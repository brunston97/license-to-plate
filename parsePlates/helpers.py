from collections import Counter
import math
import random
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


def find_corners_by_lines(img: np.ndarray) -> Optional[np.ndarray]:
    """
    Finds corners by detecting lines, extending them, finding intersections,
    and picking the 4 extreme intersections.
    """
    transformer = ImageTransformer(img)

    # Apply transformations and find lines
    lines = transformer.resize(0.2).blur(5).dialate(1).find_lines()
    lines = merge_lines([x[0] for x in lines], 10)

    contours, _ = cv2.findContours(
        transformer.edges_img, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE
    )
    potential = []
    rounded = group_lines_by_angle(lines)

    # Separate horizontal and vertical lines based on angle
    horizontal_lines: list = []
    vertical_lines: list = []
    for key, group in rounded.items():
        if key > 45:
            vertical_lines.extend(group)
        else:
            horizontal_lines.extend(group)

    threshold = 50  # endpoint distance threshold for considering a corner

    # ---- Helper functions for angle filtering ----
    def angles_similar(a: float, b: float, delta: float = 5.0) -> bool:
        return abs(a - b) <= delta

    # boxes = []
    # ---- Find potential corners from vertical line pairs and horizontal lines ----
    for i in range(len(vertical_lines)):
        for j in range(i + 1, len(vertical_lines)):
            l1, l2 = vertical_lines[i], vertical_lines[j]
            ang1, ang2 = round_number(calculate_line_angle(l1)), round_number(
                calculate_line_angle(l2)
            )
            # Only keep pairs with similar angles
            if not angles_similar(ang1, ang2):
                continue
            for h in horizontal_lines:
                ang_h = round_number(calculate_line_angle(h))
                if abs(180 - sum([ang1, ang2, ang_h])) <= 20:
                    # print(h)
                    if (
                        get_min_endpoint_distance(l1, h) < threshold
                        and get_min_endpoint_distance(l2, h) < threshold
                    ):
                        potential.extend([l1, l2, h])
                        # boxes.append(l1, l2, h, )

    # ---- Find potential corners from horizontal line pairs and vertical lines ----
    for i in range(len(horizontal_lines)):
        for j in range(i + 1, len(horizontal_lines)):
            l1, l2 = horizontal_lines[i], horizontal_lines[j]
            ang1, ang2 = round_number(calculate_line_angle(l1)), round_number(
                calculate_line_angle(l2)
            )
            if not angles_similar(ang1, ang2):
                continue
            for v in vertical_lines:
                ang_v = round_number(calculate_line_angle(v))
                # if is_complement(ang1, ang_v) and is_complement(ang2, ang_v):
                if abs(180 - sum([ang1, ang2, ang_v])) <= 20:
                    if (
                        get_min_endpoint_distance(l1, v) < threshold
                        and get_min_endpoint_distance(l2, v) < threshold
                    ):
                        potential.extend([l1, l2, v])
    # print(len(potential))

    arr_list = [np.array(arr) for arr in potential]

    # Method 1: Using numpy.unique with custom comparison
    # Convert arrays to tuples for hashing
    unique_tuples = set(tuple(arr.flatten()) for arr in arr_list)
    potential = [np.array(list(t)).reshape(arr_list[0].shape) for t in unique_tuples]

    # img_copy = transformer.bgr_img.copy()
    # draw_lines(img_copy, potential)
    # show_image(img_copy)

    # #potential = np.unique(potential)[0]
    # print(len(potential))
    # lines = cv2.HoughLinesP()
    boxes = find_bounding_boxes_with_two_connections(potential, 100)
    # print(boxes)

    # arr_list = [np.array(arr) for arr in potential]

    # # Method 1: Using numpy.unique with custom comparison
    # # Convert arrays to tuples for hashing
    # unique_tuples = set(tuple(arr.flatten()) for arr in arr_list)
    # potential = [np.array(list(t)).reshape(arr_list[0].shape) for t in unique_tuples]
    # potential = boxes[0]
    img_copy = transformer.bgr_img.copy()
    for box in boxes:
        draw_lines(img_copy, box)
    for key in rounded.keys():
        temp_lines = rounded[key]
        # draw_lines(img, temp_lines)

    # boxes = detect_rectangles(lines, image = img)
    # for box in boxes:
    #     box = np.array(xyxy_to_points(box), np.int32)
    #     box = box.reshape((-1, 1, 2))
    #     #print(box)
    #     cv2.polylines(
    #         img,
    #         [box],
    #         isClosed=True,
    #         color=(0, 0, 255),
    #         thickness=3,
    #     )
    show_image(img_copy)
    return
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


def extend_line(line, extend_percent=0.1):
    """
    Extends a line segment from both ends by a percentage of its length.

    Parameters
    ----------
    x1, y1, x2, y2 : float
        Endpoints of the original line segment.
    extend_percent : float, optional
        Fraction of the line's length to add to each end (default 0.1).

    Returns
    -------
    nx1, ny1, nx2, ny2 : tuple[float, float, float, float]
        New endpoints of the extended line segment.
    """

    x1, y1, x2, y2 = line
    dx = x2 - x1
    dy = y2 - y1

    # Extend start point backward
    nx1 = x1 - dx * extend_percent
    ny1 = y1 - dy * extend_percent

    # Extend end point forward
    nx2 = x2 + dx * extend_percent
    ny2 = y2 + dy * extend_percent

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
    # points = [(x1, y1), (x2, y1), (x2, y2), (x1, y2)]
    points = [(x1, y1), (x2, y2)]
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
        # edges = cv2.Canny(self.gray_img, 50, 200, apertureSize=3)
        # self.edges_img = cv2.medianBlur(self.edges_img, 1)
        # img = self.bgr_img
        # img = cv2.medianBlur(img, 3)

        # div = 64
        # water = img // div * div + div // 2
        # show_image(water)

        # water = cv2.cvtColor(water, cv2.COLOR_BGR2GRAY)
        # # water = watershed_algo(img)
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

    # def draw_countours(self):
    #     contours, hierarchy = cv2.findContours(
    #         self.binary_img, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE
    #     )


def extend_and_close_loop(
    segments: List[List[float]], factor: float = 1.0
) -> List[float]:
    """
    Extend the two longest sides by `factor` and compute the intersection point
    that would close the loop. Returns the coordinates of the new segment
    that would connect the extended endpoints.
    """
    # Compute lengths and sort
    seg_lengths = [
        (length(vec((s[0], s[1]), (s[2], s[3]))), i, s) for i, s in enumerate(segments)
    ]
    seg_lengths.sort(reverse=True)  # longest first

    # Extend the two longest segments outward
    new_segs = []
    for _, idx, seg in seg_lengths[:2]:
        p1, p2 = (seg[0], seg[1]), (seg[2], seg[3])
        v = vec(p1, p2)
        # Extend both ends
        new_p1 = (p1[0] - factor * v[0], p1[1] - factor * v[1])
        new_p2 = (p2[0] + factor * v[0], p2[1] + factor * v[1])
        new_segs.append((new_p1, new_p2))

    # Compute intersection of the two extended lines
    def line_intersection(p1, p2, p3, p4):
        """Return intersection of line p1p2 with line p3p4."""
        A = p2[0] - p1[0]
        B = p3[0] - p4[0]
        C = p2[1] - p1[1]
        D = p3[1] - p4[1]
        E = p3[0] - p1[0]
        F = p3[1] - p1[1]
        denom = A * D - B * C
        if abs(denom) < 1e-9:
            return None
        t = (E * D - B * F) / denom
        return (p1[0] + t * A, p1[1] + t * C)

    inter = line_intersection(*new_segs[0], *new_segs[1])
    if inter is None:
        raise ValueError("Extended lines are parallel; cannot close loop.")

    # The new segment is the line from intersection to the opposite extended endpoint
    # (pick one endpoint from each extended segment)
    new_seg = [inter[0], inter[1], new_segs[0][1][0], new_segs[0][1][1]]
    return new_seg


"""
Utility for merging nearly overlapping line segments.
Each line is represented as an (x1, y1, x2, y2) tuple.
Shapely is **not** required – a pure‑Python fallback is used automatically.
"""


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


# ---------- Main public API ----------
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


# ──────────────────────────────────────────────────────────────────────────────
#  Filename:  geometry_helpers.py
#  Purpose:   Join line endpoints to the nearest other endpoint
# ──────────────────────────────────────────────────────────────────────────────

from typing import List, Tuple, Optional

# --- 1. Update the type alias ---------------------------------------------
Line = List[int]  # e.g., [x1, y1, x2, y2]  (all integers)

# Connection stays the same
Connection = Tuple[Tuple[int, int], Tuple[int, int]]


def connect_lines(
    lines: List[Line], threshold: Optional[float] = None
) -> List[Connection]:
    """
    For each endpoint of every line (now represented as a 4‑int list),
    find the nearest other endpoint that does not belong to the same line.
    Returns a list of pairs that should be joined.
    """
    # Gather all endpoints with metadata
    endpoints: List[Tuple[Tuple[float, float], int, int]] = []
    for idx, line in enumerate(lines):
        start = (line[0], line[1])  # first two ints
        end = (line[2], line[3])  # last two ints
        endpoints.append((start, idx, 0))  # 0 = start side
        endpoints.append((end, idx, 1))  # 1 = end side

    # Build KD‑tree for fast nearest‑neighbour queries
    try:
        from scipy.spatial import KDTree
    except ImportError:
        raise RuntimeError("scipy is required for efficient nearest‑neighbour search.")

    points = [pt for pt, _, _ in endpoints]
    tree = KDTree(points)

    visited = set()
    connections = []  #: List[Connection] = []

    for i, (pt, line_idx, side) in enumerate(endpoints):
        if (line_idx, side) in visited:
            continue

        # Find the nearest point (excluding itself)
        dists, idxs = tree.query(pt, k=2)
        nearest_idx = idxs[1] if idxs[0] == i else idxs[0]
        nearest_pt, n_line_idx, n_side = endpoints[nearest_idx]

        # Optional distance threshold
        if threshold is not None and dists[1] > threshold:
            continue

        # Avoid connecting a line to itself
        if line_idx == n_line_idx:
            continue

        # connections.append(((line_idx, side), (n_line_idx, n_side)))
        connections.append(join_xyxy_lines)
        visited.add((line_idx, side))
        visited.add((n_line_idx, n_side))

    return connections


# utils.py
import numpy as np
from shapely.geometry import LineString, box


def join_xyxy_lines(lines):
    """
    Stitch together a collection of line segments defined as [x1, y1, x2, y2]
    by connecting each endpoint to its nearest neighbour.
    The function then returns the reconstructed line list **and** the
    axis‑aligned bounding box that would enclose the resulting polygon.

    Parameters
    ----------
    lines : list[Sequence[float]]
        List of 4‑element sequences, each representing a line segment
        as (x1, y1, x2, y2).

    Returns
    -------
    new_lines : list[list[float]]
        The reconstructed line segments (same format as the input).
    bbox : list[float]
        Bounding box coordinates as [minx, miny, maxx, maxy].
    """
    # ---- 1. Flatten to a list of all endpoints --------------------------------
    endpoints = np.array(
        [lines[i][:2] for i in range(len(lines))]  # first endpoints
        + [lines[i][2:] for i in range(len(lines))]
    )  # second endpoints
    n = len(endpoints)

    # ---- 2. Compute pairwise distances ----------------------------------------
    dist = np.linalg.norm(endpoints[:, None, :] - endpoints[None, :, :], axis=2)
    np.fill_diagonal(dist, np.inf)  # ignore self‑distances

    # ---- 3. Nearest‑neighbour pairing -----------------------------------------
    nn_idx = np.argmin(dist, axis=1)  # nearest neighbour index for each point
    used = set()
    pairs = []
    for i, j in enumerate(nn_idx):
        if i in used or j in used or i == j:
            continue
        pairs.append((i, j))
        used.update([i, j])

    # ---- 4. Reconstruct lines from pairs ------------------------------------
    new_lines = [endpoints[a].tolist() + endpoints[b].tolist() for a, b in pairs]

    # ---- 5. Bounding box of all endpoints ------------------------------------
    minx, miny = endpoints.min(axis=0)
    maxx, maxy = endpoints.max(axis=0)
    bbox = [minx, miny, maxx, maxy]

    return new_lines, bbox


def group_lines_by_angle(lines):
    """
    Groups XYXY lines by their angles.

    Args:
        lines (list): A list of XYXY lines.
        angle_rounding_function (function): A function to round angles.

    Returns:
        dict: A dictionary where keys are rounded angles and values are lists of corresponding lines.
    """
    grouped_lines = {}
    for line in lines:
        # Calculate the angle of the line
        # x1, y1, x2, y2 = line
        angle = calculate_line_angle(line)

        # Round the angle using the provided function
        rounded_angle = round_number(angle)

        # Add the line to the corresponding group in the dictionary
        if rounded_angle not in grouped_lines:
            grouped_lines[rounded_angle] = []
        grouped_lines[rounded_angle].append(line)
    return grouped_lines


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


def watershed_algo(img: cv2.typing.MatLike) -> cv2.typing.MatLike:
    """
    Applies the watershed segmentation algorithm to the input image.

    Parameters:
        img (Matlike): Input image (grayscale or color).
                        If color, it will be converted to grayscale first.

    Returns:
        MatLike: The segmented image where each region is labeled (i.e., the output of cv2.watershed).
                 The output is a labeled image where each region is assigned a unique label.
                 Note: The output is typically a binary mask where foreground pixels are labeled,
                       and background is 0.

    Note:
        - The function uses a simple approach: thresholding to get initial markers,
          then applies watershed segmentation.
        - For best results, the input should have clear boundaries (e.g., objects with distinct backgrounds).
        - The function assumes the input is a NumPy array or a compatible image type (e.g., PIL, OpenCV Mat).
    """
    # img = cv2.imread("coins.png")
    assert img is not None, "file could not be read, check with os.path.exists()"
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    ret, thresh = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # noise removal
    kernel = np.ones((3, 3), np.uint8)
    opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
    show_image(opening)

    # sure background area
    sure_bg = cv2.dilate(opening, kernel, iterations=3)

    # Finding sure foreground area
    dist_transform = cv2.distanceTransform(opening, cv2.DIST_L2, 5)
    ret, sure_fg = cv2.threshold(dist_transform, 0.7 * dist_transform.max(), 255, 0)

    # Finding unknown region
    sure_fg = np.uint8(sure_fg)
    unknown = cv2.subtract(sure_bg, sure_fg)

    # Marker labelling
    ret, markers = cv2.connectedComponents(sure_fg)

    # Add one to all labels so that sure background is not 0, but 1
    markers = markers + 1

    # Now, mark the region of unknown with zero
    markers[unknown == 255] = 0
    markers = cv2.watershed(img, markers)
    img[markers == -1] = [255, 0, 0]
    return img  # .astype(np.uint8)


def distance(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    return math.hypot(p1[0] - p2[0], p1[1] - p2[1])


def get_line_endpoints(
    line: Tuple[float, float, float, float],
) -> Tuple[Tuple[float, float], Tuple[float, float]]:
    x1, y1, x2, y2 = line
    return (x1, y1), (x2, y2)


def get_line_orientation(line: Tuple[float, float, float, float]) -> str:
    """Returns 'vertical' or 'horizontal' based on line orientation"""
    x1, y1, x2, y2 = line
    if abs(x2 - x1) > abs(y2 - y1):
        return "horizontal"
    else:
        return "vertical"


def are_lines_almost_connected(
    line1: Tuple[float, float, float, float],
    line2: Tuple[float, float, float, float],
    threshold: float = 10.0,
) -> bool:
    p1_start, p1_end = get_line_endpoints(line1)
    p2_start, p2_end = get_line_endpoints(line2)

    # Check if any endpoint of line1 is close to any endpoint of line2
    distances = [
        distance(p1_start, p2_start),
        distance(p1_start, p2_end),
        distance(p1_end, p2_start),
        distance(p1_end, p2_end),
    ]

    return any(d <= threshold for d in distances)


def are_orientations_compatible(orientation1: str, orientation2: str) -> bool:
    """Returns True if orientations are compatible (one vertical, one horizontal)"""
    return orientation1 != orientation2


def find_bounding_boxes_with_two_connections(
    lines: List[Tuple[float, float, float, float]], threshold: float = 10.0
) -> List[List[Tuple[float, float, float, float]]]:
    boxes = []

    # Precompute orientations for all lines
    orientations = [get_line_orientation(line) for line in lines]

    # For 3 lines (partial rectangle)
    for i in range(len(lines)):
        for j in range(i + 1, len(lines)):
            for k in range(j + 1, len(lines)):
                line1, line2, line3 = lines[i], lines[j], lines[k]
                orient1, orient2, orient3 = (
                    orientations[i],
                    orientations[j],
                    orientations[k],
                )

                # Check if orientations are compatible (one vertical, one horizontal)
                connections = 0
                if are_orientations_compatible(orient1, orient2):
                    connections += 1
                if are_orientations_compatible(orient2, orient3):
                    connections += 1
                if are_orientations_compatible(orient1, orient3):
                    connections += 1
                # connections = 5
                # For a valid partial rectangle, we need at least 2 connections
                if connections < 2:
                    continue

                connections = 0
                # if not (are_orientations_compatible(orient1, orient2) and
                #         are_orientations_compatible(orient2, orient3) and
                #         are_orientations_compatible(orient1, orient3)):
                #     continue
                if (
                    abs(calculate_line_angle(line1, 5) - calculate_line_angle(line3, 5))
                    <= 10
                ):
                    connections += 1
                if (
                    abs(calculate_line_angle(line2, 5) - calculate_line_angle(line1, 5))
                    <= 10
                ):
                    connections += 1
                if (
                    abs(calculate_line_angle(line3, 5) - calculate_line_angle(line2, 5))
                    <= 10
                ):
                    connections += 1
                # connections = 5
                # For a valid partial rectangle, we need at least 2 connections
                if connections < 1:
                    continue

                # Check if lines are almost connected (any two lines are connected)
                # This allows for a triangle (3 lines) representing a partial rectangle
                connections = 0
                if are_lines_almost_connected(line1, line2, threshold):
                    connections += 1
                if are_lines_almost_connected(line2, line3, threshold):
                    connections += 1
                if are_lines_almost_connected(line1, line3, threshold):
                    connections += 1
                # connections = 5
                # For a valid partial rectangle, we need at least 2 connections
                if connections >= 2:
                    # Check that each line can connect to at most 2 other lines
                    boxes.append([line1, line2, line3])

    # For 4 lines
    for i in range(len(lines)):
        for j in range(i + 1, len(lines)):
            for k in range(j + 1, len(lines)):
                for l in range(k + 1, len(lines)):
                    line1, line2, line3, line4 = lines[i], lines[j], lines[k], lines[l]
                    orient1, orient2, orient3, orient4 = (
                        orientations[i],
                        orientations[j],
                        orientations[k],
                        orientations[l],
                    )

                    # Check if orientations are compatible (one vertical, one horizontal)
                    if not (
                        are_orientations_compatible(orient1, orient2)
                        and are_orientations_compatible(orient2, orient3)
                        and are_orientations_compatible(orient3, orient4)
                        and are_orientations_compatible(orient4, orient1)
                    ):
                        continue

                    # Check if lines form a closed loop
                    if (
                        are_lines_almost_connected(line1, line2, threshold)
                        and are_lines_almost_connected(line2, line3, threshold)
                        and are_lines_almost_connected(line3, line4, threshold)
                        and are_lines_almost_connected(line4, line1, threshold)
                    ):

                        # Check that each line can connect to at most 2 other lines
                        # For 4 lines forming a closed loop, this is automatically satisfied
                        boxes.append([line1, line2, line3, line4])

    return boxes
