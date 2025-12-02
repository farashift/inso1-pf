"use client"

import { ProtectedLayout } from "@/components/protected-layout"

export default function SettingsPage() {
  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8">
        <h1 className="text-3xl font-bold text-[#3d3330] mb-6">CONFIGURACIÓN</h1>

        <div className="bg-white rounded-lg p-8 shadow">
          <p className="text-[#8b6f47] mb-4">Panel de configuración del sistema</p>
          <p className="text-sm text-[#6b5f52]">Opciones de configuración próximamente</p>
        </div>
      </div>
    </ProtectedLayout>
  )
}