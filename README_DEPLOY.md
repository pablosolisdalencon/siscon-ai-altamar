# Guía de Despliegue - SISCON-AI Altamar (Producción)

Este documento describe los pasos necesarios para desplegar la aplicación en el hosting de Altamar utilizando GitHub Actions.

## 1. Configuración de Secrets en GitHub

Debes agregar los siguientes secretos en tu repositorio de GitHub (**Settings > Secrets and variables > Actions > New repository secret**):

| Nombre del Secreto | Valor |
| :--- | :--- |
| `FTP_HOST` | `ftp.altamarmkt.cl` |
| `FTP_USER` | `altamarm` |
| `FTP_PASS` | `DG1%6fG1m0-b6yU` |

## 2. Configuración en cPanel (Backend Node.js)

Para que el backend funcione, debes configurar una aplicación Node.js en cPanel:

1. Busca **"Setup Node.js App"** en tu cPanel.
2. Haz clic en **"Create Application"**.
3. **Node.js version**: Selecciona la versión `20.x` (o la más reciente disponible).
4. **Application mode**: `Production`.
5. **Application root**: `public_html/siscon-ai/api`.
6. **Application URL**: `tu-dominio.cl/siscon-ai/api`.
7. **Application startup file**: `src/server.js`.
8. Haz clic en **"Create"**.
9. Una vez creada, cPanel te dará un comando para entrar al entorno virtual (ej: `source /home/altamarm/nodevenv/...`). Cópialo y ejecútalo en la terminal de cPanel para instalar las dependencias con `npm install`.

## 3. Configuración de Redirección (.htaccess)

Para que React maneje las rutas correctamente y las peticiones al API lleguen al backend, asegúrate de tener un archivo `.htaccess` en `public_html/siscon-ai/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /siscon-ai/
  
  # Si la petición empieza por /api, dejar que el servidor la maneje (hacia Node.js)
  RewriteCond %{REQUEST_URI} ^/siscon-ai/api [NC]
  RewriteRule .* - [L]

  # Para el resto de rutas de React, redirigir a index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /siscon-ai/index.html [L]
</IfModule>
```

## 4. Archivo .env en el Servidor

El workflow de GitHub Actions **no sube archivos .env** por seguridad. Debes crear manualmente el archivo `.env` en `public_html/siscon-ai/api/.env` con el contenido del archivo `packages/api/.env.prod` que he generado.

---
**ERIC V2.1** - *Optimización y Ejecución Agnóstica.*
