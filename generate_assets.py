"""
This script generates simple, cute placeholder art for the game using Pillow.
You only need to run this once. After that, you can IGNORE this file completely
and just replace the PNG files in the assets/ folders with your own artwork
(keep the same file names and similar sizes and everything will keep working).
"""

from PIL import Image, ImageDraw
import os

BASE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(BASE, "assets")


def save(img, *path_parts):
    path = os.path.join(A, *path_parts)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)
    print("saved", path)


def blank(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def draw_face(draw, cx, cy, r, eye_color=(30, 30, 30, 255)):
    # simple cute eyes + smile used on characters
    ex = r * 0.35
    ey = r * 0.05
    draw.ellipse([cx - ex - 4, cy - ey - 4, cx - ex + 4, cy - ey + 4], fill=eye_color)
    draw.ellipse([cx + ex - 4, cy - ey - 4, cx + ex + 4, cy - ey + 4], fill=eye_color)
    draw.arc([cx - r * 0.4, cy - r * 0.05, cx + r * 0.4, cy + r * 0.5], 20, 160,
              fill=eye_color, width=3)


# ---------------------------------------------------------------------------
# PLAYER placeholder (blue round blob character) -> assets/player/player.png
# ---------------------------------------------------------------------------
img = blank(64, 64)
d = ImageDraw.Draw(img)
d.ellipse([6, 10, 58, 60], fill=(74, 144, 226, 255), outline=(40, 90, 160, 255), width=3)
d.ellipse([16, 4, 48, 26], fill=(74, 144, 226, 255), outline=(40, 90, 160, 255), width=3)
draw_face(d, 32, 16, 16)
save(img, "player", "player.png")

# ---------------------------------------------------------------------------
# NPC placeholder (orange round character) -> assets/npc/npc.png
# ---------------------------------------------------------------------------
img = blank(64, 64)
d = ImageDraw.Draw(img)
d.ellipse([6, 10, 58, 60], fill=(240, 150, 60, 255), outline=(180, 100, 30, 255), width=3)
d.ellipse([16, 4, 48, 26], fill=(240, 150, 60, 255), outline=(180, 100, 30, 255), width=3)
draw_face(d, 32, 16, 16)
save(img, "npc", "npc.png")

# ---------------------------------------------------------------------------
# COLLECTIBLE placeholder (gold star) -> assets/collectibles/collectible.png
# ---------------------------------------------------------------------------
import math
img = blank(32, 32)
d = ImageDraw.Draw(img)
cx, cy, r_out, r_in = 16, 16, 14, 6
pts = []
for i in range(10):
    ang = -math.pi / 2 + i * math.pi / 5
    r = r_out if i % 2 == 0 else r_in
    pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
d.polygon(pts, fill=(255, 210, 60, 255), outline=(200, 150, 20, 255))
save(img, "collectibles", "collectible.png")

# ---------------------------------------------------------------------------
# GRASS background tile (tileable-ish) -> assets/backgrounds/grass_tile.png
# ---------------------------------------------------------------------------
img = Image.new("RGBA", (64, 64), (120, 200, 100, 255))
d = ImageDraw.Draw(img)
import random
random.seed(1)
for _ in range(18):
    x, y = random.randint(0, 63), random.randint(0, 63)
    d.ellipse([x, y, x + 2, y + 2], fill=(100, 180, 85, 255))
save(img, "backgrounds", "grass_tile.png")

# ---------------------------------------------------------------------------
# ROOM 2 floor tile -> assets/backgrounds/room2_floor.png
# ---------------------------------------------------------------------------
img = Image.new("RGBA", (64, 64), (222, 197, 150, 255))
d = ImageDraw.Draw(img)
d.rectangle([0, 0, 63, 63], outline=(200, 175, 130, 255), width=2)
save(img, "backgrounds", "room2_floor.png")

# ---------------------------------------------------------------------------
# TREE decoration -> assets/decorations/tree.png
# ---------------------------------------------------------------------------
img = blank(64, 96)
d = ImageDraw.Draw(img)
d.rectangle([28, 60, 36, 92], fill=(120, 80, 45, 255))
d.ellipse([8, 8, 56, 56], fill=(60, 150, 70, 255), outline=(40, 110, 50, 255), width=3)
d.ellipse([2, 30, 40, 68], fill=(70, 165, 80, 255), outline=(40, 110, 50, 255), width=3)
d.ellipse([26, 30, 64, 68], fill=(70, 165, 80, 255), outline=(40, 110, 50, 255), width=3)
save(img, "decorations", "tree.png")

# ---------------------------------------------------------------------------
# BUSH decoration -> assets/decorations/bush.png
# ---------------------------------------------------------------------------
img = blank(48, 40)
d = ImageDraw.Draw(img)
d.ellipse([0, 12, 28, 40], fill=(80, 170, 90, 255), outline=(50, 120, 60, 255), width=2)
d.ellipse([16, 8, 48, 36], fill=(90, 180, 100, 255), outline=(50, 120, 60, 255), width=2)
d.ellipse([8, 4, 36, 32], fill=(85, 175, 95, 255), outline=(50, 120, 60, 255), width=2)
save(img, "decorations", "bush.png")

# ---------------------------------------------------------------------------
# ROCK decoration -> assets/decorations/rock.png
# ---------------------------------------------------------------------------
img = blank(48, 32)
d = ImageDraw.Draw(img)
d.ellipse([2, 8, 46, 30], fill=(150, 150, 155, 255), outline=(110, 110, 115, 255), width=2)
d.ellipse([10, 4, 34, 20], fill=(165, 165, 170, 255), outline=(110, 110, 115, 255), width=2)
save(img, "decorations", "rock.png")

# ---------------------------------------------------------------------------
# FLOWER decoration -> assets/decorations/flower.png
# ---------------------------------------------------------------------------
img = blank(24, 24)
d = ImageDraw.Draw(img)
petal_color = (240, 110, 150, 255)
for ang in range(0, 360, 72):
    rad = math.radians(ang)
    px, py = 12 + 6 * math.cos(rad), 12 + 6 * math.sin(rad)
    d.ellipse([px - 5, py - 5, px + 5, py + 5], fill=petal_color)
d.ellipse([7, 7, 17, 17], fill=(255, 220, 80, 255))
save(img, "decorations", "flower.png")

# ---------------------------------------------------------------------------
# DOOR object (used to move between rooms) -> assets/objects/door.png
# ---------------------------------------------------------------------------
img = blank(48, 64)
d = ImageDraw.Draw(img)
d.rectangle([2, 2, 46, 62], fill=(120, 75, 45, 255), outline=(80, 50, 30, 255), width=3)
d.ellipse([34, 30, 40, 36], fill=(230, 200, 120, 255))
save(img, "objects", "door.png")

print("All placeholder assets generated successfully.")
