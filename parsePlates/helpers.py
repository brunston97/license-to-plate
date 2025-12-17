import math
import os
import sys
from paddleocr import PaddleOCR
import numpy as np
import cv2


def get_line_length(x):
    return math.dist([x[0], x[1]], [x[2], x[3]])


def recognize_text(plate_img):
    """
    Recognize text in a license plate image using PaddleOCR.

    Args:
        plate_img (numpy array): Cropped license plate image

    Returns:
        str: Recognized text or empty string
    """
    print(plate_img)
    # img = cv2.imread(plate_img)
    # resized_img = cv2.resize(
    #     img, (400, 300)
    # )  # , fx=0.75, fy=0.75, interpolation=cv2.INTER_AREA, )
    # cv2.imshow("test", resized_img)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    # 4. Close all open OpenCV windows
    # return ""

    toReturn = []
    # Initialize PaddleOCR
    ocr = PaddleOCR(use_textline_orientation=True, lang="en")
    # return ""
    # Run OCR
    try:
        for filename in os.listdir(plate_img):
            result = None
            if filename.endswith(
                (".jpg", ".jpeg", ".png")
            ):  # Add more extensions if needed
                image_path = os.path.join(plate_img, filename)
                img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
                im_bw = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY)[1]
                cv2.imshow("test", im_bw)
                cv2.waitKey(0)
                cv2.destroyAllWindows()
                try:
                    result = ocr.predict(im_bw)
                    print(result)
                except Exception as e:
                    print(e)
            if result != None:
                # return ""
                for res in result:
                    # res.print()
                    res.save_to_img("output/reads")
                    # res.save_to_json("output")
                    maxVal = max(res["rec_boxes"], key=lambda x: get_line_length(x))
                    index = np.where(res["rec_boxes"] == maxVal)[0][0]
                    text = res["rec_texts"][index]
                    toReturn.append(text)
    except Exception as e:
        print(e)
    except KeyboardInterrupt:
        print("\nCtrl+C pressed! Cleaning up and exiting gracefully.")
        # Perform cleanup operations here
        sys.exit(0)

    return "\n".join(toReturn)
