"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Order {
  id: number;
  orderNumber: string;
  tableNumber: number;
  status: string;
  totalPrice: number;
  createdAt: string;
}

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Traer pedidos READY
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pedidos?status=ready`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmar Pago
  const processPayment = async () => {
    if (!selectedOrder) return;

    try {
      await fetch(`${API_URL}/api/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          amount: selectedOrder.totalPrice,
          method: paymentMethod,
        }),
      });

      setSelectedOrder(null);
      setPaymentMethod("cash");
      fetchOrders(); // actualizar lista de pedidos listos
    } catch (error) {
      console.error("Error processing payment:", error);
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
          MÓDULO DE PAGO
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pedidos READY */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-bold text-[#3d3330] mb-4">
                Pedidos Listos para Pagar
              </h2>

              {orders.length === 0 ? (
                <p className="text-[#8b6f47]">No hay pedidos listos para pagar</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-4 rounded cursor-pointer border-2 transition-colors ${
                        selectedOrder?.id === order.id
                          ? "border-[#d97706] bg-[#fef9f3]"
                          : "border-[#d4a574] bg-white hover:bg-[#fef9f3]"
                      }`}
                    >
                      <p className="font-bold text-[#3d3330]">
                        Pedido #{order.orderNumber}
                      </p>
                      <p className="text-sm text-[#8b6f47]">
                        Mesa {order.tableNumber}
                      </p>
                      <p className="text-lg font-bold text-[#d97706] mt-2">
                        S/.{order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal de pago */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow sticky top-6">
              <h2 className="text-lg font-bold text-[#3d3330] mb-4">
                Seleccionar Pedido
              </h2>

              {selectedOrder ? (
                <>
                  <div className="mb-6 pb-4 border-b-2 border-[#d4a574]">
                    <p className="text-sm text-[#8b6f47] mb-2">
                      Pedido #{selectedOrder.orderNumber}
                    </p>
                    <p className="text-2xl font-bold text-[#3d3330]">
                      S/.{selectedOrder.totalPrice.toFixed(2)}
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-bold text-[#3d3330] mb-3">
                      Métodos de Pago:
                    </p>
                    <div className="space-y-2">
                      {["cash", "card", "digital"].map((method) => (
                        <label
                          key={method}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method}
                            checked={paymentMethod === method}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-[#3d3330] capitalize">
                            {method === "cash"
                              ? "Efectivo"
                              : method === "card"
                              ? "Tarjeta"
                              : "Digital"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={processPayment}
                    className="w-full bg-[#d97706] hover:bg-[#b94f0f] text-white font-bold py-2 rounded mb-2"
                  >
                    [CONFIRMAR PAGO]
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-full bg-gray-300 hover:bg-gray-400 text-[#3d3330] font-bold py-2 rounded"
                  >
                    [CANCELAR]
                  </button>
                </>
              ) : (
                <p className="text-[#8b6f47] text-center py-8">
                  Selecciona un pedido
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
