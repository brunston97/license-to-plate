import cv2
import numpy as np
from ultralytics import YOLO  # type: ignore
from pathlib import Path
from typing import  Optional
from helpers import (
    PointBox,
    do_boxes_intersect,
    expand_bbox,
    find_corners_by_lines,
    find_largest_textbox,
    points_to_xyxy,
    sort_bbox_corners,
    sort_flat_boxes,
    xyxy_to_points,
)


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

    def four_point_transform(self, image: np.ndarray, pts: np.ndarray) -> np.ndarray:
        """
        Obtains a bird's-eye view of the image based on 4 points.
        """
        rect = sort_bbox_corners(pts)
        # rect = np.array(rect, dtype=np.float32)
        # print(rect)
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
            dtype=np.float32,
        )
        # print(dst)
        # Compute the perspective transform matrix and then apply it
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))

        return warped

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
            # confs = results.boxes.conf.cpu().numpy()
            # max_idx = confs.argmax()
            # best_conf = confs[max_idx]
            # best_box = results.boxes.xyxy[max_idx].cpu().numpy()  # [x1, y1, x2, y2]
            #boxes = np.array(results.boxes.xyxy, dtype=np.array[np.int32])
            boxes = results.boxes.xyxy.cpu().numpy()
            # print(boxes)
            # boxes = np.vstack((boxes, np.array([0, 0, 1000, 1000])))
            # print(boxes)

            sorted_boxes = sort_flat_boxes(boxes, ascending=False)
            # sorted_boxes = np.array(sorted_boxes, np.int32)
            best_box = sorted_boxes[0]

            # best_box = np.array(sorted_boxes[0], np.int32)
            index = np.where(boxes == best_box)[0][0]
            # print(best_box, index)
            best_conf = results.boxes.conf[index]
            best_box = np.array(best_box, np.int32)
            # print(results.boxes.conf)

            if best_box is not None:
                img = cv2.imread(str(image_path))
                if img is None:
                    continue
                best_point_box = xyxy_to_points(best_box)
                bounds[Path(image_path).name] = {
                    "bbox": best_point_box,
                    "confidence": float(best_conf),
                }

        return bounds

    def find_corners_contour_fallback(self, crop_img: np.ndarray) -> Optional[PointBox]:
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

    def run(self, image_folder_path: str):
        image_folder = Path(image_folder_path)
        output_path = image_folder / "output"
        #Path(f"{image_folder_path}/output/detectedPlates")
        missed_plates_path = output_path / "missedPlates"
        detected_plates_path = output_path / "detectedPlates"

        if not image_folder.exists():
            print(f"File not found: {image_folder_path}")
            return

        if not output_path.exists():
            output_path.mkdir(parents=True, exist_ok=True)
            detected_plates_path.mkdir(parents=True, exist_ok=True)
            missed_plates_path.mkdir(parents=True, exist_ok=True)

        print(f"Processing: {image_folder.name}")

        # 1. Detect Box
        bounds = self.detect_plate_bbox(image_folder)
        self.bounds = bounds
        with open('source/scans.txt', 'w') as f:
            f.write(str(self.bounds))
        # print(f"Plate Detected (Conf: {conf:.2f}) at: {bounds}")

        # 2. Crop Image
        for key in self.bounds:
            img = cv2.imread(str(image_folder / key))

            x1, y1, x2, y2 = points_to_xyxy(
                expand_bbox(
                    bounds[key]["bbox"],
                    img_shape=img.shape,
                    margin=img.shape[1] * 0.1,
                )
            )
            conf = bounds[key]["confidence"]
            output_img = img[y1:y2, x1:x2]
            #show_image(output_img)
            # show_image(original_img)
            output_name = "not_warped_" + key
            # output_img = crop.copy()

            if conf < 0.7:
                # 3. Find Corners (Try Lines first, then Contours)
                best_box = find_largest_textbox(img)
                if best_box is None:
                    continue

                x1, y1, x2, y2 = points_to_xyxy(
                    expand_bbox(best_box, img.shape, img.shape[1] * 0.2)
                )
                output_img = img[y1:y2, x1:x2]
                output_name = "textbox_" + key
                # show_image(output_img)

            elif False:

                print("Attempting Line Intersection Method...")
                corners = find_corners_by_lines(img)
                if corners is None:
                    print(
                        "Line method failed/insufficient data. Falling back to Contours..."
                    )
                    corners = self.find_corners_contour_fallback(output_img)
                print(do_boxes_intersect(corners, best_box))
                if corners is not None and do_boxes_intersect(corners, best_box):
                    # print(corners)
                    # merged_points = merge_overlapping_boxes(corners, best_box)
                    # x1, y1, x2, x2 = points_to_xyxy(merged_points)
                    # 4. Warp Perspective
                    output_img = self.four_point_transform(output_img, corners)
                    output_name = "warped_" + key
                    # show_image(output_img)
                    # cv2.imwrite(output_name, )
            img_size = np.array(((768 / img.shape[1]) * img.shape[1], (768 / img.shape[1]) * img.shape[0]), dtype=np.int32)
            output_img = cv2.resize(output_img, img_size)
            cv2.imwrite(detected_plates_path / output_name, output_img)
