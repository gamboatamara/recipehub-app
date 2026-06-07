<div align="center">

# RecipeHub App

Aplicación web colaborativa para compartir, explorar, comentar y calificar recetas de cocina.






<img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=111827" alt="React" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
<img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/Express-111827?style=flat-square&logo=express&logoColor=white" alt="Express" />
<img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
<img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
<img src="https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white" alt="Nginx" />

</div>

---



## Descripción

RecipeHub permite que los usuarios se registren, inicien sesión, publiquen recetas, exploren recetas de otras personas y participen mediante comentarios y calificaciones.

La aplicación está separada en dos partes principales:

- **Frontend:** una SPA creada con React y Vite.
- **Backend:** una API REST construida con Node.js, Express y MongoDB.

El despliegue se realiza en una VPS Ubuntu 24.04 usando Docker Compose para la API y MongoDB, Nginx como servidor web y reverse proxy, certificados SSL con Let's Encrypt y automatización mediante GitHub Actions.

---

## URLs de producción

| Servicio | URL |
| --- | --- |
| Frontend | [https://app.recipehubapp.xyz](https://app.recipehubapp.xyz) |
| Backend API | [https://api.recipehubapp.xyz](https://api.recipehubapp.xyz) |
| Health check | [https://api.recipehubapp.xyz/api/health](https://api.recipehubapp.xyz/api/health) |

---

## Stack tecnológico

### Frontend

- React
- Vite
- React Router DOM
- Axios
- pnpm

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Cloudinary

### Infraestructura

- VPS Ubuntu 24.04
- Docker Engine
- Docker Compose plugin v2
- Nginx
- Certbot
- Let's Encrypt SSL
- GitHub Actions

---

## Arquitectura general

La aplicación está desplegada en una VPS Ubuntu 24.04.

El frontend se compila con Vite y genera la carpeta `frontend/dist/`. Ese build se copia al servidor y Nginx lo sirve desde el subdominio:

```txt
https://app.recipehubapp.xyz
```

El backend corre dentro de un contenedor Docker con Node.js y Express. La API escucha internamente en el puerto `4000`, y Nginx la publica mediante HTTPS en:

```txt
https://api.recipehubapp.xyz
```

MongoDB 7 se ejecuta en otro contenedor dentro de la red interna de Docker Compose. No expone puertos públicos, por lo que sólo la API puede comunicarse directamente con la base de datos.

```txt
Usuario
  |
  | HTTPS
  v
Nginx
  |
  |-- app.recipehubapp.xyz
  |     -> React build: /var/www/recipehubapp/app
  |
  |-- api.recipehubapp.xyz
        -> reverse proxy a http://127.0.0.1:4000
        -> contenedor api
              |
              v
        contenedor mongo
```

---

## Estructura del proyecto

```txt
recipehub-app/
|-- backend/
|   |-- Dockerfile
|   |-- .env.example
|   |-- package.json
|   |-- src/
|   `-- tests/
|-- frontend/
|   |-- .env.example
|   |-- package.json
|   `-- src/
|-- .github/
|   `-- workflows/
|       `-- deploy.yml
|-- docker-compose.yml
|-- nginx-api.conf
|-- nginx-app.conf
|-- .env.example
`-- README.md
```

---




## Variables de entorno

El archivo `.env` real se mantiene solo en la VPS y no se sube al repositorio.

### Backend y Docker Compose

Estas variables se usan para levantar MongoDB y la API con `docker-compose.yml`.

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto interno donde escucha la API de Express. |
| `MONGO_INITDB_ROOT_USERNAME` | Usuario root inicial del contenedor de MongoDB. |
| `MONGO_INITDB_ROOT_PASSWORD` | Password root inicial del contenedor de MongoDB. |
| `MONGO_INITDB_DATABASE` | Nombre de la base de datos creada al iniciar MongoDB. |
| `MONGO_URI` | Cadena de conexión usada por el backend para conectarse a MongoDB. |
| `JWT_SECRET` | Secreto usado para firmar y validar tokens JWT. |
| `JWT_EXPIRES_IN` | Tiempo de expiración de los tokens JWT. |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud de Cloudinary para almacenar imágenes. |
| `CLOUDINARY_API_KEY` | API key de Cloudinary. |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary. |

Ejemplo para la raíz del proyecto:

```env
PORT=4000
MONGO_INITDB_ROOT_USERNAME=change_me
MONGO_INITDB_ROOT_PASSWORD=change_me
MONGO_INITDB_DATABASE=recipehub
MONGO_URI=mongodb://change_me:change_me@mongo:27017/recipehub?authSource=admin
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=change_me
CLOUDINARY_API_KEY=change_me
CLOUDINARY_API_SECRET=change_me
```

En desarrollo local, el backend puede usar `backend/.env.example` como referencia:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/recipehub
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=change_me
CLOUDINARY_API_KEY=change_me
CLOUDINARY_API_SECRET=change_me
```

### Frontend

El frontend solo necesita conocer la URL base de la API.

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL base que Axios usa para enviar peticiones al backend. |

Ejemplo para desarrollo local:

```env
VITE_API_URL=http://localhost:4000/api
```

Ejemplo para producción:

```env
VITE_API_URL=https://api.recipehubapp.xyz/api
```

### GitHub Secrets

El despliegue automático usa GitHub Secrets para no exponer credenciales en el código fuente.

```txt
VPS_HOST
VPS_USER
VPS_SSH_KEY
MONGO_ROOT_USERNAME
MONGO_ROOT_PASSWORD
MONGO_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

## Ejecución con Docker Compose

Desde la raíz del proyecto en la VPS:

```bash
docker compose up -d --build
```

Verificar contenedores:

```bash
docker compose ps
```

Ver logs del backend:

```bash
docker compose logs api --tail=100
```

Probar la API localmente:

```bash
curl http://127.0.0.1:4000/api/health
```

---

## Backend

El backend se construye con Docker usando:

```txt
backend/Dockerfile
```

El servicio `api` se define en `docker-compose.yml` y se conecta al servicio `mongo` dentro de la red interna de Docker.

Endpoint de verificación:

```txt
GET /api/health
```

Ejemplo:

```bash
curl https://api.recipehubapp.xyz/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

## MongoDB

MongoDB usa la imagen oficial:

```txt
mongo:7
```

La base de datos mantiene la información en un volumen nombrado:

```txt
recipehub-mongo-data
```

MongoDB no tiene puertos públicos expuestos. Esto ayuda a que la base de datos quede aislada y accesible solo desde los servicios internos.

---

## Frontend

Instalar dependencias:

```bash
cd frontend
pnpm install
```

Compilar para producción:

```bash
pnpm build
```

El build genera:

```txt
frontend/dist/
```

Esa carpeta se copia al directorio servido por Nginx:

```txt
/var/www/recipehubapp/app
```

---

## Nginx y SSL

Nginx se utiliza para:

1. Servir el frontend compilado de React.
2. Funcionar como reverse proxy para la API.
3. Redirigir HTTP a HTTPS.
4. Gestionar el tráfico de los subdominios.

Archivos de configuración incluidos:

```txt
nginx-api.conf
nginx-app.conf
```

El frontend usa configuración para SPA:

```nginx
try_files $uri $uri/ /index.html;
```

Esto permite que rutas como `/login`, `/register`, `/recetas/:id` y `/perfil` funcionen correctamente al refrescar la página.

### Certificados SSL

Los certificados SSL fueron generados con Certbot para:

```txt
api.recipehubapp.xyz
app.recipehubapp.xyz
```

Comando usado:

```bash
sudo certbot --nginx -d api.recipehubapp.xyz -d app.recipehubapp.xyz
```

Verificar certificados:

```bash
sudo certbot certificates
```

Probar renovación automática:

```bash
sudo certbot renew --dry-run
```

### Redirección HTTP a HTTPS

Verificación:

```bash
curl -I http://api.recipehubapp.xyz/api/health
curl -I http://app.recipehubapp.xyz
```

Respuesta esperada:

```txt
HTTP/1.1 301 Moved Permanently
```

---

## Pruebas unitarias

El backend incluye 3 pruebas unitarias que se ejecutan con:

```bash
cd backend
pnpm test
```

Pruebas implementadas:

```txt
GET /api/health responde status 200 y status ok
POST /api/recetas/:id/comentarios sin token responde 401
POST /api/recetas/:id/comentarios con calificación inválida responde 400
```

Resultado esperado:

```txt
3/3 tests passed
```

---

## CI/CD con GitHub Actions

El pipeline se encuentra en:

```txt
.github/workflows/deploy.yml
```

El workflow se ejecuta automáticamente en cada push a la rama `main`.

Flujo del pipeline:

1. Checkout del repositorio.
2. Configuración de Node.js 22.
3. Activación de pnpm.
4. Instalación de dependencias del backend.
5. Ejecución de pruebas unitarias.
6. Instalación de dependencias del frontend.
7. Build del frontend.
8. Carga del build como artifact.
9. Conexión SSH al VPS.
10. Copia del frontend compilado a Nginx.
11. Actualización del código en `/opt/recipehub`.
12. Creación del `.env` usando GitHub Secrets.
13. Ejecución de `docker compose up -d --build`.
14. Health check post-deploy contra `https://api.recipehubapp.xyz/api/health`.

---

## Comandos útiles de producción

Entrar al proyecto en la VPS:

```bash
cd /opt/recipehub
```

Ver contenedores:

```bash
docker compose ps
```

Ver logs del backend:

```bash
docker compose logs api --tail=100
```

Probar health check:

```bash
curl https://api.recipehubapp.xyz/api/health
```

Probar frontend:

```bash
curl -I https://app.recipehubapp.xyz
```

Verificar SSL:

```bash
sudo certbot certificates
```

---

## Seguridad

- El archivo `.env` real no se sube al repositorio.
- Las credenciales se manejan mediante GitHub Secrets.
- El acceso al VPS se realiza mediante llave SSH.
- MongoDB se mantiene dentro de la red interna de Docker.
- La API queda detrás de Nginx.
- El tráfico HTTP se redirige automáticamente a HTTPS.
- Cloudinary se configura mediante variables de entorno.
- Los archivos `.env.example` solo contienen nombres de variables y valores de ejemplo.

---

## Estado del despliegue

- Frontend desplegado correctamente en HTTPS.
- Backend desplegado correctamente en HTTPS.
- MongoDB funcionando en Docker.
- SSL válido con Let's Encrypt.
- Redirección HTTP a HTTPS activa.
- GitHub Actions ejecuta build, tests, deploy y health check.

---

<div align="center">

**RecipeHub App**  

</div>
