import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from 'lucide-react';

interface ReceiptFormProps {
  onSubmit: (data: any) => void;
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

const ReceiptForm: React.FC<ReceiptFormProps> = ({ onSubmit }) => {
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
        <Input id="vendor" name="vendor" defaultValue="Pizzeria" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cost">Cost</Label>
        <Input id="cost" name="cost" defaultValue="$13.10" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" defaultValue="Meal" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Input id="type" name="type" defaultValue="Dinner" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" defaultValue="2018-02-13" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" />
      </div>

      <Button type="submit" className="w-full bg-blue-400 hover:bg-blue-500">Submit</Button>

      {shareablePageCreated && (
        <div className="mt-4 text-center">
          <p className="text-gray-700">Shareable Page URL:</p>
          <div className="flex justify-center items-center space-x-2">
            <a href={`/share/${id}`} className="text-blue-500 hover:underline">
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