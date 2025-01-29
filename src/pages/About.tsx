import React from 'react';
import Header from '@/components/Header';

const About = () => {
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
