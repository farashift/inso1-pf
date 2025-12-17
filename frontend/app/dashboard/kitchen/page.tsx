"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";

interface OrderItemData {
  productName: string;
  category: string;
  quantity: number;
}

interface Order {
  id: number;
  orderNumber: string;
  tableNumber: number;
  status: string;
  items: OrderItemData[];
  createdAt: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pedidos`);
      if (!response.ok) {
        console.error("Error al obtener pedidos");
        return;
      }
      const data: Order[] = await response.json();
      console.log("Fetched orders:", data);

      const filtrados = data.filter(
        (o) => {
          const s = (o.status || "").toLowerCase().trim();
          return s === "pending" || s === "in-progress";
        }
      );
      setOrders(filtrados);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );

    try {
      await fetch(`${API_URL}/api/pedidos/${orderId}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      void fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      // Rollback if needed, but fetchOrders usually corrects it
      void fetchOrders();
    }
  };

  if (isLoading) {
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
      <div className="p-6 md:p-8">
        <h1 className="text-3xl font-bold text-[#3d3330] mb-6">
          PEDIDOS EN COCINA
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-[#8b6f47]">No hay pedidos pendientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isPending = order.status === "pending";
              const isInProgress = order.status === "in-progress";

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-lg p-6 shadow border-l-4 ${isPending
                    ? "border-green-500" // pedido nuevo bien resaltado
                    : "border-blue-500"
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xl font-bold text-[#3d3330]">
                        #{order.orderNumber} · Mesa {order.tableNumber}
                      </p>
                      <p className="text-xs text-[#8b6f47]">
                        {new Date(order.createdAt).toLocaleTimeString("es-PE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {order.items.map((item) => item.category).join(", ")}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold text-white ${isPending
                        ? "bg-green-600"
                        : isInProgress
                          ? "bg-blue-600"
                          : "bg-gray-600"
                        }`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-bold text-[#3d3330] mb-2">
                      Productos a preparar:
                    </p>
                    <ul className="text-sm text-[#8b6f47] space-y-1">
                      {order.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2"
                        >
                          <span className="inline-block w-2 h-2 bg-[#d97706] rounded-full" />
                          {item.productName} (x{item.quantity})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    {isPending && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "in-progress")
                        }
                        className="flex-1 bg-[#d97706] hover:bg-[#b94f0f] text-white font-bold py-2 rounded"
                      >
                        EN PREPARACIÓN
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "ready")
                        }
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
                      >
                        LISTO
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
