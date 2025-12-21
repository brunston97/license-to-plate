import math
import os
from pathlib import Path
import sys

from paddleocr import PaddleOCR
import numpy as np
import cv2

from helpers import (
    expand_bbox,
    get_largest_textbox,
    get_line_length,
    group_by_height,
    show_image,
    sort_boxes_by_area,
)


def recognize_text(plates_dir_path: str):
    """
    Recognize text in a license plate image using PaddleOCR + DB detector
    """
    os.environ["DISABLE_MODEL_SOURCE_CHECK"] = "True"
    # detector = cv2.dnn_TextDetectionModel_DB("source/DB_TD500_resnet50.onnx")
    toReturn = []

    # 1. Set up detector and OCR
    # detector = textDetectorDB50(threshold=0.5, box_thresh=0.6)   # adjust thresholds if needed

    IMG_SIZE = 500

    plates_path = Path(plates_dir_path)
    bit_image_path = Path(plates_path.parent / "bitImages")
    reads_path = Path(plates_path.parent / "reads")

    bit_image_path.mkdir(exist_ok=True)
    reads_path.mkdir(exist_ok=True)

    for filename in os.listdir(plates_path):
        if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
            continue

        image_path = plates_path / filename
        image_path_bit = bit_image_path / filename
        # read_path = reads_path / f"{Path(filename).stem}.txt"

        # ---------------------------------------------------------
        # 2. Read, resize, and preprocess image
        # ---------------------------------------------------------
        img = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        im_bw = cv2.threshold(img, 155, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

        # ---------------------------------------------------------
        # 3. Detect plate bounding box using DB detector
        # ---------------------------------------------------------
        # boxes, _ = detector.detect(
        #     cv2.cvtColor(im_bw, cv2.COLOR_GRAY2BGR)
        # )  # boxes shape: (N, 4, 2) – pick the biggest
        largest_box = get_largest_textbox(img)
        if largest_box is None:
            print(f"No plate detected in {filename}, trying BW image")
            largest_box = get_largest_textbox(im_bw)
            img = im_bw
            if largest_box is None:
                print(f"No plate detected in {filename}")
                continue
        # boxes, _ = sort_boxes_by_area(boxes, ascending=False)
        # print(boxes[0])
        # Take the biggest box
        # = boxes[0]  # change if needed (e.g., by area)
        x1 = int(min(largest_box[:, 0]))
        y1 = int(min(largest_box[:, 1]))
        x2 = int(max(largest_box[:, 0]))
        y2 = int(max(largest_box[:, 1]))
        bbox = [x1, y1, x2, y2]

        # ---------------------------------------------------------
        # 4. Expand the bounding box slightly
        # ---------------------------------------------------------
        expanded_bbox = expand_bbox(bbox, img.shape, margin=int(IMG_SIZE * 0.2))
        x1, y1, x2, y2 = expanded_bbox

        # ---------------------------------------------------------
        # 5. Crop the plate and run Canny + line drawing (like test.py)
        # ---------------------------------------------------------
        plate_crop = img[y1:y2, x1:x2]
        # gray = plate_crop  # cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)
        # show_image(gray)

        # # Canny
        # edges = cv2.Canny(gray, 50, 200, apertureSize=3)

        # # Hough lines (probabilistic)
        # lines = cv2.HoughLinesP(
        #     edges, 1, np.pi / 180, threshold=100, minLineLength=30, maxLineGap=5
        # )

        # # Draw lines on the cropped image
        # if lines is not None:
        #     for l in lines:
        #         x_start, y_start, x_end, y_end = l[0]
        #         cv2.line(plate_crop, (x_start, y_start), (x_end, y_end), (0, 255, 0), 2)

        # Save the processed image (for debugging / visualisation)
        plate_crop = cv2.GaussianBlur(plate_crop, (5, 5), 0)
        plate_crop = cv2.cvtColor(plate_crop, cv2.COLOR_GRAY2BGR)
        cv2.imwrite(str(image_path_bit), plate_crop)

    # ---------------------------------------------------------
    # 6. OCR on the cropped plates
    # ---------------------------------------------------------
    # results = ocr.predict(
    #     str(bit_image_path), use_textline_orientation=False, use_doc_unwarping=False
    # )
    # print(str(results))
    return
    for result in results:
        plate_text = ""
        if result:
            # plate_text = result[0][0][1]  # first detected text
            for res in result:
                if len(res["rec_boxes"]) == 0:
                    continue
                # res.print()
                res.save_to_img(str(reads_path))
                # res.save_to_json("output")
                maxVal = max(res["rec_boxes"], key=lambda x: get_line_length(x))
                index = np.where(res["rec_boxes"] == maxVal)[0][0]
                plate_text = res["rec_texts"][index]
                toReturn.append(plate_text)
        # print(toReturn)

        # Save OCR result
        # with open(read_path, "w", encoding="utf-8") as f:
        #     f.write(plate_text)

    print(f"[{filename}] Plate text: {plate_text}")


def read_text(bit_image_path: Path):
    toReturn = []
    bit_image_path = Path(bit_image_path)
    ocr = PaddleOCR(
        use_textline_orientation=False,
        use_doc_orientation_classify=False,
        lang="en",
        use_doc_unwarping=False,
    )
    results = ocr.predict(str(bit_image_path))
    for res in results:
        plate_text = ""
        if res and len(res["rec_boxes"]) > 0:
            boxes = group_by_height(res["rec_boxes"], relative=True)[0]
            print(str(boxes))
            # plate_text = result[0][0][1]  # first detected text
            # for res in result:
            # if len(res["rec_boxes"]) == 0:
            #     continue
            # res.print()
            res.save_to_img(str(bit_image_path.parent / "reads"))
            for box in boxes:
                # res.save_to_json("output")
                # maxVal = max(res["rec_boxes"], key=lambda x: get_line_length(x))
                index = np.where(res["rec_boxes"] == box)[0][0]
                plate_text += res["rec_texts"][index] + " "
            toReturn.append(plate_text.rstrip())
        # print(toReturn)

        # Save OCR result
        # with open(read_path, "w", encoding="utf-8") as f:
        #     f.write(plate_text)

    print(f"[{toReturn}] Plate text: {plate_text}")
