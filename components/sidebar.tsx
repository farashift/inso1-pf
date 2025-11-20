"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, LogOut } from "lucide-react"

interface SidebarProps {
  adminName?: string
}

const menuItems = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/dashboard/new-order", label: "Registrar Pedido", icon: "➕" },
  { href: "/dashboard/orders-in-progress", label: "Pedidos en Proceso", icon: "⏳" },
  { href: "/dashboard/kitchen", label: "Cocina", icon: "👨‍🍳" },
  { href: "/dashboard/payments", label: "Pagos", icon: "💳" },
  { href: "/dashboard/inventory", label: "Inventario", icon: "📦" },
  { href: "/dashboard/reports", label: "Reportes", icon: "📊" },
  { href: "/dashboard/settings", label: "Configuración", icon: "⚙️" },
]

export function Sidebar({ adminName }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("adminName")
    router.push("/login")
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#d97706] text-white rounded"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#3d3330] text-white overflow-y-auto transform transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-[#4a3f3a]">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">☕</div>
            <div>
              <h2 className="font-bold text-base">CAFETERÍA</h2>
              <h3 className="font-bold text-base text-[#d97706]">FONZI</h3>
            </div>
          </div>
          {adminName && <p className="text-xs text-[#c1b5a8] mt-2">Admin: {adminName}</p>}
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded text-sm font-medium hover:bg-[#d97706] transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#4a3f3a] mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content offset for desktop */}
      <div className="hidden md:block w-64" />
    </>
  )
}
