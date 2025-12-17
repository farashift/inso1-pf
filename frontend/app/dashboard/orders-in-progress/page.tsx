"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Plus, X, Search, ShoppingBag } from "lucide-react";

interface OrderItemData {
  productName: string;
  category: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  orderNumber: string;
  tableNumber: number;
  status: string;
  items: OrderItemData[];
  totalPrice: number;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function OrdersInProgressPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States para "Agregar Item"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [qtyInputs, setQtyInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    void fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Polling cada 5s
    return () => clearInterval(interval);
  }, []);

  // Cargar productos al abrir el modal si no están cargados
  useEffect(() => {
    if (isModalOpen && products.length === 0) {
      fetch(`${API_URL}/api/productos`)
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch((err) => console.error("Error loading products:", err));
    }
  }, [isModalOpen, products.length]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pedidos`);
      if (!response.ok) {
        console.error("Error al obtener pedidos");
        return;
      }
      const data: Order[] = await response.json();
      console.log("OrdersInProgressPage - Fetched ALL orders:", data);

      const activeOrders = data.filter(
        (o) => {
          const s = (o.status || "").toLowerCase().trim();
          return s === "pending" || s === "in-progress" || s === "ready";
        }
      );
      setOrders(activeOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await fetch(`${API_URL}/api/pedidos/${orderId}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      void fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleOpenAddModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setQtyInputs({});
    setSearchTerm("");
    setIsModalOpen(true);
  };

  const handleAddItem = async (product: Product) => {
    if (!selectedOrderId) return;
    const qty = parseInt(qtyInputs[product.id] || "1");
    if (qty <= 0) {
      alert("Cantidad inválida");
      return;
    }

    if (qty > product.stock) {
      alert("No hay suficiente stock");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/pedidos/${selectedOrderId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: product.id, quantity: qty }]
        }),
      });

      if (!res.ok) throw new Error("Error al agregar items");

      alert("Item agregado correctamente");
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert("Error al agregar items");
    }
  };

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && orders.length === 0) {
    return (
      <ProtectedLayout>
        <div className="p-6 md:p-8 text-center text-[#8b6f47]">
          Cargando...
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8 relative">
        <h1 className="text-3xl font-bold text-[#3d3330] mb-6">
          PEDIDOS EN PROCESO
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow">
            <p className="text-[#8b6f47]">No hay pedidos en proceso</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg p-6 shadow border border-[#e8dfd5] flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-[#3d3330]">
                        #{order.orderNumber}
                      </p>
                      {/* Botón para agregar más cosas */}
                      <button
                        onClick={() => handleOpenAddModal(order.id)}
                        className="bg-[#fef9f3] text-[#d97706] p-1 rounded-full border border-[#d4a574] hover:bg-[#d97706] hover:text-white transition-colors"
                        title="Agregar más items"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                    <p className="text-sm text-[#8b6f47]">
                      Mesa {order.tableNumber}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold text-white ${order.status === "pending"
                      ? "bg-yellow-600"
                      : order.status === "in-progress"
                        ? "bg-blue-600"
                        : order.status === "ready"
                          ? "bg-green-600"
                          : "bg-gray-600"
                      }`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="mb-4 pb-4 border-b-2 border-[#d4a574] flex-1 overflow-y-auto max-h-48">
                  <p className="text-sm font-bold text-[#3d3330] mb-2">
                    Productos:
                  </p>
                  <ul className="text-xs text-[#8b6f47] space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between border-b border-dashed border-[#e8dfd5] pb-1">
                        <span>{item.quantity} x {item.productName}</span>
                        <span className="font-semibold text-[#3d3330]">S/.{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center mb-4 pt-2">
                  <p className="font-bold text-[#3d3330]">
                    Total: S/.{order.totalPrice.toFixed(2)}
                  </p>
                </div>


                <div className="flex gap-2 mt-auto">
                  {order.status === "pending" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, "in-progress")
                      }
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm transition-colors shadow-sm"
                    >
                      EN PREPARACIÓN
                    </button>
                  )}
                  {order.status === "in-progress" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, "ready")
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-sm transition-colors shadow-sm"
                    >
                      LISTO
                    </button>
                  )}
                  {order.status === "ready" && (
                    <div className="flex-1 text-center text-xs font-bold text-green-700 bg-green-100 py-2 rounded border border-green-200">
                      ESPERANDO PAGO
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal para Agregar Items */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
              <div className="p-4 border-b flex justify-between items-center bg-[#3d3330] text-white rounded-t-lg">
                <h3 className="font-bold flex items-center gap-2">
                  <ShoppingBag size={18} /> Agregar Productos al Pedido
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 border-b bg-[#fef9f3]">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    className="w-full pl-9 pr-3 py-2 border rounded text-sm focus:outline-none focus:border-[#d97706]"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-white border p-3 rounded hover:bg-gray-50">
                    <div>
                      <p className="font-bold text-[#3d3330] text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">S/.{p.price.toFixed(2)} | Stock: {p.stock}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        className="w-12 text-center border rounded py-1 text-sm"
                        value={qtyInputs[p.id] || "1"}
                        onChange={e => setQtyInputs({ ...qtyInputs, [p.id]: e.target.value })}
                      />
                      <button
                        onClick={() => handleAddItem(p)}
                        className="bg-[#d97706] text-white p-2 rounded hover:bg-[#b94f0f]"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-4">No se encontraron productos</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedLayout>
  );
}
