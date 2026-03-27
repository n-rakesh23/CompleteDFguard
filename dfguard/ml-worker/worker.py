# ============================================================
# DFGuard ML Worker
# Run this on Google Colab (GPU runtime) or Kaggle
#
# Setup:
# 1. Add these to Colab Secrets (🔑 icon on left sidebar):
#    - AWS_ACCESS_KEY_ID
#    - AWS_SECRET_ACCESS_KEY
#    - MONGO_URI
#    - SQS_QUEUE_URL
#    - S3_IMAGE_BUCKET
#
# 2. Enable GPU: Runtime → Change runtime type → T4 GPU
# 3. Run all cells in order
# ============================================================


# ── CELL 1: Install Dependencies ────────────────────────────
# !pip install torch torchvision facenet-pytorch \
#              boto3 pymongo dnspython Pillow tqdm -q


# ── CELL 2: Imports & AWS Config ────────────────────────────
import os, sys, json, time, tempfile, threading
from datetime import datetime
from pathlib  import Path

import boto3
import torch
from pymongo  import MongoClient
from bson     import ObjectId

# Load secrets from Colab
try:
    from google.colab import userdata
    AWS_ACCESS_KEY_ID     = userdata.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = userdata.get('AWS_SECRET_ACCESS_KEY')
    MONGO_URI             = userdata.get('MONGO_URI')
    SQS_QUEUE_URL         = userdata.get('SQS_QUEUE_URL')
    S3_IMAGE_BUCKET       = userdata.get('S3_IMAGE_BUCKET')
    print("✅ Secrets loaded from Colab")
except ImportError:
    # Kaggle fallback
    try:
        from kaggle_secrets import UserSecretsClient
        secrets               = UserSecretsClient()
        AWS_ACCESS_KEY_ID     = secrets.get_secret('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = secrets.get_secret('AWS_SECRET_ACCESS_KEY')
        MONGO_URI             = secrets.get_secret('MONGO_URI')
        SQS_QUEUE_URL         = secrets.get_secret('SQS_QUEUE_URL')
        S3_IMAGE_BUCKET       = secrets.get_secret('S3_IMAGE_BUCKET')
        print("✅ Secrets loaded from Kaggle")
    except Exception:
        # Local dev fallback
        from dotenv import load_dotenv
        load_dotenv()
        AWS_ACCESS_KEY_ID     = os.getenv('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
        MONGO_URI             = os.getenv('MONGO_URI')
        SQS_QUEUE_URL         = os.getenv('SQS_QUEUE_URL')
        S3_IMAGE_BUCKET       = os.getenv('S3_IMAGE_BUCKET')
        print("✅ Secrets loaded from .env")

os.environ['AWS_ACCESS_KEY_ID']     = AWS_ACCESS_KEY_ID
os.environ['AWS_SECRET_ACCESS_KEY'] = AWS_SECRET_ACCESS_KEY
os.environ['AWS_DEFAULT_REGION']    = 'ap-south-1'

# AWS clients
sqs = boto3.client('sqs', region_name='ap-south-1')
s3  = boto3.client('s3',  region_name='ap-south-1')

# MongoDB
mongo_client = MongoClient(MONGO_URI)
db           = mongo_client['dfguard']

print(f"✅ AWS and MongoDB connected")


# ── CELL 3: Load ML Models ───────────────────────────────────
from facenet_pytorch       import InceptionResnetV1, MTCNN
from engine.protect        import protect_image
from engine.face_detector  import build_detector, detect_faces

device     = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"🖥️  Using device: {device}")

# Load face recognition model (used for adversarial attack)
face_model = InceptionResnetV1(pretrained='vggface2').eval().to(device)
print("✅ FaceNet model loaded (VGGFace2 weights)")

# Load face detector (used to verify image has a face)
detector = build_detector(device)
print("✅ MTCNN face detector loaded")


# ── CELL 4: Job Processing Functions ────────────────────────
def update_job_status(job_id: str, status: str,
                      output_s3_key=None,
                      download_url=None,
                      error_message=None):
    """Update job status in MongoDB."""
    update = {
        'status':      status,
        'completedAt': datetime.utcnow() if status in ('completed', 'failed') else None
    }
    if output_s3_key:  update['outputS3Key']  = output_s3_key
    if download_url:   update['downloadUrl']   = download_url
    if error_message:  update['errorMessage']  = error_message

    db.jobs.update_one({'_id': ObjectId(job_id)}, {'$set': update})


def process_job(job_data: dict):
    """
    Full pipeline for one image protection job:
    1. Download from S3
    2. Detect face
    3. Apply adversarial noise
    4. Upload protected image to S3
    5. Update MongoDB
    """
    job_id     = job_data['jobId']
    input_key  = job_data['inputS3Key']
    output_key = f"output/{job_id}_protected.jpg"

    print(f"\n{'─'*50}")
    print(f"📦 Job {job_id}")
    print(f"   Input: {input_key}")

    # Mark as processing
    update_job_status(job_id, 'processing')

    with tempfile.TemporaryDirectory() as tmp:
        input_path  = os.path.join(tmp, 'input.jpg')
        output_path = os.path.join(tmp, 'output.jpg')

        # ── Step 1: Download from S3 ──────────────────────
        print("  ⬇️  Downloading from S3...")
        s3.download_file(S3_IMAGE_BUCKET, input_key, input_path)
        print(f"     File size: {os.path.getsize(input_path) / 1024:.1f} KB")

        # ── Step 2: Face detection ────────────────────────
        print("  🔍 Detecting faces...")
        has_face, boxes, count = detect_faces(detector, input_path)
        print(f"     Faces found: {count}")

        if not has_face:
            print("  ⚠️  No face detected — still applying protection")

        # ── Step 3: Adversarial protection ───────────────
        print("  🧠 Applying neural protection (PGD)...")
        protect_image(
            model       = face_model,
            device      = device,
            input_path  = input_path,
            output_path = output_path,
            epsilon     = 8  / 255,
            alpha       = 2  / 255,
            steps       = 40
        )

        # ── Step 4: Upload to S3 ──────────────────────────
        print("  ⬆️  Uploading protected image to S3...")
        s3.upload_file(
            output_path,
            S3_IMAGE_BUCKET,
            output_key,
            ExtraArgs={'ContentType': 'image/jpeg'}
        )

        # ── Step 5: Generate download URL (7 days) ────────
        download_url = s3.generate_presigned_url(
            'get_object',
            Params  = {'Bucket': S3_IMAGE_BUCKET, 'Key': output_key},
            ExpiresIn = 604800
        )

    # ── Step 6: Update MongoDB ────────────────────────────
    update_job_status(
        job_id,
        status       = 'completed',
        output_s3_key = output_key,
        download_url  = download_url
    )

    print(f"  ✅ Job complete! Download URL valid for 7 days.")
    return download_url


# ── CELL 5: Keep-Alive Heartbeat ────────────────────────────
def heartbeat():
    """Prints a dot every 5 minutes to prevent Colab idle disconnect."""
    while True:
        time.sleep(300)
        print(f"♥  Worker alive at {datetime.now().strftime('%H:%M:%S')}", flush=True)

threading.Thread(target=heartbeat, daemon=True).start()
print("✅ Heartbeat started")


# ── CELL 6: Main Worker Loop ─────────────────────────────────
def run_worker():
    """
    Polls SQS queue forever.
    Processes jobs one at a time with full error handling.
    Safe to restart — SQS visibility timeout handles retries.
    """
    print(f"\n{'='*50}")
    print("🚀 DFGuard ML Worker STARTED")
    print(f"   Queue:  {SQS_QUEUE_URL}")
    print(f"   Bucket: {S3_IMAGE_BUCKET}")
    print(f"   Device: {device}")
    print(f"{'='*50}\n")

    jobs_processed = 0
    jobs_failed    = 0

    while True:
        try:
            # Poll SQS — long polling (20s) reduces empty responses
            response = sqs.receive_message(
                QueueUrl              = SQS_QUEUE_URL,
                MaxNumberOfMessages   = 1,
                WaitTimeSeconds       = 20,
                VisibilityTimeout     = 300    # 5 min to process
            )

            messages = response.get('Messages', [])
            if not messages:
                continue

            msg      = messages[0]
            job_data = json.loads(msg['Body'])

            try:
                process_job(job_data)
                jobs_processed += 1

                # Delete from queue ONLY on success
                sqs.delete_message(
                    QueueUrl      = SQS_QUEUE_URL,
                    ReceiptHandle = msg['ReceiptHandle']
                )
                print(f"\n📊 Stats: {jobs_processed} processed, {jobs_failed} failed")

            except Exception as job_err:
                jobs_failed += 1
                job_id = job_data.get('jobId', 'unknown')
                print(f"\n❌ Job {job_id} failed: {job_err}")

                # Mark job as failed in MongoDB
                update_job_status(
                    job_id,
                    status        = 'failed',
                    error_message = str(job_err)
                )

                # Don't delete from SQS — let it retry up to 3x
                # After 3 retries it goes to dead-letter queue

        except KeyboardInterrupt:
            print("\n\n🛑 Worker stopped by user")
            print(f"   Total processed: {jobs_processed}")
            print(f"   Total failed:    {jobs_failed}")
            break

        except Exception as poll_err:
            print(f"⚠️  Poll error: {poll_err}")
            time.sleep(10)  # Back off before retrying


# Start the worker
run_worker()
