from PIL import Image
import os

INPUT_FOLDER = ""
OUTPUT_FOLDER = ""
TARGET_RATIO = 5 / 7
FINAL_SIZE = (500,700) #TBD

count = 0

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

for filename in os.listdir(INPUT_FOLDER):
    if not filename.lower().endswith((".jpg",".jpeg",".png")):
        continue

    path = os.path.join(INPUT_FOLDER, filename)
    img = Image.open(path)
    w, h = img.size
    current_ratio = w / h

    # Image is too wide
    if current_ratio > TARGET_RATIO:
        new_width = int(h * TARGET_RATIO)
        offset = (w - new_width) // 2
        img = img.crop((offset, 0, offset + new_width, h))
    # Image is too tall
    else:
        new_height = int(w / TARGET_RATIO)
        offset = (h - new_height) // 2
        img = img.crop((0, offset, w, offset + new_height))

    img = img.resize(FINAL_SIZE, Image.Resampling.LANCZOS)
    img.save(os.path.join(OUTPUT_FOLDER, filename))

    count += 1

print(f"Converted {count} files")
