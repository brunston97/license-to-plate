import math
from paddleocr import PaddleOCR
import numpy as np

def get_line_length(x):
    return  math.dist([x[0], x[1]], [x[2], x[3]])

def recognize_text(plate_img):
    """
    Recognize text in a license plate image using PaddleOCR.
    
    Args:
        plate_img (numpy array): Cropped license plate image
    
    Returns:
        str: Recognized text or empty string
    """
    # Initialize PaddleOCR
    ocr = PaddleOCR(use_textline_orientation=True, lang='en')

    # Run OCR
    result = ocr.predict(plate_img)
    toReturn = []

    #print(result)
    for res in result:
      #res.print()
      res.save_to_img("output")
      #res.save_to_json("output")
      maxVal = max(res["rec_boxes"], key=lambda x: get_line_length(x))
      index = np.where(res["rec_boxes"] == maxVal)[0][0]
      text = res["rec_texts"][index]
      toReturn.append(text)
    return ', '.join(toReturn)
