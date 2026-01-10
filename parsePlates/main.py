from pathlib import Path
from LicensePlateProcess import LicensePlateProcess
from readPlates import read_text, recognize_text


if __name__ == "__main__":
    # Settings
    # Use raw strings (r"...") or forward slashes for paths to avoid escape character issues
    MODEL_PATH = r"source/license-plate-finetune-v1x.pt"

    # Image to process
    target_folder = Path("source/images/input")
    target_folder.mkdir(parents=True, exist_ok=True)

    output_path = target_folder.parent / "output"

    cropped_text_output_path = output_path / "bitImages"
    cropped_text_output_path.mkdir(exist_ok=True, parents=True)
    detected_plates_path = output_path / "detectedPlates"

    if 1:
        # Execution
        # TODO convert to one by one
        # processor = LicensePlateProcess(model_path=MODEL_PATH)
        # processor.run(str(target_folder), output_path)
        # plates = recognize_text(str(detected_plates_path))
        reads = read_text(str(detected_plates_path))
