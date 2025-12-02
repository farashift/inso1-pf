import { hash, compare } from "bcryptjs"

// For development: simple hash validation
// In production, use a proper authentication library
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

// Helper to validate admin credentials
export function getAdminCredentials() {
  return {
    email: "admin@fonzi.com",
    password: "admin12345",
  }
}
