import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSupabase } from '@/SupabaseContext';

const Shareable = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [transactionName, setTransactionName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();
  const { id } = useParams();

  useEffect(() => {
    // Fetch transaction
    const fetchTransaction = async () => {
      const { data, error } = await supabase.from('transaction').select('*').eq('id', id).single();
      if (error) {
        console.error('Error fetching transaction:', error);
        setError('Error fetching transaction');
      } else {
        setTransactionName(data.restaurant);
      }
    };

    // Fetch items
    const fetchItems = async () => {
      const { data, error } = await supabase.from('item').select('*').eq('transaction_id', id);
      if (error) {
        console.error('Error fetching transaction:', error);
        setError('Error fetching transaction');
      } else {
        setItems(data);
      }
    };

    fetchItems();
    fetchTransaction();
  }, [id, supabase]);

  const toggleItemSelection = (itemName: string) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(itemName)
        ? prevSelectedItems.filter((i) => i !== itemName)
        : [...prevSelectedItems, itemName]
    );
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex flex-col flex-grow items-center justify-center bg-gradient-to-b from-indigo-100 to-white pmd:p-8 mx-4 my-4 rounded-lg mb-10">
      <div className="absolute inset-x-0 -top-60 transform-gpu overflow-hidden blur-3xl sm:-top-96">
        <div className="relative left-[calc(50%-20rem)] aspect-[1155/678] w-[48rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#87dfff] to-[#9dc6fa] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[96rem]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 transform-gpu overflow-hidden blur-3xl sm:bottom-60">
        <div className="relative right-[calc(50%-20rem)] aspect-[1155/678] w-[48rem] translate-x-1/2 rotate-[-30deg] bg-gradient-to-tr from-[#b3bbff] to-[#b3faff] opacity-30 sm:right-[calc(50%-40rem)] sm:w-[96rem]" />
      </div>
      <div className="bg-white bg-opacity-30 backdrop-blur-md rounded-lg p-8 max-w-lg w-full transition-all duration-300">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">{transactionName}</h1>
        <div className={`space-y-4 w-full transition-all duration-300 ${selectedItems.length > 0 ? 'mb-6' : ''}`}>
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItemSelection(item.item_name)}
              className={`cursor-pointer w-full px-4 py-2 rounded-full border text-center ${
                selectedItems.includes(item.item_name)
                  ? 'bg-blue-400 text-white'
                  : 'bg-white text-gray-800 border border-grey-300'
              } transition-colors duration-200`}
            >
              {item.item_name} - ${item.cost}
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
