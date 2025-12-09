import os
import shutil

# directory that contains all author directories (which should have plate images)
SOURCE_DIR = "C:\\My Stuff\\PlateZonePlateOff\\2025"
VALID_IMAGE_EXTS = (".jpg",".jpeg",".png")

counter = 1

for author in os.listdir(SOURCE_DIR):
    author_path = os.path.join(SOURCE_DIR, author)

    if not os.path.isdir(author_path):
      continue

    for filename in os.listdir(author_path):
        ext = os.path.splitext(filename)[1].lower()

        if ext not in VALID_IMAGE_EXTS:
          continue

        old_path = os.path.join(author_path, filename)
        new_name = f"plate{counter}.jpg"
        new_path = os.path.join(author_path, new_name)

        os.rename(old_path, new_path)
        print(f"Renamed {old_path} to {new_name}")

        counter += 1

print(f"\nDone! Processed {counter - 1} images")
