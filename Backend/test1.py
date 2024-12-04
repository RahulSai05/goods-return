import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
from google.colab.patches import cv2_imshow
from google.colab import files

def highlight_differences_with_bounding_boxes(image1_path, image2_path):
    # Read the images
    image1 = cv2.imread(image1_path)
    image2 = cv2.imread(image2_path)

    # Resize images to match dimensions if necessary
    if image1.shape != image2.shape:
        print("Resizing images to match dimensions...")
        image2 = cv2.resize(image2, (image1.shape[1], image1.shape[0]))

    # Convert to grayscale
    gray1 = cv2.cvtColor(image1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(image2, cv2.COLOR_BGR2GRAY)

    # Compute SSIM between the two images
    (score, diff) = ssim(gray1, gray2, full=True)
    diff = (diff * 255).astype("uint8")
    print(f"SSIM Score: {score}")

    # Invert the difference image
    diff_inv = cv2.bitwise_not(diff)

    # Threshold the difference image to get the regions with differences
    _, thresh = cv2.threshold(diff_inv, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

    # Apply morphological operations to remove noise and small differences
    kernel = np.ones((5, 5), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
    thresh = cv2.dilate(thresh, kernel, iterations=1)

    # Find contours of the differences
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Draw bounding boxes around differences on the original image
    result_image = image2.copy()
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > 500:  # Adjust this threshold based on your images
            x, y, w, h = cv2.boundingRect(contour)
            cv2.rectangle(result_image, (x, y), (x + w, y + h), (0, 0, 255), 2)  # Red bounding box

    # Display the result
    print("Differences highlighted with bounding boxes:")
    cv2_imshow(result_image)

# Install scikit-image if not already installed
!pip install scikit-image

# Upload images in Colab
print("Please upload the first image (image1):")
uploaded1 = files.upload()

print("Please upload the second image (image2):")
uploaded2 = files.upload()

# Extract file names
image1_path = next(iter(uploaded1))
image2_path = next(iter(uploaded2))

# Highlight differences and display result
highlight_differences_with_bounding_boxes(image1_path, image2_path)