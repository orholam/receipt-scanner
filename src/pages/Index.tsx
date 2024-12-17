import React, { useState, useEffect } from 'react';
import Camera from '@/components/Camera';
import ReceiptForm from '@/components/ReceiptForm';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RotateCcw, Edit, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

const Index = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const savedImage = localStorage.getItem('capturedReceipt');
    if (savedImage) {
      setCapturedImage(savedImage);
      setIsScanning(false);
    }
  }, []);

  const handleCapture = (image: string) => {
    setCapturedImage(image);
    setIsScanning(false);
    toast.success("Receipt captured successfully!");
  };

  const handleReset = () => {
    setCapturedImage(null);
    setIsScanning(true);
    localStorage.removeItem('capturedReceipt');
  };

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    toast.success("Receipt information saved!");
    handleReset();
  };

  return (
    <div className="flex-grow bg-gradient-to-b from-indigo-100 to-white p-4 md:p-8 mx-4 my-2 rounded-lg">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Receipt Scanner</h1>
          <p className="text-gray-500">
            {isScanning ? "Scanning..." : "The information has been extracted."}
          </p>
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
            <ReceiptForm onSubmit={handleSubmit} />
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