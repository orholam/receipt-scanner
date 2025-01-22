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
  const [isCapturing, setIsCapturing] = useState(false);
  const [isWebcamLoaded, setIsWebcamLoaded] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setIsCapturing(true);
      onCapture(imageSrc);
      localStorage.setItem('capturedReceipt', imageSrc);
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

  const handleWebcamLoad = useCallback(() => {
    setIsWebcamLoaded(true);
  }, []);

  if (isCapturing) {
    return null;
  }

  return (
    <div className="relative">
      {/* Navigation */}
      <nav className={`max-w-7xl mx-auto px-6 py-6 fixed top-0 left-0 right-0 transition-all duration-300 ${hasScrolled ? 'bg-white bg-opacity-30 backdrop-blur-lg' : 'bg-transparent'} rounded-lg z-50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">BILL CLUB</h1>
          </div>
        </div>
      </nav>

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