import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, MinusCircle, PlusCircle, Split } from 'lucide-react';
import { useSupabase } from '@/SupabaseContext';
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

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
  venmoUsername?: string;
};

const generateId = async (): Promise<string> => {
  try {
    // Fetch a random adjective
    const adjectiveResponse = await fetch('https://random-word-api.herokuapp.com/word');
    const adjectiveArray = await adjectiveResponse.json();
    const adjective = adjectiveArray[0].replace(/\s+/g, '-');

    // Fetch a random noun
    const nounResponse = await fetch('https://random-word-api.herokuapp.com/word');
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

const preventMinusSymbol = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === '-') {
    e.preventDefault();
  }
};

const preventAlphabet = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (/[a-zA-Z]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
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
  const [tipPercentage, setTipPercentage] = useState<number | null>(null);
  const [grandTotal, setGrandTotal] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('Venmo');
  const paymentMethods = ['Venmo', 'Cashapp', 'Apple Pay', 'Zelle'];
  const [paymentUsername, setPaymentUsername] = useState<string | null>(null);
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
    const hasNegativeItemCost = localContent.items.some(item => item.itemCost < 0);
    setTotalBeforeTax(parseFloat(totalItemCosts.toFixed(2)));
    setIsButtonDisabled(
      totalAfterTax <= 0 || 
      totalAfterTax === undefined || 
      totalAfterTax < totalBeforeTax || 
      hasNegativeItemCost
    );
  }, [localContent.items.map(item => item.itemCost), totalAfterTax, totalBeforeTax]);

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
  }, [localContent, tax, totalBeforeTax, totalAfterTax, tip, paymentMethod]);

  useEffect(() => {
    setLocalContent(content);
    setTax(content.tax || 0);
    setTotalBeforeTax(content.totalBeforeTax || null);
    setTotalAfterTax(content.totalAfterTax || null);
    setTip(content.tip || 0);
  }, [content]);

  useEffect(() => {
    if (totalAfterTax !== null && tip !== null) {
      setGrandTotal(parseFloat((totalAfterTax + tip).toFixed(2)));
    } else if (totalAfterTax !== null) {
      setGrandTotal(totalAfterTax);
    } else {
      setGrandTotal(null);
    }
  }, [totalAfterTax, tip]);

  const handleRemoveItem = (index: number) => {
    const updatedItems = localContent.items.filter((_, i) => i !== index);
    setLocalContent({ ...localContent, items: updatedItems });
    setFormChanged(true); // Ensure formChanged is set to true
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    setLocalContent(prevContent => {
      const updatedItems = prevContent.items.map((item, i) =>
        i === index ? { ...item, [field]: field === 'itemCost' ? parseFloat(value) || 0 : value } : item
      );
      return { ...prevContent, items: updatedItems };
    });
    setFormChanged(true); // Ensure formChanged is set to true
  };

  const handleAddItem = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    const newItem = { itemName: '', itemCost: 0 };
    setLocalContent({ ...localContent, items: [...localContent.items, newItem] });
  };

  const handleSplitItem = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    const splitCount = prompt('Enter the number of splits:', '2');
    if (splitCount !== null && parseInt(splitCount, 10) > 1) {
      const itemToSplit = localContent.items[index];
      const splitCountInt = parseInt(splitCount, 10);
      const newItems = Array.from({ length: splitCountInt }, (_, i) => ({
        itemName: `${itemToSplit.itemName} (${i + 1})`,
        itemCost: parseFloat((itemToSplit.itemCost / splitCountInt).toFixed(2))
      }));
      let updatedItems = [
        ...localContent.items.slice(0, index),
        ...localContent.items.slice(index + 1),
        ...newItems
      ];
      setLocalContent({ ...localContent, items: updatedItems });
      setFormChanged(true); // Ensure formChanged is set to true
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Add payment method to form data
    formData.append('paymentMethod', paymentMethod);
    
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
        payment_username: data.paymentUsername,
        payment_method: data.paymentMethod,
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
              onKeyDown={(e) => { preventEnterKey(e); preventMinusSymbol(e); preventAlphabet(e); }}
            />
          </div>
          <button
            onClick={() => handleRemoveItem(index)}
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <MinusCircle size={20} />
          </button>
          <button
            onClick={(e) => handleSplitItem(index, e)}
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <Split size={20} />
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

      <div id="totals" className="space-y-2 bg-gradient-to-b from-blue-50 to-white shadow-lg rounded-lg p-4">
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
          <div className="flex flex-row items-center gap-1">
            <Button type="button" onClick={() => {setTip(0); setTipPercentage(0)}} className="flex-1 border border-blue-400 rounded-sm p-1 text-center text-black bg-transparent hover:bg-[#D5E6FF]" style={{ backgroundColor: tipPercentage === 0 ? '#D5E6FF' : '' }}>0%</Button>
            <Button type="button" onClick={() => {setTip(parseFloat((.15*totalAfterTax).toFixed(2))); setTipPercentage(0.15)}} className="flex-1 border border-blue-400 rounded-sm p-1 text-center text-black bg-transparent hover:bg-[#D5E6FF]" style={{ backgroundColor: tipPercentage === 0.15 ? '#D5E6FF' : '' }}>15%</Button>
            <Button type="button" onClick={() => {setTip(parseFloat((.18*totalAfterTax).toFixed(2))); setTipPercentage(0.18)}} className="flex-1 border border-blue-400 rounded-sm p-1 text-center text-black bg-transparent hover:bg-[#D5E6FF]" style={{ backgroundColor: tipPercentage === 0.18 ? '#D5E6FF' : '' }}>18%</Button>
            <Button type="button" onClick={() => {setTip(parseFloat((.20*totalAfterTax).toFixed(2))); setTipPercentage(0.20)}} className="flex-1 border border-blue-400 rounded-sm p-1 text-center text-black bg-transparent hover:bg-[#D5E6FF]" style={{ backgroundColor: tipPercentage === 0.20 ? '#D5E6FF' : '' }}>20%</Button>
            <Button type="button" onClick={() => {setTip(parseFloat((.22*totalAfterTax).toFixed(2))); setTipPercentage(0.22)}} className="flex-1 border border-blue-400 rounded-sm p-1 text-center text-black bg-transparent hover:bg-[#D5E6FF]" style={{ backgroundColor: tipPercentage === 0.22 ? '#D5E6FF' : '' }}>22%</Button>
          </div>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <div className="flex flex-row items-center gap-3">
          <div className="w-1/3">
            <Select onValueChange={setPaymentMethod} value={paymentMethod}>
              <SelectTrigger>
                {paymentMethod}
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Input 
              id="paymentUsername" 
              name="paymentUsername"
              value={paymentUsername !== null ? `@${paymentUsername.toString().replace('@', '')}` : '@'}
              onChange={(e) => {
                const value = e.target.value;
                setPaymentUsername(value.startsWith('@') ? value.substring(1) : value);
              }}
              onKeyDown={preventEnterKey}
              placeholder={`Enter ${paymentMethod} username`}
            />
          </div>
        </div>
      </div>

      <hr className="my-4 border-gray-500" />

      <div className="space-y-2 mt-6">
        <Label htmlFor="grandTotal" className="text-xl">Grand Total</Label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
          <p className="pl-6 py-2 text-2xl">{grandTotal !== null ? grandTotal.toFixed(2) : ''}</p>
        </div>
      </div>

      <Button 
        type="submit" 
        className={`w-full bg-blue-400 hover:bg-blue-500 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
        disabled={isButtonDisabled}
      >
        Shareable Link
      </Button>

      {isButtonDisabled && (
        <p className="text-red-500 text-sm mt-2 text-center">
          {totalAfterTax <= 0 ? 'Total after tax cannot be negative' : 
           totalAfterTax < totalBeforeTax ? 'Tax cannot be negative' : 
           tax < 0 ? 'Tax cannot be negative.' : 
           'Please ensure all item costs are non-negative and total after tax is valid.'}
        </p>
      )}

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

      <div className="flex justify-center mt-8">
        <a
          href="https://forms.gle/GTYzC5f42PU2uuNZ6"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-6 rounded-lg shadow-md transition duration-300"
        >
          Click here for Test User Survey
        </a>
      </div>
    </form>
  );
};

export default ReceiptForm;