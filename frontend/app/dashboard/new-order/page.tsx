"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Plus, Trash2 } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface OrderItem {
  productId: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function NewOrderPage() {
  // catálogo de productos
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // pedido actual
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // form de nuevo producto
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");

  // cantidades temporales por producto (para el input de Cant.)
  const [productQuantities, setProductQuantities] = useState<
    Record<number, string>
  >({});

  useEffect(() => {
    void fetchProducts();
  }, []);

  // 🔹 Traer productos desde el backend
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

  // 🔹 Crear producto en BD (tabla Product)
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

  // 🔹 Agregar producto a la orden
  const addProductToOrder = (product: Product) => {
    const qtyStr = productQuantities[product.id] ?? "1";
    let quantity = Number.parseInt(qtyStr, 10);
    if (!quantity || quantity < 1) quantity = 1;

    // (Opcional) limitar por stock
    if (quantity > product.stock) {
      quantity = product.stock;
    }

    if (quantity <= 0) {
      setMessage("No hay stock disponible para este producto.");
      return;
    }

    setOrderItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity,
        },
      ];
    });

    // opcional: resetear cantidad a 1
    setProductQuantities((prev) => ({ ...prev, [product.id]: "1" }));
  };

  const removeOrderItem = (productId: number) => {
    setOrderItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateOrderQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeOrderItem(productId);
    } else {
      setOrderItems((prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        ),
      );
    }
  };

  const totalPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // 🔹 Generar pedido (Order + OrderItem en BD)
  const handleGenerateOrder = async () => {
    if (!tableNumber.trim()) {
      setMessage("Por favor ingresa el número de mesa.");
      return;
    }
    if (orderItems.length === 0) {
      setMessage("Agrega al menos un producto al pedido.");
      return;
    }

    const mesa = Number.parseInt(tableNumber, 10);
    if (Number.isNaN(mesa) || mesa <= 0) {
      setMessage("Número de mesa inválido.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: mesa,
          items: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          paymentMethod: "cash",
          notes: customerNotes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al crear pedido");
      }

      setMessage("Pedido generado y enviado a cocina ✅");
      setTableNumber("");
      setCustomerNotes("");
      setOrderItems([]);

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error al registrar pedido. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit =
    !isLoading && orderItems.length > 0 && tableNumber.trim().length > 0;

  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8">
        <h1 className="text-3xl font-bold text-[#3d3330] mb-6">
          REGISTRAR PEDIDO
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* IZQUIERDA: Agregar producto + listado de productos */}
          <div className="lg:col-span-2 space-y-6">

            {/* Listado de productos (con scroll y altura fija para ~10 filas) */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-bold text-[#3d3330] mb-4">
                Productos registrados
              </h2>

              {productsLoading ? (
                <p className="text-[#8b6f47] text-sm">Cargando productos...</p>
              ) : products.length === 0 ? (
                <p className="text-[#8b6f47] text-sm">
                  Aún no hay productos registrados.
                </p>
              ) : (
                <div className="max-h-96 overflow-y-auto border border-[#e8dfd5] rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f5ede0] sticky top-0">
                      <tr>
                        <th className="text-left py-2 px-2 font-semibold text-[#3d3330]">
                          Producto
                        </th>
                        <th className="text-left py-2 px-2 font-semibold text-[#3d3330]">
                          Categoría
                        </th>
                        <th className="text-right py-2 px-2 font-semibold text-[#3d3330]">
                          Precio
                        </th>
                        <th className="text-center py-2 px-2 font-semibold text-[#3d3330]">
                          Stock
                        </th>
                        <th className="text-center py-2 px-2 font-semibold text-[#3d3330]">
                          Cant.
                        </th>
                        <th className="text-center py-2 px-2 font-semibold text-[#3d3330]">
                          +
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr
                          key={p.id}
                          className="border-t border-[#e8dfd5] hover:bg-[#fef9f3]"
                        >
                          <td className="py-2 px-2 text-[#3d3330]">
                            {p.name}
                          </td>
                          <td className="py-2 px-2 text-[#8b6f47]">
                            {p.category}
                          </td>
                          <td className="py-2 px-2 text-right text-[#3d3330]">
                            S/.{p.price.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-center text-[#3d3330]">
                            {p.stock}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min={1}
                              value={productQuantities[p.id] ?? "1"}
                              onChange={(e) =>
                                setProductQuantities((prev) => ({
                                  ...prev,
                                  [p.id]: e.target.value,
                                }))
                              }
                              className="w-14 px-2 py-1 border border-[#d4a574] rounded text-center text-xs"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => addProductToOrder(p)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#d97706] text-white hover:bg-[#b94f0f]"
                            >
                              <Plus size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* DERECHA: Mesa + productos del pedido + generar pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow sticky top-6">
              {/* Mesa arriba de productos del pedido */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#3d3330] mb-2">
                  Mesa
                </label>
                <input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Número de mesa"
                  className="w-full px-4 py-2 border-2 border-[#d4a574] rounded bg-[#fef9f3] text-[#3d3330] focus:outline-none focus:border-[#d97706]"
                />
              </div>

              <h2 className="text-lg font-bold text-[#3d3330] mb-3">
                Productos del pedido
              </h2>

              {/* Rectángulo fijo con scroll si hay muchos productos */}
              {orderItems.length === 0 ? (
                <div className="border border-[#e8dfd5] rounded mb-4 h-40 flex items-center justify-center">
                  <p className="text-[#8b6f47] text-sm">
                    No hay productos agregados.
                  </p>
                </div>
              ) : (
                <div className="border border-[#e8dfd5] rounded mb-4 max-h-40 overflow-y-auto">
                  <div className="space-y-2 p-3">
                    {orderItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between items-center bg-[#fef9f3] rounded px-2 py-2"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-[#3d3330] text-sm">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#8b6f47]">
                            {item.category} · S/.
                            {item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateOrderQuantity(
                                item.productId,
                                Number.parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-10 px-1 py-1 border border-[#d4a574] rounded text-center text-xs"
                          />
                          <button
                            onClick={() =>
                              removeOrderItem(item.productId)
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t-2 border-[#d4a574] pt-3 mb-4">
                <p className="text-[#3d3330] font-bold">
                  Total: S/.{totalPrice.toFixed(2)}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#3d3330] mb-2">
                  Notas del cliente
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#d4a574] rounded bg-[#fef9f3] text-[#3d3330] text-sm focus:outline-none focus:border-[#d97706]"
                  rows={3}
                />
              </div>

              {message && (
                <div
                  className={`p-3 rounded text-sm mb-4 ${
                    message.includes("Error")
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                onClick={handleGenerateOrder}
                disabled={!canSubmit}
                className="w-full bg-[#d97706] hover:bg-[#b94f0f] text-white font-bold py-2 rounded disabled:opacity-50"
              >
                {isLoading
                  ? "Generando pedido..."
                  : "[GENERAR PEDIDO / ENVIAR A COCINA]"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
