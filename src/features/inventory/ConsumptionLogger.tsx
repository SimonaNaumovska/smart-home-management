import type { Product, User } from "../../types/Product";
import { useConsumptionLogger } from "./useConsumptionLogger";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";

interface ConsumptionLoggerProps {
  products: Product[];
  activeUser: User | null;
  onLogConsumption: (productId: string, amount: number) => void;
}

export function ConsumptionLogger({
  products,
  activeUser,
  onLogConsumption,
}: ConsumptionLoggerProps) {
  const {
    selectedProduct,
    amount,
    foodProducts,
    selectedProductData,
    setSelectedProduct,
    setAmount,
    handleLog,
  } = useConsumptionLogger({ products, onLogConsumption });

  return (
    <Card
      sx={{
        mb: 3,
        borderColor: "secondary.main",
        borderWidth: 2,
        borderStyle: "solid",
      }}
    >
      <CardContent>
        <Typography variant="h5" component="h2" color="secondary" gutterBottom>
          🍽️ Log Food Consumption
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Track what you eat - inventory updates automatically
        </Typography>

        {!activeUser ? (
          <Alert severity="error">
            ⚠️ Please select an active user to log consumption
          </Alert>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Chip
              avatar={
                <span style={{ fontSize: "1.5rem", marginLeft: "8px" }}>
                  {activeUser.avatar}
                </span>
              }
              label={`${activeUser.name} is eating...`}
              sx={{
                bgcolor: activeUser.color,
                color: "white",
                fontWeight: "bold",
                fontSize: "1rem",
                py: 2.5,
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Select Food Item</InputLabel>
              <Select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                label="Select Food Item"
              >
                <MenuItem value="">Select Food Item</MenuItem>
                {foodProducts.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} ({product.quantity} {product.unit} available)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedProductData && (
              <TextField
                fullWidth
                type="number"
                label={`Amount (${selectedProductData.unit})`}
                placeholder={`Amount (${selectedProductData.unit})`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                variant="outlined"
              />
            )}

            <Button
              onClick={handleLog}
              disabled={!selectedProduct || !amount}
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
            >
              Log Consumption
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
