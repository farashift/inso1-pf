"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      setIsLoading(true);
      setMessage("");
      const res = await fetch(`${API_URL}/api/pedidos`);
      if (!res.ok) throw new Error("No se pudieron cargar los pedidos");
      const data: Order[] = await res.json();

      // ordenamos por fecha desc por si el backend no lo hace
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setOrders(sorted.slice(0, 5)); // últimos 5
    } catch (err) {
      console.error(err);
      setMessage("Error al cargar los pedidos recientes.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatCurrency = (value: number) => `S/.${value.toFixed(2)}`;

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "ready":
        return "bg-blue-100 text-blue-700";
      case "paid":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-[#3d3330]">
            Bienvenido, Mesero
          </h1>
          <p className="text-[#8b6f47]">
            Sistema de gestión de cafetería FONZI
          </p>
        </div>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-[#3d3330]">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              href="/dashboard/new-order"
              className="rounded bg-[#d97706] px-6 py-3 text-center font-bold text-white transition-colors hover:bg-[#b94f0f]"
            >
              [Registrar Pedido]
            </Link>
            <Link
              href="/dashboard/kitchen"
              className="rounded bg-[#8b6f47] px-6 py-3 text-center font-bold text-white transition-colors hover:bg-[#6b5235]"
            >
              [Ver Cocina]
            </Link>
          </div>
        </section>

        {/* Mensaje de error si hay */}
        {message && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {message}
          </div>
        )}

        {/* Recent Orders */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#3d3330]">
              Pedidos Recientes
            </h2>
            <button
              onClick={fetchRecentOrders}
              className="text-sm font-semibold text-[#d97706] hover:text-[#b94f0f]"
            >
              Actualizar
            </button>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            {isLoading ? (
              <p className="text-sm text-[#8b6f47]">
                Cargando pedidos recientes...
              </p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-[#8b6f47]">
                Aún no hay pedidos registrados.
              </p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-2 rounded border border-[#e8dfd5] bg-[#fef9f3] px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-[#3d3330]">
                        Pedido #{order.orderNumber} · Mesa {order.tableNumber}
                      </p>
                      <p className="text-xs text-[#8b6f47]">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded px-3 py-1 text-xs font-bold ${getStatusStyles(
                          order.status,
                        )}`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                      <span className="text-sm font-bold text-[#d97706]">
                        {formatCurrency(order.totalPrice ?? 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </ProtectedLayout>
  );
}
