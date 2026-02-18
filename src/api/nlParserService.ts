import Groq from "groq-sdk";
import type { Product } from "../types/Product";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface ParsedProductUpdate {
  action: "add" | "update" | "consume"; // add new product, update existing, or log consumption
  productName: string;
  quantity: number;
  unit: string;
  category?: string; // Food & Beverage, Cleaning, etc.
  minStock?: number;
  storage?: string;
  confidence: number; // 0-100, how sure AI is about the parse
  reasoning: string; // Why AI made this interpretation
  originalInput: string;
}

/**
 * Parse natural language input like "I bought 10 eggs" into structured product data
 * Using Claude to understand context and intent
 */
export async function parseNaturalLanguageInput(
  input: string,
  existingProducts: Product[],
): Promise<ParsedProductUpdate | null> {
  try {
    if (!input.trim()) {
      return null;
    }

    // Build product context for Claude (what products already exist)
    const productNames = existingProducts.map((p) => p.name).join(", ");

    const prompt = `You are a smart home assistant that parses natural language input to update a household inventory system.

USER INPUT: "${input}"

EXISTING PRODUCTS IN INVENTORY: ${productNames || "None yet"}

Parse this input and determine:
1. What product is being mentioned?
2. What action? (add new product, update quantity of existing, or log consumption)
3. Quantity and unit (e.g., 10 eggs, 2L milk, 1 box cereal)
4. Estimated category (Food & Beverage, Cleaning Supplies, etc.)

Return ONLY valid JSON (no markdown, no explanation):
{
  "action": "add" | "update" | "consume",
  "productName": "exact product name",
  "quantity": number,
  "unit": "eggs" | "L" | "kg" | "boxes" | "pieces" | etc,
  "category": "Food & Beverage" | "Cleaning Supplies" | "Other",
  "confidence": 85,
  "reasoning": "Why you interpreted it this way"
}

RULES:
- If it says "I bought" → action: add
- If it says "I used" or "I consumed" → action: consume
- If product name matches existing product → action: update
- Be specific with product names (e.g., "eggs" not "egg")
- Common units: eggs, L, kg, ml, boxes, pieces, bars, rolls, etc.
- Confidence: 90-100 for clear inputs, 70-80 for ambiguous
- If unsure, return action: "add" (safest default)

Return JSON only.`;

    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.choices[0]?.message?.content || "";

    if (!responseText) {
      console.warn("Empty response from Groq API");
      return null;
    }

    // Extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("No JSON found in AI response:", responseText);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      action: parsed.action,
      productName: parsed.productName,
      quantity: parsed.quantity,
      unit: parsed.unit,
      category: parsed.category,
      confidence: Math.min(100, Math.max(0, parsed.confidence || 75)),
      reasoning: parsed.reasoning,
      originalInput: input,
    };
  } catch (error) {
    console.error("Error parsing natural language:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return null;
  }
}

/**
 * Apply the parsed update to create/update a product
 */
export function applyParsedUpdate(
  update: ParsedProductUpdate,
  existingProducts: Product[],
): Product | null {
  const today = new Date().toISOString().split("T")[0];

  switch (update.action) {
    case "add": {
      const newProduct: Product = {
        id: `PROD-${Date.now()}`,
        name: update.productName,
        category: update.category || "Food & Beverage",
        quantity: update.quantity,
        unit: update.unit,
        minStock: update.minStock || 1,
        purchased: today,
        useBy: "", // Will be set by user if needed
        storage: update.storage || "",
        toBuy: false,
        frequentlyUsed: false,
      };
      return newProduct;
    }

    case "update": {
      const existing = existingProducts.find(
        (p) => p.name.toLowerCase() === update.productName.toLowerCase(),
      );
      if (existing) {
        return {
          ...existing,
          quantity: existing.quantity + update.quantity,
          purchased: today,
        };
      }
      // If not found, create as new
      const newProduct: Product = {
        id: `PROD-${Date.now()}`,
        name: update.productName,
        category: update.category || "Food & Beverage",
        quantity: update.quantity,
        unit: update.unit,
        minStock: update.minStock || 1,
        purchased: today,
        useBy: "",
        storage: update.storage || "",
        toBuy: false,
        frequentlyUsed: false,
      };
      return newProduct;
    }

    case "consume": {
      const existing = existingProducts.find(
        (p) => p.name.toLowerCase() === update.productName.toLowerCase(),
      );
      if (existing) {
        return {
          ...existing,
          quantity: Math.max(0, existing.quantity - update.quantity),
        };
      }
      return null; // Can't consume what doesn't exist
    }

    default:
      return null;
  }
}
