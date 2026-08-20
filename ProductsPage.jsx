import { useCallback, useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../api.js";
import ProductForm from "./ProductForm.jsx";

export default function ProductsPage({ onDataChange }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | product object
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      if (lowStockOnly) params.set("low_stock", "true");
      const qs = params.toString() ? `?${params.toString()}` : "";
      setProducts(await getProducts(qs));
      setError("");
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez que le backend est lancé.");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, lowStockOnly]);

  useEffect(() => {
    const t = setTimeout(load, 300); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  async function handleSave(data) {
    if (editing === "new") {
      await createProduct(data);
    } else {
      await updateProduct(editing.id, data);
    }
    setEditing(null);
    await load();
    onDataChange();
  }

  async function handleDelete(product) {
    if (!window.confirm(`Supprimer le produit "${product.name}" ?`)) return;
    await deleteProduct(product.id);
    await load();
    onDataChange();
  }

  return (
    <div>
      <div className="toolbar">
        <input
          type="search"
          className="search-input"
          placeholder="Rechercher par nom, référence, catégorie…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
          />
          Stock bas uniquement
        </label>
        <button className="btn primary" onClick={() => setEditing("new")}>
          + Nouveau produit
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="muted">Chargement…</p>
      ) : products.length === 0 ? (
        <p className="muted">Aucun produit trouvé.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th className="num">Prix</th>
              <th className="num">Quantité</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="mono">{p.reference}</td>
                <td>{p.name}</td>
                <td>{p.category_name || <span className="muted">—</span>}</td>
                <td className="num">
                  {Number(p.price).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  €
                </td>
                <td className="num">{p.quantity}</td>
                <td>
                  {p.quantity === 0 ? (
                    <span className="badge danger">Rupture</span>
                  ) : p.is_low_stock ? (
                    <span className="badge warning">Stock bas</span>
                  ) : (
                    <span className="badge ok">En stock</span>
                  )}
                </td>
                <td className="actions">
                  <button className="btn small" onClick={() => setEditing(p)}>
                    Modifier
                  </button>
                  <button
                    className="btn small danger-outline"
                    onClick={() => handleDelete(p)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing !== null && (
        <ProductForm
          product={editing === "new" ? null : editing}
          categories={categories}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
