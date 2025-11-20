import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VerificationPopupProps {
  show: boolean;
  onClose: () => void;
}

const VerificationPopup = ({ show, onClose }: VerificationPopupProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (show) {
      setStep(1);
      const timer = setTimeout(() => setStep(2), 1000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-8 text-center">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6"
                      >
                        <Shield className="w-8 h-8 text-amber-600" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-amber-800 mb-2">Welcome!</h2>
                      <p className="text-amber-700">Setting up your account...</p>
                    </motion.div>
                  )}
                  
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6"
                      >
                        <CheckCircle className="w-8 h-8 text-amber-600" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-amber-800 mb-4">Verification Required</h2>
                      <p className="text-amber-700 mb-6">
                        Complete verification to start receiving bookings and access all features.
                      </p>
                      <div className="space-y-3">
                        <Button 
                          onClick={() => {
                            onClose();
                            navigate('/vendor/dashboard/verification');
                          }}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          Complete Verification
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={onClose}
                          className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          Later
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VerificationPopup;





