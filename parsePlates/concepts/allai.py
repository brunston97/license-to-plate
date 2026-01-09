import math
from typing import List, Tuple, Optional, Dict, Set

import numpy as np


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


def find_bounding_boxes_with_orientation_constraint(
    lines: List[Tuple[float, float, float, float]], threshold: float = 10.0
) -> List[List[Tuple[float, float, float, float]]]:
    boxes = []

    # Precompute orientations for all lines
    orientations = [get_line_orientation(line) for line in lines]

    # For 3 lines
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
                if not (
                    are_orientations_compatible(orient1, orient2)
                    and are_orientations_compatible(orient2, orient3)
                    and are_orientations_compatible(orient1, orient3)
                ):
                    continue

                # Check if lines are almost connected
                if (
                    are_lines_almost_connected(line1, line2, threshold)
                    and are_lines_almost_connected(line2, line3, threshold)
                    and are_lines_almost_connected(line1, line3, threshold)
                ):

                    # Check if each endpoint connects to only one line
                    endpoints = []
                    for line in [line1, line2, line3]:
                        endpoints.extend(get_line_endpoints(line))

                    # Count how many lines connect to each endpoint
                    endpoint_counts = {}
                    for endpoint in endpoints:
                        endpoint_counts[endpoint] = 0

                    for line in [line1, line2, line3]:
                        p1_start, p1_end = get_line_endpoints(line)
                        endpoint_counts[p1_start] += 1
                        endpoint_counts[p1_end] += 1

                    # Check if any endpoint has more than one connection
                    if all(count <= 2 for count in endpoint_counts.values()):
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

                        # Check if each endpoint connects to only one line
                        endpoints = []
                        for line in [line1, line2, line3, line4]:
                            endpoints.extend(get_line_endpoints(line))

                        # Count how many lines connect to each endpoint
                        endpoint_counts = {}
                        for endpoint in endpoints:
                            endpoint_counts[endpoint] = 0

                        for line in [line1, line2, line3, line4]:
                            p1_start, p1_end = get_line_endpoints(line)
                            endpoint_counts[p1_start] += 1
                            endpoint_counts[p1_end] += 1

                        # Check if any endpoint has more than one connection
                        if all(count <= 2 for count in endpoint_counts.values()):
                            boxes.append([line1, line2, line3, line4])

    return boxes
