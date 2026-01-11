from collections import Counter
import math
import random
from typing import List, Sequence, Tuple
import cv2
import numpy as np

from typing import List, Tuple

# --- 1. Update the type alias ---------------------------------------------
Line = List[int]  # e.g., [x1, y1, x2, y2]  (all integers)

# Connection stays the same
Connection = Tuple[Tuple[int, int], Tuple[int, int]]
Box = Tuple[int, int, int, int]  # (x1, y1, x2, y2)
PointBox = List[
    Tuple[float, float]
]  # , Tuple[int, int], Tuple[int, int], Tuple[int, int]]
Boxes = Sequence[Box]  # any iterable of boxes


def points_to_xyxy(points: PointBox) -> Box:
    """
    Calculate the bounding box from a list of points.

    Parameters:
    - points: A list of tuples representing the coordinates of the corners of the box (x, y).

    Returns:
    - A tuple containing the minimum and maximum x and y values defining the bounding box.
    """
    # Convert the list of points to a NumPy array for easier manipulation
    points_array = np.array(points).flatten()

    # Calculate the min and max along each axis (0: x-axis, 1: y-axis)
    # xmin, xmax = points_array[:, 0].min(), points_array[:, 0].max()
    # ymin, ymax = points_array[:, 1].min(), points_array[:, 1].max()

    # Return the bounding box as a tuple
    # return (xmin, ymin, xmax, ymax)
    return points_array


def get_line_length(x):
    """
    Docstring for get_line_length

    :param x: Description
    """
    return math.dist([x[0], x[1]], [x[2], x[3]])


def expand_bbox(
    bbox: PointBox, img_shape: tuple[int, int], margin: int = 20
) -> PointBox:
    """
    Expands a bounding box by a given margin.

    Args:
    - bbox (PointBox): The input bounding box.
    - img_shape (tuple[int, int]): The shape of the image.
    - margin (int, optional): The expansion margin. Defaults to 20.

    Returns:
    - PointBox: The expanded bounding box.
    """
    # Calculate the minimum and maximum x and y coordinates
    min_x = min(point[0] for point in bbox)
    max_x = max(point[0] for point in bbox)
    min_y = min(point[1] for point in bbox)
    max_y = max(point[1] for point in bbox)

    # Calculate the expanded bounding box coordinates
    expanded_min_x = max(0, min_x - margin)
    expanded_max_x = min(img_shape[1], max_x + margin)
    expanded_min_y = max(0, min_y - margin)
    expanded_max_y = min(img_shape[0], max_y + margin)

    # Create the expanded bounding box
    expanded_bbox = [
        (expanded_min_x, expanded_min_y),
        # (expanded_max_x, expanded_min_y),
        (expanded_max_x, expanded_max_y),
        # (expanded_min_x, expanded_max_y),
    ]

    return np.array((expanded_bbox), dtype=np.int32)


def show_image(img: cv2.typing.MatLike):
    cv2.namedWindow("test", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("test", 600, 600)
    cv2.imshow("test", img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


def sort_bbox_corners(points: PointBox) -> PointBox:
    """
    Sort 4 corner points of a bounding box into TL, TR, BR, BL order.

    Parameters
    ----------
    points : array‑like of shape (4, 2)
        The four corner points in any order.

    Returns
    -------
    sorted_points : numpy.ndarray of shape (4, 2)
        The points sorted as [TL, TR, BR, BL].
    """
    pts = np.asarray(points, dtype=np.int32)

    # 1. Compute the sum and difference of coordinates
    #    sum  : (x + y) – gives a relative “vertical” order
    #    diff : (y - x) – gives a relative “horizontal” order
    s = pts.sum(axis=1)
    d = np.diff(pts, axis=1).squeeze()

    # 2. Order based on the sums (smallest = top, largest = bottom)
    top_idx = np.argmin(s)  # TL
    bottom_idx = np.argmax(s)  # BR

    # 3. Order based on the diffs (smallest = right, largest = left)
    right_idx = np.argmin(d)  # TR
    left_idx = np.argmax(d)  # BL

    # 4. Assemble in TL, TR, BR, BL order
    sorted_pts = np.array(
        [
            pts[top_idx],  # TL
            pts[right_idx],  # TR
            pts[bottom_idx],  # BR
            pts[left_idx],  # BL
        ],
        dtype=np.int32,
    )

    return sorted_pts


def sort_flat_boxes(boxes, ascending=False):
    return sorted(boxes, key=get_line_length, reverse=ascending == False)


def find_largest_textbox(img: cv2.typing.MatLike) -> PointBox | None:
    # Set threshold for Binary Map creation and polygon detection.
    binThresh = 0.3
    polyThresh = 0.5
    mean = (122.67891434, 116.66876762, 104.00698793)
    textDetectorDB50 = cv2.dnn_TextDetectionModel_DB("source/DB_TD500_resnet50.onnx")
    textDetectorDB50.setBinaryThreshold(binThresh)
    textDetectorDB50.setPolygonThreshold(polyThresh)
    textDetectorDB50.setInputParams(1 / 255, (736, 736), mean, True)
    img = cv2.medianBlur(img, 3)
    boxes, confidences = textDetectorDB50.detect(img)
    # if 1:
    #     for box in boxes:
    #         cv2.polylines(
    #             img,
    #             [np.array(box, np.int32)],
    #             isClosed=True,
    #             color=(0, 0, 255),
    #             thickness=1,
    #         )
    #     show_image(img)
    if len(boxes) == 0:
        return None

    boxes, _ = sort_boxes_by_area(boxes, False)
    return boxes[0]


def group_boxes_by_height(
    boxes: List[Box],
    *,
    abs_tol: float = 0.0,  # absolute pixel tolerance (default 0 → exact match)
    rel_tol: float = 0.0,  # relative tolerance as a fraction (e.g. 0.1 = 10%)
    min_group_size: int = 1,  # ignore groups smaller than this
    return_indices: bool = False,  # if True, return lists of indices instead of boxes
) -> List[List[Box]]:
    """
    Group bounding boxes by similar height.

    Parameters
    ----------
    boxes:
        List of bounding boxes in (x, y, x2, y2) format.
    abs_tol:
        Absolute pixel tolerance. Two boxes are considered the same height
        if |h1 - h2| <= abs_tol.
    rel_tol:
        Relative tolerance (fraction of the average height). Used as an
        alternative to abs_tol. Ignored if abs_tol > 0.
    min_group_size:
        Groups containing fewer items than this threshold are dropped.
    return_indices:
        If True, return the list of indices of the original input list
        instead of the boxes themselves.

    Returns
    -------
    groups:
        List of groups. Each group is either a list of BBox objects or
        a list of indices depending on ``return_indices``.
    """
    # ------------------------------------------------------------------
    # 1. Compute heights and keep the original indices
    # ------------------------------------------------------------------
    heights = [(i, b[3] - b[1]) for i, b in enumerate(boxes)]

    # ------------------------------------------------------------------
    # 2. Decide the tolerance to use
    # ------------------------------------------------------------------
    if abs_tol <= 0 and rel_tol <= 0:
        raise ValueError("At least one of abs_tol or rel_tol must be > 0")

    # ------------------------------------------------------------------
    # 3. Bucket boxes by height using a simple O(n^2) sweep
    #    (good for typical OCR sizes – thousands of boxes is still fine)
    # ------------------------------------------------------------------
    visited = [False] * len(boxes)
    groups = []

    for i, hi in heights:
        if visited[i]:
            continue

        current_group = [i] if return_indices else [boxes[i]]
        visited[i] = True

        for j, hj in heights[i + 1 :]:
            if visited[j]:
                continue

            # Calculate tolerance for this pair
            tol = abs_tol
            if tol <= 0 and rel_tol > 0:
                avg_h = (hi + hj) / 2.0
                tol = rel_tol * hi  # avg_h

            if abs(hi - hj) <= tol:
                visited[j] = True
                current_group.append(j if return_indices else boxes[j])

        if len(current_group) >= min_group_size:
            groups.append(current_group)
    # print(groups)

    return groups


def xyxy_to_points(
    xyxy: tuple[float, float, float, float],
) -> List[Tuple[float, float]]:
    """
    Converts an XYXY bounding box to a list of points.

    Args:
    - xyxy (tuple[float, float, float, float]): The input XYXY bounding box.

    Returns:
    - List[Tuple[float, float]]: The converted list of points.
    """
    x1, y1, x2, y2 = xyxy

    # Create the list of points
    # points = [(x1, y1), (x2, y1), (x2, y2), (x1, y2)]
    points = [(x1, y1), (x2, y2)]
    return points


def calculate_line_angle(line: Box):
    """
    Calculate the angle between two points.

    Args:
    - line (Box): The 4 point box.

    Returns:
    - float: The angle in degrees.
    """
    x1, y1, x2, y2 = line
    dx = x2 - x1
    dy = y2 - y1
    angle = np.degrees(np.arctan2(dy, dx))

    # # normalize angle
    # if angle > 90:
    #     angle -= 180
    # if angle < -90:
    #     angle += 180
    # # if angle < 0:
    # #     angle += 360

    # return abs(angle)
    return angle


def normalize_angle(angle):
    # normalize angle
    if angle > 90:
        angle -= 180
    if angle < -90:
        angle += 180
    # if angle < 0:
    #     angle += 360

    return abs(angle)


# def detect_strongest_lines(img: cv2.typing.MatLike) -> Tuple[Sequence, cv2.typing.MatLike]:


def draw_lines(
    img, lines=List[Tuple[int, int, int, int]], randomColor=True
) -> cv2.typing.MatLike:
    color = (
        random.randrange(0, 255),
        random.randrange(0, 255),
        random.randrange(0, 255),
    )
    if randomColor == False:
        color = (0, 255, 0)

    line_width = max(int(img.shape[1] * 0.005), 2)
    for i in range(0, len(lines)):
        # print(np.array(lines[i]).ndim)
        if np.array(lines[i]).ndim == 1:
            l = lines[i]
        else:
            l = tuple(map(int, lines[i][0]))
        # l = lines[i][0]
        # l = lines[i]
        cv2.line(img, (l[0], l[1]), (l[2], l[3]), color, line_width, cv2.LINE_AA)
    return img


class ImageTransformer:
    def __init__(self, img: np.ndarray):
        """
        Initialize the ImageTransformer with an image.

        Args:
            img (np.ndarray): The input image.
        """
        div = 128
        img = img.copy()
        img = img // div * div + div // 2
        self.bgr_img = img
        self.gray_img = cv2.cvtColor(self.bgr_img, cv2.COLOR_BGR2GRAY)
        self.binary_img = None
        self.edges_img = None
        self.set_binary_img()

    def resize(self, scale_factor: float) -> "ImageTransformer":
        """
        Resize the image by a given scale factor.

        Args:
            scale_factor (float): The scale factor for resizing.

        Returns:
            ImageTransformer: The updated ImageTransformer instance.
        """
        h, w = self.bgr_img.shape[:2]
        new_size = np.array((w * scale_factor, h * scale_factor), dtype=np.int32)
        # new_size = (500, 500)
        self.bgr_img = cv2.resize(self.bgr_img, tuple(new_size))
        self.gray_img = cv2.cvtColor(self.bgr_img, cv2.COLOR_BGR2GRAY)
        self.set_binary_img()
        return self

    def set_binary_img(self, threshold: int = 155) -> "ImageTransformer":
        """
        Apply a binary threshold to the grayscale image.

        Args:
            threshold (int): The threshold value for binarization.

        Returns:
            ImageTransformer: The updated ImageTransformer instance.
        """
        _, self.binary_img = cv2.threshold(
            self.gray_img, threshold, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU
        )
        self.edges_img = cv2.Canny(self.binary_img, 50, 200)
        return self

    def find_lines(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Find lines in the image using the Hough Line Transform.

        Returns:
            Tuple[np.ndarray, np.ndarray]: The detected lines and their coordinates.
        """
        self.set_binary_img()

        # Load image, convert to grayscale, and apply thresholding or Canny edge detection
        ret, thresh = cv2.threshold(
            self.gray_img, 127, 255, cv2.THRESH_BINARY
        )  # or use cv2.Canny()

        # Find contours
        # For OpenCV 3.x and 4.x, findContours typically returns two or three values
        contours, hierarchy = cv2.findContours(
            thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE
        )

        # Draw all contours as lines on a blank image
        # Use a positive thickness value (e.g., 2) to draw the boundary lines
        blank_mask = np.zeros_like(self.bgr_img)  # A black image to draw on
        cv2.drawContours(blank_mask, contours, -1, (255, 255, 255), 2)
        # self.edges_img = cv2.Canny(self.binary_img, 50, 200)

        # show_image(self.binary_img)
        # show_image(self.edges_img)
        show_image(blank_mask)

        lines = cv2.HoughLinesP(
            # self.edges_img,
            cv2.cvtColor(blank_mask, cv2.COLOR_BGR2GRAY),
            1,
            np.pi / 180,
            threshold=50,
            minLineLength=40,  # int(self.bgr_img.shape[1] * .05),
            maxLineGap=3,
        )
        # copy = self.bgr_img.copy()
        # draw_lines(copy, [x[0] for x in lines])
        # show_image(copy)

        return lines

    def show_image(self, img: np.ndarray) -> None:
        """
        Display an image.

        Args:
            img (np.ndarray): The image to display.
        """
        cv2.imshow("Image", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    def dialate(self, iterations=1):
        kernel = np.ones((1, 1), np.uint8)
        self.edges_img = cv2.dilate(self.edges_img, kernel, iterations=iterations)
        # self.edges_img = cv2.erode(self.edges_img, kernel, iterations=iterations)
        return self

    def blur(self, factor: int = 5):
        # show_image(self.gray_img)
        factor = factor if factor % 2 == 1 else factor - 1
        self.gray_img = cv2.medianBlur(self.gray_img, factor)
        # self.edges_img = cv2.Canny(self.gray_img, 50, 200)
        self.set_binary_img()
        return self



# ---------- Helper functions ----------
def _distance_point_to_line(px, py, x1, y1, x2, y2):
    """Shortest distance from (px,py) to segment (x1,y1)-(x2,y2)."""
    vx, vy = x2 - x1, y2 - y1
    wx, wy = px - x1, py - y1
    c1 = wx * vx + wy * vy
    c2 = vx * vx + vy * vy
    if c2 == 0:  # degenerate segment
        return ((px - x1) ** 2 + (py - y1) ** 2) ** 0.5
    t = max(0, min(1, c1 / c2))
    projx = x1 + t * vx
    projy = y1 + t * vy
    return ((px - projx) ** 2 + (py - projy) ** 2) ** 0.5


def _merge_two_lines(l1, l2, tolerance):
    """
    Merge two segments if they’re almost colinear and within `tolerance`.
    Returns the merged segment as (x1, y1, x2, y2) or None if they shouldn’t merge.
    """
    # Check how far each end of l2 is from l1
    d1 = _distance_point_to_line(l2[0], l2[1], *l1)
    d2 = _distance_point_to_line(l2[2], l2[3], *l1)
    if max(d1, d2) > tolerance:
        return None

    # Check orientation (colinearity)
    dx1, dy1 = l1[2] - l1[0], l1[3] - l1[1]
    dx2, dy2 = l2[2] - l2[0], l2[3] - l2[1]
    dot = dx1 * dx2 + dy1 * dy2
    norm1 = (dx1**2 + dy1**2) ** 0.5
    norm2 = (dx2**2 + dy2**2) ** 0.5
    if norm1 == 0 or norm2 == 0:
        return None
    cos_angle = dot / (norm1 * norm2)
    if abs(cos_angle) < 0.99:  # not colinear
        return None

    # Merge by taking the extreme endpoints along the line direction
    def _proj(x, y):
        return (x * dx1 + y * dy1) / norm1

    pts = [(l1[0], l1[1]), (l1[2], l1[3]), (l2[0], l2[1]), (l2[2], l2[3])]
    proj_vals = [_proj(px, py) for px, py in pts]
    min_idx, max_idx = proj_vals.index(min(proj_vals)), proj_vals.index(max(proj_vals))
    merged = pts[min_idx] + pts[max_idx]
    return merged


def merge_lines(lines, tolerance=1e-6):
    """
    Merge nearly overlapping line segments.

    Parameters
    ----------
    lines : list of tuples
        Each tuple is (x1, y1, x2, y2).
    tolerance : float
        Distance threshold for considering two lines “almost overlapping”.

    Returns
    -------
    list of tuples
        Merged line segments, each as (x1, y1, x2, y2).
    """
    if not lines:
        return []

    merged = []
    used = [False] * len(lines)

    for i, l1 in enumerate(lines):
        if used[i]:
            continue
        current = l1
        for j in range(i + 1, len(lines)):
            if used[j]:
                continue
            l2 = lines[j]
            m = _merge_two_lines(current, l2, tolerance)
            if m is not None:
                current = m
                used[j] = True
        merged.append(np.array(current, dtype=np.int32))
        used[i] = True

    return merged


def round_number(number: float, divisor=5):
    divisor = max(divisor, 1)
    return round(number / divisor) * divisor


def line_distance(l1: Box, l2: Box):
    """
    Calculate the shortest distance between two lines defined by their endpoints.

    Args:
        x1 (float): x-coordinate of the first endpoint of the first line.
        y1 (float): y-coordinate of the first endpoint of the first line.
        x2 (float): x-coordinate of the second endpoint of the first line.
        y2 (float): y-coordinate of the second endpoint of the first line.
        x3 (float): x-coordinate of the first endpoint of the second line.
        y3 (float): y-coordinate of the first endpoint of the second line.
        x4 (float): x-coordinate of the second endpoint of the second line.
        y4 (float): y-coordinate of the second endpoint of the second line.

    Returns:
        float: The shortest distance between the two lines.
    """
    # Calculate the direction vectors of the lines

    x1, y1, x2, y2 = l1
    x3, y3, x4, y4 = l2
    dx1 = x2 - x1
    dy1 = y2 - y1
    dx2 = x4 - x3
    dy2 = y4 - y3

    # Calculate the determinant (area of the parallelogram formed by the two lines)
    det = dx1 * dy2 - dx2 * dy1

    if det == 0:
        # The lines are parallel, so we need to find the distance between them
        # We can do this by finding the distance from a point on one line to the other line
        return point_line_distance(x3, y3, x1, y1, dx1, dy1)
    else:
        # Calculate the parameters of the intersection point
        t = ((x1 - x3) * dy2 - (y1 - y3) * dx2) / det
        u = ((x1 - x3) * dy1 - (y1 - y3) * dx1) / det

        # Calculate the coordinates of the intersection point
        ix = x1 + t * dx1
        iy = y1 + t * dy1

        # Return the distance between the two lines at the intersection point
        return math.sqrt((ix - x3) ** 2 + (iy - y3) ** 2)


def point_line_distance(px, py, x1, y1, dx, dy):
    """
    Calculate the distance from a point to a line.

    Args:
        px (float): x-coordinate of the point.
        py (float): y-coordinate of the point.
        x1 (float): x-coordinate of a point on the line.
        y1 (float): y-coordinate of a point on the line.
        dx (float): Direction vector of the line in the x-direction.
        dy (float): Direction vector of the line in the y-direction.

    Returns:
        float: The distance from the point to the line.
    """
    return abs(dx * py - dy * px + x1 * dy - y1 * dx) / math.sqrt(dx**2 + dy**2)


def get_min_endpoint_distance(segment1, segment2) -> float:
    """
    Check distances between all endpoint pairs

    Parameters:
    segment1: list of 4 values [x1, y1, x2, y2]
    segment2: list of 4 values [x3, y3, x4, y4]

    Returns:
    bool: True if any endpoint of segment1 is within threshold distance of any endpoint of segment2
    """
    # Unpack the segments
    x1, y1, x2, y2 = segment1
    x3, y3, x4, y4 = segment2

    # Define distance between two points
    def distance(p1, p2):
        return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)

    # Check distances between all endpoint pairs
    distances = [
        distance((x1, y1), (x3, y3)),  # (1,1) to (3,3)
        distance((x1, y1), (x4, y4)),  # (1,1) to (4,4)
        distance((x2, y2), (x3, y3)),  # (2,2) to (3,3)
        distance((x2, y2), (x4, y4)),  # (2,2) to (4,4)
    ]

    return min(distances)  # any(d <= threshold for d in distances)


def lines_intersect(line1, line2):
    """
    Determine if two lines defined by their endpoints intersect.

    Parameters:
    line1: list of 4 values [x1, y1, x2, y2] - first line
    line2: list of 4 values [x3, y3, x4, y4] - second line

    Returns:
    bool: True if the lines intersect, False otherwise
    """
    x1, y1, x2, y2 = line1
    x3, y3, x4, y4 = line2

    # Calculate direction vectors
    dx1 = x2 - x1
    dy1 = y2 - y1
    dx2 = x4 - x3
    dy2 = y4 - y3

    # Calculate determinant
    det = dx1 * dy2 - dx2 * dy1

    # If determinant is zero, lines are parallel
    if abs(det) < 1e-10:  # Using small epsilon for floating point comparison
        return False

    # Calculate intersection point parameters
    dx3 = x1 - x3
    dy3 = y1 - y3

    # Calculate parameters t and u for the intersection point
    t = (dx2 * dy3 - dy2 * dx3) / det
    u = (dx1 * dy3 - dy1 * dx3) / det

    # Lines intersect if both parameters are between 0 and 1
    # (within the line segments)
    return 0 <= t <= 1 and 0 <= u <= 1

