import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Shield,

} from "lucide-react";
import { toast } from "sonner";
import {
  getVerificationStatus,
  setVerificationStatus,
  type VerificationStatus,
} from "../../utils/verificationUtils";
import { apiService } from "../../services/api";

const Verification = () => {
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [address, setAddress] = useState("");
  const [verificationStatus, setVerificationStatusState] =
    useState<VerificationStatus | null>(null); 



  useEffect(() => {
    const checkVerificationStatus = async () => {
      console.log('🔍 VERIFICATION PAGE: Starting verification status check...');
      
      // Always start with pending status for new users
      console.log('🔄 VERIFICATION PAGE: Setting initial status to pending');
      setVerificationStatusState('pending');
      
      // Check vendor profile in localStorage
      const storedProfile = localStorage.getItem('vendor_profile');
      console.log('📋 VERIFICATION PAGE: Stored profile in localStorage:', storedProfile);
      
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);
          const isVerified = profile.is_verified;
          console.log('📊 VERIFICATION PAGE: Parsed profile is_verified:', isVerified, 'type:', typeof isVerified);
          
          if (isVerified === true || isVerified === 1) {
            console.log('✅ VERIFICATION PAGE: Profile shows verified, setting status to approved');
            setVerificationStatusState('approved');
            localStorage.setItem('verificationStatus', 'approved');
            return;
          } else {
            console.log('❌ VERIFICATION PAGE: Profile shows not verified, continuing with API check');
          }
        } catch (e) {
          console.error('💥 VERIFICATION PAGE: Error parsing vendor profile:', e);
        }
      } else {
        console.log('📋 VERIFICATION PAGE: No stored profile found in localStorage');
      }

      // Check API for verification status
      try {
        console.log('📡 VERIFICATION PAGE: Calling API to get profile...');
        const result = await apiService.getProfile();
        console.log('📥 VERIFICATION PAGE: API response:', result);
        
        if (result.data) {
          const isVerified = (result.data as any).is_verified;
          const status = isVerified === true || isVerified === 1 ? 'approved' : 'pending';
          
          console.log('📊 VERIFICATION PAGE: API is_verified:', isVerified, 'type:', typeof isVerified);
          console.log('📊 VERIFICATION PAGE: Calculated status:', status);
          
          setVerificationStatusState(status);
          setVerificationStatus(status);
          localStorage.setItem('verificationStatus', status);
          localStorage.setItem('vendor_profile', JSON.stringify(result.data));
          
          console.log('✅ VERIFICATION PAGE: Updated status to:', status);
        } else {
          console.log('❌ VERIFICATION PAGE: No profile data from API, keeping as pending');
          setVerificationStatusState('pending');
          localStorage.setItem('verificationStatus', 'pending');
        }
      } catch (error: any) {
        console.error('💥 VERIFICATION PAGE: Error fetching profile:', error);
        // On error, keep as pending
        setVerificationStatusState('pending');
        localStorage.setItem('verificationStatus', 'pending');
      }
      
      console.log('🏁 VERIFICATION PAGE: Verification status check completed');
    };

    checkVerificationStatus();
    
    // Listen for verification status changes
    const handleVerificationUpdate = () => {
      const newStatus = localStorage.getItem('verificationStatus');
      console.log('🔄 VERIFICATION PAGE: Status change event received, new status:', newStatus);
      
      if (newStatus === 'approved') {
        setVerificationStatusState('approved');
      } else {
        setVerificationStatusState('pending');
      }
    };
    
    window.addEventListener('verificationStatusChanged', handleVerificationUpdate);
    
    return () => {
      window.removeEventListener('verificationStatusChanged', handleVerificationUpdate);
    };
  }, []);

  const handleFileUpload = (file: File, type: "aadhaar" | "pan") => {
    if (type === "aadhaar") {
      setAadhaarFile(file);
    } else {
      setPanFile(file);
    }
    toast.success(
      `${
        type === "aadhaar" ? "Aadhaar" : "PAN"
      } document uploaded successfully!`
    );
  };

  const handleSubmit = async () => {
    if (!aadhaarFile || !panFile) {
      toast.error("Please upload both documents");
      return;
    }

    console.log('🔄 Starting verification submission process...');
    
    const formData = new FormData();
    formData.append("aadhaar_document", aadhaarFile);
    formData.append("pan_document", panFile);


    try {
      // Submit verification documents
      console.log('📄 Submitting verification documents...');
      const verificationResult = await apiService.submitVerification(formData);
      
      if (verificationResult.error) {
        console.error('❌ Verification submission failed:', verificationResult.error);
        toast.error('Document upload failed: ' + verificationResult.error);
        return;
      }
      
      console.log('✅ Documents submitted successfully:', verificationResult.data);
      
      // Auto-approve verification after successful document submission
      console.log('🔄 Auto-approving verification...');
      const profileUpdateResult = await apiService.updateProfile({ is_verified: true });
      
      if (profileUpdateResult.error) {
        console.error('❌ Profile update failed:', profileUpdateResult.error);
        toast.error('Failed to update verification status: ' + profileUpdateResult.error);
        return;
      }
      
      // Update frontend state
      const newStatus = "approved";
      setVerificationStatusState(newStatus);
      setVerificationStatus(newStatus);

      // Update localStorage
      const vendorProfile = JSON.parse(localStorage.getItem("vendor_profile") || "{}");
      vendorProfile.is_verified = true;
      localStorage.setItem("vendor_profile", JSON.stringify(vendorProfile));
      localStorage.setItem("verificationStatus", "approved");
      localStorage.removeItem("verificationPopupShown");

      const event = new CustomEvent("verificationStatusChanged");
      window.dispatchEvent(event);
      
      // Clear the form
      setAadhaarFile(null);
      setPanFile(null);
      
      toast.success("🎉 Verification completed successfully! You are now a verified vendor.");
      
    } catch (error: any) {
      console.error('❌ Verification submission failed with exception:', error);
      toast.error('Verification failed: ' + (error?.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Document Verification</h1>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={
              verificationStatus === "approved"
                ? "bg-success text-success-foreground border-success"
                : verificationStatus === "rejected"
                ? "bg-destructive text-destructive-foreground border-destructive"
                : "bg-amber-100 text-amber-800 border-amber-200"
            }
          >
            {verificationStatus === "approved" && (
              <CheckCircle className="w-4 h-4 mr-1" />
            )}
            {verificationStatus === "rejected" && (
              <AlertCircle className="w-4 h-4 mr-1" />
            )}
            {(!verificationStatus || verificationStatus === "pending") && (
              <AlertCircle className="w-4 h-4 mr-1" />
            )}
            {verificationStatus
              ? verificationStatus.charAt(0).toUpperCase() +
                verificationStatus.slice(1)
              : "Pending"}
          </Badge>
        </div>
      </div>

      {verificationStatus === "approved" ? (
        <Card className="shadow-md border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                🎉 You are Verified!
              </h2>
              <p className="text-green-700 mb-4">
                Your vendor account has been successfully verified. You can now
                receive bookings and access all features.
              </p>
              <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified Vendor
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : verificationStatus !== null ? (
        <>
          <Card className="shadow-md border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">
                    Verification Required
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Some features are locked until verification is complete.
                    Please upload your documents to gain full access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aadhaar Upload */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Aadhaar Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="aadhaar-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "aadhaar");
                    }}
                  />
                  <label htmlFor="aadhaar-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    {aadhaarFile ? (
                      <div>
                        <p className="font-medium text-foreground">
                          {aadhaarFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(aadhaarFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-foreground">
                          Click to upload Aadhaar
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          PDF, JPG, or PNG (Max 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* PAN Upload */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  PAN Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="pan-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "pan");
                    }}
                  />
                  <label htmlFor="pan-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    {panFile ? (
                      <div>
                        <p className="font-medium text-foreground">
                          {panFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(panFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-foreground">
                          Click to upload PAN
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          PDF, JPG, or PNG (Max 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>



          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Submit for Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium mb-2">Requirements Checklist:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      {aadhaarFile ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      Aadhaar Card uploaded
                    </li>
                    <li className="flex items-center gap-2">
                      {panFile ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      PAN Card uploaded
                    </li>

                  </ul>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-gradient-primary"
                  onClick={handleSubmit}
                  disabled={!aadhaarFile || !panFile}
                >
                  Complete Verification
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Submit your documents to complete verification instantly.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Verification;





