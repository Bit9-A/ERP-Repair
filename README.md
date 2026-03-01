# RepairShop ERP — PRO MAX 🚀

Un moderno sistema ERP diseñado específicamente para talleres de reparación de dispositivos electrónicos (celulares, tablets, laptops). Facilita la gestión integral del negocio: desde el ingreso de tickets y seguimiento Kanban, hasta el control de inventario, finanzas multimoneda y cálculo de comisiones.

![RepairShop ERP](https://via.placeholder.com/800x400?text=RepairShop+ERP+PRO+MAX)

## 📋 Características Principales

### 💻 Frontend (React + Vite + Mantine UI)

- **Dashboard Interactivo:** Vista rápida de KPIs (Tickets activos, ingresos del día, stock bajo) y un resumen del "Workflow Status" estilo Kanban.
- **Módulo de Reparaciones (Kanban):** Tablero _drag-and-drop_ para gestionar el flujo de trabajo de los equipos (Cotización -> Recibido -> Revisión -> Esperando Repuesto -> Reparado -> Entregado).
- **Control de Inventario:** Listado de stock en tiempo real, alertas de bajo stock, y gestión de categorías (Repuestos, Accesorios).
- **Gestión Financiera Multimoneda:** Soporte nativo para transacciones en múltiples monedas (USD, VES, COP) con tasas de cambio actualizables, Arqueo de Caja y panel de conciliación.
- **Catálogo de Servicios:** Administración de la mano de obra, precios base y comisiones para técnicos.
- **Gestión de Usuarios:** Roles (Admin, Técnico) con lógica de nómina (salario fijo, comisión pura, mixto).

### ⚙️ Backend (Node.js + Express + Prisma + PostgreSQL)

- **Arquitectura DDD (Domain-Driven Design):** Código organizado por dominios de negocio (`users`, `inventory`, `services`, `repairs`, `finance`) para alta escalabilidad y fácil mantenimiento.
- **API RESTful Segura:** Autenticación basada en JWT (`Bearer tokens`) y Guards por roles de usuario.
- **Congelación de Precios:** Los precios de los repuestos y las comisiones de los servicios se "congelan" al momento de asociarlos a un ticket, preservando la integridad del historial financiero ante futuros cambios de precios.
- **Validación Transaccional:** Uso de `Prisma $transaction` para asegurar la coherencia de datos (ej. descontar stock solo si se asigna el repuesto exitosamente).
- **Cierre de Caja:** Endpoints dedicados para agrupar ingresos diarios por método de pago y moneda.

---

## 🛠️ Tecnologías Utilizadas

**Frontend (`/frontend`)**

- React 18 + TypeScript
- Vite
- Mantine UI v7 (Componentes, Hooks, Form)
- Tabler Icons React
- CSS Variables + CSS Modules

**Backend (`/backend`)**

- Node.js (Express 5) + TypeScript
- Prisma ORM
- PostgreSQL
- JWT & bcryptjs para Autenticación

---

## 🚀 Guía de Instalación y Ejecución Local

Para levantar este proyecto en tu entorno de desarrollo, sigue estos pasos:

### 1. Requisitos Previos

- [Node.js](https://nodejs.org/) (v18 o superior)
- [PostgreSQL](https://www.postgresql.org/) (Corriendo localmente en el puerto `5432`)
- Git

### 2. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd ERP-Repair
```

### 3. Configuración del Backend

```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita el .env con tus credenciales de PostgreSQL (DATABASE_URL) y tu JWT_SECRET

# 3. Preparar la Base de Datos (Prisma)
npx prisma generate
npx prisma migrate dev --name init

# 4. Iniciar el servidor en modo desarrollo
npm run dev
# El servidor se levantará en http://localhost:3001
```

### 4. Configuración del Frontend

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo Vite
npm run dev
# La aplicación estará disponible en http://localhost:5173
```

---

## 📂 Estructura del Proyecto

### Backend

```text
/backend
├── prisma/
│   └── schema.prisma           # Esquema de BD (PostgreSQL)
├── src/
│   ├── config/                 # Configuración de Entorno y Prisma
│   ├── core/                   # Middlewares (Auth, Errores) y Utilidades (Moneda)
│   ├── modules/                # Dominios del Negocio (DDD)
│   │   ├── finance/
│   │   ├── inventory/
│   │   ├── repairs/
│   │   ├── services/
│   │   └── users/
│   ├── app.ts                  # Configuración de Express
│   └── server.ts               # Punto de entrada
└── package.json
```

### Frontend

```text
/frontend
├── src/
│   ├── app/                    # Entry point y Theme de Mantine
│   ├── components/             # Componentes UI reutilizables (Sidebar, TopBar, StatCard)
│   ├── features/               # Dominios del UI
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── finance/
│   │   ├── inventory/
│   │   ├── repairs/
│   │   └── tickets/
│   ├── lib/                    # Constantes globales (Estados, Colores)
│   ├── styles/                 # CSS Global
│   └── types/                  # Interfaces Globales de TS
└── index.html
```

---

## 🤝 Contribución

1. Haz un _Fork_ del proyecto
2. Crea una nueva rama para tu funcionalidad (`git checkout -b feature/NuevaFuncionalidad`)
3. Haz _Commit_ de tus cambios (`git commit -m 'Añadir Nueva Funcionalidad'`)
4. Haz _Push_ a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un _Pull Request_

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.
