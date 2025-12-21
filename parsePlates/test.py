import math
from pathlib import Path
from typing import Optional
import numpy as np
import cv2

from helpers import get_line_length, show_image

# from readPlates import recognize_text


def process_images(img_path: str):
    # img = cv2.imread(image_path)
    print(img_path)
    # original_img = cv2.imread(img_path)
    # original_img = cv2.resize(original_img, (320, 440))

    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, (320, 320))

    im_bw = cv2.threshold(img, 155, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    blurred = cv2.GaussianBlur(im_bw, (5, 5), 0)
    # blurred = cv2.medianBlur(original_img, 5)

    # print(boxes)

    # find_corners_by_lines(im_bw)
    # return

    # edges = cv2.Canny(blurred, 100, 200)
    # show_image(original_img)
    # return
    edges = cv2.Canny(img, 50, 200, apertureSize=3)
    contours, _ = cv2.findContours(
        edges.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    contours = sorted(contours, key=cv2.contourArea, reverse=True)
    plate_contour = None
    # print(contours)

    cv2.drawContours(img, contours, -1, color=(0, 255, 0), thickness=1)
    show_image(img)

    # Set threshold for Binary Map creation and polygon detection.
    binThresh = 0.3
    polyThresh = 0.5
    mean = (122.67891434, 116.66876762, 104.00698793)
    textDetectorDB50 = cv2.dnn_TextDetectionModel_DB("source/DB_TD500_resnet50.onnx")
    textDetectorDB50.setBinaryThreshold(binThresh)
    textDetectorDB50.setPolygonThreshold(polyThresh)
    textDetectorDB50.setInputParams(1 / 255, (320, 320), mean, True)
    boxes, confidences = textDetectorDB50.detect(cv2.cvtColor(img, cv2.COLOR_GRAY2BGR))
    for box in boxes:
        # cv2.fillPoly(inpaint_mask_db50, [np.array(box, np.int32)], 255)  # DB50 mask
        cv2.polylines(
            img,
            [np.array(box, np.int32)],
            isClosed=True,
            color=(0, 0, 255),
            thickness=1,
        )  # Annotate DB50 (Red)

    show_image(im_bw)
    show_image(img)
    # cv2.imwrite(str(image_path_bit), im_bw)
    # cv2.namedWindow("test", cv2.WINDOW_NORMAL)
    # cv2.resizeWindow("test", 400, 400)
    # cv2.imshow("test", img)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()
    # cv2.imshow("test", im_bw)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    return img_path


def find_corners_by_lines(crop_img: np.ndarray) -> Optional[np.ndarray]:
    """
    Finds corners by detecting lines, extending them, finding intersections,
    and picking the 4 extreme intersections.
    """
    h, w = crop_img.shape[:2]
    gray = crop_img  # cv2.cvtColor(crop_img, cv2.COLOR_BGR2GRAY)

    # 1. Edge Detection
    # Canny parameters might need tweaking depending on lighting
    edges = cv2.Canny(gray, 50, 200, apertureSize=3)
    show_image(edges)

    # 2. Hough Line Transform (Probabilistic)
    # minLineLength: lines shorter than this are rejected
    # maxLineGap: max gap between points to be considered same line
    lines = cv2.HoughLinesP(
        edges, 1, np.pi / 180, threshold=100, minLineLength=50, maxLineGap=5
    )

    if lines is None:
        return None
    # lines = self.unify_lines(lines=lines)
    img_copy = crop_img.copy()
    if lines is not None:
        for i in range(0, len(lines)):
            l = lines[i][0]
            cv2.line(img_copy, (l[0], l[1]), (l[2], l[3]), (0, 255, 0), 3, cv2.LINE_AA)
    # cv2.imshow("lines", img_copy)
    show_image(img_copy)

    horizontal_lines = []
    vertical_lines = []

    # CONSTANTS
    ANGLE_TOLERANCE = 45  # Only accept lines within +/- 15 deg of 0 or 90
    SHAVE_FACTOR = 0.1  # Remove 10% from line ends to avoid rounded tips

    # 3. Classify Lines
    for i in range(0, len(lines)):
        # for line in lines:
        line = lines[i]
        x1, y1, x2, y2 = line[0]
        # Calculate angle in degrees
        angle = math.degrees(math.atan2(y2 - y1, x2 - x1))

        # Normalize angle to range [-90, 90]
        if angle > 90:
            angle -= 180
        if angle < -90:
            angle += 180

        # Shrink the line to ensure we rely on the straight center, not curved ends
        sx1, sy1, sx2, sy2 = shrink_line(x1, y1, x2, y2, SHAVE_FACTOR)

        # If angle is close to 0, it's horizontal. Close to 90, vertical.
        # Horizontal check (near 0)
        if abs(angle) < ANGLE_TOLERANCE:
            horizontal_lines.append((sx1, sy1, sx2, sy2))

        # Vertical check (near 90 or -90)
        elif abs(abs(angle) - 90) < ANGLE_TOLERANCE:
            vertical_lines.append((sx1, sy1, sx2, sy2))

    if not horizontal_lines or not vertical_lines:
        return None
    print(len(horizontal_lines))
    med = np.median([get_line_length(x) for x in horizontal_lines])
    horizontal_lines = [x for x in horizontal_lines if get_line_length(x) > med]
    print(med)
    print(len(horizontal_lines))

    print(len(vertical_lines))
    med = np.median([get_line_length(x) for x in vertical_lines])
    vertical_lines = [x for x in vertical_lines if get_line_length(x) > med]
    # for line in vertical_lines:
    print(med)
    print(len(vertical_lines))

    vertical_lines.sort(key=get_line_length, reverse=True)
    horizontal_lines.sort(key=get_line_length, reverse=True)

    horizontal_lines = horizontal_lines[: int(len(horizontal_lines) / 4)]
    vertical_lines = vertical_lines[: int(len(vertical_lines) / 4)]

    img_copy = crop_img.copy()
    newlines = vertical_lines + horizontal_lines
    for i in range(0, len(newlines)):
        l = tuple(map(int, newlines[i]))  # newlines[i]
        # print(l)
        x1, y1, x2, y2 = l
        cv2.line(img_copy, (x1, y1), (x2, y2), (0, 255, 0), 3, cv2.LINE_AA)
    cv2.imshow("lines2", img_copy)

    # # 4. Find Intersections
    # intersections = []
    # for h_line in horizontal_lines:
    #     for v_line in vertical_lines:
    #         pt = self.compute_line_intersection(h_line, v_line)
    #         if pt:
    #             px, py = pt
    #             # 5. Filter Intersections:
    #             # Allow points slightly outside the image (e.g. -10 to width+10)
    #             # because corners might be just cut off.
    #             margin = 20
    #             if -margin <= px <= w + margin and -margin <= py <= h + margin:
    #                 intersections.append([px, py])

    # if len(intersections) < 4:
    #     return None

    # intersections = np.array(intersections, dtype="float32")

    # # 6. Select Best 4 Corners
    # # We assume the "true" corners are the extremes of these intersections.
    # # We reuse the logic: Top-Left (min sum), Bottom-Right (max sum), etc.

    # final_corners = np.zeros((4, 2), dtype="float32")

    # # Sums (x+y)
    # s = intersections.sum(axis=1)
    # final_corners[0] = intersections[np.argmin(s)]  # TL
    # final_corners[2] = intersections[np.argmax(s)]  # BR

    # # Diffs (y-x) or (x-y)
    # # np.diff does right - left (col1 - col0) = y - x
    # diff = np.diff(intersections, axis=1)
    # final_corners[1] = intersections[
    #     np.argmin(diff)
    # ]  # TR (smallest y-x means large x small y)
    # final_corners[3] = intersections[
    #     np.argmax(diff)
    # ]  # BL (largest y-x means small x large y)

    # return final_corners


def shrink_line(x1, y1, x2, y2, shave_percent=0.1):
    """
    Shrinks a line segment from both ends by a percentage to avoid
    curved edges at the corners affecting the slope calculation.
    """
    dx = x2 - x1
    dy = y2 - y1

    # Move start point forward
    nx1 = x1 + dx * shave_percent
    ny1 = y1 + dy * shave_percent

    # Move end point backward
    nx2 = x2 - dx * shave_percent
    ny2 = y2 - dy * shave_percent

    return nx1, ny1, nx2, ny2


if __name__ == "__main__":
    img_name = "not_warped_PXL_20251210_145631502.jpg"
    # img_name = "not_warped_IMG_4570.jpg"
    # img_name = "not_warped_IMG_20251209_124213.jpg"
    img_name = "not_warped_IMG_6157.jpg"

    image_path = (
        Path("source/images/output/warpedPlates") / img_name
    )  # Replace with your image folder
    # recognize_text(str(Path("source/images/output/warpedPlates")))
    results = process_images(str(image_path))
    # print(results)
    # for i, result in enumerate(results):
    #     if result:
    #         # print(f"Image {i+1}: {result}")
    #         print(result)
    #     else:
    #         print(result)
    #         # print(f"Image {i+1}: No plate detected")
