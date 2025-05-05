import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, MinusCircle, PlusCircle, Split } from 'lucide-react';
import { useSupabase } from '@/SupabaseContext';
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import ReactQRCode from 'react-qr-code'; // Replace qrcode.react with react-qr-code

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
    quantity: number | string;
  }[];
  tip?: number;
  tax: number;
  totalAfterTax: number;
  venmoUsername?: string;
};

const generateIdBackup = () => {
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 1000);
  return `receipt-${timestamp}-${randomNum}`;
}

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
  const [currentPage, setCurrentPage] = useState<number>(0); // Track current page
  const [id, setId] = useState<string>('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [shareablePageCreated, setShareablePageCreated] = useState<boolean>(false);
  const [shareablePageLoading, setShareablePageLoading] = useState<boolean>(false);
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
  const [isPaymentMethodEnabled, setIsPaymentMethodEnabled] = useState<boolean>(false); // Default set to false
  const [showQRCode, setShowQRCode] = useState<boolean>(false); // State to toggle QR code visibility

  const getHelpText = () => {
    switch (currentPage) {
      case 0:
        return "Add items and their costs here. You can split or remove items as needed";
      case 1:
        return "Enter tax, tip, and total amounts. Adjust values to ensure accuracy";
      case 2:
        return "Generate a shareable link, share with your friends and select your own items! Please generate a new link for any new changes! Use our optional payment method, and enter a username";
      default:
        return null;
    }
  };

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
    const handleFormChange = () => {
      setFormChanged(true);
    };

    // Watch only the fields that represent actual form data
    const dependencies = [localContent, tax, totalBeforeTax, totalAfterTax, tip, paymentMethod, paymentUsername];
    handleFormChange(); // Trigger formChanged only when these dependencies change
  }, [localContent, tax, totalBeforeTax, totalAfterTax, tip, paymentMethod, paymentUsername]);

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

  useEffect(() => {
    // Ensure all items have a default quantity of 1 if not already set
    setLocalContent(prevContent => ({
      ...prevContent,
      items: prevContent.items.map(item => ({
        ...item,
        quantity: item.quantity || 1, // Default to 1 if quantity is blank or undefined
      })),
    }));
  }, [content]);

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

  const handleQuantityChange = (index: number, value: string) => {
    setLocalContent(prevContent => {
      const updatedItems = prevContent.items.map((item, i) =>
        i === index ? { ...item, quantity: value } : item
      );
      return { ...prevContent, items: updatedItems };
    });
    setFormChanged(true); // Ensure formChanged is set to true
  };

  const handleQuantityBlur = (index: number) => {
    setLocalContent(prevContent => {
      const updatedItems = prevContent.items.map((item, i) =>
        i === index ? { ...item, quantity: item.quantity === '' || parseInt(item.quantity as string, 10) < 1 ? 1 : item.quantity } : item
      );
      return { ...prevContent, items: updatedItems };
    });
  };

  const handleAddItem = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    const newItem = { itemName: '', itemCost: 0, quantity: 1 }; // Default quantity set to 1
    setLocalContent({ ...localContent, items: [...localContent.items, newItem] });
  };

  const handleSplitItem = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    const splitCount = prompt('How many people are spliting the item?:', '2');
    if (splitCount !== null && parseInt(splitCount, 10) > 1) {
      const itemToSplit = localContent.items[index];
      const splitCountInt = parseInt(splitCount, 10);
      const newItems = Array.from({ length: splitCountInt }, (_, i) => ({
        itemName: `${itemToSplit.itemName} (${i + 1})`,
        itemCost: parseFloat((itemToSplit.itemCost / splitCountInt).toFixed(2)),
        quantity: 1
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

  const collectFormData = () => {
    const formData: any = {
      vendor: localContent.businessName,
      items: localContent.items,
      tax,
      totalBeforeTax,
      totalAfterTax,
      tip,
      paymentMethod,
      paymentUsername,
    };
    return formData;
  };

  const handleSubmit = async (e: React.FormEvent, forceGenerate: boolean = false) => {
    e.preventDefault();

    // Ensure the form is valid before generating a link
    if (isButtonDisabled) {
      console.error('Form is invalid. Cannot generate a link.');
      return;
    }

    // Prevent generating a new link if one already exists and forceGenerate is false
    if (id && !formChanged && !forceGenerate) {
      console.log('No changes detected. Link generation skipped.');
      return;
    }

    const data = collectFormData(); // Collect all form data

    setShareablePageLoading(true);
    const generatedId = await generateIdBackup();
    setId(generatedId);

    // Create new transaction row in Supabase
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
      owner_id: '123',
    });

    if (error) {
      console.error('Error creating transaction:', error);
    } else {
      console.log('Transaction created successfully:', transactionData);

      // Create new item rows in Supabase that reference the transaction
      for (const item of data.items) {
        const { data: itemsData, error: itemsError } = await supabase.from('item').insert({
          transaction_id: generatedId,
          item_name: item.itemName,
          cost: item.itemCost,
          quantity: item.quantity,
          owner_nickname: '',
        });
        if (itemsError) {
          console.error('Error creating items:', itemsError);
        } else {
          console.log('Items created successfully:', itemsData);
        }
      }
    }

    setShareablePageLoading(false);
    setShareablePageCreated(true);
    setFormChanged(false); // Reset formChanged after submission
  };

  const handleCopy = () => {
    if (!id) {
      console.error('No shareable link available to copy.');
      return; // Prevent any action if no link exists
    }
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

  const handleNextPage = () => {
    if (currentPage === 0) {
      // Check if any items have a quantity greater than 1 and need splitting
      const itemsNeedSplitting = localContent.items.some(item => item.quantity > 1);

      if (itemsNeedSplitting) {
        setLocalContent(prevContent => {
          const updatedItems = prevContent.items.flatMap(item => {
            if (item.quantity > 1) {
              const splitCost = parseFloat((item.itemCost / item.quantity).toFixed(2));
              return Array.from({ length: item.quantity }, (_, idx) => ({
                ...item,
                itemName: `${item.itemName} (${idx + 1})`,
                itemCost: splitCost,
                quantity: 1,
              }));
            }
            return [item];
          });
          return { ...prevContent, items: updatedItems };
        });
        setFormChanged(true); // Mark form as changed only if items were split
      }
    }

    if (currentPage < 2) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 0:
        return (
          <>
            <h2 className="text-xl font-bold mb-4">Step 1: Add Items</h2>
            <p className="text-gray-600 mb-4">Add items and their costs here. Ensure all items from the receipt are added. Use the remove and split button as needed for shared items.</p>
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input id="vendor" name="vendor" defaultValue={localContent.businessName || "Pizzeria"} onChange={(e) => setLocalContent({ ...localContent, businessName: e.target.value })} />
            </div>
            <div className="flex space-x-4 items-center">
              <div className="flex-1">
                <Label>Item Name</Label>
              </div>
              <div className="flex-1">
                <Label>Item Cost</Label>
              </div>
              <div className="w-1/6">
                <Label>Actions</Label>
              </div>
            </div>
            {localContent.items && localContent.items.map((item, index) => (
              <div key={`${item.itemName}-${index}`} className="flex space-x-4 items-center">
                <div className="flex-1 space-y-2">
                  <Input
                    id={`itemName-${index}`}
                    name={`itemName-${index}`}
                    defaultValue={item.itemName}
                    onBlur={(e) => handleItemChange(index, 'itemName', e.target.value)}
                    onKeyDown={preventEnterKey}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    id={`itemCost-${index}`}
                    name={`itemCost-${index}`}
                    defaultValue={item.itemCost.toFixed(2)}
                    onBlur={(e) => handleItemChange(index, 'itemCost', e.target.value)}
                    onKeyDown={(e) => { preventEnterKey(e); preventMinusSymbol(e); preventAlphabet(e); }}
                  />
                </div>
                <div className="w-1/6 flex items-center space-x-2">
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
          </>
        );
      case 1:
        return (
          <>
            <h2 className="text-xl font-bold mb-4">Step 2: Enter Totals</h2>
            <p className="text-gray-600 mb-4">Enter tax, tip, and total amounts. Adjust values to ensure accuracy.</p>
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
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-xl font-bold mb-4">Step 3: Generate Shareable Link</h2>
            <p className="text-gray-600 mb-4">Generate a shareable link, share with your friends, and select your own items! Please generate a new link for any new changes! Use our optional payment method.</p>
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="paymentMethodToggle">Enable Payment Method</Label>
                <Switch
                  id="paymentMethodToggle"
                  checked={isPaymentMethodEnabled}
                  onCheckedChange={setIsPaymentMethodEnabled}
                />
              </div>
              <div
                className={`space-y-2 mt-4 ${isPaymentMethodEnabled ? '' : 'opacity-50 pointer-events-none'}`}
              >
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
                  <div className="flex-1 relative">
                    {paymentMethod === 'Venmo' && (
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black">@</span>
                    )}
                    <Input
                      id="paymentUsername"
                      name="paymentUsername"
                      value={
                        paymentMethod === 'Venmo'
                          ? paymentUsername !== null
                            ? paymentUsername.toString().replace('@', '')
                            : ''
                          : paymentUsername || ''
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setPaymentUsername(
                          paymentMethod === 'Venmo'
                            ? value.startsWith('@')
                              ? value.substring(1)
                              : value
                            : value
                        );
                      }}
                      onKeyDown={preventEnterKey}
                      placeholder={
                        paymentMethod === 'Venmo'
                          ? 'Please enter your username'
                          : 'Please enter your number'
                      }
                      className={`pl-${paymentMethod === 'Venmo' ? '6' : '3'} text-black placeholder-gray-500`}
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
              <div className="relative p-1 rounded-lg bg-gradient-to-r from-blue-600 via-blue-200 to-blue-400 animate-gradient-direction">
                <Button
                  type="submit"
                  onClick={(e) => handleSubmit(e, false)} // Do not force link generation unless explicitly needed
                  className={`w-full bg-blue-400 hover:bg-blue-500 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isButtonDisabled || shareablePageLoading} // Ensure button is disabled if form is invalid
                >
                  {shareablePageLoading ? 'Generating Link...' : 'Generate Link to Share with Friends'}
                </Button>
              </div>
              {isButtonDisabled && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  {totalAfterTax <= 0 ? 'Total after tax cannot be negative' : 
                  totalAfterTax < totalBeforeTax ? 'Tax cannot be negative' : 
                  tax < 0 ? 'Tax cannot be negative.' : 
                  'Please ensure all item costs are non-negative and total after tax is valid.'}
                </p>
              )}
              {shareablePageLoading && (
                <div className="mt-4 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="text-gray-700 mt-2">Creating your shareable link...</p>
                </div>
              )}
              {shareablePageCreated && (
                <div className="mt-4 text-center">
                  <p className="text-gray-700">Shareable Page URL:</p>
                  <div className="flex justify-center items-center space-x-2">
                    <a href={`/share/${id}`} target="_blank" className="text-blue-500 hover:underline">
                      {`/share/${id}`}
                    </a>
                    <button 
                      onClick={handleCopy} 
                      className={`text-gray-500 hover:text-gray-700 ${!id ? 'cursor-not-allowed opacity-50' : ''}`} 
                      disabled={!id} // Disable button if no link exists
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <div className="mt-8 flex justify-center">
                    <ReactQRCode value={`${window.location.origin}/share/${id}`} size={256} />
                  </div>
                </div>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
      {renderPageContent()}
      <div className="flex justify-between mt-4">
        <div className="flex-1">
          {currentPage > 0 && (
            <Button 
              type="button" 
              onClick={handlePreviousPage} 
              className="bg-gray-300 hover:bg-gray-400 text-black w-32"
            >
              Previous
            </Button>
          )}
        </div>
        <div className="flex-1 text-right">
          {currentPage < 2 && (
            <Button 
              type="button" 
              onClick={handleNextPage} 
              className="bg-blue-400 hover:bg-blue-500 text-white w-32"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default ReceiptForm;