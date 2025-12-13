from torch import Tensor
from ultralytics.utils.checks import check_requirements
from ultralytics import YOLO # type: ignore
import numpy as np

import cv2 as cv
import os
from pathlib import Path


import cv2
import numpy as np


def find_corners(im: cv.typing.MatLike):
    """ 
    Find "card" corners in a binary image.
    Return a list of points in the following format: [[640, 184], [1002, 409], [211, 625], [589, 940]] 
    The points order is top-left, top-right, bottom-left, bottom-right.
    """
    
    # Better approach: https://stackoverflow.com/questions/44127342/detect-card-minarea-quadrilateral-from-contour-opencv

    # Find contours in img.
    contours = cv2.findContours(im, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[-2]  # [-2] indexing takes return value before last (due to OpenCV compatibility issues).
    
    # mx = (0,0,0,0)      # biggest bounding box so far
    # mx_area = 0
    # for cont in contours:
    #     x,y,w,h = cv2.boundingRect(cont)
    #     area = w*h
    #     if area > mx_area:
    #         mx = x,y,w,h
    #         mx_area = area
    # x,y,w,h = mx

    # Find the contour with the maximum area (required if there is more than one contour).
    c = max(contours, key=cv2.contourArea)
    #print(c)

    # https://stackoverflow.com/questions/41138000/fit-quadrilateral-tetragon-to-a-blob
    epsilon = 0.1*cv2.arcLength(c, True)
    box = cv2.approxPolyDP(c, epsilon, True)

    # Draw box for testing
    tmp_im = cv2.cvtColor(im, cv2.COLOR_GRAY2BGR)

    mx_rect = (0,0,0,0)      # biggest skewed bounding box
    mx_area = 0
    for cont in contours:
        arect = cv2.minAreaRect(cont)
        area = arect[1][0]*arect[1][1]
        if area > mx_area:
            mx_rect, mx_area = arect, area

    tmp_im = crop_minAreaRect(tmp_im, mx_rect)
                # Resize image
    #tmp_im = tmp_im[0:300,0:300]
    #tmp_im = tmp_im[int(box[0]):int(box[0] + box[2] * 10 ), int(box[1]):int(box[1] + box[3]*10)]

    cv2.drawContours(tmp_im, [box], 0, (0, 255, 0), 2)
    cv2.imshow("tmp_im", tmp_im)
    # cv2.imshow("output", tmp_im)                       # Show image
    cv2.waitKey(0)  
    cv.destroyAllWindows()
    #box = np.squeeze(box).astype(np.float32) # Remove redundant dimensions


    # Sorting the points order is top-left, top-right, bottom-right, bottom-left.
    # Note: 
    # The method I am using is a bit of an "overkill".
    # I am not sure if the implementation is correct.
    # You may sort the corners using simple logic - find top left, bottom right, and match the other two points.
    ############################################################################
    # Find the center of the contour
    # https://docs.opencv.org/3.4/dd/d49/tutorial_py_contour_features.html
    # M = cv2.moments(c)
    # cx = M['m10']/M['m00']
    # cy = M['m01']/M['m00']
    # center_xy = np.array([cx, cy])

    # cbox = box - center_xy  # Subtract the center from each corner

    # # For a square the angles of the corners are:
    # # -135   -45
    # #
    # #
    # # 135     45
    # ang = np.arctan2(cbox[:,1], cbox[:,0]) * 180 / np.pi  # Compute the angles from the center to each corner
    # print(ang)
    # # Sort the corners of box counterclockwise (sort box elements according the order of ang).
    # box = box[ang.argsort()]
    # #print(box)
    # ############################################################################

    # # Reorder points: top-left, top-right, bottom-left, bottom-right
    # coor = np.float32(np.array([box[0], box[1], box[3], box[2]]))
    # print(box)
    # return coor


def crop_minAreaRect(img, rect):
    # Source: https://stackoverflow.com/questions/37177811/

    # rotate img
    angle = rect[2]
    rows,cols = img.shape[0], img.shape[1]
    matrix = cv2.getRotationMatrix2D((cols/2,rows/2),angle,1)
    img_rot = cv2.warpAffine(img,matrix,(cols,rows))

    # rotate bounding box
    rect0 = (rect[0], rect[1], 0.0)
    box = cv2.boxPoints(rect)
    pts = (cv2.transform(np.array([box]), matrix))[0]
    pts[pts < 0] = 0

    # crop and return
    return img_rot[pts[1][1]:pts[0][1], pts[1][0]:pts[2][0]]

# Load a model
#https://huggingface.co/morsetechlab/yolov11-license-plate-detection
model = YOLO(f"source\\license-plate-finetune-v1l.pt")  # load an official model
#model = YOLO(f"source\yolo11n.pt")  # load an official model

def expand_bounds(box: Tensor, scale = 2):
    x1, y1, x2, y2 = box
    center_x = (x1 + x2) / 2
    center_y = (y1 + y2) / 2
    width = x2 - x1
    height = y2 - y1
    new_width = width * scale
    new_height = height * scale
    new_x1 = center_x - new_width / 2
    new_y1 = center_y - new_height / 2
    new_x2 = center_x + new_width / 2
    new_y2 = center_y + new_height / 2
    return [new_x1, new_y1, new_x2, new_y2]

def get_bounding_box(folder_path):
    results = []
    toReturn = dict()
    save = False
    folder_path = folder_path + '\\20251207_133434.jpg'

    try:
        results = model(folder_path,imgsz=640, project='source\\output', name='', save=save, exist_ok=True)  # predict on an image
    except Exception as e: 
        print(e)

    #Access the results
    for result in results:
        if len(result.boxes.xyxy) == 0:
            continue

        # Get confidence scores (all boxes)
        confs = result.boxes.conf        
        # Find index of highest confidence
        max_idx = confs.argmax()        
        # Get the most confident bounding box (xyxy format)
        best_box = result.boxes.xyxy[max_idx]
        print(best_box)
        
        # Now best_box contains [x1, y1, x2, y2] for the top confidence box
        bounds = expand_bounds(best_box, 4)
        print(bounds)
        p = Path(result.path)
        toReturn[p.name] = {
            "bounds": bounds,
            "path": str(p.absolute()),
            "conf": confs[max_idx]
            }
    return toReturn

def change_perspective(path, box):
    # Load the image
    #img = cv.imread(path) # Replace with your image file path
    #rows, cols, ch = img.shape
    # print(box)

    input_image2 = cv.imread(path, cv.IMREAD_GRAYSCALE)  # Read image as Grayscale
    input_image2 = input_image2[ int(box[1]):int(box[3]), int(box[0]):int( box[2] )]

    # cv.imshow("tmp_im", input_image2)
    # # cv2.imshow("output", tmp_im)                       # Show image
    # cv.waitKey(0)  
    # cv.destroyAllWindows()


    input_image2 = cv.threshold(input_image2, 0, 255, cv.THRESH_OTSU)[1]  # Convert to binary image (just in case...)
    original_height, original_width = input_image2.shape[:2]
    new_width = 720
    aspect_ratio = new_width / original_width
    new_height = int(original_height * aspect_ratio)

    #print(box)

    #tmp_im = tmp_im[0:300,0:300]
    input_image2 = cv2.resize(input_image2, (new_width, new_height))
    # orig_im_coor = np.float32([[640, 184], [1002, 409], [211, 625], [589, 940]])
    #input_image2 = input_image2[int(box[0]):int( box[2] ), int(box[1]):int(box[3])]

    cv.imshow("tmp_im", input_image2)
    # cv2.imshow("output", tmp_im)                       # Show image
    cv.waitKey(0)  
    cv.destroyAllWindows()


    # Find the corners of the card, and sort them
    orig_im_coor = find_corners(input_image2)

    height, width = 450, 350
    new_image_coor =  np.float32(np.array([[0, 0], [width, 0], [0, height], [width, height]]))

    P = cv.getPerspectiveTransform(orig_im_coor, new_image_coor)

    perspective = cv.warpPerspective(input_image2, P, (width, height))
    cv.imshow("Perspective transformation", perspective)

    cv.waitKey(0)
    cv.destroyAllWindows()

if __name__ == "__main__":
    folder_path = "source\\images"  # Replace with your image folder
    results = get_bounding_box(folder_path)
    print(results)
    img_to_process = "20251207_133434.jpg"
    if(img_to_process in results):
        change_perspective(results[img_to_process]["path"], results[img_to_process]["bounds"])