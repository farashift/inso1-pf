"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Check, X, Printer, User } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface OrderItem {
  id: number;
  productName: string;
  category: string;
  price: number;
  quantity: number;
}

interface Payment {
  id: number;
  amount: number;
  method: string;
  createdAt: string;
}

interface Order {
  id: number;
  orderNumber: string;
  tableNumber: number;
  status: string;
  totalPrice: number;
  waiterName?: string;
  createdAt: string;
  items: OrderItem[];
  payments: Payment[]; // Para calcular el balance
}

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountToPay, setAmountToPay] = useState(""); // Input del usuario
  const [isLoading, setIsLoading] = useState(true);

  // Estado para el modal de recibo
  const [receipt, setReceipt] = useState<{
    order: Order;
    amountPaid: number;
    method: string;
    total: number;
    remaining: number;
    date: string;
  } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Al seleccionar pedido, resetear monto a pagar (sugerir restante)
  useEffect(() => {
    if (selectedOrder) {
      const paid = selectedOrder.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
      const remaining = selectedOrder.totalPrice - paid;
      setAmountToPay(remaining > 0 ? remaining.toFixed(2) : "0.00");
    }
  }, [selectedOrder]);

  // Traer pedidos READY
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pedidos?status=ready`);
      const data = await response.json();
      setOrders(data);


      // Si tenemos un pedido seleccionado, actualizarlo con la info nueva también
      if (selectedOrder) {
        const updated = data.find((o: Order) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
        else setSelectedOrder(null); // si ya no está (ej: pagado total)
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmar Pago
  const processPayment = async () => {
    if (!selectedOrder) return;

    const amount = parseFloat(amountToPay);
    if (Number.isNaN(amount) || amount <= 0) {
      alert("Ingrese un monto válido");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          amount: amount,
          method: paymentMethod,
        }),
      });

      if (!res.ok) throw new Error("Error al procesar el pago");

      const paymentData = await res.json(); // el registro de pago creado

      // Calcular montos finales para el recibo antes de refrescar
      const paidPreviously = selectedOrder.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
      const totalPaidNow = paidPreviously + amount;
      const remaining = selectedOrder.totalPrice - totalPaidNow;

      // Guardar datos para recibo
      setReceipt({
        order: selectedOrder,
        amountPaid: amount,
        method: paymentMethod,
        total: selectedOrder.totalPrice,
        remaining: Math.max(0, remaining),
        date: new Date().toLocaleString(),
      });

      // NO deseleccionamos inmediatamente si falta saldo, para permitir otro pago
      // Pero si ya se pagó todo (status podría cambiar en backend), fetchOrders refrescará la lista.
      await fetchOrders();
      // Si el pedido desaparece de la lista (porque pasó a PAID), selectedOrder se pondrá null en fetchOrders.

    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error al procesar el pago");
    }
  };

  const closeReceipt = () => {
    setReceipt(null);
  };

  // Cálculos de montos
  const getPaymentInfo = (order: Order) => {
    const paid = order.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
    const remaining = order.totalPrice - paid;
    return { paid, remaining };
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

  const { paid: currentPaid, remaining: currentRemaining } = selectedOrder
    ? getPaymentInfo(selectedOrder)
    : { paid: 0, remaining: 0 };

  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8 relative">
        <h1 className="text-3xl font-bold text-[#3d3330] mb-6">
          MÓDULO DE PAGO Y CAJA
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pedidos READY */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-bold text-[#3d3330] mb-4">
                Pedidos Por Cobrar
              </h2>

              {orders.length === 0 ? (
                <p className="text-[#8b6f47]">No hay pedidos listos para pagar</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const { remaining } = getPaymentInfo(order);
                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`p-4 rounded cursor-pointer border-2 transition-colors ${selectedOrder?.id === order.id
                          ? "border-[#d97706] bg-[#fef9f3]"
                          : "border-[#d4a574] bg-white hover:bg-[#fef9f3]"
                          }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="font-bold text-[#3d3330]">
                              Pedido #{order.orderNumber}
                            </p>
                            <p className="text-sm text-[#8b6f47]">
                              Mesa {order.tableNumber}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-[#d97706]">
                              Total: S/.{order.totalPrice.toFixed(2)}
                            </p>
                            {remaining < order.totalPrice && remaining > 0.01 && (
                              <p className="text-xs font-semibold text-red-600">
                                Resta: S/.{remaining.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Vista previa de items si está seleccionado */}
                        {selectedOrder?.id === order.id && (
                          <div className="mt-4 border-t border-[#e8dfd5] pt-2">
                            {order.waiterName && (
                              <p className="text-xs font-bold text-[#d97706] mb-2 flex items-center gap-1">
                                <User size={14} /> Atendido por: {order.waiterName}
                              </p>
                            )}
                            <p className="text-xs font-semibold text-[#8b6f47] mb-1">Detalle del pedido:</p>
                            <ul className="text-sm space-y-1">
                              {order.items?.map((item: any) => (
                                <li key={item.id} className="flex justify-between text-[#3d3330]">
                                  <span>{item.quantity}x {item.productName}</span>
                                  <span>S/.{(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Modal de pago */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow sticky top-6">
              <h2 className="text-lg font-bold text-[#3d3330] mb-4">
                Procesar Pago
              </h2>

              {selectedOrder ? (
                <>
                  <div className="mb-6 pb-4 border-b-2 border-[#d4a574]">
                    <p className="text-sm text-[#8b6f47] mb-2">
                      Pagando Pedido <span className="font-bold">#{selectedOrder.orderNumber}</span>
                    </p>

                    <div className="flex justify-between text-sm text-[#6b5f52] mb-1">
                      <span>Total:</span>
                      <span>S/.{selectedOrder.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#6b5f52] mb-1">
                      <span>Pagado:</span>
                      <span>S/.{currentPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-[#d97706] mt-2 border-t pt-2 border-dashed">
                      <span>Restante:</span>
                      <span>S/.{currentRemaining.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#3d3330] mb-1">
                        Monto a Pagar (S/.)
                      </label>
                      <input
                        type="number"
                        step="0.10"
                        value={amountToPay}
                        onChange={(e) => setAmountToPay(e.target.value)}
                        className="w-full text-2xl font-bold p-3 border-2 border-[#d4a574] rounded focus:outline-none focus:border-[#d97706] text-right"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#3d3330] mb-2">
                        Método de Pago:
                      </p>
                      <div className="space-y-2">
                        {["cash", "card", "digital"].map((method) => (
                          <label
                            key={method}
                            className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-all ${paymentMethod === method
                              ? "border-[#d97706] bg-[#fef9f3]"
                              : "border-gray-200 hover:bg-gray-50"
                              }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={method}
                              checked={paymentMethod === method}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="w-4 h-4 accent-[#d97706]"
                            />
                            <span className="text-[#3d3330] capitalize font-medium">
                              {method === "cash"
                                ? "Efectivo"
                                : method === "card"
                                  ? "Tarjeta"
                                  : "Billetera Digital"}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={processPayment}
                    disabled={parseFloat(amountToPay) <= 0 || parseFloat(amountToPay) > currentRemaining + 0.5}
                    // +0.5 margen error float, o permitir sobrepagos? Mejor estricto.
                    className="w-full bg-[#d97706] hover:bg-[#b94f0f] text-white font-bold py-3 rounded-lg mb-3 shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    REGISTRAR PAGO
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-[#3d3330] font-bold py-2 rounded-lg transition-colors"
                  >
                    Cancelar Selección
                  </button>
                </>
              ) : (
                <div className="text-center py-10 opacity-50">
                  <p className="text-4xl mb-2">👈</p>
                  <p className="text-[#8b6f47]">Selecciona un pedido para cobrar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Comprobante (Overlay) */}
        {receipt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="bg-[#3d3330] p-4 text-white flex justify-between items-center">
                <h3 className="font-bold text-lg">Comprobante de Pago</h3>
                <button onClick={closeReceipt} className="hover:bg-white/20 p-1 rounded">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="text-center border-b pb-4 border-dashed border-gray-300">
                  <p className="font-bold text-xl uppercase tracking-wider mb-1">Cafetería Fonzi</p>
                  <p className="text-sm text-gray-500">{receipt.date}</p>
                  <p className="text-sm text-gray-500">Recibo {receipt.order.orderNumber}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Concepto</span>
                    <span>Monto</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pago parcial/total ped. {receipt.order.orderNumber}</span>
                    <span>S/.{receipt.amountPaid.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Total Pedido:</span>
                    <span>S/.{receipt.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-[#d97706]">
                    <span>Saldo Restante:</span>
                    <span>S/.{receipt.remaining.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 flex justify-between pt-2">
                  <span>Método:</span>
                  <span className="capitalize">{receipt.method === "cash" ? "Efectivo" : receipt.method === "card" ? "Tarjeta" : "Digital"}</span>
                </div>

                <div className="pt-6 flex gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 border border-[#3d3330] text-[#3d3330] py-2 rounded hover:bg-gray-50 flex items-center justify-center gap-2 font-medium"
                  >
                    <Printer size={18} /> Imprimir
                  </button>
                  <button
                    onClick={closeReceipt}
                    className="flex-1 bg-[#d97706] text-white py-2 rounded hover:bg-[#b94f0f] flex items-center justify-center gap-2 font-bold"
                  >
                    <Check size={18} /> Aceptar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
