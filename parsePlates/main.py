import os
from pathlib import Path
from LicensePlateProcess import LicensePlateProcess


if __name__ == "__main__":
    # Settings
    # Use raw strings (r"...") or forward slashes for paths to avoid escape character issues
    MODEL_PATH = r"source/license-plate-finetune-v1l.pt"

    # If using standard YOLO for testing:
    # MODEL_PATH = "yolo11n.pt"

    # Image to process
    target_folder = Path("images")
    target_image = "IMG_2752.jpg"
    #target_image = "IMG_4570.jpg"


    full_image_path = target_folder / target_image

    # Execution
    processor = LicensePlateProcess(model_path=MODEL_PATH)
    processor.run(str(target_folder))

    results = []
    for filename in os.listdir(target_folder):
        if filename.endswith((".jpg", ".jpeg", ".png")):  # Add more extensions if needed
            image_path = os.path.join(target_folder, filename)
            try:
                processor.run(str(image_path))
            except Exception as e:
                  print(e)
    # Check if we are processing a specific file or a whole folder logic
    # For now, processing the specific file requested:
