"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Plus, Trash2 } from "lucide-react"

interface Product {
  id: number
  name: string
  category: string
  price: number
}

interface CartItem {
  id: number
  name: string
  category: string
  price: number
  quantity: number
}

export default function NewOrderPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [tableNumber, setTableNumber] = useState("")
  const [customerNotes, setCustomerNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity } : item)))
    }
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmitOrder = async () => {
    if (!tableNumber.trim()) {
      setMessage("Por favor ingresa el número de mesa")
      return
    }

    if (cart.length === 0) {
      setMessage("Por favor agrega productos al pedido")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: Number.parseInt(tableNumber),
          items: cart.map((item) => ({
            productName: item.name,
            category: item.category,
            price: item.price,
            quantity: item.quantity,
          })),
          totalPrice,
          notes: customerNotes,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear pedido")
      }

      setMessage("Pedido enviado a cocina")
      setTableNumber("")
      setCustomerNotes("")
      setCart([])

      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Error al registrar pedido. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedLayout>
      <div className="p-6 md:p-8">
        <h1 className="text-3xl font-bold text-[#3d3330] mb-6">REGISTRAR PEDIDO</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#3d3330] mb-2">Mesa</label>
                <input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Número de mesa"
                  className="w-full px-4 py-2 border-2 border-[#d4a574] rounded bg-[#fef9f3] text-[#3d3330] focus:outline-none focus:border-[#d97706]"
                />
              </div>

              <h2 className="text-lg font-bold text-[#3d3330] mb-4">Productos</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#d4a574]">
                      <th className="text-left py-2 px-2 font-bold text-[#3d3330]">Producto</th>
                      <th className="text-left py-2 px-2 font-bold text-[#3d3330]">Categoría</th>
                      <th className="text-left py-2 px-2 font-bold text-[#3d3330]">Precio</th>
                      <th className="text-center py-2 px-2 font-bold text-[#3d3330]">Agregar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-[#e8dfd5] hover:bg-[#fef9f3]">
                        <td className="py-3 px-2 text-[#3d3330]">{product.name}</td>
                        <td className="py-3 px-2 text-[#8b6f47]">{product.category}</td>
                        <td className="py-3 px-2 text-[#3d3330] font-bold">S/.{product.price.toFixed(2)}</td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => addToCart(product)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#d97706] text-white hover:bg-[#b94f0f]"
                          >
                            <Plus size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow sticky top-6">
              <h2 className="text-lg font-bold text-[#3d3330] mb-4">Carrito</h2>

              {cart.length === 0 ? (
                <p className="text-[#8b6f47] text-center py-8">Carrito vacío</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-[#fef9f3] rounded">
                        <div className="flex-1">
                          <p className="font-medium text-[#3d3330] text-sm">{item.name}</p>
                          <p className="text-xs text-[#8b6f47]">S/.{item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 0)}
                            className="w-10 px-1 py-1 border border-[#d4a574] rounded text-center text-sm"
                          />
                          <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-[#d4a574] pt-3 mb-4">
                    <p className="text-[#3d3330] font-bold">Total: S/.{totalPrice.toFixed(2)}</p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#3d3330] mb-2">Notas del cliente</label>
                    <textarea
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#d4a574] rounded bg-[#fef9f3] text-[#3d3330] text-sm focus:outline-none focus:border-[#d97706]"
                      rows={3}
                    />
                  </div>

                  {message && (
                    <div
                      className={`p-3 rounded text-sm mb-4 ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                    >
                      {message}
                    </div>
                  )}

                  <button
                    onClick={handleSubmitOrder}
                    disabled={isLoading}
                    className="w-full bg-[#d97706] hover:bg-[#b94f0f] text-white font-bold py-2 rounded disabled:opacity-50"
                  >
                    {isLoading ? "Enviando..." : "[ENVIAR A COCINA]"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
