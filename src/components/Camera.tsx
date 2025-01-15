import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon, ChartNoAxesColumnDecreasing } from 'lucide-react';
import { Upload } from 'lucide-react';

interface CameraProps {
  onCapture: (image: string) => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isWebcamLoaded, setIsWebcamLoaded] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setIsCapturing(true);
      onCapture(imageSrc);
      localStorage.setItem('capturedReceipt', imageSrc);
    }
  }, [onCapture]);

  const upload = useCallback(() => {
    console.log('upload');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files[0];
      console.log(file);

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
  }, []);

  const handleWebcamLoad = useCallback(() => {
    setIsWebcamLoaded(true);
  }, []);

  if (isCapturing) {
    return null;
  }

  return (
    <div className="camera-container shadow-lg bg-white p-4">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: 'environment',
        }}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isWebcamLoaded ? 'opacity-100 blur-none' : 'opacity-0 blur-lg'}`}
        onUserMedia={handleWebcamLoad}
      />
      <div className="scanner-overlay">
        <div className="scanning-line" />
      </div>
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />
      
      <Button 
        onClick={capture}
        className="bg-blue-400 hover:bg-blue-500 absolute bottom-6 left-1/2 transform -translate-x-1/2 rounded-full"
        size="icon"
      >
        <CameraIcon className="h-6 w-6" />
      </Button>
      <Button 
        onClick={upload}
        className="bg-transparent hover:bg-transparent absolute bottom-6 right-1 transform -translate-x-1/2 rounded-full"
        size="icon"
      >
        <Upload className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Camera;