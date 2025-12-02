"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface OrderItem {
  id: number;
  productName: string;
  category: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  orderNumber: string;
  tableNumber: number;
  status: "pending" | "paid" | "cancelled" | string;
  totalPrice: number;
  paymentMethod: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface TopProduct {
  productName: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/pedidos?status=paid`);
      if (!res.ok) throw new Error("No se pudieron cargar los pedidos");
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setMessage("Error al cargar los reportes de ventas.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helpers
  const formatCurrency = (value: number) =>
    `S/.${value.toFixed(2)}`;

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Métricas generales
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
  const paidOrders = orders.filter((o) => o.status === "paid").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  // Top productos por cantidad vendida
  const topProducts: TopProduct[] = (() => {
    const map = new Map<string, TopProduct>();

    for (const order of orders) {
      for (const item of order.items || []) {
        const key = item.productName;
        const existing = map.get(key);
        const subtotal = item.price * item.quantity;

        if (!existing) {
          map.set(key, {
            productName: item.productName,
            category: item.category,
            totalQuantity: item.quantity,
            totalRevenue: subtotal,
          });
        } else {
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += subtotal;
        }
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5); // top 5
  })();

  // Últimos pedidos (ordenar por fecha desc por si acaso)
  const recentOrders = [...orders]
    .sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return db - da;
    })
    .slice(0, 10);

  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8">
        <h1 className="mb-6 text-3xl font-bold text-[#3d3330]">REPORTES</h1>

        {message && (
          <div
            className={`mb-4 rounded p-3 text-sm ${
              message.includes("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-sm text-[#8b6f47]">
              Cargando reportes de ventas...
            </p>
          </div>
        ) : totalOrders === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="mb-2 text-[#8b6f47]">
              Aún no hay pedidos registrados.
            </p>
            <p className="text-sm text-[#6b5f52]">
              Cuando registres ventas desde el módulo de pedidos,
              aquí verás tus reportes.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPIs principales */}
            <section className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-white p-4 shadow">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8b6f47]">
                  Ventas totales
                </p>
                <p className="mt-2 text-2xl font-bold text-[#3d3330]">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="mt-1 text-xs text-[#6b5f52]">
                  Suma de todos los pedidos registrados
                </p>
              </div>

              <div className="rounded-lg bg-white p-4 shadow">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8b6f47]">
                  Pedidos totales
                </p>
                <p className="mt-2 text-2xl font-bold text-[#3d3330]">
                  {totalOrders}
                </p>
                <p className="mt-1 text-xs text-[#6b5f52]">
                  Pedidos creados en el sistema
                </p>
              </div>

              <div className="rounded-lg bg-white p-4 shadow">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8b6f47]">
                  Pedidos pagados
                </p>
                <p className="mt-2 text-2xl font-bold text-[#3d3330]">
                  {paidOrders}
                </p>
                <p className="mt-1 text-xs text-[#6b5f52]">
                  Marcados como &quot;paid&quot;
                </p>
              </div>

              <div className="rounded-lg bg-white p-4 shadow">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8b6f47]">
                  Pedidos pendientes
                </p>
                <p className="mt-2 text-2xl font-bold text-[#3d3330]">
                  {pendingOrders}
                </p>
                <p className="mt-1 text-xs text-[#6b5f52]">
                  Aún por pagar o completar
                </p>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Últimos pedidos */}
              <section className="lg:col-span-2 rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-bold text-[#3d3330]">
                  Últimos pedidos
                </h2>

                <div className="max-h-[420px] overflow-y-auto border border-[#e8dfd5] rounded">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#f5ede0]">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-[#3d3330]">
                          Pedido
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-[#3d3330]">
                          Fecha
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-[#3d3330]">
                          Mesa
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-[#3d3330]">
                          Estado
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-[#3d3330]">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o) => (
                        <tr
                          key={o.id}
                          className="border-t border-[#e8dfd5] hover:bg-[#fef9f3]"
                        >
                          <td className="px-3 py-2 text-[#3d3330]">
                            {o.orderNumber}
                          </td>
                          <td className="px-3 py-2 text-[#6b5f52]">
                            {formatDateTime(o.createdAt)}
                          </td>
                          <td className="px-3 py-2 text-center text-[#3d3330]">
                            {o.tableNumber}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`rounded px-3 py-1 text-xs font-bold ${
                                o.status === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : o.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {o.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-[#3d3330]">
                            {formatCurrency(o.totalPrice ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Top productos */}
              <section className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-bold text-[#3d3330]">
                  Productos más vendidos
                </h2>

                {topProducts.length === 0 ? (
                  <p className="text-sm text-[#8b6f47]">
                    Aún no hay suficientes datos de productos.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((p, idx) => (
                      <div
                        key={p.productName}
                        className="flex items-center justify-between rounded border border-[#e8dfd5] bg-[#fef9f3] px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#3d3330]">
                            {idx + 1}. {p.productName}
                          </p>
                          <p className="text-xs text-[#8b6f47]">
                            {p.category} · {p.totalQuantity} und.
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#3d3330]">
                            {formatCurrency(p.totalRevenue)}
                          </p>
                          <p className="text-[11px] text-[#6b5f52]">
                            Ingreso acumulado
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
