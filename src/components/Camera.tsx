import React, { useCallback, useRef } from 'react';
import Webcam from 'react-webcam';
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon } from 'lucide-react';

interface CameraProps {
  onCapture: (image: string) => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
      localStorage.setItem('capturedReceipt', imageSrc);
    }
  }, [onCapture]);

  return (
    <div className="camera-container shadow-lg bg-white p-4">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: 'environment',
        }}
        className="w-full h-full object-cover"
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
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 rounded-full"
        size="icon"
      >
        <CameraIcon className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Camera;