export type VerificationStatus = "pending" | "approved" | "rejected";

export const getVerificationStatus = (): VerificationStatus => {
  const stored = localStorage.getItem("verificationStatus");
  return (stored as VerificationStatus) || "pending";
};

export const setVerificationStatus = (status: VerificationStatus): void => {
  localStorage.setItem("verificationStatus", status);
};

export const getVerificationStatusDisplay = (status: VerificationStatus) => {
  switch (status) {
    case "approved":
      return {
        text: "✅ Verified Vendor",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: "CheckCircle",
        description: "Your account is fully verified and trusted"
      };
    case "rejected":
      return {
        text: "❌ Verification Rejected",
        className: "bg-red-100 text-red-800 border-red-200", 
        icon: "AlertTriangle",
        description: "Please resubmit your documents for verification"
      };
    default:
      return {
        text: "⚠ Pending Verification",
        className: "bg-amber-100 text-amber-800 border-amber-200",
        icon: "AlertTriangle", 
        description: "Upload documents to complete verification"
      };
  }
};

