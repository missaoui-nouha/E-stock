import { useState } from "react";

export default function ProductForm({ product, categories, onSave, onCancel }) {
  const [form, setForm] = useState({
    reference: product?.reference ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "",
    price: product?.price ?? "",
    quantity: product?.quantity ?? 0,
    min_quantity: product?.min_quantity ?? 5,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await onSave({
        ...form,
        category: form.category || null,
        price: form.price || 0,
        quantity: Number(form.quantity) || 0,
        min_quantity: Number(form.min_quantity) || 0,
      });
    } catch (err) {
      setErrors(err.detail || { detail: "Erreur lors de l'enregistrement." });
    } finally {
      setSaving(false);
    }
  }

  function fieldError(name) {
    return errors[name] ? <span className="field-error">{errors[name]}</span> : null;
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{product ? "Modifier le produit" : "Nouveau produit"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Référence *
              <input
                required
                value={form.reference}
                onChange={(e) => set("reference", e.target.value)}
                placeholder="ex: PC-001"
              />
              {fieldError("reference")}
            </label>
            <label>
              Nom *
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Nom du produit"
              />
              {fieldError("name")}
            </label>
          </div>

          <label>
            Description
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>

          <div className="form-row">
            <label>
              Catégorie
              <select
                value={form.category ?? ""}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="">— Aucune —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Prix (€) *
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
              {fieldError("price")}
            </label>
          </div>

          <div className="form-row">
            <label>
              Quantité
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
              />
              {fieldError("quantity")}
            </label>
            <label>
              Seuil d'alerte
              <input
                type="number"
                min="0"
                value={form.min_quantity}
                onChange={(e) => set("min_quantity", e.target.value)}
              />
              {fieldError("min_quantity")}
            </label>
          </div>

          {errors.detail && <p className="error-banner">{errors.detail}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
