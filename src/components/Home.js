import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { styles } from "../styles";

function Home() {
  const [step, setStep] = useState(0); // 0: Start, 1: Front Image, 2: Back Image
  const [message, setMessage] = useState("Click 'Start a Return' to begin the process.");
  const [result, setResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // For tracking upload status

  const handleStartClick = () => {
    setStep(1);
    setMessage("Please upload the front view image of the product.");
    setResult(null);
    setIsUploading(false);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("comparison_type", step === 1 ? "front" : "back");

    try {
      setIsUploading(true); // Start showing progress bar
      const response = await axios.post("http://127.0.0.1:5000/upload_user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsUploading(false); // Stop progress bar once upload completes
      if (response.status === 200) {
        if (response.data.overall_condition) {
          setResult({
            condition: response.data.overall_condition,
            combinedSimilarity: response.data.overall_similarity,
            combinedSSI: response.data.overall_ssi,
            front: response.data.front,
            back: response.data.back,
          });
          setMessage("Return analysis completed.");
          setStep(0); // Reset for new return
        } else {
          setStep(2);
          setMessage("Front image has been saved. Now upload the back view image of the product.");
        }
      } else {
        alert("Error uploading the image. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred during upload. Please try again.");
      setIsUploading(false); // Stop progress bar on error
    }
  };

    return (
        <div style={styles.container}>
          <h1 style={styles.title}>Auditly</h1>
    
          {/* Navbar */}
          <nav style={styles.navbar}>
            <a href="#" style={styles.navLink}>Home</a>
            <a href="#" style={styles.navLink}>Services</a>
            <a href="#" style={styles.navLink}>About Us</a>
            <a href="#" style={styles.navLink}>Contact</a>
          </nav>
    
          {/* Main Content */}
          <div style={styles.mainContent}>
            <h2 style={styles.subtitle}>Start your easy returns</h2>
            <p style={styles.description}>
            Auditly offers an AI-driven solution to simplify and enhance your product return process. Experience efficiency and transparency like never before.
            </p>
            {!result && <p style={styles.dynamicMessage}>{message}</p>}
            {step === 0 && !result && (
              <button  style={styles.uploadButton}> 
              {/* handleStartClick */}
                <Link to="/file-upload">Start a Return</Link>
              </button>
            )}
            {step > 0 && (
              <>
                <button
                  onClick={() => document.getElementById("fileInput").click()}
                  style={styles.uploadButton}
                >
                  Upload Image
                </button>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {isUploading && (
                  <div style={styles.progressBarContainer}>
                    <div style={styles.progressBar}></div>
                  </div>
                )}
              </>
            )}
            {result && (
              <div style={styles.resultBox}>
                {/* Overall Condition Display */}
                <div style={styles.overallConditionBox}>
                  <h3 style={styles.overallConditionTitle}>Overall Condition</h3>
                  <p style={styles.overallCondition}>{result.condition}</p>
                </div>
    
                {/* Detailed Results */}
                <div style={styles.resultDetails}>
                  {/* Front Image Results */}
                  {result.front && (
                    <div style={styles.resultSection}>
                      <h4 style={styles.detailTitle}>Front Image Analysis</h4>
                      <p>Similarity Score: {result.front.similarity}</p>
                      <p>Structural Similarity Index (SSI): {result.front.ssi}</p>
                    </div>
                  )}
                  {/* Back Image Results */}
                  {result.back && (
                    <div style={styles.resultSection}>
                      <h4 style={styles.detailTitle}>Back Image Analysis</h4>
                      <p>Similarity Score: {result.back.similarity}</p>
                      <p>Structural Similarity Index (SSI): {result.back.ssi}</p>
                    </div>
                  )}
                  {/* Combined Results */}
                  <div style={styles.resultSection}>
                    <h4 style={styles.detailTitle}>Combined Results</h4>
                    <p>Combined Similarity Score: {result.combinedSimilarity}</p>
                    <p>Combined Structural Similarity Index (SSI): {result.combinedSSI}</p>
                  </div>
                </div>
              </div>
            )}
            {/* Start New Return Button */}
            {result && (
              <button onClick={handleStartClick} style={styles.newReturnButton}>
                Start a New Return
              </button>
            )}
          </div>
        </div>
      );
}

export default Home;
