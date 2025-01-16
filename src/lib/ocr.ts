import axios from 'axios';

const openai_api_key = import.meta.env.VITE_OPENAI_API_KEY;
const openai_endpoint = 'https://api.openai.com/v1/chat/completions';
import { toast } from "sonner";

const tools = [
  {
      "type": "function",
      "function": {
          "name": "generate_receipt",
          "description": "Use the provided tool to transcribe the receipt in the image.",
          "parameters": {
              "type": "object",
              "properties": {
                  "businessName": {
                      "type": "string",
                      "description": "The name of the business."
                  },
                  "items": {
                      "type": "array",
                      "items": {
                          "type": "object",
                          "properties": {
                              "itemName": {
                                  "type": "string",
                                  "description": "The name of the item."
                              },
                              "itemCost": {
                                  "type": "number",
                                  "description": "The cost of the item."
                              }
                          }
                      }
                  },
                  "totalBeforeTax": {
                      "type": "number",
                      "description": "The total cost before tax."
                  },
                  "totalAfterTax": {
                      "type": "number",
                      "description": "The total cost after tax."
                  },
                  "tax": {
                      "type": "number",
                      "description": "The tax amount."
                  }
              },
              "required": ["businessName", "items", "totalBeforeTax", "totalAfterTax", "tax"],
              "additionalProperties": false
          }
      }
  }
]

interface OcrResult {
    error?: string; // Optional error property
    // Add other properties that you expect in the result
}

export const performOcr = async (base64Image: string): Promise<OcrResult> => {
  try {
    console.log("openai_api_key", openai_api_key);
    console.log("final_key", `Bearer ${openai_api_key}`);
    const response = await axios.post(openai_endpoint, {
          "model": "gpt-4o-mini",
          "store": true,
          "tools": tools,
          "messages": [
              {
                  "role": "user",
                  "content": [
                      {
                          "type": "text",
                          "text": "What is in this image?"
                      },
                      {
                          "type": "image_url",
                          "image_url": {
                              "url": base64Image
                          }
                      }
                  ]
              }
          ]
      },
      {
        headers: {
          'Authorization': `Bearer ${openai_api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(response.data); // Log the OCR result in JSON
    const raw_json = response.data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!raw_json) {
      return { error: "Failed to retrieve the expected data structure." }; // Return error if data structure is not as expected
    }
    const json = JSON.parse(raw_json);

    if (json.totalAfterTax && json.tax) {
      json.totalBeforeTax = json.totalAfterTax - json.tax;
    }

    return json; // Return the parsed JSON with totalBeforeTax
  } catch (error) {
    console.error('Error performing OCR:', error);
    return { error: error.message }; // Return the error message
  }
};
