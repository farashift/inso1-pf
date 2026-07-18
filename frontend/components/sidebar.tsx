"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ClipboardList,
  CookingPot,
  CreditCard,
  Home,
  LineChart,
  LogOut,
  Menu,
  Package,
  Plus,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  adminName?: string;
  adminRole?: string;
}

const menuItems = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: Home,
    roles: ["admin", "waiter", "kitchen", "cashier", "warehouse"],
  },
  {
    href: "/dashboard/new-order",
    label: "Registrar Pedido",
    icon: Plus,
    roles: ["admin", "waiter"],
  },
  {
    href: "/dashboard/orders-in-progress",
    label: "Pedidos en Proceso",
    icon: ClipboardList,
    roles: ["admin", "waiter"],
  },
  {
    href: "/dashboard/kitchen",
    label: "Cocina",
    icon: CookingPot,
    roles: ["admin", "kitchen"],
  },
  {
    href: "/dashboard/payments",
    label: "Pagos",
    icon: CreditCard,
    roles: ["admin", "cashier"],
  },
  {
    href: "/dashboard/inventory",
    label: "Inventario",
    icon: Package,
    roles: ["admin", "warehouse"],
  },
  {
    href: "/dashboard/reports",
    label: "Reportes",
    icon: LineChart,
    roles: ["admin"],
  },
  {
    href: "/dashboard/settings",
    label: "Configuracion",
    icon: Settings,
    roles: ["admin"],
  },
];

export function Sidebar({ adminName, adminRole = "admin" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminRole");
    router.push("/login");
  };

  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(adminRole),
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#d97706] text-white rounded"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#3d3330] text-white overflow-y-auto transform transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-[#4a3f3a]">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-[#d97706] font-bold">
              F
            </div>
            <div>
              <h2 className="font-bold text-base">CAFETERIA</h2>
              <h3 className="font-bold text-base text-[#d97706]">FONZI</h3>
            </div>
          </div>
          {adminName && (
            <p className="text-xs text-[#c1b5a8] mt-2">
              {adminName} - {adminRole}
            </p>
          )}
        </div>

        <nav className="p-4 space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#d97706] text-white"
                    : "hover:bg-[#d97706] text-white/90 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#4a3f3a] mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors"
          >
            <LogOut size={18} />
            <span>Cerrar Sesion</span>
          </button>
        </div>
      </aside>

      <div className="hidden md:block w-64" />
    </>
  );
}
