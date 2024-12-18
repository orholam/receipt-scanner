import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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

  const { id } = useParams();

  return (
    <div className="flex flex-col flex-grow items-center justify-center bg-gradient-to-b from-indigo-100 to-white pmd:p-8 mx-4 my-4 rounded-lg mb-10">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full transition-all duration-300">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">{id}</h1>
        <div className={`space-y-4 w-full transition-all duration-300 ${selectedItems.length > 0 ? 'mb-6' : ''}`}>
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
        {selectedItems.length > 0 && (
          <button
            className="w-full bg-blue-400 text-white py-2 rounded-lg hover:bg-blue-500 transition-opacity duration-300 opacity-0 animate-fade-float-in"
          >
            Claim
          </button>
        )}
      </div>
    </div>
  );
};

export default Shareable;
