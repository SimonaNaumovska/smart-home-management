import type {
  AISuggestion,
  Product,
  ChoreDefinition,
  ConsumptionLog,
} from "../../types/Product";
import { useSuggestionsPanel } from "./useSuggestionsPanel";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Chip from "@mui/material/Chip";
import RefreshIcon from "@mui/icons-material/Refresh";

interface SuggestionsPanelProps {
  products: Product[];
  chores: ChoreDefinition[];
  consumptionLogs: ConsumptionLog[];
  onProductUpdate: (product: Product) => void;
}

export function SuggestionsPanel({
  products,
  chores,
  consumptionLogs,
  onProductUpdate,
}: SuggestionsPanelProps) {
  const {
    suggestions,
    loading,
    error,
    pendingSuggestions,
    handleAccept,
    handleReject,
    handleIgnore,
    refreshSuggestions,
    getSuggestionIcon,
    getConfidenceColor,
  } = useSuggestionsPanel({
    products,
    chores,
    consumptionLogs,
    onProductUpdate,
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 0.5 }}>
            🤖 AI Smart Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered suggestions you control
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          onClick={refreshSuggestions}
          disabled={loading}
          startIcon={<RefreshIcon />}
        >
          {loading ? "⏳ Loading..." : "Refresh Insights"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!error && !import.meta.env.VITE_GROQ_API_KEY && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Setup needed</AlertTitle>
          Add your Groq API key to <code>.env.local</code> as{" "}
          <code>VITE_GROQ_API_KEY</code>
        </Alert>
      )}

      {pendingSuggestions.length === 0 && !loading && (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
            bgcolor: "grey.50",
            borderRadius: 2,
          }}
        >
          {suggestions.length > 0 ? (
            <>
              <Typography variant="body1" color="text.secondary">
                ✅ You've reviewed all suggestions!
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                Click "Refresh Insights" for new suggestions
              </Typography>
            </>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No suggestions yet. Check back later!
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: "grid", gap: 2 }}>
        {pendingSuggestions.map((suggestion) => (
          <Card key={suggestion.id} variant="outlined">
            <CardContent>
              {/* Header with icon and title */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>
                      {getSuggestionIcon(suggestion.type)}
                    </span>
                    {suggestion.title}
                  </Typography>
                </Box>
                <Chip
                  label={`${suggestion.confidence}% confidence`}
                  size="small"
                  sx={{
                    bgcolor: getConfidenceColor(suggestion.confidence),
                    color: "white",
                    fontWeight: "bold",
                  }}
                />
              </Box>

              {/* Description */}
              <Typography variant="body1" sx={{ mb: 2 }}>
                {suggestion.description}
              </Typography>

              {/* Reasoning */}
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Why:</strong> {suggestion.reasoning}
              </Alert>

              {/* Action Buttons */}
              <Box
                sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}
              >
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleReject(suggestion)}
                  size="small"
                >
                  ✕ Not helpful
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => handleIgnore(suggestion)}
                  size="small"
                >
                  ⊘ Ignore
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAccept(suggestion)}
                  size="small"
                >
                  ✓ Accept & Apply
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
