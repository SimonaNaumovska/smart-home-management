# 📸 Receipt Scanner - Upgrade Guide

## Current Implementation

The app now includes **client-side receipt scanning** using Tesseract.js OCR. This runs entirely in your browser with no backend required.

### ✅ What's Working

- Image upload from camera or file
- OCR text extraction (Tesseract.js)
- Automatic item parsing
- Price and quantity detection
- Manual item editing before adding
- Bulk add to inventory

### ⚠️ Limitations

- **Accuracy**: ~70-85% depending on receipt quality
- **Speed**: 5-15 seconds processing time
- **Offline**: Works offline but requires initial model download (~2MB)
- **Languages**: English only by default

---

## 🚀 Upgrade Options

### Option 1: Google Cloud Vision API (Recommended)

**Best for**: Production apps, high accuracy needed

**Accuracy**: ~95-99%  
**Speed**: 1-3 seconds  
**Cost**: Free tier: 1,000 requests/month, then $1.50/1,000 requests

#### Implementation Steps:

1. **Enable Google Cloud Vision API**

   ```bash
   # Install SDK
   npm install @google-cloud/vision
   ```

2. **Create Supabase Edge Function** (backend proxy)

   ```typescript
   // supabase/functions/scan-receipt/index.ts
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
   import { ImageAnnotatorClient } from "npm:@google-cloud/vision@4";

   const client = new ImageAnnotatorClient();

   serve(async (req) => {
     const { image } = await req.json();

     const [result] = await client.textDetection({
       image: { content: image },
     });

     return new Response(
       JSON.stringify({ text: result.fullTextAnnotation?.text || "" }),
       { headers: { "Content-Type": "application/json" } },
     );
   });
   ```

3. **Update ReceiptScanner.tsx**

   ```typescript
   import { supabase } from "../../supabase/config";

   const processReceipt = async () => {
     const { data, error } = await supabase.functions.invoke("scan-receipt", {
       body: { image: imageBase64 },
     });

     if (error) throw error;
     const text = data.text;
     const items = parseReceiptText(text);
     setParsedItems(items);
   };
   ```

#### Pros:

- ✅ Excellent accuracy
- ✅ Fast processing
- ✅ Handles multiple languages
- ✅ Structured data extraction

#### Cons:

- ❌ Requires backend (Supabase Edge Functions)
- ❌ Costs money after free tier
- ❌ Requires API keys/setup

---

### Option 2: GPT-4 Vision (OpenAI)

**Best for**: Maximum intelligence, context understanding

**Accuracy**: ~98-99% with smart parsing  
**Speed**: 3-5 seconds  
**Cost**: $0.01 per image (approximately)

#### Implementation:

1. **Install OpenAI SDK**

   ```bash
   npm install openai
   ```

2. **Create Supabase Edge Function**

   ```typescript
   import OpenAI from "openai";

   export const scanReceiptGPT = functions.https.onCall(async (data) => {
     const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

     const response = await openai.chat.completions.create({
       model: "gpt-4-vision-preview",
       messages: [
         {
           role: "user",
           content: [
             {
               type: "text",
               text: "Extract all items from this grocery receipt. Return JSON array with: name, quantity, unit, price",
             },
             {
               type: "image_url",
               image_url: { url: `data:image/jpeg;base64,${data.image}` },
             },
           ],
         },
       ],
       max_tokens: 1000,
     });

     return JSON.parse(response.choices[0].message.content);
   });
   ```

#### Pros:

- ✅ Best accuracy and intelligence
- ✅ Understands context (e.g., "2x Milk" = 2 quantity)
- ✅ Returns structured JSON directly
- ✅ Multi-language support

#### Cons:

- ❌ More expensive
- ❌ Requires OpenAI API key
- ❌ Slower than Cloud Vision

---

### Option 3: Azure Computer Vision

**Best for**: Microsoft Azure users

**Accuracy**: ~95-97%  
**Speed**: 2-4 seconds  
**Cost**: Free tier: 5,000 transactions/month

#### Implementation:

```bash
npm install @azure/cognitiveservices-computervision
```

Similar setup to Google Cloud Vision but using Azure SDK.

---

### Option 4: Improve Current Tesseract.js

**Best for**: Staying free and offline

**Free**: Yes  
**Offline**: Yes

#### Improvements:

1. **Image Preprocessing**

   ```typescript
   // Add before OCR
   import Tesseract from "tesseract.js";
   import sharp from "sharp"; // Install: npm install sharp

   const preprocessImage = async (imageBase64: string) => {
     const buffer = Buffer.from(imageBase64.split(",")[1], "base64");

     const processed = await sharp(buffer)
       .greyscale() // Convert to grayscale
       .normalize() // Enhance contrast
       .sharpen() // Sharpen text
       .toBuffer();

     return `data:image/jpeg;base64,${processed.toString("base64")}`;
   };
   ```

2. **Better Text Parsing**

   ```typescript
   // Add more sophisticated regex patterns
   // Use fuzzy matching for product names
   // Add common receipt format templates
   ```

3. **Multi-language Support**
   ```typescript
   const worker = await createWorker(["eng", "spa", "fra"]);
   ```

---

## 💡 Recommendation

**Start with**: Current Tesseract.js implementation (already done!)  
**Next step**: Add image preprocessing for better accuracy  
**Production**: Upgrade to Google Cloud Vision API

---

## 🔧 Quick Win: Image Tips

Add these user tips to improve current OCR:

```typescript
// In ReceiptScanner.tsx
<div style={{ backgroundColor: "#e3f2fd", padding: "16px" }}>
  <h4>📷 Tips for Better Scanning:</h4>
  <ul>
    <li>✅ Take photo in good lighting</li>
    <li>✅ Keep receipt flat and straight</li>
    <li>✅ Avoid shadows and glare</li>
    <li>✅ Ensure text is in focus</li>
    <li>✅ Capture entire receipt</li>
  </ul>
</div>
```

---

## 📊 Comparison Table

| Solution          | Accuracy | Speed | Cost       | Setup Complexity |
| ----------------- | -------- | ----- | ---------- | ---------------- |
| **Tesseract.js**  | 70-85%   | 5-15s | Free       | ✅ Easy (done!)  |
| **Google Vision** | 95-99%   | 1-3s  | $1.50/1k   | ⚠️ Medium        |
| **GPT-4 Vision**  | 98-99%   | 3-5s  | ~$10/1k    | ⚠️ Medium        |
| **Azure Vision**  | 95-97%   | 2-4s  | Free 5k/mo | ⚠️ Medium        |

---

## 🎯 Next Steps

1. **Test current implementation** with various receipts
2. **Collect feedback** on accuracy
3. **If needed**, implement preprocessing improvements
4. **For production**, evaluate Cloud Vision API based on usage volume

---

## 🔗 Resources

- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [Google Cloud Vision API](https://cloud.google.com/vision/docs)
- [OpenAI GPT-4 Vision](https://platform.openai.com/docs/guides/vision)
- [Azure Computer Vision](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/)
