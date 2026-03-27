"""
protect.py
──────────
Applies adversarial perturbation to an image to make
facial recognition models fail on it.

Uses PGD (Projected Gradient Descent) against FaceNet
(InceptionResnetV1 pretrained on VGGFace2).

The perturbation is:
  - Bounded to ±8/255 per pixel channel (imperceptible)
  - Applied iteratively over 40 steps
  - Maximizes distance from original face embedding
  - Minimizes distance to a random target embedding
"""

import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import numpy as np


# ──────────────────────────────────────────────
# Transforms
# ──────────────────────────────────────────────
_to_tensor = transforms.Compose([
    transforms.Resize((160, 160)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5],
                         [0.5, 0.5, 0.5])
])

_to_image = transforms.ToPILImage()


def load_image(path: str):
    """Load image as PIL and as tensor."""
    img = Image.open(path).convert('RGB')
    return img, _to_tensor(img).unsqueeze(0)


def save_image(tensor: torch.Tensor, original_size: tuple, path: str, quality: int = 95):
    """Convert tensor back to PIL and save at original resolution."""
    # Denormalize: [-1,1] → [0,1]
    img = (tensor.squeeze(0).detach().cpu() * 0.5 + 0.5).clamp(0, 1)
    pil = _to_image(img)
    pil = pil.resize(original_size, Image.LANCZOS)
    pil.save(path, quality=quality)
    return path


def protect_image(
    model,
    device:     torch.device,
    input_path: str,
    output_path: str,
    epsilon:    float = 8  / 255,
    alpha:      float = 2  / 255,
    steps:      int   = 40
) -> str:
    """
    Apply adversarial protection to a face image.

    Args:
        model:       FaceNet model (InceptionResnetV1)
        device:      CPU or CUDA
        input_path:  Path to source image
        output_path: Path to save protected image
        epsilon:     Max pixel perturbation (default 8/255 — imperceptible)
        alpha:       Step size per iteration
        steps:       Number of PGD iterations (more = stronger protection)

    Returns:
        output_path
    """
    model.eval()

    # ── Load ────────────────────────────────────────
    original_pil, x = load_image(input_path)
    original_size   = original_pil.size          # (W, H)
    x               = x.to(device)

    # ── Original embedding (no grad needed) ─────────
    with torch.no_grad():
        emb_orig = F.normalize(model(x), p=2, dim=1)

    # ── Random target — far from original face ──────
    emb_target = F.normalize(
        torch.randn_like(emb_orig).to(device), p=2, dim=1
    )

    # ── PGD Attack ──────────────────────────────────
    x_adv = x.clone().detach()

    for step in range(steps):
        x_adv.requires_grad_(True)

        emb_adv = F.normalize(model(x_adv), p=2, dim=1)

        # Loss: push away from original, pull toward random target
        loss = (
            - F.cosine_similarity(emb_adv, emb_orig).mean()
            + F.cosine_similarity(emb_adv, emb_target).mean()
        )

        loss.backward()

        with torch.no_grad():
            # Gradient sign step
            x_adv = x_adv + alpha * x_adv.grad.sign()

            # Project back into ε-ball around original
            delta = torch.clamp(x_adv - x, -epsilon, epsilon)
            x_adv = torch.clamp(x + delta, -1.0, 1.0).detach()

        if step % 10 == 0:
            print(f"    Step {step:2d}/{steps} | loss={loss.item():.4f}")

    # ── Save ────────────────────────────────────────
    save_image(x_adv, original_size, output_path)
    print(f"  ✅ Protected image saved → {output_path}")
    return output_path
