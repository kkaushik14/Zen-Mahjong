"""Remove neighbouring atlas fragments while preserving the selected motif's alpha edge."""

from collections import deque
from pathlib import Path
import sys

from PIL import Image, ImageFilter


def isolate_largest_component(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    alpha = image.getchannel("A")
    width, height = image.size
    pixels = alpha.load()
    visited: set[tuple[int, int]] = set()
    components: list[list[tuple[int, int]]] = []

    for y in range(height):
        for x in range(width):
            if pixels[x, y] <= 8 or (x, y) in visited:
                continue
            queue = deque([(x, y)])
            visited.add((x, y))
            component: list[tuple[int, int]] = []
            while queue:
                current_x, current_y = queue.popleft()
                component.append((current_x, current_y))
                for offset_x, offset_y in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    neighbour = (current_x + offset_x, current_y + offset_y)
                    if (
                        0 <= neighbour[0] < width
                        and 0 <= neighbour[1] < height
                        and pixels[neighbour[0], neighbour[1]] > 8
                        and neighbour not in visited
                    ):
                        visited.add(neighbour)
                        queue.append(neighbour)
            components.append(component)

    if not components:
        raise ValueError(f"No visible artwork found in {path}")

    primary = max(components, key=len)
    mask = Image.new("L", image.size)
    mask_pixels = mask.load()
    for x, y in primary:
        mask_pixels[x, y] = 255

    # Recover the anti-aliased fringe excluded by the thresholded component scan.
    mask = mask.filter(ImageFilter.MaxFilter(7))
    clean_alpha = Image.new("L", image.size)
    clean_alpha_pixels = clean_alpha.load()
    expanded_pixels = mask.load()
    for y in range(height):
        for x in range(width):
            if expanded_pixels[x, y] > 0:
                clean_alpha_pixels[x, y] = pixels[x, y]

    image.putalpha(clean_alpha)
    image.save(path, optimize=True)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: isolate-tile-artwork.py <png-path>")
    isolate_largest_component(Path(sys.argv[1]))
