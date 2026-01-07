import os
from pathlib import Path
from LicensePlateProcess import LicensePlateProcess
from readPlates import read_text, recognize_text


if __name__ == "__main__":
    # Settings
    # Use raw strings (r"...") or forward slashes for paths to avoid escape character issues
    MODEL_PATH = r"source/license-plate-finetune-v1x.pt"

    # If using standard YOLO for testing:
    # MODEL_PATH = "yolo11n.pt"

    # Image to process
    target_folder = Path("source/images").absolute()
    target_image = "IMG_2752.jpg"
    # target_image = "IMG_4570.jpg"
    # full_image_path = target_folder / target_image

    output_path = (
        target_folder / "output" / "detectedPlates"
    )  # Path("source/images/output").absolute()
    cropped_text_output_path = target_folder / "output" / "bitImages"
    cropped_text_output_path.mkdir(exist_ok=True, parents=True)
    # print(output_path)
    # print(str(target_folder))

    if 1:
        # Execution
        processor = LicensePlateProcess(model_path=MODEL_PATH)
        processor.run(str(target_folder))
        plates = recognize_text(str(output_path))
        # for folder in Path(target_folder / "output/bit/split").iterdir():
        #     folderPath = Path(folder)
        #     print(folderPath.name[:5])
        #     if str(folderPath.name)[:5] == "batch":
        reads = read_text(str(cropped_text_output_path))
        # print(plates)

    results = []
    # for filename in os.listdir(target_folder):
    #     if filename.endswith((".jpg", ".jpeg", ".png")):  # Add more extensions if needed
    #         image_path = os.path.join(target_folder, filename)
    #         try:
    #             processor.run(str(image_path))
    #         except Exception as e:
    #               print(e)
    # Check if we are processing a specific file or a whole folder logic
    # For now, processing the specific file requested:
