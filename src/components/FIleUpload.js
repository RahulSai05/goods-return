import axios from "axios";
import React, { useState } from "react";
import {Stepper} from "react-form-stepper";
import styled from "styled-components";
import { styles } from "../styles";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import DeviceSelector from "./DeviceSelector";

const STEPS = [
    {label: "Select a device"},
    {label: "Upload Front"},
    {label: "Upload Back"},
    {label: "Review"}
];

const Card = styled.div`
    width: 70%;
    min-height: 50vh;
    margin: 2rem auto;
`;

const UploaderContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
`;

const Reference = styled.div`
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const FlexVertical = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    position: relative;
`;

const UploaderChild = styled.div`
    width: 50%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Image = styled.img`
    width: 250px;
    height: 500px;
    border-radius: 0.25rem;
`;

const ImageContainer = styled.div`
    width: 250px;
    height: 500px;
    border: 2px dashed #ccc;
    border-radius: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Overlay = styled.div`
    width: 250px;
    height: 500px;
    border-radius: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: black;
    opacity: 0.7;
    color: white;
    font-weight: bold;
    position: absolute;
    top:0;
    left:0;
`;

const FileUpload = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [result, setResult] = useState(null);

    const handleNewReturn = () => {
        setActiveStep(0);
        setResult(null);
    }

    const onSelectionChange = () => {
        setActiveStep(activeStep + 1);
    }

    const clickHandler = () => {
        window.location.href="/";
    }

    return(
        <div>
            <h1 style={styles.title} onClick={clickHandler}>
                Auditly
            </h1>
            
            <Stepper 
                steps={STEPS}
                activeStep={activeStep}
                styleConfig={{
                    activeBgColor: "#f74b4b",
                    completedBgColor: '#f74b4b',
                    inactiveBgColor: '#ccc',
                    size: '40px',
                    circleFontSize: '18px'
                }}
            />
            {!result && (
                <Card>
                    {/* <CardHeader>{STEPS[activeStep].label}</CardHeader> */}
                    {activeStep===0 && <DeviceSelector onSelectionChange={onSelectionChange}/>}
                    {activeStep===1 ? (
                        <Uploader refer={"/images/front_reference.jpg"} type="front" onComplete={()=>setActiveStep(activeStep+1)}/>
                    ): null}
                    {activeStep===2 ? (
                        <Uploader refer={"/images/back_reference.jpg"} type="back" onComplete={()=>setActiveStep(activeStep+1)} setResult={setResult}/>
                    ): null}
                                
                </Card>
            )}
            <Card>
            {(result && activeStep === 3) && (
    <div style={{ ...styles.resultBox, padding: "20px", marginTop: "20px" }}>
        {/* Overall Condition Display */}
        <div style={{ ...styles.overallConditionBox, padding: "20px", textAlign: "center" }}>
            <h3 style={{ ...styles.overallConditionTitle, fontSize: "26px", letterSpacing: "1px" }}>
                Overall Condition
            </h3>
            <p style={{ ...styles.overallCondition, fontSize: "22px", color: "#ffffff" }}>
                {result.condition}
            </p>
        </div>

        {/* Detailed Results */}
        <div style={{ ...styles.resultDetails, marginTop: "20px", padding: "15px" }}>
            {/* Front Image Results */}
            {result.front && (
                <div style={{ ...styles.resultSection, marginBottom: "15px" }}>
                    <h4 style={{ ...styles.detailTitle, fontSize: "18px", color: "#4caf50" }}>
                        Front Image Analysis
                    </h4>
                    <p>Similarity Score: <span style={styles.dynamicMessage}>{result.front.similarity}</span></p>
                    <p>Structural Similarity Index (SSI): <span style={styles.dynamicMessage}>{result.front.ssi}</span></p>
                </div>
            )}

            {/* Back Image Results */}
            {result.back && (
                <div style={{ ...styles.resultSection, marginBottom: "15px" }}>
                    <h4 style={{ ...styles.detailTitle, fontSize: "18px", color: "#4caf50" }}>
                        Back Image Analysis
                    </h4>
                    <p>Similarity Score: <span style={styles.dynamicMessage}>{result.back.similarity}</span></p>
                    <p>Structural Similarity Index (SSI): <span style={styles.dynamicMessage}>{result.back.ssi}</span></p>
                </div>
            )}

            {/* Combined Results */}
            <div style={{ ...styles.resultSection, marginBottom: "15px" }}>
                <h4 style={{ ...styles.detailTitle, fontSize: "18px", color: "#1976d2" }}>
                    Combined Results
                </h4>
                <p>Combined Similarity Score: <span style={styles.dynamicMessage}>{result.combinedSimilarity}</span></p>
                <p>Combined Structural Similarity Index (SSI): <span style={styles.dynamicMessage}>{result.combinedSSI}</span></p>
            </div>
        </div>
    </div>
)}
  {result && (
                    <div style={styles.resultFooter}>
                    <button style={styles.newReturnButton}>
                        <Link to="/"> Back to Home </Link>
                    </button>
                    <button style={styles.newReturnButton} onClick={handleNewReturn}>
                        {/* onClick={handleStartClick}  */}
                        Start a New Return
                    </button>             
                    </div>
                )}
            </Card>
        </div>
    )
}

export default FileUpload;

const Uploader = ({refer, type, onComplete, setResult=()=>{} }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if(!selectedFile) return;

        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = ()=>{
            setPreview(reader.result);
        }
        reader.readAsDataURL(selectedFile);
    }

    const handleSubmit = async () => {
        if (!file) {
          alert("No file selected!");
          return;
        }
    
        const formData = new FormData();
        formData.append("file", file);
        formData.append("comparison_type", type);
    
        try {
          setIsUploading(true); // Start showing progress bar
          const response = await axios.post("http://127.0.0.1:5000/upload_user", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            // onUploadProgress: (progressEvent) => {
            //     const complete = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            //     setProgress(complete);
            // }
          });
    
          if (response.status === 200) {
            if (response.data.overall_condition) {
                setResult({
                    condition: response.data.overall_condition,
                    combinedSimilarity: response.data.overall_similarity,
                    combinedSSI: response.data.overall_ssi,
                    front: response.data.front,
                    back: response.data.back,
                });
            //   setMessage("Return analysis completed.");
            //   setStep(0); // Reset for new return
            console.log("Second FIle UPloaded");
            } else {
            //   setStep(2);
            //   setMessage("Front image has been saved. Now upload the back view image of the product.");
            console.log("First FIle UPloaded");
            }
            toast.success("Image Uploaded Successfully");
            onComplete();
          } else {
            toast.error("Error while uploading image. Please upload again");
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          setFile(null);
          setPreview(null);
          toast.error("Image Upload Failed");
        } finally {
            setIsUploading(false); // Stop progress bar once upload completes
        }
      };

    return (
        <UploaderContainer>
            <Reference>
                <Image src={refer} alt="Reference Image" />
                <p>Reference</p>
            </Reference>
            <UploaderChild>
                {preview ? (
                    <FlexVertical>
                        <Image src={preview} />
                        <button onClick={handleSubmit} style={styles.uploadButton}>Upload</button>
                        <SelectImage handleFileChange={handleFileChange} label="Re-select Image" />
                        {isUploading && (
                            <Overlay>
                                Uploading...
                            </Overlay>
                        )}
                    </FlexVertical>
                ) : (
                    <ImageContainer>
                        <SelectImage handleFileChange={handleFileChange} label="Select Image" />
                    </ImageContainer>
                )}
                
            </UploaderChild>
           
        </UploaderContainer>
    )
};

const SelectImage = ({handleFileChange, label}) => {
    return(
        <>
            <button
                onClick={() => document.getElementById("fileInput").click()}
                style={styles.uploadButton}
            >
            {label}
            </button>
            <input
                id="fileInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
        </>
    )
}