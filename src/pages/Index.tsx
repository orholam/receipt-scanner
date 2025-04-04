import React, { useState, useEffect } from 'react';
import Camera from '@/components/Camera';
import ReceiptForm from '@/components/ReceiptForm';
import { Button } from "@/components/ui/button";
import { performOcr } from '@/lib/ocr';
import { toast } from "sonner";
import { RotateCcw, Edit, Save } from 'lucide-react';
import Header from '@/components/Header';
import Popup from '@/components/Popup';
import sampleReceipt from '../assets/sample_receipt.jpg';
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

// Type for ocrResult
type OCRResult = {
  businessName: string;
  items: {
    itemName: string;
    itemCost: number;
  }[];
  totalAfterTax: number;
};

const Index = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isOcrComplete, setIsOcrComplete] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  useEffect(() => {
    // const savedImage = localStorage.getItem('capturedReceipt');
    // if (savedImage) {
    //   setCapturedImage(savedImage);
    //   setIsScanning(false);
    // }
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

  const handleTrySample = async () => {
    setIsPopupOpen(false);
    setIsScanning(false);
    localStorage.setItem('capturedReceipt', sampleReceipt);

    // Fetch the image if sampleReceipt is a URL
    const response = await fetch(sampleReceipt);
    const blob = await response.blob();

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageSrc = reader.result as string;
      setCapturedImage(imageSrc);
      localStorage.setItem('capturedReceipt', imageSrc);

      try {
        const result = await performOcr(imageSrc);
        setOcrResult(result);
        setIsOcrComplete(true);
        toast.success("Sample receipt processed successfully!");
      } catch (error) {
        console.error('Error during OCR:', error);
        toast.error('An error occurred while processing the sample receipt. Please try again.');
      }
    };
    reader.readAsDataURL(blob);
  }

  const handleReset = () => {
    setCapturedImage(null);
    setIsScanning(true);
    setIsOcrComplete(false);
    localStorage.removeItem('capturedReceipt');
  };

  const handleSubmit = (data: OCRResult) => {
    console.log('Form submitted:', data);
    toast.success("Receipt information saved!");
    handleReset();
  };

  return (
    <div className="flex-grow bg-gradient-to-b from-[#d4e6ff] to-white p-4 md:p-8 mx-4 my-4 rounded-lg mb-10 ">
      <div className="max-w-md mx-auto space-y-6 mb-10">
        <Header />

        {isScanning ? (
          <Camera onCapture={handleCapture} />
        ) : (
          <div className="space-y-6">
            {capturedImage && (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer relative">
                    <img 
                      src={capturedImage} 
                      alt="Captured receipt" 
                      className="w-full h-auto rounded-lg shadow-md hover:opacity-90 transition-opacity"
                    />
                    {!isOcrComplete && (
                      <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center animate-pulse">
                        {[...Array(12)].map((_, i) => (
                          <div 
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"
                            style={{
                              top: `${Math.random() * 100}%`,
                              left: `${Math.random() * 100}%`,
                              animationDelay: `${i * 0.15}s`,
                              animationDuration: `${0.8 + Math.random() * 1.2}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
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
            {!isOcrComplete ? (
              <div className="mt-4 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="text-gray-700 mt-2">Receipt information is being processed...</p>
              </div>
            ) : (
              <ReceiptForm content={ocrResult} onSubmit={handleSubmit} />
            )}
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
        {isPopupOpen && <Popup onClose={() => setIsPopupOpen(false) } onTrySample={handleTrySample} />}
      </div>
    </div>
  );
};

export default Index;