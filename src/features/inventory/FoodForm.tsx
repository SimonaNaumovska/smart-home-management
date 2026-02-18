import type { Room } from "../../types/Product";
import { useFoodForm } from "./useFoodForm";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

interface FoodFormProps {
  name: string;
  quantity: string;
  unit: string;
  minStock: string;
  purchased: string;
  useBy: string;
  storage: string;
  frequentlyUsed: boolean;
  toBuy: boolean;
  rooms: Room[];
  onNameChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onMinStockChange: (value: string) => void;
  onPurchasedChange: (value: string) => void;
  onUseByChange: (value: string) => void;
  onStorageChange: (value: string) => void;
  onFrequentlyUsedChange: (value: boolean) => void;
  onToBuyChange: (value: boolean) => void;
  onAddProduct: () => void;
}

export function FoodForm({
  name,
  quantity,
  unit,
  minStock,
  purchased,
  useBy,
  storage,
  frequentlyUsed,
  toBuy,
  rooms,
  onNameChange,
  onQuantityChange,
  onUnitChange,
  onMinStockChange,
  onPurchasedChange,
  onUseByChange,
  onStorageChange,
  onFrequentlyUsedChange,
  onToBuyChange,
  onAddProduct,
}: FoodFormProps) {
  const { storageLocations, foodUnits } = useFoodForm({ rooms });
  return (
    <Box className="compact-form food-form">
      <Box className="form-header" sx={{ mb: 3 }}>
        <Typography variant="h5" component="h3">
          🥗 Add Food Item
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Row 1: Item Name, Quantity, Unit, Min Stock */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Item Name"
            placeholder="Enter item name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <TextField
            fullWidth
            type="number"
            label="Quantity"
            placeholder="0"
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <FormControl fullWidth>
            <InputLabel>Unit</InputLabel>
            <Select
              value={unit}
              onChange={(e) => onUnitChange(e.target.value)}
              label="Unit"
            >
              <MenuItem value="">Select</MenuItem>
              {foodUnits.map((u) => (
                <MenuItem key={u} value={u}>
                  {u}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <TextField
            fullWidth
            type="number"
            label="Min Stock"
            placeholder="0"
            value={minStock}
            onChange={(e) => onMinStockChange(e.target.value)}
            variant="outlined"
          />
        </Grid>

        {/* Row 2: Storage Location, Purchase Date, Expiry Date */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Storage Location</InputLabel>
            <Select
              value={storage}
              onChange={(e) => onStorageChange(e.target.value)}
              label="Storage Location"
            >
              <MenuItem value="">Select location</MenuItem>
              {storageLocations.map((loc) => (
                <MenuItem key={loc} value={loc}>
                  {loc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="date"
            label="Purchase Date"
            value={purchased}
            onChange={(e) => onPurchasedChange(e.target.value)}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="date"
            label="Expiry Date"
            value={useBy}
            onChange={(e) => onUseByChange(e.target.value)}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Row 3: Checkboxes */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={frequentlyUsed}
                  onChange={(e) => onFrequentlyUsedChange(e.target.checked)}
                />
              }
              label="Frequently Used"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={toBuy}
                  onChange={(e) => onToBuyChange(e.target.checked)}
                />
              }
              label="Add to Shopping List"
            />
          </Box>
        </Grid>
      </Grid>

      <Button
        onClick={onAddProduct}
        variant="contained"
        color="success"
        className="form-submit food"
        fullWidth
        sx={{ mt: 3 }}
        size="large"
      >
        Add Food Item
      </Button>
    </Box>
  );
}
