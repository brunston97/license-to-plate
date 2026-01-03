import math
from pathlib import Path
import sys
from typing import List, Optional, Tuple
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
    sort_bbox_corners,
    xyxy_to_points,
    lines_intersect
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

    # Apply transformations and find lines
    # lines = transformer.resize(0.3).set_binary_img(155).find_lines()
    # print(lines[0])
    # lines = [Line(xyxy_to_points(line[0])) for line in lines]
    lines = transformer.resize(0.2).blur(5).dialate(1).find_lines()
    mergedLines = merge_lines([x[0] for x in lines], 10)
    lines = [Line(xyxy_to_points(line)) for line in mergedLines]

    hLines = [line for line in lines if line.orientation == "h"]
    vLines = [line for line in lines if line.orientation == "v"]
    assigned_vlines = set()

    for hLine in hLines:
        left_candidates  = []
        right_candidates = []
        for vLine in vLines:
            if(lines_intersect(hLine.xyxy, vLine.xyxy)):
                hLine.intersections.append(vLine)
                vLine.intersections.append(hLine)
            # Check if vline is to the left of the horizontal line
            if vLine.center[0] < hLine.center[0]:
                distance = int(get_min_endpoint_distance(hLine.xyxy, vLine.xyxy))
                #if hLine.left is None or distance < hLine.left[1]:
                hLine.left = [vLine, distance]
                left_candidates.append((vLine, distance))
            # Check if vline is to the right of the horizontal line
            elif vLine.center[0] > hLine.center[0]: 
                distance = int(get_min_endpoint_distance(hLine.xyxy, vLine.xyxy))
                #if hLine.right is None or distance < hLine.right[1]:
                hLine.right = [vLine, distance]
                right_candidates.append((vLine, distance))
            # Check if vline is above the horizontal line
            if vLine.center[1] < hLine.center[1]: 
                distance = int(get_min_endpoint_distance(hLine.xyxy, vLine.xyxy))
                if hLine.top is None or distance < hLine.top[1]:
                    hLine.top = [vLine, distance]
            
            # Check if vline is below the horizontal line
            elif vLine.center[1] > hLine.center[1]: 
                distance = int(get_min_endpoint_distance(hLine.xyxy, vLine.xyxy))
                if hLine.bottom is None or distance < hLine.bottom[1]:
                    hLine.bottom = [vLine, distance]
        # Pick the closest vertical line on each side
        left_candidates.sort(key=lambda x: x[1])
        right_candidates.sort(key=lambda x: x[1])
        if left_candidates:
            v, d = left_candidates[0]
            if v.id not in assigned_vlines:               # ensure one‑to‑one pairing
                hLine.left = [v, d]
                assigned_vlines.add(v.id)

        if right_candidates:
            v, d = right_candidates[0]
            if v.id not in assigned_vlines:
                hLine.right = [v, d]
                assigned_vlines.add(v.id)
    print(len(hLines))
    print(len(vLines))
    # print(sorted([x.center for x in hLines if x.left != None and x.right != None and x.angle <= 20], key=lambda x: x[0])) # and x.left[1] < 50 and x.right[1] < 50])
    chosen = [x for x in hLines if x.id == "446318"]
    if len(chosen) > 0:
        print(chosen[0].angle, chosen[0].right[1])
    #hLines = [x.xyxy for x in hLines]
    #hLines = list(filter(lambda x: len(x.intersections) <= 5 and x.left != None and x.right != None and x.left[1] < 30 and x.right[1] < 30, hLines))
    #vLines = list(filter(lambda x: len(x.intersections) <= 5 and x.top != None and x.bottom != None and x.top[1] < 30 and x.bottom[1] < 30, vLines))

    # hLines = [x for x in hLines if len(x.intersections) <= 5]
    # vLines = [x for x in vLines if len(x.intersections) <= 5]
    finalLines = []
    for line in hLines:
        #print(line)
        # closest_line = line.right[0] if line.right[0].angle > line.left[0].angle  else line.left[0]
        # if(line.left[0].id == closest_line.id):
        #     line.right[0].rotate(closest_line.angle)
        # else:
        #     line.left[0].rotate(closest_line.angle)
        if line.left and line.right:
            line.right[0].rotate(line.angle - 90)
            line.left[0].rotate(line.angle - 90)
            finalLines.extend([line.xyxy, line.left[0].xyxy, line.right[0].xyxy])

    # for line in vLines: 
    #     if line.top and line.bottom:
    #         line.top[0].rotate(line.angle - 90)
    #         line.bottom[0].rotate(line.angle - 90)
    #         finalLines.extend([line.xyxy, line.top[0].xyxy, line.bottom[0].xyxy])

    # hLines = [[x.xyxy, x.left[0].xyxy, x.right[0].xyxy] for x in hLines]
    # hLines = sum(hLines, [])

    # vLines = [[x.xyxy, x.top[0].xyxy, x.bottom[0].xyxy] for x in vLines]
    # vLines = sum(vLines, [])
    #print(hLines[0])
    #print(len(hLines))

    img = transformer.bgr_img
    draw_lines(img, finalLines, False)

    img_grey = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    img_bw = cv2.threshold(img_grey, 155, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    img_bw = cv2.cvtColor(img_bw, cv2.COLOR_GRAY2BGR)
    # img_grey = cv2.cvtColor(img_grey, cv2.COLOR_GRAY2BGR)

    #boxes = detect_bounding_boxes_partial(lines, transformer.bgr_img.shape, angle_tolerance=20 )

    # print(boxes)
    # print('printed boxes')

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
        
        self.points: PointBox =  sort_bbox_corners(line)
        self.xyxy = points_to_xyxy(self.points)
        x1, y1, x2, y2 = self.xyxy
        self.center = (int((x1 + x2) / 2), int((y1 + y2) / 2))
        self.angle: int = round_number(normalize_angle(calculate_line_angle(self.xyxy)), 5)
        self.orientation: str = "h" if self.angle <= 45 else "v"
        self.id = str(self.center[0])+str(self.center[1])
        self.intersections: List[Line] = []
    def __str__(self):
        #return str(self.__class__) + ": " + str(self.__dict__)
        return "\n, ".join([str(x) for x in [self.points, self.xyxy, self.angle, self.center, self.orientation, self.left, self.right]])
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
        length = math.sqrt(dx*dx + dy*dy)
        
        # Calculate original angle
        original_angle = math.atan2(dy, dx)
        
        # Calculate new angle
        new_angle = rad #original_angle + rad
        
        # Calculate new endpoints while maintaining length
        new_dx = length * math.cos(new_angle)
        new_dy = length * math.sin(new_angle)
        
        # Calculate new endpoints using center point
        cx, cy = self.center
        new_x1 = cx - new_dx/2
        new_y1 = cy - new_dy/2
        new_x2 = cx + new_dx/2
        new_y2 = cy + new_dy/2
        
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
    img_name = "IMG_2752.jpg"
    # img_name = "IMG_5288.jpg"
    # img_name = "IMG_1697.jpg"
    img_dir = Path("source/images")  # /output/warpedPlates")
    if not img_dir.exists():
        img_dir.mkdir(exist_ok=True, parents=True)

    image_path = img_dir / img_name
    print(image_path)
    # Replace with your image folder
    # recognize_text(str(Path("source/images/output/warpedPlates")))

    # img = cv2.imread(image_path)
    try:

        results = process_images(str(image_path))
    except KeyboardInterrupt:
        print("\nKeyboard Interrupt received!")
        print("Performing cleanup operations...")
        # Add your cleanup code here
        sys.exit(0) # Exit cleanly with a status code of 0
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
