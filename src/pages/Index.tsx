import React, { useState, useEffect } from 'react';
import Camera from '@/components/Camera';
import ReceiptForm from '@/components/ReceiptForm';
import { Button } from "@/components/ui/button";
import { performOcr } from '@/lib/ocr';
import { toast } from "sonner";
import { RotateCcw, Edit, Save } from 'lucide-react';
import logo from '../assets/logo2.png';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

const scrollToBottom = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth',
  });
};

const Index = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isOcrComplete, setIsOcrComplete] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  useEffect(() => {
    const savedImage = localStorage.getItem('capturedReceipt');
    if (savedImage) {
      setCapturedImage(savedImage);
      setIsScanning(false);
    }
  }, []);

  const handleCapture = async (image: string) => {
    setCapturedImage(image);
    setIsScanning(false);
    try {
        const result = await performOcr(image);
        if (result.error) {
            throw new Error(result.error);
        }
        setOcrResult(result);
        setIsOcrComplete(true);
        console.log("OCR complete");
        toast.success("Receipt captured successfully!");
    } catch (error) {
        console.error('Error during OCR:', error);
        toast.error('An error occurred while capturing the receipt. Please try again.');
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setIsScanning(true);
    setIsOcrComplete(false);
    localStorage.removeItem('capturedReceipt');
  };

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    toast.success("Receipt information saved!");
    handleReset();
  };

  return (
    <div className="flex-grow bg-gradient-to-b from-[#d4e6ff] to-white p-4 md:p-8 mx-4 my-4 rounded-lg mb-10 ">
      <div className="max-w-md mx-auto space-y-6 mb-10">
        <div className="text-center mb-8">
          <img src={logo} alt="Bill Club" className="w-40 mt-4 mb-4 mx-auto" />
        </div>

        {isScanning ? (
          <Camera onCapture={handleCapture} />
        ) : (
          <div className="space-y-6">
            {capturedImage && (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer">
                    <img 
                      src={capturedImage} 
                      alt="Captured receipt" 
                      className="w-full h-auto rounded-lg shadow-md hover:opacity-90 transition-opacity"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <img 
                    src={capturedImage} 
                    alt="Captured receipt" 
                    className="w-full h-auto"
                  />
                </DialogContent>
              </Dialog>
            )}
            {!isOcrComplete ? <p> Receipt information is being processed... </p> : <ReceiptForm content={ocrResult} onSubmit={handleSubmit} />}
          </div>
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