from PIL import Image
import numpy as np
from scipy import ndimage
import os

SRC = "/mnt/user-data/uploads"
OUT = "/home/claude/cute-game-project/assets"


def remove_bg_and_trim(path_in, path_out, target_h):
    im = Image.open(path_in).convert("RGB")
    arr = np.array(im).astype(np.int16)

    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    brightness = (r + g + b) / 3
    # "background-like": bright AND low color variance (white/light-gray checker)
    max_c = np.max(arr, axis=-1)
    min_c = np.min(arr, axis=-1)
    variance = max_c - min_c
    bg_like = (brightness > 225) & (variance < 12)

    # Only remove background pixels that are CONNECTED to the image border
    # (so we don't punch holes in white sneakers/eyes in the middle of the character).
    labeled, num = ndimage.label(bg_like)
    border_labels = set(labeled[0, :].tolist()) | set(labeled[-1, :].tolist()) \
        | set(labeled[:, 0].tolist()) | set(labeled[:, -1].tolist())
    border_labels.discard(0)

    remove_mask = np.isin(labeled, list(border_labels))

    alpha = np.where(remove_mask, 0, 255).astype(np.uint8)

    rgba = np.dstack([arr.astype(np.uint8), alpha])
    out_im = Image.fromarray(rgba, mode="RGBA")

    # Slight edge cleanup: fully transparent pixels get their RGB zeroed (avoids halos)
    r2, g2, b2, a2 = out_im.split()
    out_im = Image.merge("RGBA", (r2, g2, b2, a2))

    # ---- Trim transparent border ----
    bbox = out_im.getbbox()
    if bbox:
        out_im = out_im.crop(bbox)

    # ---- Resize keeping aspect ratio, to target height ----
    w, h = out_im.size
    new_h = target_h
    new_w = int(w * (new_h / h))
    out_im = out_im.resize((new_w, new_h), Image.LANCZOS)

    os.makedirs(os.path.dirname(path_out), exist_ok=True)
    out_im.save(path_out)
    print(f"{path_in} -> {path_out}  size={out_im.size}")


# Guy = player character (slightly bigger) -> target height 96px
remove_bg_and_trim(f"{SRC}/guy.png", f"{OUT}/player/player.png", target_h=96)

# Girl = NPC character -> target height 88px
remove_bg_and_trim(f"{SRC}/girl.png", f"{OUT}/npc/npc.png", target_h=88)

print("Done.")
