"""Create review-only color and grayscale contact sheets from the V3 tile manifest."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "packages/mahjong-ui/assets/tiles/v3/manifest.json"
OUTPUT = ROOT / "docs/v0.3.0/generated"
CELL_WIDTH = 180
CELL_HEIGHT = 205
COLUMNS = 5


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/SFNS.ttf",
    ):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def build_sheet(items: list[dict], grayscale: bool) -> Image.Image:
    rows = (len(items) + COLUMNS - 1) // COLUMNS
    sheet = Image.new("RGB", (CELL_WIDTH * COLUMNS, CELL_HEIGHT * rows), "#EEE9DE")
    draw = ImageDraw.Draw(sheet)
    label_font = font(16)
    id_font = font(13)

    for index, item in enumerate(items):
        column = index % COLUMNS
        row = index // COLUMNS
        left = column * CELL_WIDTH
        top = row * CELL_HEIGHT
        draw.rectangle(
            (left + 6, top + 6, left + CELL_WIDTH - 6, top + CELL_HEIGHT - 6),
            fill="#FAF8F1",
            outline="#8A775B",
            width=2,
        )
        artwork = Image.open(ROOT / item["outputPath"]).convert("RGBA")
        if grayscale:
            alpha = artwork.getchannel("A")
            artwork = ImageOps.grayscale(artwork).convert("RGBA")
            artwork.putalpha(alpha)
        artwork.thumbnail((142, 142), Image.Resampling.LANCZOS)
        art_left = left + (CELL_WIDTH - artwork.width) // 2
        sheet.paste(artwork, (art_left, top + 12), artwork)
        draw.text((left + 12, top + 158), item["name"], fill="#2C332E", font=label_font)
        draw.text((left + 12, top + 181), item["artworkId"], fill="#6A655B", font=id_font)

    return sheet


def main() -> None:
    data = json.loads(MANIFEST.read_text())
    OUTPUT.mkdir(parents=True, exist_ok=True)
    build_sheet(data["items"], grayscale=False).save(
        OUTPUT / "V0.3.0-V3-13-EXPORTED-ARTWORK-CONTACT-SHEET.png", optimize=True
    )
    build_sheet(data["items"], grayscale=True).save(
        OUTPUT / "V0.3.0-V3-13-EXPORTED-ARTWORK-GRAYSCALE.png", optimize=True
    )


if __name__ == "__main__":
    main()
