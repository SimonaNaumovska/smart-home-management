import Groq from "groq-sdk";
import type {
  AISuggestion,
  Product,
  ChoreDefinition,
  ConsumptionLog,
} from "../types/Product";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

export async function generateSuggestions(
  products: Product[],
  chores: ChoreDefinition[],
  consumptionLogs: ConsumptionLog[],
): Promise<AISuggestion[]> {
  try {
    // Filter valid products (with data)
    const validProducts = products.filter((p) => p.name && p.id);

    if (validProducts.length === 0) {
      console.warn("No valid products for suggestions");
      return [];
    }

    // Prepare context for AI
    const lowStockItems = validProducts.filter(
      (p) => p.quantity < p.minStock && p.quantity > 0,
    );
    const expiredItems = validProducts.filter((p) => {
      if (!p.useBy) return false;
      const expDate = new Date(p.useBy);
      return expDate < new Date();
    });
    const expiringItems = validProducts.filter((p) => {
      if (!p.useBy) return false;
      const expDate = new Date(p.useBy);
      const today = new Date();
      const daysUntilExpiry =
        (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
    });

    // Calculate consumption patterns (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentLogs = consumptionLogs.filter(
      (l) => l.timestamp > thirtyDaysAgo,
    );
    const consumptionByProduct: { [key: string]: number } = {};
    recentLogs.forEach((log) => {
      if (!consumptionByProduct[log.productName]) {
        consumptionByProduct[log.productName] = 0;
      }
      consumptionByProduct[log.productName] += log.amount;
    });

    // Detect spikes (products consumed more than average)
    const avgConsumption =
      Object.values(consumptionByProduct).reduce((a, b) => a + b, 0) /
        Object.keys(consumptionByProduct).length || 1;
    const consumptionSpikes = Object.entries(consumptionByProduct)
      .filter(([_, amount]) => amount > avgConsumption * 1.5)
      .map(([name]) => name);

    // Find ingredients for meal suggestions
    const ingredientsByCategory: { [key: string]: string[] } = {};
    validProducts.forEach((p) => {
      if (p.quantity > 0 && !p.useBy) {
        // Products without expiry (pantry items)
        if (!ingredientsByCategory[p.category]) {
          ingredientsByCategory[p.category] = [];
        }
        ingredientsByCategory[p.category].push(p.name);
      }
    });

    // Call Anthropic Claude with context
    const prompt = `You are a smart home assistant providing helpful suggestions. Analyze this household data and provide 2-3 specific, actionable suggestions using ONLY the data provided. Format your response as a JSON array.

HOUSEHOLD DATA:
- Low stock items: ${lowStockItems.map((p) => p.name).join(", ") || "None"}
- Expired items: ${expiredItems.map((p) => p.name).join(", ") || "None"}
- Expiring soon (7 days): ${expiringItems.map((p) => p.name).join(", ") || "None"}
- High consumption products: ${consumptionSpikes.join(", ") || "None"}
- Available ingredients by category: ${JSON.stringify(ingredientsByCategory)}
- Active chores: ${chores.filter((c) => c.active).length} tasks

IMPORTANT: 
1. Only suggest using items actually in the data above
2. Be specific with product names
3. Include confidence 0-100 based on data certainty
4. Suggest actions that would help the household

Return a JSON array with this structure:
[
  {
    "type": "low-stock" | "meal-idea" | "consumption-spike" | "expiration-warning" | "chore-optimization",
    "title": "Brief title",
    "description": "What to do",
    "reasoning": "Why this matters",
    "confidence": 85,
    "actionData": { "productName": "...", "quantity": 5, ...}
  }
]

Only return valid JSON array, no other text.`;

    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Parse response
    const responseText = message.choices[0]?.message?.content || "";

    // Extract JSON from response (in case of extra text)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn("No JSON found in AI response");
      return [];
    }

    const suggestionsData = JSON.parse(jsonMatch[0]);

    // Transform to AISuggestion format
    const suggestions: AISuggestion[] = suggestionsData
      .slice(0, 3) // Limit to 3 suggestions
      .map((s: any, index: number) => ({
        id: `sugg-${Date.now()}-${index}`,
        type: s.type,
        title: s.title,
        description: s.description,
        reasoning: s.reasoning,
        confidence: Math.min(100, Math.max(0, s.confidence || 75)),
        actionData: s.actionData || {},
        status: "pending" as const,
        createdAt: Date.now(),
      }));

    return suggestions;
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return [];
  }
}

/**
 * Apply an accepted suggestion (only when user clicks Accept)
 * This maintains the human-in-the-loop: AI suggests, human approves, system acts
 */
export function applySuggestion(
  suggestion: AISuggestion,
  products: Product[],
): { updatedProducts: Product[]; message: string } {
  const updatedProducts = [...products];

  switch (suggestion.type) {
    case "low-stock": {
      const product = updatedProducts.find(
        (p) => p.name === suggestion.actionData?.productName,
      );
      if (product) {
        product.toBuy = true;
        return {
          updatedProducts,
          message: `✅ Added "${product.name}" to shopping list`,
        };
      }
      break;
    }

    case "expiration-warning": {
      const product = updatedProducts.find(
        (p) => p.name === suggestion.actionData?.productName,
      );
      if (product) {
        // Mark for prioritized use
        product.frequentlyUsed = true;
        return {
          updatedProducts,
          message: `✅ Marked "${product.name}" for prioritized use`,
        };
      }
      break;
    }

    // Meal ideas and consumption spikes don't auto-modify data
    // They're informational - user decides what to do
    case "meal-idea":
      return {
        updatedProducts,
        message: "✅ Meal idea acknowledged",
      };

    case "consumption-spike":
      return {
        updatedProducts,
        message: "✅ Consumption pattern noted",
      };

    case "chore-optimization":
      return {
        updatedProducts,
        message: "✅ Chore suggestion noted",
      };

    default:
      return {
        updatedProducts,
        message: "✅ Suggestion processed",
      };
  }

  return {
    updatedProducts,
    message: "⚠️ Could not apply suggestion (product not found)",
  };
}

/**
 * Log feedback for AI improvement
 * This helps train the system over time
 */
export function logSuggestionFeedback(
  suggestion: AISuggestion,
  feedback: "accepted" | "rejected" | "ignored",
): void {
  const feedbackLog = {
    suggestionId: suggestion.id,
    type: suggestion.type,
    feedback,
    confidence: suggestion.confidence,
    timestamp: Date.now(),
  };

  // Store in localStorage for now (can migrate to Supabase/backend later)
  const existingFeedback = localStorage.getItem("suggestionFeedback");
  const feedbackArray = existingFeedback ? JSON.parse(existingFeedback) : [];
  feedbackArray.push(feedbackLog);

  // Keep only last 100 feedback entries
  if (feedbackArray.length > 100) {
    feedbackArray.shift();
  }

  localStorage.setItem("suggestionFeedback", JSON.stringify(feedbackArray));

  console.log(
    `📊 Feedback logged: ${suggestion.title} → ${feedback} (confidence: ${suggestion.confidence})`,
  );
}
