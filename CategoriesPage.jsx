import { useCallback, useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api.js";

export default function CategoriesPage({ onDataChange }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | category
  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : "";
      setCategories(await getCategories(qs));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  function openForm(category) {
    setEditing(category);
    setErrors({});
    setForm(
      category === "new"
        ? { name: "", description: "" }
        : { name: category.name, description: category.description }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing === "new") {
        await createCategory(form);
      } else {
        await updateCategory(editing.id, form);
      }
      setEditing(null);
      await load();
      onDataChange();
    } catch (err) {
      setErrors(err.detail || { detail: "Erreur lors de l'enregistrement." });
    }
  }

  async function handleDelete(category) {
    if (
      !window.confirm(
        `Supprimer la catégorie "${category.name}" ? Les produits associés ne seront pas supprimés.`
      )
    )
      return;
    await deleteCategory(category.id);
    await load();
    onDataChange();
  }

  return (
    <div>
      <div className="toolbar">
        <input
          type="search"
          className="search-input"
          placeholder="Rechercher une catégorie…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn primary" onClick={() => openForm("new")}>
          + Nouvelle catégorie
        </button>
      </div>

      {loading ? (
        <p className="muted">Chargement…</p>
      ) : categories.length === 0 ? (
        <p className="muted">Aucune catégorie trouvée.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th className="num">Produits</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.description || <span className="muted">—</span>}</td>
                <td className="num">{c.product_count}</td>
                <td className="actions">
                  <button className="btn small" onClick={() => openForm(c)}>
                    Modifier
                  </button>
                  <button
                    className="btn small danger-outline"
                    onClick={() => handleDelete(c)}
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
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {editing === "new" ? "Nouvelle catégorie" : "Modifier la catégorie"}
            </h2>
            <form onSubmit={handleSubmit}>
              <label>
                Nom *
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </label>
              <label>
                Description
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              {errors.detail && <p className="error-banner">{errors.detail}</p>}
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setEditing(null)}>
                  Annuler
                </button>
                <button type="submit" className="btn primary">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
