"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#3d3330] mb-2">Bienvenido, Mesero</h1>
          <p className="text-[#8b6f47]">Sistema de gestión de cafetería FONZI</p>
        </div>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#3d3330] mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/new-order"
              className="bg-[#d97706] hover:bg-[#b94f0f] text-white font-bold py-3 px-6 rounded text-center transition-colors"
            >
              [Registrar Pedido]
            </Link>
            <Link
              href="/dashboard/kitchen"
              className="bg-[#8b6f47] hover:bg-[#6b5235] text-white font-bold py-3 px-6 rounded text-center transition-colors"
            >
              [Ver Cocina]
            </Link>
          </div>
        </section>

        {/* Recent Orders */}
        <section>
          <h2 className="text-xl font-bold text-[#3d3330] mb-4">Pedidos Recientes</h2>
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="space-y-3 text-[#8b6f47]">
              <p>Pedido #123 - Mesa 5 Levar - Pendiente - Listo</p>
              <p>Pedido #123 - Mesa 2 Levar 2 - Pagado</p>
            </div>
          </div>
        </section>
      </div>
    </ProtectedLayout>
  )
}
