"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"

interface ProtectedLayoutProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedLayout({ children, allowedRoles }: ProtectedLayoutProps) {
  const router = useRouter()
  const [adminName, setAdminName] = useState<string>("")
  const [adminRole, setAdminRole] = useState<string>("")
  const [isAllowed, setIsAllowed] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const allowedRoleKey = allowedRoles?.join(",") ?? ""

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const name = localStorage.getItem("adminName")
    const role = localStorage.getItem("adminRole") || "admin"
    const roles = allowedRoleKey ? allowedRoleKey.split(",") : null

    if (!token) {
      router.push("/login")
      return
    }

    setAdminName(name || "Admin")
    setAdminRole(role)

    if (roles && !roles.includes(role)) {
      setIsAllowed(false)
      setIsLoading(false)
      return
    }

    setIsAllowed(true)
    setIsLoading(false)
  }, [allowedRoleKey, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5ede0] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">☕</div>
          <p className="text-[#3d3330]">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f5ede0]">
      <Sidebar adminName={adminName} adminRole={adminRole} />
      <main className="flex-1 md:ml-0 pt-16 md:pt-0">
        {isAllowed ? (
          children
        ) : (
          <div className="p-6 md:p-8">
            <div className="rounded-lg bg-white p-8 shadow">
              <h1 className="mb-2 text-2xl font-bold text-[#3d3330]">
                Acceso restringido
              </h1>
              <p className="text-sm text-[#8b6f47]">
                Tu rol no tiene permisos para ingresar a este modulo.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
