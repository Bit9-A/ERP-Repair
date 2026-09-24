# 🚀 Kit de Despliegue Multi-Tenant para ERP-Repair

Arquitectura de aislamiento total **Contenedor por Tenant + Base de Datos PostgreSQL por Tenant**, con **Caddy** como Reverse Proxy central con SSL/TLS automático (Let's Encrypt / ZeroSSL) y sin puertos expuestos al host.

---

## 🏛️ Arquitectura General

```text
               INTERNET (Navegadores / Clientes)
                              │
                    HTTPS (80 / 443)
                              ▼
        ┌──────────────────────────────────────────────┐
        │        CADDY REVERSE PROXY (Host)            │
        │   - Emisión y renovación automática SSL      │
        │   - Enrutamiento por subdominio o dominio    │
        └──────────────────────┬───────────────────────┘
                               │ Red Docker: erp_proxy
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
   ┌───────────────────────┐       ┌───────────────────────┐
   │ TENANT: taller-centro │       │ TENANT: fix-express   │
   │                       │       │                       │
   │  ┌─────────────────┐  │       │  ┌─────────────────┐  │
   │  │ api-taller-     │  │       │  │ api-fix-        │  │
   │  │ centro:3000     │  │       │  │ express:3000    │  │
   │  │ (Node.js/Vite)  │  │       │  │ (Node.js/Vite)  │  │
   │  └────────┬────────┘  │       │  └────────┬────────┘  │
   │           │           │       │           │           │
   │      Red privada      │       │      Red privada      │
   │           │           │       │           │           │
   │  ┌────────▼────────┐  │       │  ┌────────▼────────┐  │
   │  │ db-taller-      │  │       │  │ db-fix-         │  │
   │  │ centro:5432     │  │       │  │ express:5432    │  │
   │  │ (PostgreSQL 16) │  │       │  │ (PostgreSQL 16) │  │
   │  └─────────────────┘  │       │  └─────────────────┘  │
   │                       │       │                       │
   │  Volumen:             │       │  Volumen:             │
   │  erp-repair-db-       │       │  erp-repair-db-       │
   │  taller-centro        │       │  fix-express          │
   └───────────────────────┘       └───────────────────────┘
```

---

## 🔑 Principios de Diseño

1. **Aislamiento Físico Total**: Cada cliente tiene su propio proceso de PostgreSQL y su propia API. Un cliente nunca puede ver ni afectar los datos de otro.
2. **Cero Puertos en el Host**: Ni Postgres (5432) ni las APIs (3000) exponen puertos al exterior del VPS. Solo Caddy abre el puerto 80 y 443.
3. **Migración Automática**: El contenedor de la API ejecuta automáticamente `prisma db push` al arrancar. Cada nuevo tenant crea y sincroniza sus tablas automáticamente sin ejecutar migraciones manuales.
4. **Bundle Unificado**: La API Node.js sirve tanto los endpoints `/api/*` como el frontend compilado (React/Vite) como SPA estático.
5. **SSL Transparente**: Soporta dominios propios (`reparaciones.miempresa.com`) o dominios automáticos `sslip.io` (`cliente.<VPS-IP>.sslip.io`) con certificados SSL reales de Let's Encrypt sin tocar DNS.

---

## 🛠️ Puesta en Marcha en el VPS (Paso a Paso)

### 1. Requisitos en el VPS (Ubuntu 22.04 / 24.04)
```bash
# Actualizar e instalar dependencias básicas
sudo apt update && sudo apt install -y git curl gettext-base openssl

# Instalar Docker Engine + Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. Clonar el Repositorio en `/opt/erp-repair`
```bash
cd /opt
git clone https://github.com/Bit9-A/ERP-Repair.git erp-repair
cd /opt/erp-repair
```

### 3. Configurar e Iniciar el Reverse Proxy (Caddy)
```bash
cp deploy/.env.example deploy/.env
nano deploy/.env
# Configura tu email: CADDY_EMAIL=tu_correo@gmail.com
# Opcional: BASE_DOMAIN=tudominio.com

# Iniciar Caddy
docker compose -f deploy/docker-compose.yml up -d
```

---

## 👥 Aprovisionamiento de Clientes (Tenants)

### Crear un Cliente Automático
```bash
# Con subdominio automático sslip.io:
./deploy/scripts/add-client.sh taller-juan

# Con dominio personalizado y credenciales iniciales de admin:
./deploy/scripts/add-client.sh megarepair repair.tudominio.com admin@tudominio.com admin ClaveSegura2026!
```

El script automáticamente:
1. Valida el slug.
2. Genera credenciales únicas y contraseñas criptográficas con `openssl`.
3. Crea el stack de PostgreSQL y la API.
4. Ejecuta `prisma db push` para aplicar el esquema de la base de datos.
5. Crea el usuario Administrador y monedas por defecto.
6. Configura el archivo Caddy `deploy/caddy/sites/<slug>.caddy`.
7. Recarga Caddy en caliente sin cortes de servicio.

---

## 📦 Respaldos y Mantenimiento

### Respaldar todos los clientes
```bash
./deploy/scripts/backup-clients.sh
```
Guarda volcados comprimidos `.sql.gz` en `deploy/backups/<slug>/` con rotación automática (14 días por defecto).

### Restaurar un cliente específico
```bash
gunzip -c deploy/backups/<slug>/<archivo>.sql.gz \
  | docker compose -f deploy/clients/<slug>/docker-compose.yml exec -T db \
      psql -U erp_user -d <nombre_db>
```

### Actualizar código para todos los clientes
```bash
./deploy/scripts/update-all-tenants.sh
```
Descarga el código nuevo de Git, recompila la imagen base y reinicia los contenedores de las APIs sin tocar los datos de las bases de datos.

### Eliminar un cliente
```bash
./deploy/scripts/remove-client.sh <slug>
```
Elimina los contenedores, redes y volúmenes de datos del cliente previa confirmación por teclado.
