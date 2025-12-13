import cv2
import numpy as np
from ultralytics import YOLO
from pathlib import Path
from typing import List, Tuple, Optional
import math


class LicensePlateProcess:
    def __init__(self, model_path: str):
        """Initialize the YOLO model once."""
        print(f"Loading model from: {model_path}")
        try:
            self.model = YOLO(model_path)
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
        dst = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1]], dtype="float32")

        # Compute the perspective transform matrix and then apply it
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))

        return warped

    def expand_bounds(self, box: np.ndarray, img_w: int, img_h: int, scale: float = 1.1) -> List[int]:
        """
        Expands the bounding box by a scale factor, clamping to image boundaries.
        """
        x1, y1, x2, y2 = box
        center_x, center_y = (x1 + x2) / 2, (y1 + y2) / 2
        width, height = x2 - x1, y2 - y1

        new_width = width * scale
        new_height = height * scale

        new_x1 = max(0, center_x - new_width / 2)
        new_y1 = max(0, center_y - new_height / 2)
        new_x2 = min(img_w, center_x + new_width / 2)
        new_y2 = min(img_h, center_y + new_height / 2)

        return [int(new_x1), int(new_y1), int(new_x2), int(new_y2)]

    def detect_plate_bbox(self, image_path: Path) -> Tuple[Optional[List[int]], Optional[float]]:
        """
        Runs YOLO to find the license plate. Returns (bbox, confidence).
        """
        if self.model is None:
            return None, None

        results = self.model(str(image_path), imgsz=640, verbose=False)
        
        best_box = None
        best_conf = -1.0

        for result in results:
            if len(result.boxes) == 0:
                continue
            
            # Get the highest confidence box
            confs = result.boxes.conf.cpu().numpy()
            max_idx = confs.argmax()
            best_conf = confs[max_idx]
            best_box = result.boxes.xyxy[max_idx].cpu().numpy() # x1, y1, x2, y2

        if best_box is not None:
            # Load image just to get dims for safe clamping
            img = cv2.imread(str(image_path))
            h, w = img.shape[:2]
            # Expand the box slightly to ensure we capture the edges
            final_box = self.expand_bounds(best_box, w, h, scale=5)
            return final_box, best_conf
        
        return None, 0.0

    def find_plate_corners_in_crop(self, crop_img: np.ndarray) -> Optional[np.ndarray]:
        """
        Finds the 4 corners of the plate inside the cropped YOLO image.
        """
        gray = cv2.cvtColor(crop_img, cv2.COLOR_BGR2GRAY)
        
        # Preprocessing: Blur and Threshold
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        # Otsu's thresholding often works well for plates
        _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        dst = cv2.Canny(crop_img, 50, 200, None, 3)
        cdst = cv2.cvtColor(dst, cv2.COLOR_GRAY2BGR)
        cdstP = np.copy(cdst)
        
        lines = cv2.HoughLines(dst, 1, np.pi / 180, 150, None, 0, 0)
        
        if lines is not None:
            for i in range(0, len(lines)):
                rho = lines[i][0][0]
                theta = lines[i][0][1]
                a = math.cos(theta)
                b = math.sin(theta)
                x0 = a * rho
                y0 = b * rho
                pt1 = (int(x0 + 1000*(-b)), int(y0 + 1000*(a)))
                pt2 = (int(x0 - 1000*(-b)), int(y0 - 1000*(a)))
                cv2.line(cdst, pt1, pt2, (0,0,255), 3, cv2.LINE_AA)
        
        
        linesP = cv2.HoughLinesP(dst, 1, np.pi / 180, 50, None, 50, 10)
        
        if linesP is not None:
            for i in range(0, len(linesP)):
                l = linesP[i][0]
                cv2.line(cdstP, (l[0], l[1]), (l[2], l[3]), (255,255,255), 3, cv2.LINE_AA)
        
        #cv2.imshow("Source", crop_img)
        #cv2.imshow("Detected Lines (in red) - Standard Hough Line Transform", cdst)
        #cv2.imshow("Detected Lines (in red) - Probabilistic Line Transform", cdstP)

        gray = cv2.cvtColor(cdst, cv2.COLOR_BGR2GRAY)
        # Preprocessing: Blur and Threshold
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        # Otsu's thresholding often works well for plates
        _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        #contours, _ = cv2.findContours(cdstP, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        image_copy = thresh.copy()
        cv2.drawContours(image=image_copy, contours=contours, contourIdx=-1, color=(0, 255, 0), thickness=2, lineType=cv2.LINE_AA)
        #cv2.namedWindow("Contour", cv2.WINDOW_NORMAL)

        cv2.imshow("Contour", image_copy)

        # Sort contours by area, largest first
        contours = sorted(contours, key=cv2.contourArea, reverse=True)

        for c in contours:
            peri = cv2.arcLength(c, True)
            # Approximate the contour to a polygon
            approx = cv2.approxPolyDP(c, 0.04 * peri, True)

            # If our approximated contour has 4 points, we assume it's the plate
            if len(approx) == 4:
                return approx.reshape(4, 2)
        
        # Fallback: if no 4-point polygon found, return the bounding rect of the largest contour
        x, y, w, h = cv2.boundingRect(contours[0])
        return np.array([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], dtype="float32")

    def run(self, image_path: str):
        path_obj = Path(image_path)
        if not path_obj.exists():
            print(f"File not found: {image_path}")
            return

        print(f"Processing: {path_obj.name}")

        # 1. Detect Box
        bounds, conf = self.detect_plate_bbox(path_obj)
        
        if bounds is None:
            print("No license plate detected.")
            return

        print(f"Plate Detected (Conf: {conf:.2f}) at: {bounds}")

        # 2. Crop Image
        original_img = cv2.imread(str(path_obj))
        x1, y1, x2, y2 = bounds
        crop = original_img[y1:y2, x1:x2]

        #gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        #ret,thresh = cv2.threshold(gray,70,255,0)
        #crop = thresh

        # Debug: Show Crop
        #cv2.imshow("YOLO Crop", crop)

        # 3. Find accurate corners inside the crop
        # Resize for consistent processing if needed, though usually YOLO crop is small enough
        # We perform finding corners on the crop
        corners = self.find_plate_corners_in_crop(crop)

        if corners is not None:
            # 4. Warp Perspective
            warped = self.four_point_transform(crop, corners)
            cv2.namedWindow("Original Crop", cv2.WINDOW_NORMAL)
            cv2.namedWindow("Warped Perspective", cv2.WINDOW_NORMAL)
            # Display Results
            cv2.imshow("Original Crop", crop)
            cv2.imshow("Warped Perspective", warped)
            
            print("Press any key to close windows...")
            cv2.waitKey(0)
            cv2.destroyAllWindows()
        else:
            print("Could not find rectangular contours inside the crop.")
            cv2.imshow("Crop (No Contours)", crop)
            cv2.waitKey(0)
            cv2.destroyAllWindows()

    def allContours(self, img_original, masque, toggleMode) :
        if toggleMode :
            #trouve les contours sur l'image
            image_copy = img_original.copy()
            contours, hier = cv2.findContours(image=masque, mode=cv2.RETR_TREE, method=cv2.CHAIN_APPROX_NONE)
            cv2.drawContours(image=image_copy, contours=contours, contourIdx=-1, color=(0, 255, 0), thickness=2, lineType=cv2.LINE_AA)
            return image_copy
        else :
            return None


if __name__ == "__main__":
    # Settings
    # Use raw strings (r"...") or forward slashes for paths to avoid escape character issues
    MODEL_PATH = r"source/license-plate-finetune-v1l.pt" 
    
    # If using standard YOLO for testing:
    # MODEL_PATH = "yolo11n.pt" 

    # Image to process
    target_folder = Path("source/images")
    target_image = "IMG_2752.jpg"
    
    full_image_path = target_folder / target_image

    # Execution
    processor = LicensePlateProcess(model_path=MODEL_PATH)
    
    # Check if we are processing a specific file or a whole folder logic
    # For now, processing the specific file requested:
    processor.run(str(full_image_path))