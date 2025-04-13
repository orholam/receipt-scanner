import React, { useCallback, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon, Upload } from 'lucide-react';

interface CameraProps {
  onCapture: (image: string) => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const capture = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }, []);

  const handleImageCapture = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageSrc = reader.result as string;
        setIsCapturing(true);
        onCapture(imageSrc);
        localStorage.setItem('capturedReceipt', imageSrc);
      };
      reader.readAsDataURL(file);
    }
  }, [onCapture]);

  const upload = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageSrc = reader.result as string;
          setIsCapturing(true);
          onCapture(imageSrc);
          localStorage.setItem('capturedReceipt', imageSrc);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  }, [onCapture]);

  if (isCapturing) {
    return null;
  }

  return (
    <div className="relative">
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageCapture}
      />
      <div className="camera-container shadow-xl bg-white p-10 rounded-2xl flex flex-col items-center justify-center gap-8 max-w-md mx-auto border border-gray-100">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-gray-800">Scan Your Receipt</h2>
          <p className="text-gray-500 text-lg">Take a photo or upload your receipt to get started</p>
        </div>
        <div className="flex flex-col w-full gap-4">
          <Button 
            onClick={capture}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 flex items-center justify-center gap-3 transition-all duration-200"
          >
            <CameraIcon className="h-6 w-6" />
            Open Camera
          </Button>
          <Button 
            onClick={upload}
            variant="outline"
            className="w-full text-lg py-6 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all duration-200"
          >
            <Upload className="h-6 w-6" />
            Upload Photo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Camera;