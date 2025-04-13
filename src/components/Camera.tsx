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
      <div className="camera-container shadow-lg bg-white p-8 rounded-lg flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Scan Your Receipt</h2>
          <p className="text-gray-600">Take a photo of your receipt using your camera</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={capture}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 flex items-center gap-2"
          >
            <CameraIcon className="h-5 w-5" />
            Open Camera
          </Button>
          <Button 
            onClick={upload}
            variant="outline"
            className="px-6 py-2 flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            Upload Photo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Camera;