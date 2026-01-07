import os
from pathlib import Path
from LicensePlateProcess import LicensePlateProcess
from readPlates import read_text, recognize_text


if __name__ == "__main__":
    # Settings
    # Use raw strings (r"...") or forward slashes for paths to avoid escape character issues
    MODEL_PATH = r"source/license-plate-finetune-v1x.pt"

    # If using standard YOLO for testing:

    # Image to process
    target_folder = Path("source/images").absolute()

    output_path = target_folder / "output" / "detectedPlates"
    cropped_text_output_path = target_folder / "output" / "bitImages"
    cropped_text_output_path.mkdir(exist_ok=True, parents=True)

    if 1:
        # Execution
        processor = LicensePlateProcess(model_path=MODEL_PATH)
        processor.run(str(target_folder))
        plates = recognize_text(str(output_path))
        reads = read_text(str(cropped_text_output_path))

    results = []
