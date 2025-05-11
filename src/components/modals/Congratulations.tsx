import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";
import confetti from 'canvas-confetti';

interface CongratulationsProps {
  name: string;
  value: string;
  onClose: () => void;
  onTrySample: () => void;
}

const Congratulations = ({ name, value, onClose, onTrySample }: CongratulationsProps) => {
  React.useEffect(() => {
    // Trigger confetti animation when component mounts
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="absolute inset-0 bg-black/50 animate-fadeIn"></div>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative animate-modalEnter">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-blue-600">🎉 Great job, {name}!</h1>
            <p className="text-xl font-semibold text-gray-800">
              You owe ${value}
            </p>
          </div>

          <p className="text-gray-600">
            You can still make changes by closing this window and adjusting your items.
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">
                Love this app? Try it yourself with your own receipt!
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={onTrySample}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Try with a Sample Receipt
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit my claimed items
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Congratulations;