"""
face_detector.py
────────────────
Detects whether an uploaded image contains a human face
before running the (expensive) PGD protection step.

Uses MTCNN from facenet-pytorch.
Returns True/False and bounding boxes.
"""

import torch
from facenet_pytorch import MTCNN
from PIL import Image


def build_detector(device: torch.device) -> MTCNN:
    """Initialize the MTCNN face detector."""
    return MTCNN(
        keep_all    = True,
        device      = device,
        post_process= False,
        min_face_size=40
    )


def detect_faces(detector: MTCNN, image_path: str):
    """
    Detect faces in an image.

    Returns:
        has_face (bool):  True if at least one face found
        boxes    (list):  List of bounding boxes [[x1,y1,x2,y2], ...]
        count    (int):   Number of faces detected
    """
    try:
        img    = Image.open(image_path).convert('RGB')
        boxes, probs = detector.detect(img)

        if boxes is None or len(boxes) == 0:
            return False, [], 0

        # Filter by confidence threshold
        confident_boxes = [
            box for box, prob in zip(boxes, probs)
            if prob is not None and prob > 0.90
        ]

        has_face = len(confident_boxes) > 0
        return has_face, confident_boxes, len(confident_boxes)

    except Exception as e:
        print(f"  ⚠️  Face detection error: {e}")
        # Fail open — still process if detector crashes
        return True, [], 0
