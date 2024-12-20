import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from 'lucide-react';

interface ReceiptFormProps {
  onSubmit: (data: any) => void;
  content: any;
}

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
  const [shareablePageCreated, setShareablePageCreated] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    console.log(data);
    // onSubmit(data);

    if (!shareablePageCreated) {
      generateId().then((generatedId) => {
        setId(generatedId);
        setShareablePageCreated(true);
      });
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
        <Input id="vendor" name="vendor" defaultValue={content.businessName || "Pizzeria"} />
      </div>
      
      {content.items && content.items.map((item, index) => (
        <div key={index} className="flex space-x-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor={`itemName-${index}`}>Item Name</Label>
            <Input id={`itemName-${index}`} name={`itemName-${index}`} defaultValue={item.itemName} />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor={`itemCost-${index}`}>Item Cost</Label>
            <Input id={`itemCost-${index}`} name={`itemCost-${index}`} defaultValue={`$${item.itemCost.toFixed(2)}`} />
          </div>
        </div>
      ))}
      
      <div className="space-y-2">
        <Label htmlFor="totalBeforeTax">Total Before Tax</Label>
        <Input id="totalBeforeTax" name="totalBeforeTax" defaultValue={`$${content.totalBeforeTax.toFixed(2)}`} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="totalAfterTax">Total After Tax</Label>
        <Input id="totalAfterTax" name="totalAfterTax" defaultValue={`$${content.totalAfterTax.toFixed(2)}`} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tip">Tip</Label>
        <Input id="tip" name="tip" />
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