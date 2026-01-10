import cv2
import numpy as np
from scipy.spatial.distance import cdist
import math

def detect_bounding_boxes_partial(lines, image_shape, min_lines=3, max_gap=30, angle_tolerance=15):
    """
    Detect bounding boxes from lines, even when one side is missing
    
    Args:
        lines: List of lines from HoughLines (array of [rho, theta])
        image_shape: Shape of the image (height, width)
        min_lines: Minimum number of lines to consider for a rectangle
        max_gap: Maximum gap allowed between lines to consider them connected
        angle_tolerance: Angle tolerance for parallel lines (degrees)
    
    Returns:
        List of bounding boxes as [x, y, width, height]
    """
    
    if len(lines) < min_lines:
        return []
    
    # Convert lines to line segments
    segments = []
    for line in lines:
        # rho, theta = line[0]
        # a = math.cos(theta)
        # b = math.sin(theta)
        # x0 = a * rho
        # y0 = b * rho
        # x1 = int(x0 + 1000 * (-b))
        # y1 = int(y0 + 1000 * (a))
        # x2 = int(x0 - 1000 * (-b))
        # y2 = int(y0 - 1000 * (a))
        #print(line)
        x1, y1, x2, y2 = tuple(line[0])
        segments.append([(x1, y1), (x2, y2)])
    
    # Find all intersections
    intersections = []
    intersection_pairs = []
    print("segments created")
    for i in range(len(segments)):
        for j in range(i + 1, len(segments)):
            # Check if lines are approximately parallel
            angle1 = math.atan2(segments[i][1][1] - segments[i][0][1], 
                               segments[i][1][0] - segments[i][0][0])
            angle2 = math.atan2(segments[j][1][1] - segments[j][0][1], 
                               segments[j][1][0] - segments[j][0][0])
            
            angle_diff = abs(angle1 - angle2) * 180 / math.pi
            
            # If lines are not parallel, check intersection
            if abs(angle_diff - 90) > angle_tolerance and abs(angle_diff) > angle_tolerance:
                p = line_intersection(segments[i][0], segments[i][1], 
                                    segments[j][0], segments[j][1])
                if p:
                    intersections.append(p)
                    intersection_pairs.append((i, j, p))
    print("for loop executed")
    print(len(intersections), intersections[0])
    # Group intersections to find rectangle corners
    rectangles = find_rectangles_from_intersections(intersections, segments, 
                                                   max_gap, angle_tolerance)
    
    return rectangles

def line_intersection(p1, p2, p3, p4):
    """
    Find intersection of two lines defined by points
    """
    x1, y1 = p1
    x2, y2 = p2
    x3, y3 = p3
    x4, y4 = p4
    
    denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(denom) < 1e-10:
        return None
    
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom
    
    if 0 <= t <= 1 and 0 <= u <= 1:
        x = x1 + t * (x2 - x1)
        y = y1 + t * (y2 - y1)
        return (int(x), int(y))
    
    return None

def find_rectangles_from_intersections(intersections, segments, max_gap, angle_tolerance):
    """
    Find rectangles from intersection points, even with missing sides
    """
    if len(intersections) < 3:
        return []
    
    rectangles = []
    
    # Try different combinations of 3-4 points
    if len(intersections) >= 3:
        # Try to form rectangles with 3 or 4 points
        rectangles.extend(find_rectangle_from_3_points(intersections, max_gap))
        
        # if len(intersections) >= 4:
        #     rectangles.extend(find_rectangle_from_4_points(intersections, max_gap))
    
    # Also try to detect rectangles from line segments directly
    rectangles.extend(detect_from_segments(segments, max_gap, angle_tolerance))
    print("dupes removed")
    # Remove duplicates and return
    unique_rectangles = []
    for rect in rectangles:
        if not is_duplicate_rectangle(rect, unique_rectangles):
            unique_rectangles.append(rect)
    print("dupes removed")
    return unique_rectangles

def find_rectangle_from_3_points(intersections, max_gap):
    """
    Try to form rectangle from 3 intersection points
    """
    rectangles = []
    
    # Try all combinations of 3 points
    for i in range(len(intersections)):
        for j in range(i+1, len(intersections)):
            for k in range(j+1, len(intersections)):
                points = [intersections[i], intersections[j], intersections[k]]
                rect = points_to_rectangle(points)
                if rect and is_valid_rectangle(rect, max_gap):
                    rectangles.append(rect)
    
    return rectangles

def find_rectangle_from_4_points(intersections, max_gap):
    """
    Try to form rectangle from 4 intersection points
    """
    rectangles = []
    
    # Try all combinations of 4 points
    for i in range(len(intersections)):
        for j in range(i+1, len(intersections)):
            for k in range(j+1, len(intersections)):
                for l in range(k+1, len(intersections)):
                    points = [intersections[i], intersections[j], intersections[k], intersections[l]]
                    rect = points_to_rectangle(points)
                    if rect and is_valid_rectangle(rect, max_gap):
                        rectangles.append(rect)
    
    return rectangles

def points_to_rectangle(points):
    """
    Convert 3-4 points to a rectangle (if they form a rectangle)
    """
    if len(points) < 3:
        return None
    
    # Sort points to find bounding box
    x_coords = [p[0] for p in points]
    y_coords = [p[1] for p in points]
    
    x_min, x_max = min(x_coords), max(x_coords)
    y_min, y_max = min(y_coords), max(y_coords)
    
    # Calculate area and check if it makes sense
    width = x_max - x_min
    height = y_max - y_min
    
    if width > 0 and height > 0:
        return [x_min, y_min, width, height]
    
    return None

def is_valid_rectangle(rect, max_gap):
    """
    Check if rectangle is valid (not too small, reasonable dimensions)
    """
    x, y, w, h = rect
    return w > 5 and h > 5 and w < 1000 and h < 1000  # Adjust thresholds as needed

def is_duplicate_rectangle(rect, existing_rectangles):
    """
    Check if rectangle is duplicate of existing ones
    """
    if not existing_rectangles:
        return False
    
    x, y, w, h = rect
    for existing in existing_rectangles:
        ex, ey, ew, eh = existing
        # Simple overlap check
        if (abs(x - ex) < max(w, ew) * 0.3 and 
            abs(y - ey) < max(h, eh) * 0.3):
            return True
    return False

def detect_from_segments(segments, max_gap, angle_tolerance):
    """
    Detect rectangles directly from line segments
    """
    rectangles = []
    
    # Group parallel lines
    parallel_groups = group_parallel_lines(segments, angle_tolerance)
    
    # Try to form rectangles from these groups
    for group in parallel_groups:
        if len(group) >= 2:  # Need at least 2 parallel lines
            # Find bounding rectangle
            rect = group_to_rectangle(group, segments)
            if rect:
                rectangles.append(rect)
    
    return rectangles

def group_parallel_lines(segments, angle_tolerance):
    """
    Group lines that are approximately parallel
    """
    groups = []
    used = [False] * len(segments)
    
    for i in range(len(segments)):
        if used[i]:
            continue
            
        group = [i]
        used[i] = True
        
        # Find all lines parallel to this one
        angle1 = math.atan2(segments[i][1][1] - segments[i][0][1], 
                           segments[i][1][0] - segments[i][0][0])
        
        for j in range(i+1, len(segments)):
            if used[j]:
                continue
                
            angle2 = math.atan2(segments[j][1][1] - segments[j][0][1], 
                               segments[j][1][0] - segments[j][0][0])
            
            angle_diff = abs(angle1 - angle2) * 180 / math.pi
            
            # If angles are close (parallel)
            if angle_diff < angle_tolerance or abs(angle_diff - 180) < angle_tolerance:
                group.append(j)
                used[j] = True
        
        groups.append(group)
    
    return groups

def group_to_rectangle(group, segments):
    """
    Convert a group of parallel lines to a rectangle
    """
    if len(group) < 2:
        return None
    
    # Get all points from these lines
    points = []
    for line_idx in group:
        points.append(segments[line_idx][0])
        points.append(segments[line_idx][1])
    
    # Find bounding box
    x_coords = [p[0] for p in points]
    y_coords = [p[1] for p in points]
    
    x_min, x_max = min(x_coords), max(x_coords)
    y_min, y_max = min(y_coords), max(y_coords)
    
    width = x_max - x_min
    height = y_max - y_min
    
    if width > 0 and height > 0:
        return [x_min, y_min, width, height]
    
    return None

# Alternative simpler approach - directly detect rectangles from lines
def detect_rectangles_simple(lines, image_shape):
    """
    Simple approach to detect rectangles from lines, handling missing sides
    """
    if len(lines) < 3:
        return []
    
    # Convert lines to segments
    segments = []
    for line in lines:
        rho, theta = line[0]
        a = np.cos(theta)
        b = np.sin(theta)
        x0 = a * rho
        y0 = b * rho
        x1 = int(x0 + 1000 * (-b))
        y1 = int(y0 + 1000 * (a))
        x2 = int(x0 - 1000 * (-b))
        y2 = int(y0 - 1000 * (a))
        segments.append([(x1, y1), (x2, y2)])
    
    # Find all intersections
    intersections = []
    for i in range(len(segments)):
        for j in range(i + 1, len(segments)):
            # Skip parallel lines (they don't intersect)
            angle1 = np.arctan2(segments[i][1][1] - segments[i][0][1], 
                               segments[i][1][0] - segments[i][0][0])
            angle2 = np.arctan2(segments[j][1][1] - segments[j][0][1], 
                               segments[j][1][0] - segments[j][0][0])
            
            angle_diff = abs(angle1 - angle2)
            if abs(angle_diff - np.pi/2) > 0.1:  # Not parallel
                p = line_intersection(segments[i][0], segments[i][1], 
                                    segments[j][0], segments[j][1])
                if p:
                    intersections.append(p)
    
    # If we have enough intersections, try to form rectangles
    if len(intersections) >= 3:
        # Simple approach: find bounding box of all intersections
        x_coords = [p[0] for p in intersections]
        y_coords = [p[1] for p in intersections]
        
        if x_coords and y_coords:
            x_min, x_max = min(x_coords), max(x_coords)
            y_min, y_max = min(y_coords), max(y_coords)
            
            # Return rectangle
            return [[x_min, y_min, x_max - x_min, y_max - y_min]]
    
    return []

# Usage example:
def example_usage():
    # Assuming you have your lines from HoughLines
    # lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)
    
    # For demonstration:
    lines = [
        [[50, np.pi/4]],    # Line at 45 degrees
        [[100, np.pi/4]],   # Parallel line
        [[50, 3*np.pi/4]],  # Line at 135 degrees
        [[100, 3*np.pi/4]], # Parallel line
        [[200, 0]],         # Horizontal line
        [[250, 0]],         # Another horizontal line
    ]
    
    # Try different approaches
    rectangles1 = detect_rectangles_simple(lines, (640, 480))
    rectangles2 = detect_rectangles_simple(lines, (640, 480))
    
    print("Detected rectangles:", rectangles1)

if __name__ == "__main__":
    example_usage()