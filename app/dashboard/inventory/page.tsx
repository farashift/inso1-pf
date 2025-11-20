"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Search } from "lucide-react"

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const updateProductStock = async (productId: number, newStock: number) => {
    try {
      await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      })
      fetchProducts()
    } catch (error) {
      console.error("Error updating product:", error)
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
        <h1 className="text-3xl font-bold text-[#3d3330] mb-6">INVENTARIO GENERAL</h1>

        <div className="mb-6 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-[#8b6f47]" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border-2 border-[#d4a574] rounded bg-white text-[#3d3330] focus:outline-none focus:border-[#d97706]"
            />
          </div>
          <button className="px-6 py-2 bg-[#8b6f47] hover:bg-[#6b5235] text-white font-bold rounded">
            Filtrar por Estado
          </button>
          <button className="px-6 py-2 bg-[#d97706] hover:bg-[#b94f0f] text-white font-bold rounded">
            Exportar CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#d4a574] bg-[#fef9f3]">
                <th className="text-left py-3 px-4 font-bold text-[#3d3330]">Producto</th>
                <th className="text-left py-3 px-4 font-bold text-[#3d3330]">Stock</th>
                <th className="text-left py-3 px-4 font-bold text-[#3d3330]">Estado</th>
                <th className="text-center py-3 px-4 font-bold text-[#3d3330]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-[#e8dfd5] hover:bg-[#fef9f3]">
                  <td className="py-3 px-4 text-[#3d3330] font-medium">{product.name}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => updateProductStock(product.id, Number.parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-[#d4a574] rounded text-center text-[#3d3330]"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        product.status === "ok" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.status === "ok" ? "OK" : "BAJO"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-[#d97706] hover:text-[#b94f0f] font-bold text-sm">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedLayout>
  )
}
