import React from 'react';

const About = () => {
  return (
    <div className="flex flex-col flex-grow bg-gradient-to-b from-[#d4e6ff] to-white p-4 md:p-8 mx-4 my-4 rounded-lg mb-10">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">About Bill Splitter</h1>
          <p className="text-gray-500">
            Welcome to Bill Splitter! We make it easy to divide expenses among friends and family.
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-gray-700">
            Our application is designed to simplify the process of splitting bills, whether you're dining out, traveling, or sharing household expenses. With our intuitive interface, you can quickly and accurately calculate each person's share.
          </p>
          <p className="text-gray-700">
            Thank you for choosing Bill Splitter. We hope it enhances your experience and makes managing shared expenses hassle-free!
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
