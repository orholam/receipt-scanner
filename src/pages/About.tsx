import React, { useEffect } from 'react';
import Header from '@/components/Header';

const About = () => {
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
    <div className="flex flex-col flex-grow bg-gradient-to-b from-[#d4e6ff] to-white p-4 md:p-8 mx-4 my-4 rounded-lg mb-10">
      <Header />
      <div className="max-w-md mx-auto space-y-6 p-4">
        <div className="mb-8">
          <p className="text-gray-500">
            Welcome to Bill Club! We make it easy to divide expenses among friends and family.
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-gray-700">
            Our application is designed to simplify the process of splitting bills, whether you're dining out, traveling, or sharing household expenses. With our intuitive interface, you can quickly and accurately calculate each person's share.
          </p>
          <p className="text-gray-700">
            Thank you for choosing Bill Club. We hope it enhances your experience and makes managing shared expenses hassle-free! If you have any questions or feedback, please don't hesitate to contact the developer at <a href="https://x.com/jonwentel" className="text-blue-500">x.com/jonwentel</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
