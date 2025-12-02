"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";

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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function OrdersInProgressPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      // 🔹 Pedidos filtrados por status=in-progress
      const response = await fetch(
        `${API_URL}/api/pedidos?status=in-progress`,
      );
      if (!response.ok) {
        console.error("Error al obtener pedidos");
        return;
      }
      const data: Order[] = await response.json();
      setOrders(data);
    } catch (error) {
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
          PEDIDOS EN PROCESO
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-[#8b6f47]">No hay pedidos en proceso</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg p-6 shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-lg font-bold text-[#3d3330]">
                      #{order.orderNumber}
                    </p>
                    <p className="text-sm text-[#8b6f47]">
                      Mesa {order.tableNumber}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold text-white ${
                      order.status === "pending"
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

                <div className="mb-4 pb-4 border-b-2 border-[#d4a574]">
                  <p className="text-sm font-bold text-[#3d3330] mb-2">
                    Productos:
                  </p>
                  <ul className="text-sm text-[#8b6f47] space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        - {item.productName} (x{item.quantity}) - S/.
                        {(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="font-bold text-[#3d3330] mb-4">
                  Total: S/.{order.totalPrice.toFixed(2)}
                </p>

                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, "in-progress")
                      }
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm"
                    >
                      EN PREPARACIÓN
                    </button>
                  )}
                  {order.status === "in-progress" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, "ready")
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-sm"
                    >
                      LISTO
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
