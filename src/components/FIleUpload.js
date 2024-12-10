import axios from "axios";
import React, { useState } from "react";
import { Stepper } from "react-form-stepper";
import styled from "styled-components";
import { styles } from "../styles";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaRegImage } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";
import { GrFormNext } from "react-icons/gr";
import { TiHomeOutline } from "react-icons/ti";
import { IoMdReturnLeft } from "react-icons/io";
import { TextField, Button, Box } from "@mui/material";
import DeviceSelector from "./DeviceSelector";
import Header from "./Header";

const STEPS = [
  { label: "Select a device" },
  { label: "Upload Front" },
  { label: "Upload Back" },
  { label: "Review Input Data" },
  { label: "Image Data" },
  { label: "Review" },
];

const Card = styled.div`
  width: 100%;
  min-height: 50vh;
  margin: auto;
  padding-bottom: 24px;
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const UploaderContainer = styled.div`
  width: 70%;
  height: 100%;
  display: flex;
  justify-content: center;
`;
const SelectContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: black;
  width: 300px;
`;

const Reference = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
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
  top: 0;
  left: 0;
`;

const FileUpload = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState(null);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [images, setImages] = useState({
    front: "",
    back: "",
  });
  const [formData, setFormData] = useState({
    input1: "",
    input2: "",
    input3: "",
    input4: "",
  });
  const [errors, setErrors] = useState({});
  const deviceOptions = [
    { value: "Iphone", label: "Iphone", category: "electronics" },
    { value: "Watch", label: "Watch", category: "electronics" },
    { value: "Camera", label: "Camera", category: "electronics" },
    { value: "Laptop", label: "Laptop", category: "electronics" },
    { value: "Table", label: "Table", category: "furniture" },
    { value: "Chair", label: "Chair", category: "furniture" },
    { value: "Refrigerator", label: "Refrigerator", category: "appliances" },
    { value: "Microwave", label: "Microwave", category: "appliances" },
    { value: "Oven", label: "Oven", category: "kitchen" },
    { value: "Dishwasher", label: "Dishwasher", category: "kitchen" },
  ];

  const categoryOptions = [
    { value: "electronics", label: "Electronics" },
    { value: "furniture", label: "Furniture" },
    { value: "appliances", label: "Appliances" },
    { value: "kitchen", label: "Kitchen" },
  ];

  const handleNewReturn = () => {
    setActiveStep(0);
    setResult(null);
  };

  const onSelectionChange = () => {
    setActiveStep(activeStep + 1);
  };

  const clickHandler = () => {
    window.location.href = "/";
  };
  const onCategoryChange = (categoryValue) => {
    setSelectedCategory(categoryValue);

    const updatedDevices = deviceOptions.filter(
      (device) => device.category === categoryValue
    );
    setFilteredDevices(updatedDevices);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.input1.trim()) {
      newErrors.input1 = "Input 1 is required.";
    }
    if (!formData.input2.trim()) {
      newErrors.input2 = "Input 2 is required.";
    }
    if (!formData.input3.trim()) {
      newErrors.input3 = "Input 3 is required.";
    }
    if (!formData.input4.trim()) {
      newErrors.input4 = "Input 4 is required.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSubmit = () => {
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      console.log("data", formData);
      setFormData({ input1: "", input2: "", input3: "", input4: "" });
      setErrors({});
      setActiveStep(activeStep + 1);
    }
  };

  return (
    <div
      style={{
        background: "#E3F2FD",
        height: "calc(100%)",
        minHeight: "100vh",
        backgroundImage: "url('/backgroundimg.jpeg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      <div style={styles.overlay}></div>
      {/* <h1 style={styles.title} onClick={clickHandler}>
        Auditly
      </h1> */}
      <Header />
      <Stepper
        steps={STEPS}
        activeStep={activeStep}
        styleConfig={{
          activeBgColor: "#f74b4b",
          completedBgColor: "#f74b4b",
          inactiveBgColor: "#cccccc",
          size: "40px",
          circleFontSize: "18px",
        }}
        style={{ flexWrap: "wrap", padding: "100px 24px" }}
      />
      {!result && (
        <Card>
          {/* <CardHeader>{STEPS[activeStep].label}</CardHeader> */}
          {activeStep === 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                justifyContent: "center",
              }}
            >
              <DeviceSelector
                labelName="Select Category"
                options={categoryOptions}
                onSelectionChange={(value) => onCategoryChange(value)}
              />
              <DeviceSelector
                labelName="Select Item to return"
                options={filteredDevices}
                onSelectionChange={onSelectionChange}
                disabled={selectedCategory === "" ? true : false}
              />
            </div>
          )}
          {activeStep === 1 ? (
            <Uploader
              refer={"/images/front_reference.jpg"}
              type="front"
              onComplete={() => setActiveStep(activeStep + 1)}
              setImages={(value) => {
                setImages({ ...images, front: value.front });
              }}
            />
          ) : null}
          {activeStep === 2 ? (
            <Uploader
              refer={"/images/back_reference.jpg"}
              type="back"
              onComplete={() => setActiveStep(activeStep + 1)}
              setResult={setResult}
              setImages={(value) => {
                setImages({ ...images, back: value.back });
              }}
            />
          ) : null}
        </Card>
      )}
      {result && (
        <Card>
          {result && activeStep === 3 ? (
            <OnDataInput
              inputLabels={[
                "Original Sales Order Number",
                "Customer Name/Number",
                "Label 3",
                "Label 4",
              ]}
              formData={formData}
              errors={errors}
              handleChange={handleChange}
              handleFocus={handleFocus}
              handleSubmit={handleSubmit}
            />
          ) : null}
          {result && activeStep === 4 ? (
            <ImagesData
              image={images}
              onClickNext={() => setActiveStep(activeStep + 1)}
            />
          ) : null}
          {result && activeStep === 5 && (
            <div
              style={{
                ...styles.resultBox,
                padding: "20px",
                marginTop: "20px",
                maxWidth: "60%",
                width: "100%",
              }}
            >
              {/* Overall Condition Display */}
              <div
                style={{
                  ...styles.overallConditionBox,
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <h3
                  style={{
                    ...styles.overallConditionTitle,
                    fontSize: "26px",
                    letterSpacing: "1px",
                  }}
                >
                  Overall Condition
                </h3>
                <p
                  style={{
                    ...styles.overallCondition,
                    fontSize: "22px",
                    color: "#ffffff",
                  }}
                >
                  {result.condition}
                </p>
              </div>

              {/* Detailed Results */}
              <div
                style={{
                  ...styles.resultDetails,
                  marginTop: "20px",
                  padding: "15px",
                }}
              >
                {/* Front Image Results */}
                {result.front && (
                  <div
                    style={{ ...styles.resultSection, marginBottom: "15px" }}
                  >
                    <h4
                      style={{
                        ...styles.detailTitle,
                        fontSize: "18px",
                        color: "#4caf50",
                      }}
                    >
                      Front Image Analysis
                    </h4>
                    <p>
                      Similarity Score:{" "}
                      <span style={styles.dynamicMessage}>
                        {result.front.similarity}
                      </span>
                    </p>
                    <p>
                      Structural Similarity Index (SSI):{" "}
                      <span style={styles.dynamicMessage}>
                        {result.front.ssi}
                      </span>
                    </p>
                  </div>
                )}

                {/* Back Image Results */}
                {result.back && (
                  <div
                    style={{ ...styles.resultSection, marginBottom: "15px" }}
                  >
                    <h4
                      style={{
                        ...styles.detailTitle,
                        fontSize: "18px",
                        color: "#4caf50",
                      }}
                    >
                      Back Image Analysis
                    </h4>
                    <p>
                      Similarity Score:{" "}
                      <span style={styles.dynamicMessage}>
                        {result.back.similarity}
                      </span>
                    </p>
                    <p>
                      Structural Similarity Index (SSI):{" "}
                      <span style={styles.dynamicMessage}>
                        {result.back.ssi}
                      </span>
                    </p>
                  </div>
                )}

                {/* Combined Results */}
                <div style={{ ...styles.resultSection, marginBottom: "15px" }}>
                  <h4
                    style={{
                      ...styles.detailTitle,
                      fontSize: "18px",
                      color: "#1976d2",
                    }}
                  >
                    Combined Results
                  </h4>
                  <p>
                    Combined Similarity Score:{" "}
                    <span style={styles.dynamicMessage}>
                      {result.combinedSimilarity}
                    </span>
                  </p>
                  <p>
                    Combined Structural Similarity Index (SSI):{" "}
                    <span style={styles.dynamicMessage}>
                      {result.combinedSSI}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
          {result && activeStep === 5 && (
            <div style={styles.resultFooter}>
              <button style={styles.newReturnButton}>
                <Link to="/"> Back to Home </Link>
                <TiHomeOutline color="white" />
              </button>
              <button style={styles.newReturnButton} onClick={handleNewReturn}>
                {/* onClick={handleStartClick}  */}
                Start a New Return
                <IoMdReturnLeft color="white" size={20} />
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default FileUpload;

const Uploader = ({
  refer,
  type,
  onComplete,
  setResult = () => {},
  setImages = (value) => {},
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

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
      const response = await axios.post(
        "http://127.0.0.1:5000/upload_user",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          // onUploadProgress: (progressEvent) => {
          //     const complete = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          //     setProgress(complete);
          // }
        }
      );

      if (response.status === 200) {
        if (response.data.overall_condition) {
          setResult({
            condition: response.data.overall_condition,
            combinedSimilarity: response.data.overall_similarity,
            combinedSSI: response.data.overall_ssi,
            front: response.data.front,
            back: response.data.back,
          });
          setImages({
            back: response.data.highlighted_image,
          });
          //   setMessage("Return analysis completed.");
          //   setStep(0); // Reset for new return
          console.log("Second FIle UPloaded");
        } else {
          //   setStep(2);
          //   setMessage("Front image has been saved. Now upload the back view image of the product.");
          console.log("First FIle UPloaded");
          setImages({
            front: response.data.highlighted_image,
          });
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
        <p style={{ color: "#fff" }}>Reference</p>
      </Reference>
      <UploaderChild>
        {preview ? (
          <FlexVertical>
            <Image src={preview} />
            <button onClick={handleSubmit} style={styles.uploadButton}>
              Upload
              <FiUpload color="white" />
            </button>
            <SelectImage
              handleFileChange={handleFileChange}
              label="Re-select Image"
            />
            {isUploading && <Overlay>Uploading...</Overlay>}
          </FlexVertical>
        ) : (
          <ImageContainer>
            <SelectImage
              handleFileChange={handleFileChange}
              label="Select Image"
            />
          </ImageContainer>
        )}
      </UploaderChild>
    </UploaderContainer>
  );
};

const SelectImage = ({ handleFileChange, label }) => {
  return (
    <>
      <button
        onClick={() => document.getElementById("fileInput").click()}
        style={styles.uploadButton}
      >
        {label}
        <FaRegImage color="white" />
      </button>
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
};

const OnDataInput = ({
  inputLabels,
  formData,
  errors,
  handleChange,
  handleFocus,
  handleSubmit,
}) => {
  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "600px",
        margin: "auto",
        width: "100%",
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "16px",
      }}
    >
      {inputLabels.map((label, index) => {
        const inputName = `input${index + 1}`;
        return (
          <div
            key={inputName}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <TextField
              label={label}
              name={inputName}
              value={formData[inputName]}
              onChange={handleChange}
              onFocus={handleFocus}
              error={!!errors[inputName]}
              helperText={errors[inputName] || ""}
              id="outlined-required"
              variant="outlined"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                "& .MuiInputLabel-root": {
                  top: "0px",
                  fontSize: "16px",
                  color: "#000", // Default label color
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#1976D2", // Label color when focused
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#000", // Default border color
                  },
                  "&:hover fieldset": {
                    borderColor: "#000", // Border color on hover
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976D2", // Border color when focused
                  },
                  "&.Mui-error fieldset": {
                    borderColor: "#f44336", // Border color when there's an error
                  },
                },
                width: "100%",
                borderRadius: "10px",
                marginBottom: "16px",
                "@media (max-width: 600px)": {
                  width: "100%",
                },
              }}
            />
          </div>
        );
      })}

      <button style={styles.uploadButton} onClick={handleSubmit}>
        Next
        <GrFormNext color="white" size={24} />
      </button>
    </Box>
  );
};
const ImagesData = ({ image, onClickNext }) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {image.front && (
          <Reference>
            <p style={{ color: "#fff" }}>Front Image</p>
            <Image src={image.front} alt="highlightened Image" />
          </Reference>
        )}
        {image.back && (
          <Reference>
            <p style={{ color: "#fff" }}>Back Image</p>
            <Image src={image.back} alt="highlightened Image" />
          </Reference>
        )}
      </div>
      <button style={styles.uploadButton} onClick={onClickNext}>
        Next
        <GrFormNext color="white" size={24} />
      </button>
    </div>
  );
};
