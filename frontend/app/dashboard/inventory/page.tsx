"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Plus, Search, Edit, Trash2, X, Save } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // form de nuevo producto
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");

  useEffect(() => {
    void fetchProducts();
  }, []);

  // 🔹 Obtener productos desde tu backend
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch(`${API_URL}/api/productos`);
      if (!res.ok) throw new Error("No se pudieron cargar los productos");
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setMessage("Error al cargar productos.");
    } finally {
      setProductsLoading(false);
    }
  };

  // 🔹 Crear producto (igual lógica que en NewOrderPage)
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!productName.trim() || !productPrice.trim() || !productStock.trim()) {
      setMessage("Nombre, precio y stock son obligatorios para el producto.");
      return;
    }

    const price = Number(productPrice);
    const stock = Number(productStock);

    if (Number.isNaN(price) || price <= 0) {
      setMessage("Precio inválido.");
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      setMessage("Stock inválido.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productName.trim(),
          category: productCategory.trim() || "Sin categoría",
          price,
          stock,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al crear producto");
      }

      const nuevo: Product = await res.json();
      // lo ponemos al inicio de la lista
      setProducts((prev) => [nuevo, ...prev]);

      // limpiamos formulario
      setProductName("");
      setProductCategory("");
      setProductPrice("");
      setProductStock("");

      setMessage("Producto agregado correctamente ✅");
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error(err);
      setMessage("Error al guardar el producto.");
    }
  };

  // 🔹 Eliminar producto
  const handleDeleteProduct = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const res = await fetch(`${API_URL}/api/productos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar");

      setMessage("Producto eliminado correctamente");
      fetchProducts();
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error(error);
      setMessage("Error al eliminar producto");
    }
  };

  // 🔹 Editar producto
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch(`${API_URL}/api/productos/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProduct.name,
          category: editingProduct.category,
          price: editingProduct.price,
          stock: editingProduct.stock,
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      setMessage("Producto actualizado correctamente");
      setEditingProduct(null);
      fetchProducts();
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error(error);
      setMessage("Error al actualizar producto");
    }
  };


  // 🔹 Status visual según stock (tu pill OK / BAJO)
  const getStatus = (stock: number) => {
    if (stock <= 0) return "sin_stock";
    if (stock <= 5) return "bajo";
    return "ok";
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8">
        <h1 className="mb-6 text-3xl font-bold text-[#3d3330]">
          INVENTARIO GENERAL
        </h1>

        {/* Mensajes */}
        {message && (
          <div
            className={`mb-4 rounded p-3 text-sm ${message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
              }`}
          >
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 👉 IZQUIERDA: Lista de productos + buscador */}
          <div className="lg:col-span-2 space-y-4">
            {/* Buscador */}
            <div className="rounded-lg bg-white p-4 shadow">
              <div className="relative max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-2.5 text-[#8b6f47]"
                  size={18}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar producto por nombre..."
                  className="w-full rounded border-2 border-[#d4a574] bg-[#fef9f3] py-2 pl-9 pr-3 text-sm text-[#3d3330] focus:border-[#d97706] focus:outline-none"
                />
              </div>
            </div>

            {/* Tabla de inventario */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-bold text-[#3d3330]">
                Productos en inventario
              </h2>

              {productsLoading ? (
                <p className="text-sm text-[#8b6f47]">
                  Cargando productos...
                </p>
              ) : filteredProducts.length === 0 ? (
                <p className="text-sm text-[#8b6f47]">
                  No hay productos registrados o no coinciden con la búsqueda.
                </p>
              ) : (
                <div className="max-h-[420px] overflow-y-auto border border-[#e8dfd5] rounded">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#f5ede0]">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-[#3d3330]">
                          Producto
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-[#3d3330]">
                          Categoría
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-[#3d3330]">
                          Precio
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-[#3d3330]">
                          Stock
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-[#3d3330]">
                          Estado
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-[#3d3330]">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => {
                        const status = getStatus(p.stock);
                        return (
                          <tr
                            key={p.id}
                            className="border-t border-[#e8dfd5] hover:bg-[#fef9f3]"
                          >
                            <td className="px-3 py-2 text-[#3d3330]">
                              {p.name}
                            </td>
                            <td className="px-3 py-2 text-[#8b6f47]">
                              {p.category}
                            </td>
                            <td className="px-3 py-2 text-right text-[#3d3330]">
                              S/.{p.price.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-center text-[#3d3330]">
                              {p.stock}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span
                                className={`rounded px-3 py-1 text-xs font-bold ${status === "ok"
                                  ? "bg-green-100 text-green-700"
                                  : status === "bajo"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                  }`}
                              >
                                {status === "ok"
                                  ? "OK"
                                  : status === "bajo"
                                    ? "BAJO"
                                    : "SIN STOCK"}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center flex justify-center gap-2">
                              <button
                                onClick={() => setEditingProduct(p)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 👉 DERECHA: Formulario para crear producto */}
          <div>
            <div className="sticky top-6 rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-bold text-[#3d3330]">
                Agregar producto
              </h2>

              <form
                onSubmit={handleCreateProduct}
                className="grid grid-cols-1 gap-3"
              >
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3d3330]">
                    Producto
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Nombre del producto"
                    className="w-full rounded border border-[#d4a574] bg-[#fef9f3] px-3 py-2 text-sm text-[#3d3330]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3d3330]">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    placeholder="Ej: Bebida"
                    className="w-full rounded border border-[#d4a574] bg-[#fef9f3] px-3 py-2 text-sm text-[#3d3330]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3d3330]">
                    Precio (S/.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full rounded border border-[#d4a574] bg-[#fef9f3] px-3 py-2 text-sm text-[#3d3330]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#3d3330]">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    className="w-full rounded border border-[#d4a574] bg-[#fef9f3] px-3 py-2 text-sm text-[#3d3330]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 inline-flex items-center gap-2 rounded bg-[#d97706] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b94f0f]"
                >
                  <Plus size={16} />
                  Agregar producto
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Modal de Edición */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
              <div className="bg-[#3d3330] p-4 text-white flex justify-between items-center rounded-t-lg">
                <h3 className="font-bold text-lg">Editar Producto</h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="hover:bg-white/20 p-1 rounded"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#3d3330] mb-1">Nombre</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#d4a574] rounded focus:outline-none focus:ring-2 focus:ring-[#d97706]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3d3330] mb-1">Categoría</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#d4a574] rounded focus:outline-none focus:ring-2 focus:ring-[#d97706]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3d3330] mb-1">Precio</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-[#d4a574] rounded focus:outline-none focus:ring-2 focus:ring-[#d97706]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3d3330] mb-1">Stock</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stock: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-[#d4a574] rounded focus:outline-none focus:ring-2 focus:ring-[#d97706]"
                      required
                    />
                  </div>
                </div>
                <div className="pt-2 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#d97706] text-white rounded hover:bg-[#b94f0f] flex items-center gap-2"
                  >
                    <Save size={18} /> Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
