// server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import { prisma } from "./lib/db"; // instancia de Prisma

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

//
// 👉 HEALTH CHECK
//
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "Backend Cafetería Fonzi funcionando 🚀" });
});

//
// 👉 USUARIO ACTUAL (ADMIN) - /me y /api/me
//
app.get("/me", async (_req: Request, res: Response) => {
  try {
    const admin = await prisma.admin.findFirst();

    if (!admin) {
      return res.status(404).json({ error: "No hay ningún admin registrado" });
    }

    res.json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    console.error("Error en /me:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get("/api/me", async (_req: Request, res: Response) => {
  try {
    const admin = await prisma.admin.findFirst();

    if (!admin) {
      return res.status(404).json({ error: "No hay ningún admin registrado" });
    }

    res.json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    console.error("Error en /api/me:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//
// 👉 PRODUCTOS
//

// Listar todos los productos
app.get("/api/productos", async (_req: Request, res: Response) => {
  try {
    const productos = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener un producto por ID
app.get("/api/productos/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const producto = await prisma.product.findUnique({ where: { id } });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Crear producto
app.post("/api/productos", async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      price,
      stock,
    }: { name: string; category?: string; price: number; stock?: number } =
      req.body;

    if (!name || price == null) {
      return res
        .status(400)
        .json({ error: "name y price son obligatorios" });
    }

    const nuevoProducto = await prisma.product.create({
      data: {
        name: name.trim(),
        category: (category || "Sin categoría").trim(),
        price: Number(price),
        stock: stock != null ? Number(stock) : 0,
      },
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Actualizar SOLO el stock de un producto
app.patch("/api/productos/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { stock } = req.body as { stock: number };

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    if (typeof stock !== "number" || stock < 0) {
      return res.status(400).json({ error: "Stock inválido" });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { stock },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error al actualizar stock:", err);
    res.status(500).json({ error: "Error interno al actualizar stock" });
  }
});


//
// 👉 PEDIDOS (ORDERS)
//

type PedidoItemInput = {
  productId: number;
  quantity: number;
};

// Crear un pedido nuevo usando productId + quantity
app.post("/api/pedidos", async (req: Request, res: Response) => {
  try {
    const {
      tableNumber,
      items,
      paymentMethod,
      notes,
    } = req.body as {
      tableNumber: number;
      items: PedidoItemInput[];
      paymentMethod?: string;
      notes?: string;
    };

    // Validaciones básicas
    if (!tableNumber || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "tableNumber e items son obligatorios" });
    }

    // Sacar todos los IDs de productos
    const productIds = items.map((i) => i.productId);

    // Traer productos desde la BD
    const productos = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Si falta alguno → error
    if (productos.length !== items.length) {
      return res
        .status(400)
        .json({ error: "Uno o más productos no existen" });
    }

    let totalPrice = 0;

    // Armar los OrderItem y calcular total
    const orderItemsData = items.map((item) => {
      const producto = productos.find((p) => p.id === item.productId)!;
      const quantity = Number(item.quantity) || 1;
      const subtotal = producto.price * quantity;
      totalPrice += subtotal;

      return {
        productName: producto.name,
        category: producto.category,
        price: producto.price,
        quantity,
      };
    });

    const orderNumber = `ORD-${Date.now()}`;

    const nuevoPedido = await prisma.order.create({
      data: {
        orderNumber,
        tableNumber,
        status: "pending",
        totalPrice,
        paymentMethod: paymentMethod ?? null,
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true },
    });

    res.status(201).json(nuevoPedido);
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Listar pedidos (opcionalmente filtrados por status)
app.get("/api/pedidos", async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };

    const where = status ? { status } : {};

    const pedidos = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    res.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//
// 👉 PAGOS
//

// Registrar un pago para un pedido
app.post("/api/pagos", async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      amount,
      method,
    }: { orderId: number; amount: number; method: string } = req.body;

    if (!orderId || !amount || !method) {
      return res
        .status(400)
        .json({ error: "orderId, amount y method son obligatorios" });
    }

    const pago = await prisma.payment.create({
      data: {
        orderId,
        amount,
        method,
        status: "completed",
      },
    });

    // Marcar el pedido como pagado
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "paid" },
    });

    res.status(201).json(pago);
  } catch (error) {
    console.error("Error al registrar pago:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//
// 👉 AUTENTICACIÓN (login / register)
//

// Registrar un admin nuevo
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body as {
      email: string;
      password: string;
      name: string;
    };

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "email, password y name son obligatorios" });
    }

    // ¿Ya existe?
    const existe = await prisma.admin.findUnique({
      where: { email },
    });

    if (existe) {
      return res.status(400).json({ message: "Ese correo ya está registrado" });
    }

    // OJO: aquí podrías usar bcrypt para encriptar, pero por simplicidad lo guardamos tal cual
    const nuevo = await prisma.admin.create({
      data: {
        email,
        password, // en producción: encriptar
        name,
      },
    });

    return res.status(201).json({
      id: nuevo.id,
      email: nuevo.email,
      name: nuevo.name,
      message: "Admin registrado correctamente",
    });
  } catch (error) {
    console.error("Error en /api/auth/register:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Login de admin
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email y password son obligatorios" });
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Comparación simple (sin hash, para el proyecto de la U)
    if (admin.password !== password) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Token fake para el localStorage (solo demo)
    const token = `fake-token-${admin.id}-${Date.now()}`;

    return res.json({
      token,
      name: admin.name,
      email: admin.email,
    });
  } catch (error) {
    console.error("Error en /api/auth/login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

//
// 👉 INICIO DEL SERVIDOR
//
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
