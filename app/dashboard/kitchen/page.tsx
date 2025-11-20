"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"

interface OrderItemData {
  productName: string
  category: string
  quantity: number
}

interface Order {
  id: number
  orderNumber: string
  tableNumber: number
  status: string
  items: OrderItemData[]
  createdAt: string
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders?status=pending,in-progress")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsReady = async (orderId: number) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ready" }),
      })
      fetchOrders()
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="p-6 md:p-8 text-center text-[#8b6f47]">Cargando...</div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8">
        <h1 className="text-3xl font-bold text-[#3d3330] mb-6">PEDIDOS EN COCINA</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-[#8b6f47]">No hay pedidos pendientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg p-6 shadow border-l-4 border-[#d97706]">
                <div className="mb-3">
                  <p className="text-xl font-bold text-[#3d3330]">
                    #{order.orderNumber} - Mesa {order.tableNumber}
                  </p>
                  <p className="text-sm text-[#8b6f47]">{order.items.map((item) => item.category).join(", ")}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-bold text-[#3d3330] mb-2">Productos a preparar:</p>
                  <ul className="text-sm text-[#8b6f47] space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-[#d97706] rounded-full"></span>
                        {item.productName} (x{item.quantity})
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => markAsReady(order.id)}
                    className="flex-1 bg-[#d97706] hover:bg-[#b94f0f] text-white font-bold py-2 rounded"
                  >
                    EN PREPARACIÓN
                  </button>
                  <button
                    onClick={() => markAsReady(order.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
                  >
                    LISTO
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
