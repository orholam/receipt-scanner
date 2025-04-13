import React, { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon, Upload, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CameraProps {
  onCapture: (image: string) => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
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
      <div className="camera-container shadow-lg bg-white p-4">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "environment"
          }}
          className="w-full h-full object-cover"
        />
        <div className="scanner-overlay">
          <div className="scanning-line" />
        </div>
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center">
          <Button 
            onClick={capture}
            className="bg-blue-400 hover:bg-blue-500 rounded-full"
            size="icon"
          >
            <CameraIcon className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute bottom-6 right-6 flex justify-center">
          <Button 
            onClick={upload}
            className="bg-blue-400 hover:bg-blue-500 rounded-full"
            size="icon"
          >
            <Upload className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Camera;