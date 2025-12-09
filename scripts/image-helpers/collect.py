import os
import shutil
import time

SOURCE_DIR = "C:\\My Stuff\\PlateZonePlateOff\\2025"
DEST_DIR = "C:\\My Stuff\\PlateZonePlateOff\\2025\\all"
os.makedirs(DEST_DIR, exist_ok=True)

def copy_with_retry(src, dest, attempts=20, delay=0.25):
    for attempt in range(1, attempts + 1):
      try:
          shutil.copy2(src, dest)
          return True
      except PermissionError as e:
          print(f"[LOCKED] Attempt {attempt}/{attempts} on {os.path.basename(src)}")
          time.sleep(delay)
      except Exception as e:
          print(f"[ERROR] Unexpected error copying {src}: {e}")
          return False
    print(f"Could not copy {src} after {attempts} attempts")
    return False

for author in os.listdir(SOURCE_DIR):
    author_path = os.path.join(SOURCE_DIR, author)
    if not os.path.isdir(author_path):
        continue

    for filename in os.listdir(author_path):
        if not filename.lower().endswith(".jpg"):
            continue

        src = os.path.join(author_path, filename)
        dest = os.path.join(DEST_DIR, filename)

        print(f"Copying {filename}")
        copy_with_retry(src, dest)

print("Done")
