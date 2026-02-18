import type { Room } from "../../types/Product";
import { useProductForm } from "./useProductForm";
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

interface ProductFormProps {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  minStock: string;
  purchased: string;
  useBy: string;
  storage: string;
  toBuy: boolean;
  frequentlyUsed: boolean;
  rooms: Room[];
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onMinStockChange: (value: string) => void;
  onPurchasedChange: (value: string) => void;
  onUseByChange: (value: string) => void;
  onStorageChange: (value: string) => void;
  onToBuyChange: (value: boolean) => void;
  onFrequentlyUsedChange: (value: boolean) => void;
  onAddProduct: () => void;
}

export function ProductForm({
  name,
  category,
  quantity,
  unit,
  minStock,
  purchased,
  useBy,
  storage,
  toBuy,
  frequentlyUsed,
  rooms,
  onNameChange,
  onCategoryChange,
  onQuantityChange,
  onUnitChange,
  onMinStockChange,
  onPurchasedChange,
  onUseByChange,
  onStorageChange,
  onToBuyChange,
  onFrequentlyUsedChange,
  onAddProduct,
}: ProductFormProps) {
  const { storageLocations, categories } = useProductForm({ rooms });
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Add Product
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Item Name"
            placeholder="Item Name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              label="Category"
            >
              <MenuItem value="">Select Category</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Quantity"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Unit"
            placeholder="Unit"
            value={unit}
            onChange={(e) => onUnitChange(e.target.value)}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Min Stock Level"
            placeholder="Min Stock Level"
            value={minStock}
            onChange={(e) => onMinStockChange(e.target.value)}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Storage Location</InputLabel>
            <Select
              value={storage}
              onChange={(e) => onStorageChange(e.target.value)}
              label="Storage Location"
            >
              <MenuItem value="">Select Storage Location</MenuItem>
              {storageLocations.map((loc) => (
                <MenuItem key={loc} value={loc}>
                  {loc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Purchased"
            value={purchased}
            onChange={(e) => onPurchasedChange(e.target.value)}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Use By"
            value={useBy}
            onChange={(e) => onUseByChange(e.target.value)}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={toBuy}
                onChange={(e) => onToBuyChange(e.target.checked)}
              />
            }
            label="To Buy?"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={frequentlyUsed}
                onChange={(e) => onFrequentlyUsedChange(e.target.checked)}
              />
            }
            label="Frequently Used?"
          />
        </Grid>
      </Grid>

      <Button
        onClick={onAddProduct}
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        size="large"
      >
        Add
      </Button>
    </Box>
  );
}
