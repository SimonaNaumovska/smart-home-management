import type { ConsumptionLog, User, Product } from "../../types/Product";

interface AISuggestionsProps {
  consumptionLogs: ConsumptionLog[];
  users: User[];
  products: Product[];
}

interface Suggestion {
  type: "correction" | "shopping" | "meal" | "pattern" | "waste";
  priority: "high" | "medium" | "low";
  icon: string;
  title: string;
  message: string;
}

export function AISuggestions({
  consumptionLogs,
  users,
  products,
}: AISuggestionsProps) {
  const suggestions: Suggestion[] = [];

  // 1. CORRECTIONS - Check for over-consumption
  const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
  const recentLogs = consumptionLogs.filter(
    (log) => log.timestamp >= last24Hours,
  );

  recentLogs.forEach((log) => {
    const product = products.find((p) => p.id === log.productId);
    if (product && log.amount > product.quantity + log.amount) {
      suggestions.push({
        type: "correction",
        priority: "high",
        icon: "⚠️",
        title: "Possible Over-Consumption",
        message: `${log.userName} logged ${log.amount} ${log.unit} of ${log.productName}, but only ${product.quantity} ${product.unit} was in stock. Please verify the entry.`,
      });
    }
  });

  // 2. SHOPPING SUGGESTIONS
  const shoppingList = products.filter((p) => p.toBuy);
  const lowStock = products.filter(
    (p) => p.quantity <= p.minStock && !p.toBuy && p.quantity > 0,
  );
  const outOfStock = products.filter((p) => p.quantity === 0);
  const frequentItems = products.filter(
    (p) => p.frequentlyUsed && p.quantity <= p.minStock * 1.5,
  );

  if (shoppingList.length > 0) {
    suggestions.push({
      type: "shopping",
      priority: "high",
      icon: "🛒",
      title: "Shopping List Ready",
      message: `You have ${shoppingList.length} items marked for shopping: ${shoppingList.map((p) => p.name).join(", ")}`,
    });
  }

  if (outOfStock.length > 0) {
    suggestions.push({
      type: "shopping",
      priority: "high",
      icon: "🚨",
      title: "Out of Stock Alert",
      message: `${outOfStock.length} items are completely out: ${outOfStock
        .slice(0, 3)
        .map((p) => p.name)
        .join(", ")}${outOfStock.length > 3 ? "..." : ""}`,
    });
  }

  if (lowStock.length > 0) {
    suggestions.push({
      type: "shopping",
      priority: "medium",
      icon: "📉",
      title: "Low Stock Warning",
      message: `${lowStock.length} items are running low: ${lowStock
        .slice(0, 3)
        .map((p) => p.name)
        .join(", ")}${lowStock.length > 3 ? "..." : ""}`,
    });
  }

  if (frequentItems.length > 0) {
    suggestions.push({
      type: "shopping",
      priority: "medium",
      icon: "⭐",
      title: "Restock Frequently Used Items",
      message: `Your frequently used items need restocking: ${frequentItems.map((p) => p.name).join(", ")}`,
    });
  }

  // 3. MEAL SUGGESTIONS based on available ingredients
  const foodProducts = products.filter((p) => p.category === "Food & Beverage");
  const availableIngredients = foodProducts
    .filter((p) => p.quantity > 0)
    .map((p) => p.name.toLowerCase());

  const mealSuggestions = generateMealSuggestions(availableIngredients);
  mealSuggestions.forEach((meal) => {
    suggestions.push({
      type: "meal",
      priority: "low",
      icon: "🍽️",
      title: `Meal Idea: ${meal.name}`,
      message: `You have: ${meal.ingredients.join(", ")}. ${meal.tip}`,
    });
  });

  // 4. CONSUMPTION PATTERNS - Detect anomalies
  const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyLogs = consumptionLogs.filter(
    (log) => log.timestamp >= last7Days,
  );

  // Group by product
  const productConsumption = new Map<string, number>();
  weeklyLogs.forEach((log) => {
    const current = productConsumption.get(log.productName) || 0;
    productConsumption.set(log.productName, current + log.amount);
  });

  // Detect high consumption
  productConsumption.forEach((amount, productName) => {
    const product = products.find((p) => p.name === productName);
    if (product && amount > product.minStock * 3) {
      suggestions.push({
        type: "pattern",
        priority: "low",
        icon: "📊",
        title: "High Consumption Detected",
        message: `${productName} usage is unusually high this week (${amount.toFixed(1)} ${product.unit}). Consider bulk buying to save money.`,
      });
    }
  });

  // User activity patterns
  users.forEach((user) => {
    const userLogs = weeklyLogs.filter((log) => log.userId === user.id);
    const foodLogs = userLogs.filter((log) => log.type === "food");
    const choreLogs = userLogs.filter((log) => log.type === "chore");

    if (choreLogs.length === 0 && users.length > 1) {
      suggestions.push({
        type: "pattern",
        priority: "low",
        icon: "🧹",
        title: "Chore Distribution",
        message: `${user.name} hasn't completed any chores this week. Consider redistributing household tasks.`,
      });
    }

    if (foodLogs.length > choreLogs.length * 5 && choreLogs.length > 0) {
      suggestions.push({
        type: "pattern",
        priority: "low",
        icon: "⚖️",
        title: "Activity Balance",
        message: `${user.name} logs consumption frequently but fewer chores. Household contribution seems unbalanced.`,
      });
    }
  });

  // 5. WASTE REDUCTION
  const today = new Date();
  const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const expiringSoon = foodProducts.filter((p) => {
    if (!p.useBy) return false;
    const expiryDate = new Date(p.useBy);
    return expiryDate >= today && expiryDate <= in3Days && p.quantity > 0;
  });

  const expiringThisWeek = foodProducts.filter((p) => {
    if (!p.useBy) return false;
    const expiryDate = new Date(p.useBy);
    return expiryDate > in3Days && expiryDate <= in7Days && p.quantity > 0;
  });

  if (expiringSoon.length > 0) {
    suggestions.push({
      type: "waste",
      priority: "high",
      icon: "🚨",
      title: "Use Immediately!",
      message: `${expiringSoon.map((p) => p.name).join(", ")} expire(s) in 3 days. Plan meals to use these items ASAP.`,
    });
  }

  if (expiringThisWeek.length > 0) {
    suggestions.push({
      type: "waste",
      priority: "medium",
      icon: "⏰",
      title: "Expiring This Week",
      message: `${expiringThisWeek.map((p) => p.name).join(", ")} expire(s) within 7 days. Use soon to avoid waste.`,
    });
  }

  // Detect items purchased long ago but unused
  const staleItems = foodProducts.filter((p) => {
    if (!p.purchased) return false;
    const purchasedDate = new Date(p.purchased);
    const daysSincePurchase =
      (today.getTime() - purchasedDate.getTime()) / (1000 * 60 * 60 * 24);
    const isUnused = !consumptionLogs.some((log) => log.productId === p.id);
    return daysSincePurchase > 14 && isUnused && p.quantity > 0;
  });

  if (staleItems.length > 0) {
    suggestions.push({
      type: "waste",
      priority: "low",
      icon: "🗂️",
      title: "Forgotten Items",
      message: `${staleItems.map((p) => p.name).join(", ")} purchased over 2 weeks ago but never used. Check if still good.`,
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );

  const typeColors = {
    correction: "#f44336",
    shopping: "#FF9800",
    meal: "#4CAF50",
    pattern: "#2196F3",
    waste: "#9C27B0",
  };

  const priorityBorders = {
    high: "3px solid",
    medium: "2px solid",
    low: "1px solid",
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "28px" }}>🤖 AI Smart Suggestions</h2>
        <span
          style={{
            fontSize: "14px",
            padding: "4px 12px",
            backgroundColor: "#E8F5E9",
            color: "#2E7D32",
            borderRadius: "12px",
            fontWeight: "bold",
          }}
        >
          {suggestions.length} insights
        </span>
      </div>

      {suggestions.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            color: "#666",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✨</div>
          <h3>All systems optimal!</h3>
          <p>
            No suggestions at the moment. Keep tracking your household data.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              style={{
                padding: "20px",
                backgroundColor: "white",
                borderRadius: "12px",
                border: `${priorityBorders[suggestion.priority]} ${typeColors[suggestion.type]}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div style={{ fontSize: "32px", lineHeight: "1" }}>
                  {suggestion.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        color: typeColors[suggestion.type],
                      }}
                    >
                      {suggestion.title}
                    </h3>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        backgroundColor:
                          suggestion.priority === "high"
                            ? "#FFEBEE"
                            : suggestion.priority === "medium"
                              ? "#FFF3E0"
                              : "#E3F2FD",
                        color:
                          suggestion.priority === "high"
                            ? "#C62828"
                            : suggestion.priority === "medium"
                              ? "#E65100"
                              : "#1565C0",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      {suggestion.priority}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "#555", lineHeight: "1.6" }}>
                    {suggestion.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to generate meal suggestions
function generateMealSuggestions(
  availableIngredients: string[],
): { name: string; ingredients: string[]; tip: string }[] {
  const meals: { name: string; ingredients: string[]; tip: string }[] = [];

  // Define meal patterns
  const mealPatterns = [
    {
      name: "Pasta Dish",
      required: ["pasta", "spaghetti", "noodles"],
      optional: ["tomato", "cheese", "garlic", "olive oil"],
      tip: "Quick and easy comfort food!",
    },
    {
      name: "Stir Fry",
      required: ["rice"],
      optional: ["vegetables", "soy sauce", "chicken", "beef", "oil"],
      tip: "Perfect for using up vegetables.",
    },
    {
      name: "Sandwich",
      required: ["bread"],
      optional: ["cheese", "ham", "lettuce", "tomato", "mayo"],
      tip: "Quick lunch option.",
    },
    {
      name: "Salad",
      required: ["lettuce", "salad"],
      optional: ["tomato", "cucumber", "olive oil", "cheese"],
      tip: "Healthy and refreshing.",
    },
    {
      name: "Soup",
      required: ["broth", "stock"],
      optional: ["vegetables", "chicken", "noodles", "rice"],
      tip: "Warm and comforting.",
    },
    {
      name: "Eggs & Toast",
      required: ["eggs", "bread"],
      optional: ["butter", "cheese", "milk"],
      tip: "Classic breakfast or brunch.",
    },
  ];

  mealPatterns.forEach((pattern) => {
    const hasRequired = pattern.required.some((ingredient) =>
      availableIngredients.some((avail) => avail.includes(ingredient)),
    );

    if (hasRequired) {
      const foundIngredients = [
        ...pattern.required.filter((ingredient) =>
          availableIngredients.some((avail) => avail.includes(ingredient)),
        ),
        ...pattern.optional.filter((ingredient) =>
          availableIngredients.some((avail) => avail.includes(ingredient)),
        ),
      ];

      if (foundIngredients.length >= 2) {
        meals.push({
          name: pattern.name,
          ingredients: foundIngredients.slice(0, 4),
          tip: pattern.tip,
        });
      }
    }
  });

  return meals.slice(0, 3); // Return max 3 meal suggestions
}
