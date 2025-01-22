import { Zap } from "lucide-react";

export default function Header() {
    return (
        <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold">BILL CLUB</h1>
            </div>
        </div>
    )
}