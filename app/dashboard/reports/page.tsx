"use client"

import { ProtectedLayout } from "@/components/protected-layout"

export default function ReportsPage() {
  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8">
        <h1 className="text-3xl font-bold text-[#3d3330] mb-6">REPORTES</h1>

        <div className="bg-white rounded-lg p-8 text-center shadow">
          <p className="text-[#8b6f47] mb-4">Módulo de reportes en construcción</p>
          <p className="text-sm text-[#6b5f52]">Pronto podrás generar reportes de ventas, inventario y más</p>
        </div>
      </div>
    </ProtectedLayout>
  )
}
