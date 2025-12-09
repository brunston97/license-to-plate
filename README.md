# license-to-plate
Simple voting webpage that pairs images against eachother and keeps track of the winners

## Yearly Plate Setup

### Step 1
Download plate zone server images via "discrub" browser extension, and select the option to separate media by author

### Step 2
Rename the plate image files to "platex.jpg", where x will be the eventual plate ID, using the "rename.py" script

### Step 3
Copy all plate images into one directory, while still maintaining the separate list of plates by author, using the "collect.py" script. Be sure to specify the
source and destination directories

### Step 4
Resize all images to same aspect ratio using "resize.py" script. Make sure to set the input and output directories and run 'pip install pillow' before running the script

### Step 5
TBD
