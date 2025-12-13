import cv2
import numpy as np
import paddlex as pdx
from paddleocr import PaddleOCR, draw_ocr
import os

def detect_license_plate(image_path):
    """
    Detect license plates in an image using PaddleX and return the largest bounding box.
    
    Args:
        image_path (str): Path to the input image
    
    Returns:
        tuple: (cropped_plate_image, bounding_box) or (None, None) if no plate detected
    """
    # Load pre-trained license plate detection model
    # Note: You need to replace 'license_plate_model' with your actual model path
    # You can download a sample model from: https://paddlex.com/models/detection/
    model = pdx.det.Detection(model_dir='license_plate_model', use_gpu=True)
    
    # Run inference
    results = model.predict(image_path)
    
    if not results:
        return None, None
    
    # Find the largest bounding box (by area)
    max_area = 0
    largest_box = None
    for result in results:
        x1, y1, x2, y2 = result['bbox']
        area = (x2 - x1) * (y2 - y1)
        if area > max_area:
            max_area = area
            largest_box = result['bbox']
    
    # Crop the image to the largest plate region
    img = cv2.imread(image_path)
    x1, y1, x2, y2 = map(int, largest_box)
    plate_img = img[y1:y2, x1:x2]
    
    return plate_img, largest_box

def recognize_text(plate_img):
    """
    Recognize text in a license plate image using PaddleOCR.
    
    Args:
        plate_img (numpy array): Cropped license plate image
    
    Returns:
        str: Recognized text or empty string
    """
    # Initialize PaddleOCR
    ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
    
    # Run OCR
    result = ocr.ocr(plate_img, cls=True)
    
    # Extract text from results
    if result and len(result) > 0:
        # Combine all detected text segments
        text = []
        for line in result[0]:
            text.append(line[1][0])
        return ''.join(text)
    return ""

def main(image_path):
    """Main function to process the image and output license plate text."""
    # Validate input image
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")
    
    # Detect license plate
    plate_img, bbox = detect_license_plate(image_path)
    
    if plate_img is None or bbox is None:
        print("No license plate detected in the image.")
        return
    
    # Recognize text
    recognized_text = recognize_text(plate_img)
    
    # Output results
    print("\n" + "="*50)
    print(f"License Plate Recognition Results")
    print("="*50)
    print(f"Input Image: {os.path.basename(image_path)}")
    print(f"Detected Plate Region: {bbox}")
    print(f"Recognized Text: {recognized_text}")
    print("="*50)
    
    # Optional: Save cropped plate image
    cv2.imwrite("detected_plate.jpg", plate_img)
    print("Cropped plate saved as 'detected_plate.jpg'")

if __name__ == "__main__":
    # Example usage - replace with your image path
    IMAGE_PATH = ".\\images\\PXL_20251210_145631502.jpg"
    
    # Check if image exists
    if not os.path.exists(IMAGE_PATH):
        print(f"Error: Image '{IMAGE_PATH}' not found.")
        print("Please replace 'your_license_plate_image.jpg' with your actual image path")
        print("or download a sample image from: https://paddlex.com/datasets/license_plate/")
        print("Sample image URL: https://paddlex.com/static/images/license_plate_sample.jpg")
        exit(1)
    
    main(IMAGE_PATH)