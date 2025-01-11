import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, MinusCircle, PlusCircle } from 'lucide-react';
import { useSupabase } from '@/SupabaseContext';

interface ReceiptFormProps {
  onSubmit: (data: any) => void;
  content: any;
}

// Type for Transaction
type Transaction = {
  businessName: string;
  items: {
    itemName: string;
    itemCost: number;
  }[];
  tip?: number;
  totalBeforeTax: number;
  totalAfterTax: number;
};

const generateId = async (): Promise<string> => {
  try {
    // Fetch a random adjective
    const adjectiveResponse = await fetch('https://random-word-form.herokuapp.com/random/adjective');
    const adjectiveArray = await adjectiveResponse.json();
    const adjective = adjectiveArray[0].replace(/\s+/g, '-');

    // Fetch a random noun
    const nounResponse = await fetch('https://random-word-form.herokuapp.com/random/noun');
    const nounArray = await nounResponse.json();
    const noun = nounArray[0].replace(/\s+/g, '-');

    // Combine adjective and noun with a hyphen
    return `${adjective}-${noun}`;
  } catch (error) {
    console.error('Error generating ID:', error);
    return 'default-id';
  }
};

const ReceiptForm: React.FC<ReceiptFormProps> = ({ onSubmit, content }) => {
  const [id, setId] = useState<string>('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [shareablePageCreated, setShareablePageCreated] = useState<boolean>(false);
  const [localContent, setLocalContent] = useState(content);
  const supabase = useSupabase();

  const handleRemoveItem = (index: number) => {
    const updatedItems = localContent.items.filter((_, i) => i !== index);
    setLocalContent({ ...localContent, items: updatedItems });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    setLocalContent(prevContent => ({
      ...prevContent,
      items: prevContent.items.map((item, i) =>
        i === index ? { ...item, [field]: field === 'itemCost' ? parseFloat(value) || 0 : value } : item
      )
    }));
  };

  const handleAddItem = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    const newItem = { itemName: '', itemCost: 0 };
    setLocalContent({ ...localContent, items: [...localContent.items, newItem] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    console.log("DATA");
    console.log(data);

    if (!shareablePageCreated) {
      const generatedId = await generateId();
      setId(generatedId);

      // Create new transaction row in supabase
      const { data: transactionData, error } = await supabase.from('transaction').insert({
        id: generatedId,
        date: new Date().toISOString(),
        restaurant: data.vendor,
        tip: data.tip,
        tax: Number(data.totalAfterTax) - Number(data.totalBeforeTax),
        total: Number(data.totalAfterTax),
        status: 'incomplete',
        owner_id: '123'
      });

      if (error) {
        console.error('Error creating transaction:', error);
      } else {
        console.log('Transaction created successfully:', transactionData);

        // Create new item rows in supabase that reference the transaction
        const items = [];
        let index = 0;
        while (data[`itemName-${index}`] !== undefined) {
          items.push({
            transaction_id: generatedId,
            itemName: data[`itemName-${index}`],
            itemCost: Number(data[`itemCost-${index}`])
          });
          index++;
        }

        for (const item of items) {
          const { data: itemsData, error: itemsError } = await supabase.from('item').insert({
            transaction_id: generatedId,
            item_name: item.itemName,
            cost: item.itemCost,
            quantity: 1,
            owner_nickname: '123'
          });
          if (itemsError) {
            console.error('Error creating items:', itemsError);
          } else {
            console.log('Items created successfully:', itemsData);
          }
        }

      }

      setShareablePageCreated(true);
    }
  };

  const handleCopy = () => {
    const fullUrl = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      console.log('URL copied to clipboard:', fullUrl);
    }).catch(err => {
      console.error('Failed to copy URL:', err);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vendor">Vendor</Label>
        <Input id="vendor" name="vendor" defaultValue={localContent.businessName || "Pizzeria"} />
      </div>
      
      {localContent.items && localContent.items.map((item, index) => (
        <div key={`${item.itemName}-${index}`} className="flex space-x-4 items-center">
          <div className="flex-1 space-y-2">
            <Label htmlFor={`itemName-${index}`}>Item Name</Label>
            <Input
              id={`itemName-${index}`}
              name={`itemName-${index}`}
              defaultValue={item.itemName}
              onBlur={(e) => handleItemChange(index, 'itemName', e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor={`itemCost-${index}`}>Item Cost</Label>
            <Input
              id={`itemCost-${index}`}
              name={`itemCost-${index}`}
              defaultValue={item.itemCost.toFixed(2)}
              onBlur={(e) => handleItemChange(index, 'itemCost', e.target.value)}
            />
          </div>
          <button
            onClick={() => handleRemoveItem(index)}
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <MinusCircle size={20} />
          </button>
        </div>
      ))}

      <Button 
        onClick={handleAddItem} 
        type="button"
        className="w-full border border-blue-400 text-blue-400 hover:bg-blue-100 flex justify-center items-center bg-transparent"
      >
        <PlusCircle size={20} />
      </Button>

      <div className="space-y-2">
        <Label htmlFor="totalBeforeTax">Total Before Tax</Label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
          <Input id="totalBeforeTax" name="totalBeforeTax" defaultValue={localContent.totalBeforeTax.toFixed(2)} className="pl-6" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalAfterTax">Total After Tax</Label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
          <Input id="totalAfterTax" name="totalAfterTax" defaultValue={localContent.totalAfterTax.toFixed(2)} className="pl-6" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tip">Tip</Label>
        <Input id="tip" name="tip" defaultValue="0" />
      </div>

      <Button type="submit" className="w-full bg-blue-400 hover:bg-blue-500">Shareable Link</Button>

      {shareablePageCreated && (
        <div className="mt-4 text-center">
          <p className="text-gray-700">Shareable Page URL:</p>
          <div className="flex justify-center items-center space-x-2">
            <a href={`/share/${id}`} target="_blank" className="text-blue-500 hover:underline">
              {`/share/${id}`}
            </a>
            <button onClick={handleCopy} className="text-gray-500 hover:text-gray-700">
              <Copy size={16} />
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default ReceiptForm;