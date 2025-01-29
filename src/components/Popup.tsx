import { Button } from "@/components/ui/button";
import undrawReceipt from '../assets/undraw_modern-design_yur1.svg';
import { X } from "lucide-react";

const Popup = ( { onClose, onTrySample }: { onClose: () => void, onTrySample: () => void } ) => {
    return (
        <div className="flex gap-2 items-center justify-between bg-gray-100 rounded-xl p-4 z-50">
            <div className="flex items-center">
                <img src={undrawReceipt} alt="Sample Receipt" className="w-12 h-12 mr-4" />
                <div>
                    <h1 className="text-lg font-semibold">First time?</h1>
                    <p className="text-sm">Try it out with a sample receipt</p>
                </div>
            </div>
            <div className="flex">
                <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300" onClick={onTrySample}>
                    Try it out
                </Button>
                <Button className="px-4 py-2 text-black bg-gray-100 rounded-lg hover:bg-gray-300 transition duration-300" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

export default Popup;