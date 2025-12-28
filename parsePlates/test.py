import math
from pathlib import Path
from typing import Optional
import numpy as np
import cv2
from time import time

from helpers import (
    ImageTransformer,
    find_corners_by_lines,
    find_largest_textbox,
    get_line_length,
    show_image,
)

# from LicensePlateProcess import LicensePlateProcess

MODEL_PATH = r"source/license-plate-finetune-v1l.pt"

# from readPlates import recognize_text


def process_images(img_path: str):
    img = cv2.imread(image_path)
    print(img_path)

    # Create an ImageTransformer instance
    transformer = ImageTransformer(img)

    # Apply transformations and find lines
    lines = transformer.resize(0.3).set_binary_img(155).find_lines()

    # original_img = cv2.imread(img_path)
    # original_img = cv2.resize(original_img, (320, 440))

    # img = cv2.imread(img_path)  # , cv2.IMREAD_GRAYSCALE)
    # img = cv2.resize(img, (736, 736))

    img_grey = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    img_bw = cv2.threshold(img_grey, 155, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    img_bw = cv2.cvtColor(img_bw, cv2.COLOR_GRAY2BGR)
    # img_grey = cv2.cvtColor(img_grey, cv2.COLOR_GRAY2BGR)

    # edges = cv2.Canny(img, 50, 200, apertureSize=3)

    # kernel = np.ones((2, 2), np.uint8)
    # erosion = cv2.dilate(edges, kernel, iterations=1)
    # erosion = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
    # find_corners_by_lines(cv2.cvtColor(img, cv2.COLOR_GRAY2BGR))
    find_corners_by_lines(img)
    # show_image(erosion)
    # contours, _ = cv2.findContours(
    #     edges.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    # )

    # rectangles = []

    # for contour in contours:
    #     # Approximate the contour to a polygon
    #     epsilon = 0.02 * cv2.arcLength(contour, True)
    #     approx = cv2.approxPolyDP(contour, epsilon, True)

    #     # Check if the polygon has four vertices and is convex
    #     if len(approx) == 4 and cv2.isContourConvex(approx):
    #         rectangles.append(approx)

    # for rect in rectangles:
    #     # Draw the rectangle on the original image
    #     cv2.drawContours(img, [rect], -1, (0, 255, 0), thickness=3)  # Green color and
    # show_image(img)
    # find_corners_by_lines(cv2.GaussianBlur(edges, (5, 5), 0))

    # find_corners_by_lines(cv2.medianBlur(img_bw, 3))

    # blurred = cv2.medianBlur(img_bw, 3)  # grey is good
    # img_bw = cv2.GaussianBlur(img_grey, (5, 5), 0)
    # blurred = cv2.cvtColor(blurred, cv2.COLOR_GRAY2BGR)

    # img_bw = cv2.cvtColor(img_grey, cv2.COLOR_GRAY2BGR)
    # img_bw = cv2.cvtColor(img_bw, cv2.COLOR_GRAY2BGR)

    # processor = LicensePlateProcess(model_path=MODEL_PATH)
    # processor.run(str(Path(img_path).parent))
    # folder = Path(img_path).parent
    # box = find_largest_textbox(img)

    # find_corners_by_lines(img_bw)
    # find_corners_by_lines(blurred)
    # show_image(img)

    # im_bw = cv2.threshold(img, 155, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    # blurred = cv2.GaussianBlur(im_bw, (5, 5), 0)
    # blurred = cv2.medianBlur(original_img, 5)

    # print(boxes)

    # find_corners_by_lines(im_bw)
    # return

    # edges = cv2.Canny(blurred, 100, 200)
    # show_image(original_img)
    # return
    # edges = cv2.Canny(img, 50, 200, apertureSize=3)
    # contours, _ = cv2.findContours(
    #     edges.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    # )
    # contours = sorted(contours, key=cv2.contourArea, reverse=True)
    plate_contour = None
    # print(contours)

    # cv2.drawContours(img, contours, -1, color=(0, 255, 0), thickness=1)
    # show_image(img)
    # img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    # boxes, confidences = textDetectorDB50.detect(cv2.cvtColor(img, cv2.COLOR_GRAY2BGR))
    # best_box = find_largest_textbox(img)
    # print(best_box)
    # for box in boxes:
    # cv2.fillPoly(inpaint_mask_db50, [np.array(box, np.int32)], 255)  # DB50 mask
    # if best_box is not None:
    #     cv2.polylines(
    #         img,
    #         [np.array(best_box, np.int32)],
    #         isClosed=True,
    #         color=(0, 0, 255),
    #         thickness=1,
    #     )  # Annotate DB50 (Red)

    # # show_image(im_bw)
    # show_image(img)

    return img_path


if __name__ == "__main__":
    img_name = "not_warped_PXL_20251210_145631502.jpg"
    img_name = "IMG_4570.jpg"
    # img_name = "not_warped_IMG_20251209_124213.jpg"
    img_name = "IMG_2752.jpg"
    # img_name = "IMG_5288.jpg"
    #img_name = "IMG_1697.jpg"
    img_dir = Path("source/images")  # /output/warpedPlates")
    if not img_dir.exists():
        img_dir.mkdir(exist_ok=True, parents=True)

    image_path = img_dir / img_name
    print(image_path)
    # Replace with your image folder
    # recognize_text(str(Path("source/images/output/warpedPlates")))

    # img = cv2.imread(image_path)

    results = process_images(str(image_path))
    # print(results)
    # for i, result in enumerate(results):
    #     if result:
    #         # print(f"Image {i+1}: {result}")
    #         print(result)
    #     else:
    #         print(result)
    #         # print(f"Image {i+1}: No plate detected")
