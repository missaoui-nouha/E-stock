import { useCallback, useEffect, useState } from "react";
import ProductsPage from "./components/ProductsPage.jsx";
import CategoriesPage from "./components/CategoriesPage.jsx";
import { getStats } from "./api.js";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("products");
  const [stats, setStats] = useState(null);

  const refreshStats = useCallback(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <h1>
            <span className="logo">📦</span> Gestion de Stock
          </h1>
          <nav>
            <button
              className={tab === "products" ? "nav-btn active" : "nav-btn"}
              onClick={() => setTab("products")}
            >
              Produits
            </button>
            <button
              className={tab === "categories" ? "nav-btn active" : "nav-btn"}
              onClick={() => setTab("categories")}
            >
              Catégories
            </button>
          </nav>
        </div>
      </header>

      {stats && (
        <section className="stats">
          <div className="stat-card">
            <span className="stat-value">{stats.total_products}</span>
            <span className="stat-label">Produits</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.total_categories}</span>
            <span className="stat-label">Catégories</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.total_quantity}</span>
            <span className="stat-label">Unités en stock</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {Number(stats.total_value).toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </span>
            <span className="stat-label">Valeur du stock</span>
          </div>
          <div className={`stat-card ${stats.low_stock_count > 0 ? "alert" : ""}`}>
            <span className="stat-value">{stats.low_stock_count}</span>
            <span className="stat-label">Stock bas</span>
          </div>
        </section>
      )}

      <main className="content">
        {tab === "products" ? (
          <ProductsPage onDataChange={refreshStats} />
        ) : (
          <CategoriesPage onDataChange={refreshStats} />
        )}
      </main>
    </div>
  );
}
