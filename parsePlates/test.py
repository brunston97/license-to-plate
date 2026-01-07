import math
from pathlib import Path
import sys
from typing import List, Optional, Set, Tuple
import numpy as np
import cv2
from time import time

from helpers import (
    ImageTransformer,
    PointBox,
    calculate_line_angle,
    draw_lines,
    get_min_endpoint_distance,
    merge_lines,
    normalize_angle,
    points_to_xyxy,
    round_number,
    show_image,
    xyxy_to_points,
    lines_intersect,
)
from test3 import detect_bounding_boxes_partial

# from LicensePlateProcess import LicensePlateProcess

MODEL_PATH = r"source/license-plate-finetune-v1l.pt"

# from readPlates import recognize_text


def process_images(img_path: str):
    img = cv2.imread(image_path)
    print(img_path)

    # Create an ImageTransformer instance
    transformer = ImageTransformer(img)

    scaleFactor = 1024 / img.shape[1] if img.shape[1] > 1024 else 1
    scaleFactor = 1
    lines = transformer.resize(scaleFactor).blur(3).dialate(1).find_lines()
    lines = [x[0] for x in lines]
    copy = transformer.bgr_img.copy()
    draw_lines(copy, lines, False)
    show_image(copy)
    return

    # transformer.show_image()

    mergedLines = [x[0] for x in lines]  #
    mergeDistance = max(int(transformer.bgr_img.shape[1] * 0.01), 20)
    mergedLines = merge_lines([x[0] for x in lines], mergeDistance)

    lines = [Line(xyxy_to_points(line)) for line in mergedLines]

    hLines = [line for line in lines if line.orientation == "h"]
    vLines = [line for line in lines if line.orientation == "v"]

    assigned_lines = set()
    max_corner_distance = 30
    # show_image(transformer.bgr_img)

    # Unified loop over all (h, v) pairs
    for h_line in hLines:
        for v_line in vLines:
            if lines_intersect(h_line.xyxy, v_line.xyxy):
                v_line.intersections.add(h_line.id)
                h_line.intersections.add(v_line.id)

            # Determine relative positions
            x_rel = v_line.center[0] - h_line.center[0]
            y_rel = v_line.center[1] - h_line.center[1]

            # calc now because we will do it anyways
            dist = get_min_endpoint_distance(h_line.xyxy, v_line.xyxy)
            # print(h_line.xyxy, v_line.xyxy)

            if dist > max_corner_distance:
                continue
            # print(dist)
            # Assign based on relative position (only one per v-line)
            if x_rel < 0:  # left
                if h_line.left is None or dist < h_line.left[1]:
                    h_line.left = [v_line, dist]
            elif x_rel > 0:  # right
                if h_line.right is None or dist < h_line.right[1]:
                    h_line.right = [v_line, dist]

            if y_rel < 0:  # top (v_line above h_line)
                if v_line.top is None or dist < v_line.top[1]:
                    v_line.top = [h_line, dist]
            elif y_rel > 0:  # bottom
                if v_line.bottom is None or dist < v_line.bottom[1]:
                    v_line.bottom = [h_line, dist]

            # if v_line.top is not None and v_line.bottom is not None:
            #     assigned_lines.add(v_line.id)
            #     assigned_lines.add(v_line.top[0].id)
            #     assigned_lines.add(v_line.bottom[0].id)
            # if h_line.left is not None and h_line.right is not None:
            #     assigned_lines.add(h_line.id)
            #     assigned_lines.add(h_line.left[0].id)
            #     assigned_lines.add(h_line.right[0].id)

    assigned_lines = set()
    hLines = [x for x in hLines if x.left is not None and x.right is not None]
    hLines.sort(key=lambda x: x.left[1] + x.right[1])
    for h_line in hLines:
        if h_line.id not in assigned_lines:
            assigned_lines.add(h_line.id)
            assigned_lines.add(h_line.left[0].id)
            assigned_lines.add(h_line.right[0].id)

    vLines = [
        x
        for x in vLines
        if (x.top is not None or x.bottom is not None) and len(x.intersections) < 5
    ]
    vLines.sort(key=lambda x: x.top[1] + x.bottom[1])
    for v_line in vLines:
        if v_line.id not in assigned_lines:
            assigned_lines.add(v_line.id)
            assigned_lines.add(v_line.top[0].id)
            assigned_lines.add(v_line.bottom[0].id)

    assigned = [x for x in vLines + hLines]  # if x.id in assigned_lines]
    # assigned = [x for x in vLines + hLines if x.id in assigned_lines]
    finalLines = [x.xyxy for x in assigned]

    w = img.shape[1]
    resizedW = transformer.bgr_img.shape[1]
    ratio = float(w) / float(resizedW)
    print(w, resizedW, ratio)

    finalLines = [np.array(ratio * x, dtype=np.int32) for x in finalLines]
    draw_lines(img, finalLines, False)

    # img = transformer.bgr_img
    # for box in boxes:
    #     cv2.fillPoly(img, [np.array(box, np.int32)], 255)  # DB50 mask
    # if best_box is not None:
    #     cv2.polylines(
    #         img,
    #         [np.array(best_box, np.int32)],
    #         isClosed=True,
    #         color=(0, 0, 255),
    #         thickness=1,
    #     )  # Annotate DB50 (Red)

    # # show_image(im_bw)
    show_image(img)

    return img_path


class Line:
    def __init__(self, line: PointBox):
        self.left: Tuple[Line, float] = None
        self.right: Tuple[Line, float] = None
        self.top: Tuple[Line, float] = None
        self.bottom: Tuple[Line, float] = None

        self.points: PointBox = line  # sort_bbox_corners(line)
        self.xyxy = points_to_xyxy(self.points)
        x1, y1, x2, y2 = self.xyxy
        self.center = (int((x1 + x2) / 2), int((y1 + y2) / 2))
        self.angle: int = round_number(calculate_line_angle(self.xyxy), 5)
        self.orientation: str = "h" if normalize_angle(self.angle) <= 45 else "v"
        self.id = str(self.center[0]) + str(self.center[1])
        self.intersections: Set[str] = set()

    def __str__(self):
        # return str(self.__class__) + ": " + str(self.__dict__)
        return "\n, ".join(
            [
                str(x)
                for x in [
                    self.points,
                    self.xyxy,
                    self.angle,
                    self.center,
                    self.orientation,
                    self.left,
                    self.right,
                ]
            ]
        )

    def __repr__(self):
        return str(self)

    def rotate(self, angle_degrees):
        """
        Rotate the line around its center point while maintaining its length
        angle_degrees: rotation angle in degrees (positive = counter-clockwise)
        """
        import math

        # Convert angle to radians
        rad = math.radians(angle_degrees)

        # Get line endpoints
        x1, y1, x2, y2 = self.xyxy

        # Calculate original vector
        dx = x2 - x1
        dy = y2 - y1

        # Calculate original length
        length = math.sqrt(dx * dx + dy * dy)

        # Calculate original angle
        original_angle = math.atan2(dy, dx)

        # Calculate new angle
        new_angle = rad  # original_angle + rad

        # Calculate new endpoints while maintaining length
        new_dx = length * math.cos(new_angle)
        new_dy = length * math.sin(new_angle)

        # Calculate new endpoints using center point
        cx, cy = self.center
        new_x1 = cx - new_dx / 2
        new_y1 = cy - new_dy / 2
        new_x2 = cx + new_dx / 2
        new_y2 = cy + new_dy / 2

        # Update line coordinates
        self.xyxy = np.array([new_x1, new_y1, new_x2, new_y2], dtype=np.int32)
        self.points = xyxy_to_points(self.xyxy)

        # Update angle and orientation
        self.angle = round_number(calculate_line_angle(self.xyxy), 5)
        self.orientation = "h" if self.angle <= 45 else "v"


if __name__ == "__main__":
    img_name = "not_warped_PXL_20251210_145631502.jpg"
    img_name = "IMG_4570.jpg"
    # img_name = "not_warped_IMG_20251209_124213.jpg"
    # img_name = "IMG_2752.jpg"
    # img_name = "IMG_5288.jpg"
    # img_name = "IMG_1697.jpg"
    img_name = "IMG_7490.jpg"
    img_name = "IMG_20251209_124213.jpg"
    img_dir = Path("source/images")
    if not img_dir.exists():
        img_dir.mkdir(exist_ok=True, parents=True)

    image_path = img_dir / img_name
    print(image_path)
    # Replace with your image folder
    # img = cv2.imread(image_path)
    try:

        results = process_images(str(image_path))
    except KeyboardInterrupt:
        print("\nKeyboard Interrupt received!")
        print("Performing cleanup operations...")
        # Add your cleanup code here
        sys.exit(0)  # Exit cleanly with a status code of 0
    finally:
        # Code in the finally block runs whether an exception occurred or not
        print("Exiting the program.")

    # print(results)
    # for i, result in enumerate(results):
    #     if result:
    #         # print(f"Image {i+1}: {result}")
    #         print(result)
    #     else:
    #         print(result)
    #         # print(f"Image {i+1}: No plate detected")
