import { useState } from "react";
import type { Product } from "./types/Product";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("pcs");
  const [minStock, setMinStock] = useState(0);

  const addProduct = () => {
    if (!name) return;

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name,
      quantity,
      unit,
      minStock,
    };

    setProducts([...products, newProduct]);

    // reset form
    setName("");
    setQuantity(0);
    setUnit("pcs");
    setMinStock(0);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Smart Home Management</h1>

      <h2>Add Product</h2>

      <input
        type="text"
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <input
        type="text"
        placeholder="Unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
      />

      <input
        type="number"
        placeholder="Min stock"
        value={minStock}
        onChange={(e) => setMinStock(Number(e.target.value))}
      />

      <button onClick={addProduct}>Add</button>

      <h2>Products</h2>

      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} — {product.quantity} {product.unit}
            {product.quantity <= product.minStock && (
              <strong style={{ color: "red" }}> (Low stock!)</strong>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
