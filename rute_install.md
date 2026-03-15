# Guía de Instalación Rápida para Nuevas Sucursales (ERP-Repair)

Esta guía detalla los pasos exactos para instalar, configurar y desplegar el sistema (Frontend y Backend) en una nueva computadora o servidor de sucursal utilizando **pnpm**, **PM2** y **Nginx**.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en la computadora de la sucursal:

1.  **Node.js** (Versión 18 o superior).
2.  **pnpm** (Instálalo ejecutando `npm install -g pnpm` si no viene por defecto).
3.  **Nginx** para Windows o Linux.
4.  Clonar o copiar la carpeta completa del proyecto `ERP-Repair` a la máquina destino.

---

## 🛠️ Paso 1: Configurar las Variables de Entorno

El sistema necesita saber cómo conectarse a la base de datos centralizada (Neon) y cuál es su clave secreta.

1.  Ve a la carpeta `backend/`.
2.  Crea un archivo llamado `.env` (si aún no existe) copiando el contenido de `.env.example`.
3.  Asegúrate de configurar los siguientes valores correctamente:
    ```env
    DATABASE_URL="postgresql://usuario:contraseña@servidor.neon.tech/tu_bdd?sslmode=require"
    JWT_SECRET="tu_clave_secreta_super_segura_aqui"
    PORT=3000
    ```

---

## 🚀 Paso 2: Instalar y Levantar el Backend (API)

He preparado un script ejecutable que automatiza este proceso mediante `pnpm`.

1.  Abre la carpeta principal de tu proyecto (`ERP-Repair`).
2.  Haz doble clic en el archivo **`1_instalar_backend.bat`**.
3.  **¿Qué hará este archivo?**
    - Instalará las librerías del backend.
    - Se conectará a la base de datos y descargará el esquema de Prisma (`generate`).
    - Verificará que las tablas de la base de datos existan y las creará si faltan (`db push`).
    - Compilará el código fuente de TypeScript.
    - Iniciará el servidor de forma silenciosa e infinita utilizando **PM2**.
    - Guardará el estado de PM2 para que el servidor reviva automáticamente si la PC se reinicia.
4.  Cuando termine, el script dirá "¡BACKEND INSTALADO Y CORRIENDO!". Puedes presionar cualquier tecla para cerrarlo.

---

## 🎨 Paso 3: Instalar y Compilar el Frontend (React)

Ahora necesitamos generar los archivos visuales de la aplicación.

1.  Abre la carpeta principal de tu proyecto (`ERP-Repair`).
2.  Haz doble clic en el archivo **`2_instalar_frontend.bat`**.
3.  **¿Qué hará este archivo?**
    - Descargará las librerías del frontend.
    - Compilará todo el sistema en una versión optimizada para producción (`dist`).
4.  Cuando termine, dirá "¡FRONTEND COMPILADO CON EXITO!". Aparecerá una nueva carpeta llamada `dist/` dentro de `ERP-Repair/frontend/`.

---

## 🌐 Paso 4: Configurar Nginx (Servidor Web y Enrutador)

Nginx será la cara del sistema. Mostrará la web y reenviará las peticiones silenciosas (API) hacia Node.

1.  Ve a la carpeta donde instalaste Nginx (Ejemplo: `C:\nginx\`).
2.  Busca la carpeta `conf` y abre el archivo **`nginx.conf`** con un editor de texto (como Bloc de Notas).
3.  Copia y pega el contenido del archivo `nginx.conf` que te generé previamente (el que está en la carpeta raíz de tu proyecto).
4.  **¡IMPORTANTE!** Dentro de ese archivo, debes cambiar la línea `root` para que apunte exactamente a donde está tu carpeta compilada del paso anterior.
    ```nginx
    # CAMBIA ESTO por la ruta real de tu computadora:
    root "C:/TuRuta/ERP-Repair/frontend/dist";
    ```
5.  Guarda los cambios en el archivo.
6.  Abre una terminal normal o PowerShell y navega hasta la carpeta de Nginx (`cd C:\nginx`).
7.  Inicia Nginx escribiendo:
    ```bash
    start nginx
    ```
    _(Nota: Si alguna vez cambias el archivo de Nginx, recárgalo con `nginx -s reload`)_.

---

## ✅ Verificación Final

Para confirmar que todo quedó perfecto:

1.  Abre Google Chrome o tu navegador favorito en esa computadora.
2.  Escribe `http://localhost` en la barra de direcciones.
3.  Deberías ver la pantalla de Login del ERP.
4.  Intenta iniciar sesión. Si entras al sistema con éxito, significa que Nginx, el Frontend compilado, el Backend con PM2 y la Base de Datos están trabajando juntos en perfecta sintonía. 🎉

_(Si necesitas entrar desde otro teléfono o PC conectado al mismo Wi-Fi de la sucursal, simplemente averigua la IP Local de esta computadora principal (ej: `192.168.1.50`) y escríbela en el navegador del celular)._
