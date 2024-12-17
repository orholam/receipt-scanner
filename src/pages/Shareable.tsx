import React, { useState } from 'react';

const exampleReceiptItems = [
  'Burger - $10',
  'Fries - $5',
  'Soda - $2',
  'Salad - $7',
  'Ice Cream - $4',
];

const Shareable = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItemSelection = (item: string) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(item)
        ? prevSelectedItems.filter((i) => i !== item)
        : [...prevSelectedItems, item]
    );
  };

  return (
    <div className="flex flex-col flex-grow items-center justify-center bg-gradient-to-b from-indigo-100 to-white p-4 mx-4 my-2 rounded-lg">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Select Items to Share</h1>
        <div className="space-y-4 w-full">
          {exampleReceiptItems.map((item) => (
            <div
              key={item}
              onClick={() => toggleItemSelection(item)}
              className={`cursor-pointer w-full px-4 py-2 rounded-full border text-center ${
                selectedItems.includes(item)
                  ? 'bg-blue-400 text-white'
                  : 'bg-gray-200 text-gray-800'
              } transition-colors duration-200`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shareable;
