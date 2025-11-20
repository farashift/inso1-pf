"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter()
  const [adminName, setAdminName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const name = localStorage.getItem("adminName")

    if (!token) {
      router.push("/login")
      return
    }

    setAdminName(name || "Admin")
    setIsLoading(false)
  }, [router])

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
      <Sidebar adminName={adminName} />
      <main className="flex-1 md:ml-0 pt-16 md:pt-0">{children}</main>
    </div>
  )
}
