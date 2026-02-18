import { useState } from "react";
import { createWorker } from "tesseract.js";
import type { Product } from "../../types/Product";

export interface ParsedItem {
  name: string;
  quantity: number;
  unit: string;
  price?: number;
}

interface UseReceiptScannerProps {
  onAddItems: (items: Partial<Product>[]) => void;
}

export const useReceiptScanner = ({ onAddItems }: UseReceiptScannerProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [rawText, setRawText] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setParsedItems([]);
        setRawText("");
      };
      reader.readAsDataURL(file);
    }
  };

  const parseReceiptText = (text: string): ParsedItem[] => {
    const lines = text.split("\\n").filter((line) => line.trim());
    const items: ParsedItem[] = [];

    let startIndex = -1;
    let endIndex = lines.length;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes("ддв број") || line.includes("ddv broj")) {
        startIndex = i + 1;
      }
      if (line.includes("промет од") || line.includes("promet od")) {
        endIndex = i;
        break;
      }
    }

    if (startIndex === -1) startIndex = 0;

    const relevantLines = lines.slice(startIndex, endIndex);

    for (let i = 0; i < relevantLines.length - 1; i += 2) {
      const nameLine = relevantLines[i].trim();
      const detailLine = relevantLines[i + 1]?.trim();

      if (!nameLine || !detailLine) continue;

      if (
        nameLine.match(
          /^(total|subtotal|tax|вкупно|данок|сметка|картичка|готовина|payment|благајна)/i,
        )
      ) {
        i -= 1;
        continue;
      }

      const detailPattern =
        /(\\d+(?:[.,]\\d+)?)\\s*([a-zA-Zа-яА-Я.]+)?\\s+(\\d+(?:[.,]\\d+)?)/;
      const match = detailLine.match(detailPattern);

      if (match) {
        const [, qty, unit, price] = match;

        let normalizedUnit = unit?.toLowerCase() || "unit";
        const unitMap: { [key: string]: string } = {
          gr: "g",
          "g.": "g",
          грам: "g",
          грами: "g",
          kg: "kg",
          "kg.": "kg",
          кг: "kg",
          kilogram: "kg",
          l: "L",
          "l.": "L",
          liter: "L",
          литар: "L",
          ml: "ml",
          "ml.": "ml",
          милилитар: "ml",
          kom: "pieces",
          "kom.": "pieces",
          парче: "pieces",
          парчиња: "pieces",
          пакет: "pieces",
          шише: "pieces",
        };

        normalizedUnit = unitMap[normalizedUnit] || normalizedUnit;

        items.push({
          name: nameLine,
          quantity: Number.parseFloat(qty.replace(",", ".")),
          unit: normalizedUnit,
          price: Number.parseFloat(price.replace(",", ".")),
        });
      }
    }

    return items;
  };

  const processReceipt = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);
    setParsedItems([]);

    try {
      const worker = await createWorker(["mkd", "eng"], 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const {
        data: { text },
      } = await worker.recognize(image);

      setRawText(text);
      const items = parseReceiptText(text);
      setParsedItems(items);

      await worker.terminate();
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Failed to process receipt. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToInventory = () => {
    const products: Partial<Product>[] = parsedItems.map((item) => ({
      id: crypto.randomUUID(),
      name: item.name,
      category: "food",
      quantity: item.quantity,
      unit: item.unit,
      minStock: item.quantity * 0.2,
      lastPurchased: new Date().toISOString().split("T")[0],
      useBy: "",
      status: "in-stock",
    }));

    onAddItems(products);

    setImage(null);
    setParsedItems([]);
    setRawText("");
  };

  const removeItem = (index: number) => {
    setParsedItems(parsedItems.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof ParsedItem,
    value: string | number,
  ) => {
    const updated = [...parsedItems];
    updated[index] = { ...updated[index], [field]: value };
    setParsedItems(updated);
  };

  return {
    image,
    isProcessing,
    progress,
    parsedItems,
    rawText,
    showRaw,
    setShowRaw,
    handleImageUpload,
    processReceipt,
    handleAddToInventory,
    removeItem,
    updateItem,
  };
};
