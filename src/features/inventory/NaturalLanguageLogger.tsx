import type { Product } from "../../types/Product";
import { useNaturalLanguageLogger } from "./useNaturalLanguageLogger";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MicIcon from "@mui/icons-material/Mic";

interface NaturalLanguageLoggerProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onConsumeProduct: (productId: string, amount: number) => void;
}

export function NaturalLanguageLogger({
  products,
  onAddProduct,
  onUpdateProduct,
  onConsumeProduct,
}: NaturalLanguageLoggerProps) {
  const {
    input,
    suggestion,
    loading,
    error,
    setInput,
    handleParse,
    handleAccept,
    handleReject,
  } = useNaturalLanguageLogger({
    products,
    onAddProduct,
    onUpdateProduct,
    onConsumeProduct,
  });

  const getActionLabel = (action: string): string => {
    switch (action) {
      case "add":
        return "➕ Add new product";
      case "update":
        return "📝 Update existing product";
      case "consume":
        return "📉 Log consumption";
      default:
        return "Process";
    }
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case "add":
        return "#4CAF50";
      case "update":
        return "#2196F3";
      case "consume":
        return "#FF9800";
      default:
        return "#666";
    }
  };

  return (
    <Card sx={{ mb: 3, bgcolor: "grey.50" }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
        >
          🗣️ Quick Input
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Say what you bought or used: "I bought 10 eggs", "Used 500ml milk",
          "Bought 2L detergent"
        </Typography>

        {/* Input Field */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleParse();
              }
            }}
            placeholder="e.g., I bought 10 eggs..."
            variant="outlined"
          />
          <Button
            onClick={handleParse}
            disabled={loading || !input.trim()}
            variant="contained"
            color="warning"
            startIcon={<MicIcon />}
            sx={{ whiteSpace: "nowrap" }}
          >
            {loading ? "Parsing..." : "Parse"}
          </Button>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* AI Suggestion */}
        {suggestion && (
          <Card
            variant="outlined"
            sx={{
              borderWidth: 2,
              borderColor: getActionColor(suggestion.action),
              mb: 2,
            }}
          >
            <CardContent>
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  mb: 1.5,
                }}
              >
                <Box>
                  <Typography variant="h6" component="h4" sx={{ mb: 0.5 }}>
                    {getActionLabel(suggestion.action)}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {suggestion.quantity} {suggestion.unit} of{" "}
                    <Box
                      component="span"
                      sx={{ color: getActionColor(suggestion.action) }}
                    >
                      {suggestion.productName}
                    </Box>
                  </Typography>
                </Box>
                <Chip
                  label={`${suggestion.confidence}% sure`}
                  sx={{
                    bgcolor: getActionColor(suggestion.action),
                    color: "white",
                    fontWeight: "bold",
                  }}
                />
              </Box>

              {/* Details */}
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  mb: 1.5,
                }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Category:</strong> {suggestion.category}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Action:</strong> {getActionLabel(suggestion.action)}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontStyle="italic"
                >
                  <strong>Why:</strong> {suggestion.reasoning}
                </Typography>
              </Box>

              {/* Buttons */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  onClick={handleReject}
                  variant="contained"
                  color="error"
                  fullWidth
                >
                  ✕ Not Right
                </Button>
                <Button
                  onClick={handleAccept}
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: getActionColor(suggestion.action),
                    "&:hover": {
                      bgcolor: getActionColor(suggestion.action),
                      filter: "brightness(0.9)",
                    },
                  }}
                >
                  ✓ Yes, Update
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
