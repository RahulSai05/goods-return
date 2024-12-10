import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import cv2
from skimage.metrics import structural_similarity as ssim
from tensorflow.keras.preprocessing.image import img_to_array, load_img
from flask import send_from_directory # add this line for local directory of accessing image

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Directories
UPLOAD_DIRECTORY = "./uploads"
REFERENCE_DIRECTORY = "./reference_images"
FRONT_REFERENCE = os.path.join(REFERENCE_DIRECTORY, "front_reference.jpg")
BACK_REFERENCE = os.path.join(REFERENCE_DIRECTORY, "back_reference.jpg")

# Temporary storage for results
comparison_results = {"front": None, "back": None}

# Helper function to preprocess images
def preprocess_image(image_path, target_size=(224, 224)):
    image = load_img(image_path, target_size=target_size)
    image = img_to_array(image)
    image = np.expand_dims(image, axis=0)
    return image.astype("float32") / 255.0

# Helper function to calculate SSIM (Structural Similarity Index)
def calculate_ssi(image1_path, image2_path, target_size=(224, 224)):
    img1 = load_img(image1_path, target_size=target_size)
    img2 = load_img(image2_path, target_size=target_size)
    img1 = img_to_array(img1).astype("float32") / 255.0
    img2 = img_to_array(img2).astype("float32") / 255.0

    ssi_r = ssim(img1[..., 0], img2[..., 0], data_range=1.0)
    ssi_g = ssim(img1[..., 1], img2[..., 1], data_range=1.0)
    ssi_b = ssim(img1[..., 2], img2[..., 2], data_range=1.0)

    return (ssi_r + ssi_g + ssi_b) / 3

# Helper function to classify image condition based on SSIM
def classify_condition(ssi):
    # Adjusted conditions based on SSI value
    if ssi < 0.5:
        return "Non-Functional"
    elif ssi > 0.85:
        return "Damaged"
    elif ssi > 0.75:
        return "Excellent Condition"
    elif ssi > 0.6:
        return "Brand New"
    return "Different"

# Helper function to highlight differences on the uploaded user image
def highlight_differences_on_uploaded_image(image1_path, image2_path, output_path):
    # Read the images
    image1 = cv2.imread(image1_path)  # User-uploaded image
    image2 = cv2.imread(image2_path)  # Reference image

    # Check if images were loaded correctly
    if image1 is None or image2 is None:
        print("Error: One of the images couldn't be loaded. Check the file paths.")
        return

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

    # Draw bounding boxes around differences on the uploaded user image
    result_image = image1.copy()  # Use the uploaded image for drawing the bounding boxes
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > 500:  # Adjust this threshold based on your images
            x, y, w, h = cv2.boundingRect(contour)
            cv2.rectangle(result_image, (x, y), (x + w, y + h), (0, 0, 255), 2)  # Red bounding box

    # Save the result image
    cv2.imwrite(output_path, result_image)
    print(f"Result image saved to {output_path}")

# Route for uploading user image and processing it
@app.route("/upload_user", methods=["POST"])
def upload_user():
    global comparison_results
    try:
        if "file" not in request.files or "comparison_type" not in request.form:
            return jsonify({"error": "File or comparison type missing."}), 400

        file = request.files["file"]
        comparison_type = request.form.get("comparison_type")

        if comparison_type not in ["front", "back"]:
            return jsonify({"error": "Invalid comparison type."}), 400

        # Save the uploaded file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"user_{comparison_type}_{timestamp}.jpg"
        user_image_path = os.path.join(UPLOAD_DIRECTORY, filename)
        os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
        file.save(user_image_path)

        # Compare with reference image
        reference_image = FRONT_REFERENCE if comparison_type == "front" else BACK_REFERENCE
        ssi = float(calculate_ssi(user_image_path, reference_image))

        # Determine condition based on SSI
        condition = classify_condition(ssi)

        # Store results
        comparison_results[comparison_type] = {"ssi": round(ssi, 2), "condition": condition}

        # Highlight differences on the uploaded image and save the result
        highlighted_image_filename = f"highlighted_{comparison_type}_{timestamp}.jpg"
        highlighted_image_path = os.path.join(UPLOAD_DIRECTORY, highlighted_image_filename)
        highlight_differences_on_uploaded_image(user_image_path, reference_image, highlighted_image_path)

        # If both front and back are processed, calculate combined results
        if comparison_results["front"] and comparison_results["back"]:
            avg_ssi = (
                comparison_results["front"]["ssi"] + comparison_results["back"]["ssi"]
            ) / 2

            overall_condition = classify_condition(avg_ssi)

            response = {
                "message": "Comparison successful.",
                "overall_ssi": round(avg_ssi, 2),
                "overall_condition": overall_condition,
                "front": comparison_results["front"],
                "back": comparison_results["back"],
                # "highlighted_image": highlighted_image_filename (modified this line)
                "highlighted_image": f"http://127.0.0.1:5000/uploads/{highlighted_image_filename}"  
            }
            comparison_results = {"front": None, "back": None}  # Reset results for next request
            return jsonify(response), 200

        return jsonify({
            "message": f"{comparison_type.capitalize()} image processed.",
            "ssi": round(ssi, 2),
            "condition": condition,
            # "highlighted_image": highlighted_image_filename (modified this line)
            "highlighted_image": f"http://127.0.0.1:5000/uploads/{highlighted_image_filename}"
        }), 200

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500


# for local image path access add these 
@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    return send_from_directory(UPLOAD_DIRECTORY, filename)


if __name__ == "__main__":
    app.run(debug=True)
