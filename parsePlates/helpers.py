import math
from typing import List, Sequence, Tuple
import cv2
import numpy as np


def get_line_length(x):
    return math.dist([x[0], x[1]], [x[2], x[3]])


def expand_bbox(bbox, img_shape, margin=20):
    """
    bbox: 4 points (x1, y1, x2, y2)
    img_shape: (height, width, channels)
    margin: pixels to expand on each side
    """
    h, w = img_shape[:2]
    x1, y1, x2, y2 = bbox
    x1 = max(x1 - margin, 0)
    y1 = max(y1 - margin, 0)
    x2 = min(x2 + margin, w)
    y2 = min(y2 + margin, h)
    return [x1, y1, x2, y2]


def show_image(img: cv2.typing.MatLike):
    cv2.namedWindow("test", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("test", 600, 600)
    cv2.imshow("test", img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


import numpy as np


def sort_bbox_corners(points):
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
        dtype=float,
    )

    return sorted_pts


def sort_corners_clockwise(pts: np.ndarray) -> np.ndarray:
    """
    Reorder the four points of a rectangle into clockwise order:
    TL → TR → BR → BL.

    Parameters
    ----------
    pts : ndarray, shape (4,2)
        Unordered corner points (integers or floats).

    Returns
    -------
    ndarray, shape (4,2)
        Clockwise‑ordered corners.
    """
    pts = np.asarray(pts, dtype=np.float64)
    if pts.shape != (4, 2):
        raise ValueError("Expected shape (4, 2) – got {}".format(pts.shape))

    # 1. Find the leftmost two points (smallest x)
    idx_sorted_by_x = np.argsort(pts[:, 0])
    left = pts[idx_sorted_by_x[:2]]
    right = pts[idx_sorted_by_x[2:]]

    # 2. Sort each side by y (smaller y → top)
    left = left[np.argsort(left[:, 1])]
    right = right[np.argsort(right[:, 1])]

    # 3. Assemble TL, TR, BR, BL
    tl, bl = left
    tr, br = right
    return np.vstack([tl, tr, br, bl])


# --------------------------------------------------------------------------- #
# 2️⃣  Polygon area (shoelace formula)
# --------------------------------------------------------------------------- #
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


# --------------------------------------------------------------------------- #
# 3️⃣  Sort a list of bounding boxes by area
# --------------------------------------------------------------------------- #
def sort_boxes_by_area(boxes, ascending=True, normalise=True):
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
        boxes = [sort_corners_clockwise(b) for b in boxes]

    # Compute areas
    areas = [polygon_area(b) for b in boxes]

    # Get the sorted indices
    idx = np.argsort(areas)
    if not ascending:
        idx = idx[::-1]

    sorted_boxes = [boxes[i] for i in idx]
    sorted_areas = [areas[i] for i in idx]
    return sorted_boxes, sorted_areas


def get_largest_textbox(img: cv2.typing.MatLike):
    # Set threshold for Binary Map creation and polygon detection.
    binThresh = 0.3
    polyThresh = 0.5
    mean = (122.67891434, 116.66876762, 104.00698793)
    textDetectorDB50 = cv2.dnn_TextDetectionModel_DB("source/DB_TD500_resnet50.onnx")
    textDetectorDB50.setBinaryThreshold(binThresh)
    textDetectorDB50.setPolygonThreshold(polyThresh)
    textDetectorDB50.setInputParams(1 / 255, (320, 320), mean, True)
    boxes, confidences = textDetectorDB50.detect(cv2.cvtColor(img, cv2.COLOR_GRAY2BGR))
    if len(boxes) == 0:
        return None

    boxes, _ = sort_boxes_by_area(boxes, False)
    return boxes[0]


Box = Tuple[float, float, float, float]  # (x, y, height, width)
Boxes = Sequence[Box]  # any iterable of boxes


def group_boxes_by_height(
    boxes: List[Box],
    *,
    abs_tol: float = 0.0,  # absolute pixel tolerance (default 0 → exact match)
    rel_tol: float = 0.0,  # relative tolerance as a fraction (e.g. 0.1 = 10%)
    min_group_size: int = 1,  # ignore groups smaller than this
    return_indices: bool = False  # if True, return lists of indices instead of boxes
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
    print(groups)
    return groups
