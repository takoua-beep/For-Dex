from PIL import Image, ImageDraw
import math
import os

OUT_DIR = "/home/claude/cute-game-project/assets/decorations"
os.makedirs(OUT_DIR, exist_ok=True)

# Petal color, center color) per flower variant.
VARIANTS = {
    "flower_pink":   ((240, 110, 150, 255), (255, 220, 80, 255)),
    "flower_yellow": ((250, 200, 60, 255), (255, 255, 255, 255)),
    "flower_purple": ((170, 120, 220, 255), (255, 230, 90, 255)),
    "flower_white":  ((250, 250, 250, 255), (255, 200, 60, 255)),
    "flower_orange": ((250, 150, 60, 255), (255, 240, 120, 255)),
}

for name, (petal_color, center_color) in VARIANTS.items():
    img = Image.new("RGBA", (24, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for ang in range(0, 360, 72):
        rad = math.radians(ang)
        px, py = 12 + 6 * math.cos(rad), 12 + 6 * math.sin(rad)
        d.ellipse([px - 5, py - 5, px + 5, py + 5], fill=petal_color)
    d.ellipse([7, 7, 17, 17], fill=center_color)
    img.save(os.path.join(OUT_DIR, f"{name}.png"))
    print("saved", name)

print("Done generating flower color variants.")
