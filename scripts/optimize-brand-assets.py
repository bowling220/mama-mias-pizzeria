from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / "public"
for source, target, size in (
    ("mama-mias-logo-enhanced.png", "mama-mias-logo-web.webp", (900, 300)),
    ("mama-mias-chef-badge.png", "mama-mias-chef-badge-web.webp", (384, 384)),
):
    image = Image.open(root / source).convert("RGBA")
    image.thumbnail(size, Image.Resampling.LANCZOS)
    image.save(root / target, "WEBP", lossless=True, method=6)
