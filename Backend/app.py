import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.preprocessing.image import img_to_array, load_img
from skimage.metrics import structural_similarity as ssim

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Directories
UPLOAD_DIRECTORY = "./uploads"
REFERENCE_DIRECTORY = "./reference_images"
FRONT_REFERENCE = os.path.join(REFERENCE_DIRECTORY, "front_reference.jpg")
BACK_REFERENCE = os.path.join(REFERENCE_DIRECTORY, "back_reference.jpg")

# Load ResNet50 model
feature_extractor = ResNet50(weights="imagenet", include_top=False, pooling="avg")

# Temporary storage for results
comparison_results = {"front": None, "back": None}

# Helper functions
def preprocess_image(image_path, target_size=(224, 224)):
    image = load_img(image_path, target_size=target_size)
    image = img_to_array(image)
    image = np.expand_dims(image, axis=0)
    return preprocess_input(image)

def extract_features(image_path):
    image = preprocess_image(image_path)
    features = feature_extractor.predict(image).flatten()
    return features / np.linalg.norm(features)

def calculate_ssi(image1_path, image2_path, target_size=(224, 224)):
    img1 = load_img(image1_path, target_size=target_size)
    img2 = load_img(image2_path, target_size=target_size)
    img1 = img_to_array(img1).astype("float32") / 255.0
    img2 = img_to_array(img2).astype("float32") / 255.0

    ssi_r = ssim(img1[..., 0], img2[..., 0], data_range=1.0)
    ssi_g = ssim(img1[..., 1], img2[..., 1], data_range=1.0)
    ssi_b = ssim(img1[..., 2], img2[..., 2], data_range=1.0)

    return (ssi_r + ssi_g + ssi_b) / 3

def classify_condition(similarity, ssi):
    if similarity < 0.4 or ssi < 0.5:
        return "Non-Functional"
    if similarity > 0.85 and ssi > 0.7:
        return "Damaged"
    elif similarity > 0.75 and ssi > 0.6:
        return "Excellent Condition"
    elif similarity > 0.6 and ssi > 0.5:
        return "Brand New"
    return "Different"

@app.route("/upload_user", methods=["POST"])
def upload_user():
    global comparison_results
    try:
        if "file" not in request.files or "comparison_type" not in request.form:
            print("Missing file or comparison_type in request.")
            return jsonify({"error": "File or comparison type missing."}), 400

        file = request.files["file"]
        comparison_type = request.form.get("comparison_type")

        if comparison_type not in ["front", "back"]:
            print(f"Invalid comparison type: {comparison_type}")
            return jsonify({"error": "Invalid comparison type."}), 400

        # Save the uploaded file
        print(f"Processing {comparison_type} image...")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"user_{comparison_type}_{timestamp}.jpg"
        user_image_path = os.path.join(UPLOAD_DIRECTORY, filename)
        os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
        file.save(user_image_path)
        print(f"File saved at: {user_image_path}")

        # Compare with reference image
        reference_image = FRONT_REFERENCE if comparison_type == "front" else BACK_REFERENCE
        user_features = extract_features(user_image_path)
        reference_features = extract_features(reference_image)
        similarity = float(np.dot(user_features, reference_features))
        ssi = float(calculate_ssi(user_image_path, reference_image))

        # Store results
        comparison_results[comparison_type] = {"similarity": round(similarity, 2), "ssi": round(ssi, 2)}
        print(f"Stored results for {comparison_type}: {comparison_results[comparison_type]}")

        # If both front and back are processed, calculate combined results
        if comparison_results["front"] and comparison_results["back"]:
            avg_similarity = (
                comparison_results["front"]["similarity"] + comparison_results["back"]["similarity"]
            ) / 2
            avg_ssi = (
                comparison_results["front"]["ssi"] + comparison_results["back"]["ssi"]
            ) / 2

            overall_condition = classify_condition(avg_similarity, avg_ssi)
            print(f"Combined Results: Similarity={avg_similarity}, SSI={avg_ssi}, Condition={overall_condition}")

            response = {
                "message": "Comparison successful.",
                "overall_similarity": round(avg_similarity, 2),
                "overall_ssi": round(avg_ssi, 2),
                "overall_condition": overall_condition,
                "front": comparison_results["front"],
                "back": comparison_results["back"],
            }
            comparison_results = {"front": None, "back": None}  # Reset results for next request
            return jsonify(response), 200

        return jsonify({
            "message": f"{comparison_type.capitalize()} image processed.",
            "similarity": round(similarity, 2),
            "ssi": round(ssi, 2),
        }), 200

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
