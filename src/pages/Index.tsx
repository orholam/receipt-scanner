import React, { useState, useEffect } from 'react';
import Camera from '@/components/Camera';
import ReceiptForm from '@/components/ReceiptForm';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RotateCcw, Edit, Save } from 'lucide-react';

const Index = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Check for saved image in localStorage on component mount
    const savedImage = localStorage.getItem('capturedReceipt');
    if (savedImage) {
      setCapturedImage(savedImage);
      setIsScanning(false);
    }
  }, []);

  const handleCapture = (image: string) => {
    setCapturedImage(image);
    setShowPreview(true);
    toast.success("Receipt captured successfully!");
    
    // Switch to form after 1 second
    setTimeout(() => {
      setShowPreview(false);
      setIsScanning(false);
    }, 1000);
  };

  const handleReset = () => {
    setCapturedImage(null);
    setIsScanning(true);
    setShowPreview(false);
    localStorage.removeItem('capturedReceipt');
  };

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    toast.success("Receipt information saved!");
    handleReset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Receipt Scanner</h1>
          <p className="text-gray-500">
            {isScanning ? "Scanning..." : "The information has been extracted."}
          </p>
        </div>

        {isScanning ? (
          <Camera onCapture={handleCapture} />
        ) : showPreview ? (
          <div className="camera-container shadow-lg bg-white p-4">
            <img 
              src={capturedImage || ''} 
              alt="Captured receipt" 
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        ) : (
          <ReceiptForm onSubmit={handleSubmit} />
        )}

        <div className="flex justify-center gap-4 mt-6">
          {!isScanning && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                className="rounded-full"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <Save className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;