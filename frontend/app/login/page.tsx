"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// 🔥 URL DEL BACKEND (usa .env)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isRegistering) {
        // ------------------------------------------------------
        // 🔐 REGISTER
        // ------------------------------------------------------
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Error al registrar");
          return;
        }

        setIsRegistering(false);
        setName("");
        setError("Registro exitoso. Ahora puedes iniciar sesión.");
      } else {
        // ------------------------------------------------------
        // 🔐 LOGIN
        // ------------------------------------------------------
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Error al iniciar sesión");
          return;
        }

        // Guardar token y nombre
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("adminName", data.name);

        // Redirigir al dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5ede0] flex flex-col">
      {/* Header */}
      <header className="bg-[#3d3330] text-white py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl">☕</div>
          <h1 className="text-lg font-bold tracking-wide">
            CAFETERÍA FONZI - SISTEMA WEB
          </h1>
        </div>
      </header>

      {/* Login Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-center text-[#3d3330] mb-8">
              {isRegistering ? "Registrar Administrador" : "Iniciar Sesión"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre (solo registro) */}
              {isRegistering && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[#3d3330] mb-2"
                  >
                    Nombre
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full px-4 py-2 border-2 border-[#d4a574] rounded bg-[#fef9f3] text-[#3d3330] placeholder-[#b5a494] focus:outline-none focus:border-[#d97706]"
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#3d3330] mb-2"
                >
                  Usuario
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre.apellido"
                  className="w-full px-4 py-2 border-2 border-[#d4a574] rounded bg-[#fef9f3] text-[#3d3330] placeholder-[#b5a494] focus:outline-none focus:border-[#d97706]"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#3d3330] mb-2"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border-2 border-[#d4a574] rounded bg-[#fef9f3] text-[#3d3330] placeholder-[#b5a494] focus:outline-none focus:border-[#d97706]"
                  required
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              {/* Botón */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#d97706] hover:bg-[#b94f0f] text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
              >
                {isLoading
                  ? isRegistering
                    ? "Registrando..."
                    : "Iniciando..."
                  : isRegistering
                  ? "REGISTRAR"
                  : "INICIAR SESIÓN"}
              </button>
            </form>

            {/* Switch login/register */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError("");
                  setName("");
                }}
                className="text-[#d97706] hover:text-[#b94f0f] text-sm underline"
              >
                {isRegistering
                  ? "¿Ya tienes cuenta? Inicia sesión"
                  : "¿No tienes cuenta? Regístrate"}
              </button>
            </div>

            {/* Forgot password */}
            <p className="text-center text-[#8b6f47] text-sm mt-6">
              ¿Olvidaste tu contraseña?
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
