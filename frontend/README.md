# 🍵 CAFETERÍA FONZI - Sistema Web de Gestión

Sistema completo de gestión para cafetería con control de pedidos, inventario, pagos y cocina.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación Local](#instalación-local)
3. [Configuración Base de Datos](#configuración-base-de-datos)
4. [Ejecutar Localmente](#ejecutar-localmente)
5. [Desplegar en Vercel](#desplegar-en-vercel)
6. [Credenciales de Acceso](#credenciales-de-acceso)
7. [Solución de Problemas](#solución-de-problemas)

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** versión 18 o superior (descarga desde [nodejs.org](https://nodejs.org))
- **Git** (descarga desde [git-scm.com](https://git-scm.com))
- **NPM** o **YARN** (viene con Node.js)
- Cuenta en **Neon** para la base de datos PostgreSQL (crea una en [neon.tech](https://neon.tech))
- Cuenta en **Vercel** para desplegar (crea una en [vercel.com](https://vercel.com))

**Verificar instalación:**
\`\`\`bash
node --version
npm --version
git --version
\`\`\`

---

## 🚀 Instalación Local

### Paso 1: Descargar y Descomprimir

1. Descarga el archivo `fonzi-cafe.zip` desde v0
2. Haz clic en los tres puntos (...) arriba a la derecha
3. Selecciona "Download ZIP"
4. Descomprime el archivo en la carpeta donde desees trabajar

\`\`\`bash
# En Windows
# Click derecho → Extraer todo

# En Mac/Linux
unzip fonzi-cafe.zip
cd fonzi-cafe
\`\`\`

### Paso 2: Abrir en VSCode

1. Abre Visual Studio Code
2. Archivo → Abrir carpeta → Selecciona la carpeta `fonzi-cafe`
3. O desde terminal:
\`\`\`bash
code .
\`\`\`

### Paso 3: Instalar Dependencias

1. Abre la terminal en VSCode (Terminal → Nueva terminal)
2. Ejecuta:
\`\`\`bash
npm install
\`\`\`

Esto descargará todas las dependencias necesarias (Next.js, Prisma, bcryptjs, etc.)

**Espera a que termine completamente** - puede tomar 2-3 minutos la primera vez.

---

## 🗄️ Configuración Base de Datos

### Paso 1: Crear Base de Datos en Neon

1. Ve a [neon.tech](https://neon.tech) e inicia sesión
2. Crea un nuevo proyecto:
   - Nombre: `fonzi-cafe` (o el que prefieras)
   - Region: Selecciona la más cercana a ti
3. Copia la cadena de conexión (URL de conexión)

### Paso 2: Agregar Variable de Entorno

1. En la raíz del proyecto, crea un archivo llamado `.env.local`
2. Pega el siguiente contenido:

\`\`\`env
DATABASE_URL="postgresql://user:password@host/database"
\`\`\`

Reemplaza `postgresql://user:password@host/database` con la URL de Neon que copiaste

**Nota:** La carpeta raíz es donde está el archivo `package.json`

### Paso 3: Crear Tablas en Base de Datos

1. Abre el archivo `scripts/init-db.sql`
2. Copia TODO el contenido
3. Ve a tu dashboard de Neon → SQL Editor
4. Pega el script completo
5. Ejecuta (botón Run o Ctrl+Enter)

**Esto creará:**
- Tabla `Admin` con usuario admin@fonzi.com / admin12345
- Tabla `Product` con 7 productos de ejemplo
- Tabla `Order` para pedidos
- Tabla `OrderItem` para items de pedidos
- Tabla `Payment` para pagos

---

## 💻 Ejecutar Localmente

### Paso 1: Verificar Variables de Entorno

Asegúrate de que `.env.local` tiene la variable `DATABASE_URL` correcta

### Paso 2: Inicializar Prisma

En la terminal, ejecuta:

\`\`\`bash
npx prisma generate
\`\`\`

Esto genera el cliente de Prisma

### Paso 3: Ejecutar la Aplicación

\`\`\`bash
npm run dev
\`\`\`

Verás una salida como:
\`\`\`
> fonzi-cafe@1.0.0 dev
> next dev

  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
\`\`\`

### Paso 4: Acceder a la Aplicación

1. Abre tu navegador
2. Ve a `http://localhost:3000`
3. Deberías ver la página de LOGIN

**Credenciales de prueba:**
- Usuario: `admin@fonzi.com`
- Contraseña: `admin12345`

### Paso 5: Detener la Aplicación

En la terminal, presiona `Ctrl+C`

---

## 🌐 Desplegar en Vercel

### Paso 1: Preparar el Proyecto

1. Asegúrate de que el proyecto está en una carpeta limpia sin archivos extra
2. Verifica que `package.json` existe en la raíz

### Paso 2: Crear Repositorio en GitHub (Recomendado)

**Opción A: Subir a GitHub**

1. Crea una nueva cuenta en [github.com](https://github.com) (si no tienes)
2. Crea un nuevo repositorio:
   - Nombre: `fonzi-cafe`
   - Privado o público (tu elección)
   - NO inicialices con README
3. En VSCode, abre la terminal y ejecuta:

\`\`\`bash
git init
git add .
git commit -m "Initial commit: Cafeteria Fonzi App"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/fonzi-cafe.git
git push -u origin main
\`\`\`

Reemplaza `TU_USUARIO` con tu nombre de usuario en GitHub

### Paso 3: Conectar a Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Haz clic en "New Project"
3. Importa el repositorio `fonzi-cafe`
4. Haz clic en "Import"

### Paso 4: Configurar Variables de Entorno en Vercel

1. En la página del proyecto, ve a "Settings" → "Environment Variables"
2. Agrega la variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Pega tu URL de Neon (la misma que usaste localmente)
3. Haz clic en "Save"

### Paso 5: Desplegar

1. Haz clic en "Deploy"
2. Espera a que termine (2-5 minutos)
3. Cuando veas "Congratulations!", tu app está en vivo

**Tu URL será algo como:** `https://fonzi-cafe.vercel.app`

---

### Opción B: Desplegar sin GitHub (ZIP directo)

**Si prefieres no usar GitHub:**

1. En VSCode, haz clic en el icono de GitHub en la esquina superior derecha
2. Haz clic en "Publish to GitHub"
3. O simplemente sube el ZIP a Vercel directamente:
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "Upload" en lugar de "Import Git Repo"
   - Carga el ZIP
   - Agrega las variables de entorno (DATABASE_URL)
   - Despliega

---

## 🔐 Credenciales de Acceso

**Usuario de Administrador:**
\`\`\`
Email: admin@fonzi.com
Contraseña: admin12345
\`\`\`

**Productos de Ejemplo Creados:**
- Café Americano (Latte, $2.50)
- Sándwich Pavo (Sándwich, $5.00)
- Muffin Chocolate (Latte, $3.00)
- Té Chai (Bebida, $2.00)
- Jugo Natural (Jugo, $4.00)
- Croissant (Pastelería, $2.50)
- Brownie Chocolate (Pastelería, $3.50)

---

## 📱 Funcionalidades Principales

### Dashboard (Inicio)
- Acciones rápidas: Registrar Pedido, Ver Cocina
- Pedidos recientes
- Información general

### Registrar Pedido
- Seleccionar mesa
- Agregar productos del menú
- Especificar cantidad
- Enviar a cocina

### Pedidos en Proceso
- Ver todos los pedidos activos
- Cambiar estado (Pendiente → En Preparación → Listo → Pagado)

### Cocina
- Vista optimizada para el área de cocina
- Actualización automática cada 3 segundos
- Marcar pedidos como "En Preparación" o "Listo"

### Pagos
- Registrar pagos de pedidos listos
- Seleccionar método de pago (Efectivo, Tarjeta, Digital)
- Histórico de pagos

### Inventario
- Ver stock de todos los productos
- Búsqueda y filtrado
- Editar productos

### Reportes
- Resumen de pedidos por fecha
- Ingresos totales

---

## 🛠️ Solución de Problemas

### Error: "DATABASE_URL no definida"

**Solución:**
1. Verifica que existe el archivo `.env.local` en la raíz
2. Abre el archivo y verifica que la URL está correcta
3. Reinicia el servidor: `npm run dev`

### Error: "Cannot find module @prisma/client"

**Solución:**
\`\`\`bash
npm install @prisma/client
npm install -D prisma
npx prisma generate
\`\`\`

### Error de conexión a base de datos

**Solución:**
1. Verifica que la BD está corriendo en Neon
2. Copia nuevamente la URL de Neon
3. Verifica que no hay espacios extra en `.env.local`
4. Reinicia la aplicación

### La página de login no carga

**Solución:**
1. Abre la consola del navegador (F12)
2. Verifica que no hay errores en rojo
3. Recarga la página (F5)
4. Limpia el caché: Ctrl+Shift+Delete

### Error al desplegar en Vercel

**Solución:**
1. Verifica que la variable `DATABASE_URL` está en Vercel
2. Redeploy: Ve a "Deployments" → Haz clic en los tres puntos → "Redeploy"
3. Revisa los logs en "Deployments" → "Logs"

---

## 📚 Stack Tecnológico

- **Frontend:** Next.js 16, React 19, TypeScript
- **Estilos:** Tailwind CSS, shadcn/ui
- **Base de Datos:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Autenticación:** JWT, bcryptjs
- **Deployment:** Vercel

---

## ✅ Checklist Rápido

- [ ] Node.js v18+ instalado
- [ ] Proyecto descargado y descomprimido
- [ ] Dependencias instaladas (`npm install`)
- [ ] Base de datos creada en Neon
- [ ] Archivo `.env.local` con `DATABASE_URL`
- [ ] Script SQL ejecutado en Neon
- [ ] App corriendo localmente (`npm run dev`)
- [ ] Login funcionando con admin@fonzi.com
- [ ] Repositorio en GitHub (opcional pero recomendado)
- [ ] Conectado a Vercel
- [ ] Variables de entorno en Vercel
- [ ] Desplegado y funcionando

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa la sección "Solución de Problemas"
2. Verifica que todas las variables de entorno están configuradas
3. Asegúrate de que todas las dependencias están instaladas
4. Recarga la página y limpia el caché del navegador
5. Reinicia el servidor de desarrollo

---

**¡Listo! Tu cafetería FONZI está lista para gestionar sus pedidos. ¡Que disfrutes! ☕**
