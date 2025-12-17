import cv2
import numpy as np
from ultralytics import YOLO  # type: ignore
from pathlib import Path
from typing import List, Tuple, Optional, Dict
import math
from paddleocr import PaddleOCR

from helpers import recognize_text, get_line_length


class LicensePlateProcess:
    def __init__(self, model_path: str):
        """Initialize the YOLO model once."""
        print(f"Loading model from: {model_path}")
        try:
            self.model = YOLO(model_path)
            self.bounds = dict()
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None

    def order_points(self, pts: np.ndarray) -> np.ndarray:
        """
        Orders coordinates in the form: top-left, top-right, bottom-right, bottom-left.
        Essential for consistent perspective transforms.
        """
        rect = np.zeros((4, 2), dtype="float32")

        # The top-left point will have the smallest sum, whereas
        # the bottom-right point will have the largest sum
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]
        rect[2] = pts[np.argmax(s)]

        # The top-right point will have the smallest difference,
        # whereas the bottom-left will have the largest difference
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]
        rect[3] = pts[np.argmax(diff)]

        return rect

    def four_point_transform(self, image: np.ndarray, pts: np.ndarray) -> np.ndarray:
        """
        Obtains a bird's-eye view of the image based on 4 points.
        """
        rect = self.order_points(pts)
        (tl, tr, br, bl) = rect

        # Compute the width of the new image
        widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        maxWidth = max(int(widthA), int(widthB))

        # Compute the height of the new image
        heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        maxHeight = max(int(heightA), int(heightB))

        # Construct destination points
        dst = np.array(
            [
                [0, 0],
                [maxWidth - 1, 0],
                [maxWidth - 1, maxHeight - 1],
                [0, maxHeight - 1],
            ],
            dtype="float32",
        )

        # Compute the perspective transform matrix and then apply it
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))

        return warped

    def expand_bounds(
        self,
        box: np.ndarray,
        img_w: int,
        img_h: int,
        scale: float = 1.1,
        min_width: int = None,
        max_width: int = None,
    ) -> List[int]:
        """
        Expands the bounding box by a scale factor, clamping to image boundaries.
        """
        x1, y1, x2, y2 = box
        center_x, center_y = (x1 + x2) / 2, (y1 + y2) / 2
        width, height = x2 - x1, y2 - y1

        new_width = width * scale
        new_height = height * scale

        if min_width is not None:
            new_width = max(new_width, min_width)
            new_height = max(new_width, new_height)
        if max_width is not None:
            new_width = min(new_width, max_width)
            new_height = min(new_width, new_height)

        new_x1 = max(0, center_x - new_width / 2)
        new_y1 = max(0, center_y - new_height / 2)
        new_x2 = min(img_w, center_x + new_width / 2)
        new_y2 = min(img_h, center_y + new_height / 2)

        return [int(new_x1), int(new_y1), int(new_x2), int(new_y2)]

    def detect_plate_bbox(self, read_path: Path) -> dict:
        """
        Runs YOLO to find the license plate. Returns a dictionary mapping image filename
        to {'bbox': [x1, y1, x2, y2], 'confidence': float}.
        """
        if self.model is None:
            return {}

        bounds = {}

        # Run YOLO inference
        mainResults = self.model(
            str(read_path),
            imgsz=640,
            verbose=False,
            save=True,
            project="output",
            name="detections",
            exist_ok=True,
        )

        for results in mainResults:
            if len(results.boxes) == 0:
                continue

            image_path = results.path
            confs = results.boxes.conf.cpu().numpy()
            max_idx = confs.argmax()
            best_conf = confs[max_idx]
            best_box = results.boxes.xyxy[max_idx].cpu().numpy()  # [x1, y1, x2, y2]

            if best_box is not None:
                img = cv2.imread(str(image_path))
                if img is None:
                    continue
                h, w = img.shape[:2]
                scaleFactor = 1.0 if best_conf > 0.7 else 1.5
                expanded_box = self.expand_bounds(
                    best_box, w, h, scale=scaleFactor, min_width=w // 3
                )
                bounds[Path(image_path).name] = {
                    "bbox": expanded_box,
                    "confidence": float(best_conf),
                }

        return bounds

    def compute_line_intersection(self, line1, line2) -> Optional[Tuple[int, int]]:
        """
        Finds intersection (x, y) of two lines given by ((x1, y1), (x2, y2)).
        Uses determinants.
        """
        x1, y1, x2, y2 = line1
        x3, y3, x4, y4 = line2

        denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
        if denom == 0:
            return None  # Parallel lines

        px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom
        py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom

        return int(px), int(py)

    def find_corners_by_lines(self, crop_img: np.ndarray) -> Optional[np.ndarray]:
        """
        Finds corners by detecting lines, extending them, finding intersections,
        and picking the 4 extreme intersections.
        """
        h, w = crop_img.shape[:2]
        gray = cv2.cvtColor(crop_img, cv2.COLOR_BGR2GRAY)

        # 1. Edge Detection
        # Canny parameters might need tweaking depending on lighting
        edges = cv2.Canny(gray, 50, 200, apertureSize=3)

        # 2. Hough Line Transform (Probabilistic)
        # minLineLength: lines shorter than this are rejected
        # maxLineGap: max gap between points to be considered same line
        lines = cv2.HoughLinesP(
            edges, 1, np.pi / 180, threshold=50, minLineLength=50, maxLineGap=10
        )

        if lines is None:
            return None
        # lines = self.unify_lines(lines=lines)
        img_copy = crop_img.copy()
        if lines is not None:
            for i in range(0, len(lines)):
                l = lines[i][0]
                cv2.line(
                    img_copy, (l[0], l[1]), (l[2], l[3]), (0, 255, 0), 3, cv2.LINE_AA
                )
        # cv2.imshow("lines", img_copy)

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
            sx1, sy1, sx2, sy2 = self.shrink_line(x1, y1, x2, y2, SHAVE_FACTOR)

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

        # 4. Find Intersections
        intersections = []
        for h_line in horizontal_lines:
            for v_line in vertical_lines:
                pt = self.compute_line_intersection(h_line, v_line)
                if pt:
                    px, py = pt
                    # 5. Filter Intersections:
                    # Allow points slightly outside the image (e.g. -10 to width+10)
                    # because corners might be just cut off.
                    margin = 20
                    if -margin <= px <= w + margin and -margin <= py <= h + margin:
                        intersections.append([px, py])

        if len(intersections) < 4:
            return None

        intersections = np.array(intersections, dtype="float32")

        # 6. Select Best 4 Corners
        # We assume the "true" corners are the extremes of these intersections.
        # We reuse the logic: Top-Left (min sum), Bottom-Right (max sum), etc.

        final_corners = np.zeros((4, 2), dtype="float32")

        # Sums (x+y)
        s = intersections.sum(axis=1)
        final_corners[0] = intersections[np.argmin(s)]  # TL
        final_corners[2] = intersections[np.argmax(s)]  # BR

        # Diffs (y-x) or (x-y)
        # np.diff does right - left (col1 - col0) = y - x
        diff = np.diff(intersections, axis=1)
        final_corners[1] = intersections[
            np.argmin(diff)
        ]  # TR (smallest y-x means large x small y)
        final_corners[3] = intersections[
            np.argmax(diff)
        ]  # BL (largest y-x means small x large y)

        return final_corners

    def find_corners_contour_fallback(
        self, crop_img: np.ndarray
    ) -> Optional[np.ndarray]:
        """
        Old method: useful fallback if line detection fails.
        """
        gray = cv2.cvtColor(crop_img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        contours, _ = cv2.findContours(
            thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        if not contours:
            return None

        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        for c in contours:
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.04 * peri, True)
            if len(approx) == 4:
                return approx.reshape(4, 2)

        x, y, w, h = cv2.boundingRect(contours[0])
        return np.array(
            [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], dtype="float32"
        )

    def shrink_line(self, x1, y1, x2, y2, shave_percent=0.1):
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

    def run(self, read_path: str):
        path_obj = Path(read_path)
        if not path_obj.exists():
            print(f"File not found: {read_path}")
            return

        print(f"Processing: {path_obj.name}")

        # 1. Detect Box
        bounds = self.detect_plate_bbox(path_obj)
        print(bounds)
        # #return
        # if len() is None:
        #     print("No license plate detected.")
        #     return
        self.bounds = bounds
        # print(f"Plate Detected (Conf: {conf:.2f}) at: {bounds}")

        # 2. Crop Image
        for key in self.bounds:
            original_img = cv2.imread(str(path_obj / key))
            x1, y1, x2, y2 = bounds[key]["bbox"]
            conf = bounds[key]["confidence"]
            crop = original_img[y1:y2, x1:x2]
            output_name = "not_warped_" + key
            warped = crop.copy()

            if conf < 0.7:
                # 3. Find Corners (Try Lines first, then Contours)
                print("Attempting Line Intersection Method...")
                corners = self.find_corners_by_lines(crop)

                if corners is None:
                    print(
                        "Line method failed/insufficient data. Falling back to Contours..."
                    )
                    corners = self.find_corners_contour_fallback(crop)

                if corners is not None:
                    # 4. Warp Perspective
                    warped = self.four_point_transform(crop, corners)
                    output_name = "warped_" + key
                    # cv2.imwrite(output_name, )

            cv2.imwrite(f"output/{output_name}", warped)
