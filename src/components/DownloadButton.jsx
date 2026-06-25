import React from "react";
import { 
  generateUserPDF, 
  generateUserListPDF, 
  generatePaymentPDF, 
  generateClaimPDF,
  generatePolicyPDF,
  generateCustomerPDF
} from "../utils/pdfGenerator";

const DownloadButton = ({ 
  type, 
  data, 
  extraData = {}, 
  label = "📥", 
  title = "Download PDF Document",
  className = "action-btn",
  style = {} 
}) => {
  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (type === "user") {
        generateUserPDF(data);
      } else if (type === "userList") {
        generateUserListPDF(data, extraData); // extraData contains filters
      } else if (type === "payment") {
        const { formattedDate, formattedTime } = extraData;
        generatePaymentPDF(data, formattedDate, formattedTime);
      } else if (type === "claim") {
        const { claimNum } = extraData;
        generateClaimPDF(data, claimNum);
      } else if (type === "policy") {
        const { customerName } = extraData;
        generatePolicyPDF(data, customerName);
      } else if (type === "customer") {
        generateCustomerPDF(data);
      } else {
        console.warn("Unknown PDF type:", type);
      }
    } catch (err) {
      console.error("PDF Generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <button
      onClick={handleDownload}
      title={title}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        cursor: "pointer",
        ...style
      }}
    >
      {label}
    </button>
  );
};

export default DownloadButton;
