from PIL import Image
import numpy as np
from scipy import ndimage
import colorsys
import os

SRC = "/mnt/user-data/uploads/collectables.png"
OUT_DIR = "/home/claude/cute-game-project/assets/collectibles"
os.makedirs(OUT_DIR, exist_ok=True)

im = Image.open(SRC).convert("RGB")

# Manually-measured grid cell boxes (with generous margin around each card).
# Format: (x_start, y_start, x_end, y_end)
COLS = [(40, 280), (280, 520)]  # placeholder, replaced below
col_boxes = [(40, 280), (280, 520), (505, 750), (750, 995)]
row_boxes = [(275, 520), (540, 785), (790, 1010)]

# name for each (row, col) cell, based on visual inspection of the sheet
NAMES = [
    ["strawberry", "icecream", "cake", "dumbbell"],
    ["penguin", "bunny", "chick", "pizza"],
    ["bomb", "cheese", "cloud", "clock"],
]

TARGET_H = 48  # final icon height in pixels (in-game display size)


def extract_icon(cell_img):
    arr = np.array(cell_img).astype(np.float32) / 255.0
    h, w, _ = arr.shape

    # Compute HSV to separate saturated/dark icon pixels from the pale
    # pink card background and white page background.
    maxc = arr.max(axis=-1)
    minc = arr.min(axis=-1)
    v = maxc
    s = np.where(maxc > 0, (maxc - minc) / np.where(maxc == 0, 1, maxc), 0)

    keep = (s > 0.16) | (v < 0.45)  # colorful OR dark (outlines/shadows)

    # Keep only the largest connected blob (the icon itself), drop stray
    # specks of card texture / shadow.
    labeled, num = ndimage.label(keep)
    if num == 0:
        return None
    sizes = ndimage.sum(keep, labeled, range(1, num + 1))
    biggest = np.argmax(sizes) + 1
    mask = labeled == biggest

    # Slightly grow the mask by 1px so we don't clip anti-aliased edges.
    mask = ndimage.binary_dilation(mask, iterations=2)

    alpha = (mask * 255).astype(np.uint8)
    rgba = np.dstack([np.array(cell_img), alpha])
    out = Image.fromarray(rgba, mode="RGBA")

    bbox = out.getbbox()
    if not bbox:
        return None
    out = out.crop(bbox)

    # Pad a little so the shape isn't touching the sprite's edge.
    pad = 4
    canvas = Image.new("RGBA", (out.width + pad * 2, out.height + pad * 2), (0, 0, 0, 0))
    canvas.paste(out, (pad, pad), out)
    out = canvas

    # Resize to a consistent in-game height, keep aspect ratio.
    w2, h2 = out.size
    new_h = TARGET_H
    new_w = max(1, int(w2 * (new_h / h2)))
    out = out.resize((new_w, new_h), Image.LANCZOS)
    return out


for r, (y0, y1) in enumerate(row_boxes):
    for c, (x0, x1) in enumerate(col_boxes):
        cell = im.crop((x0, y0, x1, y1))
        icon = extract_icon(cell)
        name = NAMES[r][c]
        if icon is None:
            print(f"FAILED to extract {name} (row {r} col {c})")
            continue
        path = os.path.join(OUT_DIR, f"{name}.png")
        icon.save(path)
        print(f"saved {path}  size={icon.size}")

print("Done slicing collectibles.")
