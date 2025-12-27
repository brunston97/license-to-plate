from collections import Counter
import math
from typing import List, Optional, Sequence, Tuple
import cv2
import numpy as np

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
    points_array = np.array(points)

    # Calculate the min and max along each axis (0: x-axis, 1: y-axis)
    xmin, xmax = points_array[:, 0].min(), points_array[:, 0].max()
    ymin, ymax = points_array[:, 1].min(), points_array[:, 1].max()

    # Return the bounding box as a tuple
    return (xmin, ymin, xmax, ymax)


def get_line_length(x):
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
        (expanded_max_x, expanded_min_y),
        (expanded_max_x, expanded_max_y),
        (expanded_min_x, expanded_max_y),
    ]

    return np.array(sort_bbox_corners(expanded_bbox), dtype=np.int32)


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
    pts = np.asarray(points, dtype=float)

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
        dtype=np.float32,
    )

    return sorted_pts


def polygon_area(pts: np.ndarray) -> float:
    """
    Compute the area of a simple polygon defined by points in order.

    Parameters
    ----------
    pts : ndarray, shape (N,2)
        Vertices of the polygon in either clockwise or counter‑clockwise order.

    Returns
    -------
    float
        The absolute area of the polygon.
    """
    x = pts[:, 0]
    y = pts[:, 1]
    # Cross‑product sum
    area = 0.5 * np.abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1)))
    return area


def sort_boxes_by_area(
    boxes: List[PointBox], ascending=True, normalise=True
) -> Tuple[List[PointBox], List[float]]:
    """
    Sort a list of bounding boxes by their area.

    Parameters
    ----------
    boxes : list or array‑like
        Each element is an (4,2) array of corner coordinates.  The order of
        corners can be arbitrary if *normalise* is True.
    ascending : bool, default=True
        If True, the smallest area comes first.  If False, the largest area
        comes first.
    normalise : bool, default=True
        If True, the corner order of each box is first normalised to
        clockwise order (necessary for a stable area calculation on
        arbitrarily oriented boxes).  Set to False if your boxes are already
        in a known order.

    Returns
    -------
    sorted_boxes : list of ndarray
        Boxes sorted by area.
    sorted_areas : list of float
        Corresponding areas in the same order.
    """
    boxes = [np.asarray(b, dtype=np.float64) for b in boxes]

    # Normalise if requested
    if normalise:
        boxes = [sort_bbox_corners(b) for b in boxes]

    # Compute areas
    areas = [polygon_area(b) for b in boxes]

    # Get the sorted indices
    idx = np.argsort(areas)
    if not ascending:
        idx = idx[::-1]

    sorted_boxes = [boxes[i] for i in idx]
    sorted_areas = [areas[i] for i in idx]
    return sorted_boxes, sorted_areas


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
) -> Boxes:
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


def find_corners_by_lines(img: np.ndarray) -> Optional[np.ndarray]:
    """
    Finds corners by detecting lines, extending them, finding intersections,
    and picking the 4 extreme intersections.
    """
    # h, w = crop_img.shape[:2]

    # crop_img = cv2.resize(crop_img, np.array((w * 0.3, h * 0.3), dtype=np.int32))
    # h, w = crop_img.shape[:2]

    # gray = cv2.cvtColor(crop_img, cv2.COLOR_BGR2GRAY)

    # # blurred = cv2.bilateralFilter(gray, 9, 75, 75)
    # blurred = cv2.medianBlur(gray, 5)
    # # blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    # ret, img_bw = cv2.threshold(blurred, 155, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    # contours, hierarchy = cv2.findContours(
    #     img_bw, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE
    # )
    # blurred = cv2.cvtColor(blurred, cv2.COLOR_BGR2GRAY)
    # cv2.drawContours(crop_img, contours, -1, (0, 0, 255), 1)
    # show_image(blurred)
    # show_image(crop_img)

    # # 1. Edge Detection
    # # Canny parameters might need tweaking depending on lighting
    # # blurred = cv2.cvtColor(crop_img, cv2.COLOR_BGR2GRAY)
    # edges = cv2.Canny(blurred, 50, 200, apertureSize=3)
    # show_image(edges)
    # # edges = cv2.cvtColor(crop_img, cv2.COLOR_BGR2GRAY)
    # # find_largest_textbox(crop_img)
    # kernel = np.ones((2, 2), np.uint8)
    # # dialated = cv2.dilate(edges, kernel, iterations=1)
    # dialated = edges
    # # dialated = cv2.erode(edges, kernel, iterations=1)
    # # show_image(dialated)

    # 2. Hough Line Transform (Probabilistic)
    # minLineLength: lines shorter than this are rejected
    # maxLineGap: max gap between points to be considered same line

    # edges, 1, np.pi / 180, threshold=50, minLineLength=10, maxLineGap=5
    transformer = ImageTransformer(img)

    # Apply transformations and find lines
    lines = transformer.resize(0.2).blur(5).dialate(1).find_lines()
    contours, _ = cv2.findContours(
        transformer.edges_img, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE
    )
    img = transformer.bgr_img.copy()
    cv2.drawContours(img, contours, -1, (0, 255, 0), -1)

    # show_image(img)
    # lines = cv2.HoughLinesP(
    #     dialated, 1, np.pi / 180, threshold=50, minLineLength=30, maxLineGap=20
    # )

    if lines is None:
        return None
    # # lines = self.unify_lines(lines=lines)
    img_copy = transformer.bgr_img.copy()
    # show_image(draw_lines(img_copy, lines))
    # if lines is not None:
    #     for i in range(0, len(lines)):
    #         l = lines[i][0]
    #         cv2.line(img_copy, (l[0], l[1]), (l[2], l[3]), (0, 255, 0), 3, cv2.LINE_AA)
    # cv2.imshow("lines", img_copy)

    # show_image(img_copy)

    horizontal_lines = []
    vertical_lines = []

    # CONSTANTS
    ANGLE_TOLERANCE = 35  # Only accept lines within +/- 15 deg of 0 or 90
    SHAVE_FACTOR = 0.0  # Remove 10% from line ends to avoid rounded tips

    # 3. Classify Lines
    for i in range(0, len(lines)):
        # for line in lines:
        line = lines[i]
        x1, y1, x2, y2 = line[0]
        # Calculate angle in degrees
        angle = calculate_line_angle(line[0])
        # angle = math.degrees(math.atan2(y2 - y1, x2 - x1))

        # # Normalize angle to range [-90, 90]
        # if angle > 90:
        #     angle -= 180
        # if angle < -90:
        #     angle += 180

        # Shrink the line to ensure we rely on the straight center, not curved ends
        sx1, sy1, sx2, sy2 = shrink_line(x1, y1, x2, y2, SHAVE_FACTOR)

        # If angle is close to 0, it's horizontal. Close to 90, vertical.
        # Horizontal check (near 0)
        if abs(angle) < ANGLE_TOLERANCE:
            horizontal_lines.append((sx1, sy1, sx2, sy2))

        # Vertical check (near 90 or -90)
        else:
            vertical_lines.append((sx1, sy1, sx2, sy2))

    if not horizontal_lines or not vertical_lines:
        return None

    # med = np.median([get_line_length(x) for x in horizontal_lines])
    # horizontal_lines = [x for x in horizontal_lines if get_line_length(x) > med]

    # med = np.median([get_line_length(x) for x in vertical_lines])
    # vertical_lines = [x for x in vertical_lines if get_line_length(x) > med]
    # for line in vertical_lines:

    # vertical_lines.sort(key=get_line_length, reverse=True)
    # horizontal_lines.sort(key=get_line_length, reverse=True)

    # horizontal_lines = horizontal_lines[: int(len(horizontal_lines) / 4) + 1]
    # vertical_lines = vertical_lines[: int(len(vertical_lines) / 4) + 1]

    # longest line removed, get average angles
    horizontal_angles = np.array(
        [(round(calculate_line_angle(x) / 3)) * 3 for x in horizontal_lines],
        dtype=np.int32,
    )
    values, counts = np.unique(horizontal_angles, return_counts=True)
    max_count_index = np.argmax(counts)
    mode_value = values[max_count_index]
    counter = [x[0] for x in Counter(horizontal_angles).most_common(5)]
    print(len(horizontal_lines))
    # show_image(draw_lines(img_copy, horizontal_lines))

    # horizontal_lines = merge_lines(horizontal_lines)
    # vertical_lines = merge_lines(vertical_lines)
    # show_image(transformer.edges_img)
    print(len(horizontal_lines))

    # for line in horizontal_lines:
    # angle = round(calculate_line_angle(line) / 5) * 5
    # print(f"line is {line}, angle is {angle}")
    # print(calculate_line_angle([0, 0, 10, 10]))
    print(mode_value, counts)
    print(counter)
    ### separate intersection by negative and positive angeles
    ##unify angles, eg -30 should just be 150

    # img_copy = crop_img.copy()
    horizontal_lines = [
        x
        for index, x in enumerate(horizontal_lines)
        if (round(calculate_line_angle(x) / 3) * 3) in counter
    ]
    newlines = vertical_lines + horizontal_lines
    show_image(draw_lines(img_copy, newlines))
    # for i in range(0, len(newlines)):
    #     l = tuple(map(int, newlines[i]))  # newlines[i]
    #     # print(l)
    #     x1, y1, x2, y2 = l
    #     cv2.line(img_copy, (x1, y1), (x2, y2), (0, 255, 0), 3, cv2.LINE_AA)
    # # cv2.imshow("lines2", img_copy)
    # show_image(img_copy)
    return
    # implement the plate ratio check, you just need 3 lines

    # 4. Find Intersections
    intersections = []
    for h_line in horizontal_lines:
        for v_line in vertical_lines:
            pt = compute_line_intersection(h_line, v_line)
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


def shrink_line(x1, y1, x2, y2, shave_percent=0.1):
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


def compute_line_intersection(line1, line2) -> Optional[Tuple[int, int]]:
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
    points = [(x1, y1), (x2, y1), (x2, y2), (x1, y2)]

    return points


def do_boxes_overlap(box1: PointBox, box2: PointBox) -> bool:
    """
    Checks if two point boxes overlap.

    Args:
    - box1 (PointBox): The first point box.
    - box2 (PointBox): The second point box.

    Returns:
    - bool: True if the boxes overlap, False otherwise.
    """
    # Calculate the minimum and maximum x and y coordinates for each box
    min_x1 = min(point[0] for point in box1)
    max_x1 = max(point[0] for point in box1)
    min_y1 = min(point[1] for point in box1)
    max_y1 = max(point[1] for point in box1)

    min_x2 = min(point[0] for point in box2)
    max_x2 = max(point[0] for point in box2)
    min_y2 = min(point[1] for point in box2)
    max_y2 = max(point[1] for point in box2)

    # Check if the boxes overlap
    return not (
        max_x1 < min_x2 or max_x2 < min_x1 or max_y1 < min_y2 or max_y2 < min_y1
    )


def merge_overlapping_boxes(box1: PointBox, box2: PointBox) -> PointBox:
    """
    Merges two overlapping point boxes.

    Args:
    - box1 (PointBox): The first point box.
    - box2 (PointBox): The second point box.

    Returns:
    - PointBox: The merged point box.
    """
    # Calculate the minimum and maximum x and y coordinates for each box
    min_x1 = min(point[0] for point in box1)
    max_x1 = max(point[0] for point in box1)
    min_y1 = min(point[1] for point in box1)
    max_y1 = max(point[1] for point in box1)

    min_x2 = min(point[0] for point in box2)
    max_x2 = max(point[0] for point in box2)
    min_y2 = min(point[1] for point in box2)
    max_y2 = max(point[1] for point in box2)

    # Calculate the merged bounding box coordinates
    merged_min_x = min(min_x1, min_x2)
    merged_max_x = max(max_x1, max_x2)
    merged_min_y = min(min_y1, min_y2)
    merged_max_y = max(max_y1, max_y2)

    # Create the merged bounding box
    merged_box = [
        (merged_min_x, merged_min_y),
        (merged_max_x, merged_min_y),
        (merged_max_x, merged_max_y),
        (merged_min_x, merged_max_y),
    ]

    return merged_box


def do_boxes_intersect(box1: PointBox, box2: PointBox) -> bool:
    """
    Checks if two point boxes intersect.

    Args:
    - box1 (PointBox): The first point box.
    - box2 (PointBox): The second point box.

    Returns:
    - bool: True if the boxes intersect, False otherwise.
    """
    # Calculate the minimum and maximum x and y coordinates for each box
    min_x1 = min(point[0] for point in box1)
    max_x1 = max(point[0] for point in box1)
    min_y1 = min(point[1] for point in box1)
    max_y1 = max(point[1] for point in box1)

    min_x2 = min(point[0] for point in box2)
    max_x2 = max(point[0] for point in box2)
    min_y2 = min(point[1] for point in box2)
    max_y2 = max(point[1] for point in box2)

    # Check if the boxes intersect
    return not (
        max_x1 < min_x2 or max_x2 < min_x1 or max_y1 < min_y2 or max_y2 < min_y1
    )


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

    # normalize angle
    if angle > 90:
        angle -= 180
    if angle < -90:
        angle += 180
    # if angle < 0:
    #     angle += 360

    return angle * -1


# def detect_strongest_lines(img: cv2.typing.MatLike) -> Tuple[Sequence, cv2.typing.MatLike]:


def draw_lines(img, lines=[]) -> cv2.typing.MatLike:
    for i in range(0, len(lines)):
        l = tuple(map(int, lines[i]))
        # l = lines[i][0]
        cv2.line(img, (l[0], l[1]), (l[2], l[3]), (0, 255, 0), 2, cv2.LINE_AA)
    return img


class ImageTransformer:
    def __init__(self, img: np.ndarray):
        """
        Initialize the ImageTransformer with an image.

        Args:
            img (np.ndarray): The input image.
        """
        self.bgr_img = img.copy()
        self.gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
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
        self.edges_img = cv2.Canny(self.gray_img, 50, 200)
        return self

    def find_lines(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Find lines in the image using the Hough Line Transform.

        Returns:
            Tuple[np.ndarray, np.ndarray]: The detected lines and their coordinates.
        """
        # edges = cv2.Canny(self.gray_img, 50, 200, apertureSize=3)
        lines = cv2.HoughLinesP(
            self.edges_img,
            1,
            np.pi / 180,
            threshold=50,
            minLineLength=40,
            maxLineGap=3,
        )
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
        kernel = np.ones((2, 2), np.uint8)
        self.edges_img = cv2.dilate(self.edges_img, kernel, iterations=iterations)
        return self

    def blur(self, factor: int = 5):
        # show_image(self.gray_img)
        factor = factor if factor % 2 == 1 else factor - 1
        self.gray_img = cv2.medianBlur(self.gray_img, factor)
        # self.edges_img = cv2.Canny(self.gray_img, 50, 200)
        self.set_binary_img()
        return self

    # def draw_countours(self):
    #     contours, hierarchy = cv2.findContours(
    #         self.binary_img, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE
    #     )


import numpy as np


def calculate_overlap(line1, line2):
    """
    Calculates the area of overlap between two rectangles defined by xyxy coordinates.
    """
    x11, y11, x12, y12 = line1
    x21, y21, x22, y22 = line2

    # Calculate intersection rectangle
    ix1 = max(x11, x21)
    iy1 = max(y11, y21)
    ix2 = min(x12, x22)
    iy2 = min(y12, y22)

    if ix1 < ix2 and iy1 < iy2:  # Check for non-zero overlap
        return (ix2 - ix1) * (iy2 - iy1)
    else:
        return 0


def merge_lines(lines, threshold=0.05):
    """
    Merges lines in xyxy format based on a given overlap threshold.
    """
    if not lines:
        return []

    merged = [lines[0]]

    for line in lines[1:]:
        added = False
        for i, m_line in enumerate(merged):
            overlap_area = calculate_overlap(m_line, line)
            total_area_m_line = (m_line[2] - m_line[0]) * (m_line[3] - m_line[1])
            total_area_line = (line[2] - line[0]) * (line[3] - line[1])

            # Check if overlap is greater than the threshold
            if (overlap_area / total_area_m_line) > threshold or (
                overlap_area / total_area_line
            ) > threshold:
                # Calculate new bounding box for merged lines
                x11 = min(m_line[0], line[0])
                y11 = min(m_line[1], line[1])
                x12 = max(m_line[2], line[2])
                y12 = max(m_line[3], line[3])

                # Replace the old line with the merged line
                merged[i] = (x11, y11, x12, y12)
                added = True
                break

        if not added:
            # If no overlap found, add the line as a new entry
            merged.append(line)

    return merged
