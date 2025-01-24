import React, { useState, useEffect } from 'react';
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
  tax: number;
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

const preventEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
};

const ReceiptForm = ({ onSubmit, content }: ReceiptFormProps) => {
  const [id, setId] = useState<string>('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [shareablePageCreated, setShareablePageCreated] = useState<boolean>(false);
  const [localContent, setLocalContent] = useState(content);
  const [tax, setTax] = useState(content.tax || 0);
  const [totalBeforeTax, setTotalBeforeTax] = useState<number | null>(content.totalBeforeTax || null);
  const [totalAfterTax, setTotalAfterTax] = useState<number | null>(content.totalAfterTax || null);
  const [tip, setTip] = useState<number | null>(content.tip || 0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isSharableLinkDisabled, setIsSharableLinkDisabled] = useState<boolean>(true);
  const [formChanged, setFormChanged] = useState<boolean>(false);
  const supabase = useSupabase();

  useEffect(() => {
    if (totalBeforeTax === null || totalAfterTax === null || tax < 0 || totalAfterTax < totalBeforeTax) {
      setIsSharableLinkDisabled(true);
    } else {
      setIsSharableLinkDisabled(false);
    }
  }, [totalBeforeTax, totalAfterTax, tax]);

  useEffect(() => {
    const totalItemCosts = localContent.items.reduce((sum, item) => sum + item.itemCost, 0);
    setTotalBeforeTax(parseFloat(totalItemCosts.toFixed(2)));
    setIsButtonDisabled(
      totalAfterTax <= 0 || 
      totalAfterTax === undefined || 
      totalItemCosts !== totalBeforeTax || 
      totalAfterTax < totalBeforeTax
    );
  }, [localContent.items, totalAfterTax, totalBeforeTax]);

  useEffect(() => {
    if (totalBeforeTax !== null && totalAfterTax !== null) {
      const calculatedTax = parseFloat((totalAfterTax - totalBeforeTax).toFixed(2));
      setTax(calculatedTax);
    }
  }, [totalBeforeTax, totalAfterTax]);

  useEffect(() => {
    if (totalBeforeTax === null || totalAfterTax === null || tax < 0) {
      setIsButtonDisabled(true);
    } else {
      setIsButtonDisabled(false);
    }
  }, [totalBeforeTax, totalAfterTax, tax]);

  useEffect(() => {
    setFormChanged(true);
  }, [localContent, tax, totalBeforeTax, totalAfterTax, tip]);

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

    if (formChanged) {
      const generatedId = await generateId();
      setId(generatedId);

      // Create new transaction row in supabase
      const { data: transactionData, error } = await supabase.from('transaction').insert({
        id: generatedId,
        date: new Date().toISOString(),
        restaurant: data.vendor,
        tip: data.tip,
        tax: data.tax,
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
            owner_nickname: ''
          });
          if (itemsError) {
            console.error('Error creating items:', itemsError);
          } else {
            console.log('Items created successfully:', itemsData);
          }
        }
      }

      setShareablePageCreated(true);
      setFormChanged(false);
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

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedTax = value === '' ? null : parseFloat(value);
    setTax(parsedTax);

    if (parsedTax !== null && totalBeforeTax !== null) {
      const calculatedTotalAfterTax = parseFloat((totalBeforeTax + parsedTax).toFixed(2));
      setTotalAfterTax(calculatedTotalAfterTax);
    }
  };

  const handleTotalBeforeTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTotalBeforeTax(value === '' ? null : parseFloat(value));
  };

  const handleTotalAfterTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedValue = value === '' ? null : parseFloat(value);
    setTotalAfterTax(parsedValue);

    if (parsedValue !== null && totalBeforeTax !== null) {
      const calculatedTax = parseFloat((parsedValue - totalBeforeTax).toFixed(2));
      setTax(calculatedTax);
    }
  };

  const handleTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTip(value === '' ? null : parseFloat(value));
  };

  const handleAutoCalculate = () => {
    if (tax !== null && totalAfterTax !== null) {
      const calculatedTotalBeforeTax = totalAfterTax - tax;
      setTotalBeforeTax(calculatedTotalBeforeTax);
    }
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
              onKeyDown={preventEnterKey}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor={`itemCost-${index}`}>Item Cost</Label>
            <Input
              id={`itemCost-${index}`}
              name={`itemCost-${index}`}
              defaultValue={item.itemCost.toFixed(2)}
              onBlur={(e) => handleItemChange(index, 'itemCost', e.target.value)}
              onKeyDown={preventEnterKey}
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
        style={{ height: 'auto' }}
      >
        <PlusCircle size={20} style={{ width: '20px', height: '20px' }} />
      </Button>

      <div className="space-y-2">
        <Label htmlFor="totalBeforeTax">Total Before Tax</Label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
          <Input 
            id="totalBeforeTax" 
            name="totalBeforeTax" 
            value={totalBeforeTax !== null ? totalBeforeTax.toString() : ''} 
            className="pl-6 bg-gray-300 appearance-none" 
            type="number" 
            step="0.01" 
            readOnly 
            onKeyDown={preventEnterKey} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxFees">Tax/Fees</Label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
          <Input 
            id="tax" 
            name="tax" 
            value={tax !== null ? tax.toString() : ''} 
            onChange={handleTaxChange} 
            onKeyDown={preventEnterKey} 
            className="pl-6" 
            type="number" 
            step="0.01" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalAfterTax">Total After Tax</Label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
          <Input 
            id="totalAfterTax" 
            name="totalAfterTax" 
            value={totalAfterTax !== null ? totalAfterTax.toString() : ''} 
            onChange={handleTotalAfterTaxChange} 
            onKeyDown={preventEnterKey} 
            className="pl-6" 
            type="number" 
            step="0.01" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tip">Tip</Label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
          <Input 
            id="tip" 
            name="tip" 
            value={tip !== null ? tip.toString() : ''} 
            className="pl-6" 
            type="number" 
            step="0.01" 
            onChange={handleTipChange}
            onKeyDown={preventEnterKey} 
          />
        </div>
      </div>

      <Button type="submit" className={`w-full bg-blue-400 hover:bg-blue-500 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isButtonDisabled}>Shareable Link</Button>

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