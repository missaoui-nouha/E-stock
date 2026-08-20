const BASE_URL = "http://localhost:8000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detail;
    try {
      detail = await res.json();
    } catch {
      detail = { detail: res.statusText };
    }
    const error = new Error("Erreur API");
    error.detail = detail;
    throw error;
  }
  if (res.status === 204) return null;
  return res.json();
}

// Products
export const getProducts = (params = "") => request(`/products/${params}`);
export const createProduct = (data) =>
  request("/products/", { method: "POST", body: JSON.stringify(data) });
export const updateProduct = (id, data) =>
  request(`/products/${id}/`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProduct = (id) =>
  request(`/products/${id}/`, { method: "DELETE" });

// Categories
export const getCategories = (params = "") => request(`/categories/${params}`);
export const createCategory = (data) =>
  request("/categories/", { method: "POST", body: JSON.stringify(data) });
export const updateCategory = (id, data) =>
  request(`/categories/${id}/`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCategory = (id) =>
  request(`/categories/${id}/`, { method: "DELETE" });

// Stats
export const getStats = () => request("/stats/");
