import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import undrawReceipt from '../assets/undraw_modern-design_yur1.svg';
import { X } from "lucide-react";

const Popup = ( { onClose, onTrySample }: { onClose: () => void, onTrySample: () => void } ) => {
    useEffect(() => {
        // Google Tag Manager script for <head>
        const headScript = document.createElement('script');
        headScript.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-ML2ZRPGF');
        `;
        document.head.appendChild(headScript);

        // Google Tag Manager (noscript) for <body>
        const noscript = document.createElement('noscript');
        noscript.innerHTML = `
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-ML2ZRPGF"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
        `;
        document.body.insertBefore(noscript, document.body.firstChild);

        return () => {
            document.head.removeChild(headScript);
            document.body.removeChild(noscript);
        };
    }, []);

    return (
        <div className="flex gap-1 items-center justify-between bg-gray-100 rounded-xl p-4 z-50 pr-1">
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
                <Button className="py-2 text-black bg-gray-100 rounded-lg hover:bg-gray-300 transition duration-300" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

export default Popup;