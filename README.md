# WallyGrow - Sistema de Gestión Comercial

Sistema completo de punto de venta (POS) con gestión de inventario, clientes, proveedores y reportes de ventas. Incluye interfaz web moderna y API REST completa.

## 🚀 Características

- **Punto de Venta (POS)**: Interfaz intuitiva para procesar ventas
- **Gestión de Inventario**: Control de productos y stock en tiempo real
- **Gestión de Clientes**: Base de datos de clientes con información de contacto
- **Gestión de Proveedores**: Administración de proveedores
- **Reportes**: Dashboard con estadísticas de ventas y métricas
- **API REST**: Backend completo con documentación automática
- **Interfaz Web**: Frontend responsive y moderno

## 🛠️ Tecnologías

### Backend
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **Pydantic** - Validación de datos
- **Uvicorn** - Servidor ASGI

### Frontend
- **HTML5/CSS3/JavaScript** - Interfaz web nativa
- **Responsive Design** - Compatible con dispositivos móviles

### Infraestructura
- **Docker & Docker Compose** - Containerización
- **n8n** - Automatizaciones y workflows

## 📋 Requisitos

- Docker y Docker Compose
- Puerto 8000 (API), 5432 (PostgreSQL), 5678 (n8n) disponibles

## 🚀 Inicio Rápido

1. **Clonar el repositorio**:
```bash
git clone <repository-url>
cd wallygrow-test
```

2. **Configurar variables de entorno** (opcional):
```bash
# El archivo .env ya está configurado con valores por defecto
# Puedes modificar las credenciales si es necesario
```

3. **Levantar servicios**:
```bash
docker-compose up -d
```

4. **Acceder a las aplicaciones**:
- **Interfaz Web**: http://localhost:8000/static/index.html
- **API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **n8n**: http://localhost:5678

## 🖥️ Interfaz de Usuario

La aplicación web incluye las siguientes secciones:

### Punto de Venta
- Selección de productos con información de stock
- Carrito de compras interactivo
- Selección de cliente
- Procesamiento de ventas

### Gestión de Productos
- Formulario para agregar productos
- Lista de productos con precios y stock
- Asociación con proveedores

### Gestión de Clientes
- Registro de nuevos clientes
- Lista de clientes con información de contacto
- Modal para creación rápida desde POS

### Reportes
- Estadísticas de ventas del día
- Contadores de productos y clientes
- Historial de ventas recientes

## 📡 API Endpoints

### Clientes
- `POST /clientes` - Crear cliente
- `GET /clientes` - Listar todos los clientes

**Esquema Cliente**:
```json
{
  "nombre": "string",
  "telefono": "string (opcional)",
  "email": "string (opcional)"
}
```

### Proveedores
- `POST /proveedores` - Crear proveedor
- `GET /proveedores` - Listar todos los proveedores

**Esquema Proveedor**:
```json
{
  "nombre": "string",
  "telefono": "string (opcional)",
  "email": "string (opcional)"
}
```

### Productos
- `POST /productos` - Crear producto
- `GET /productos` - Listar todos los productos

**Esquema Producto**:
```json
{
  "nombre": "string",
  "precio": "float",
  "stock": "integer",
  "proveedor_id": "integer (opcional)"
}
```

### Ventas
- `POST /ventas` - Registrar venta
- `GET /ventas` - Listar todas las ventas

**Esquema Venta**:
```json
{
  "cliente_id": "integer",
  "producto_id": "integer",
  "cantidad": "integer"
}
```

## 🗄️ Estructura de Base de Datos

### Tablas
- **clientes**: id, nombre, telefono, email
- **proveedores**: id, nombre, telefono, email
- **productos**: id, nombre, precio, stock, proveedor_id
- **ventas**: id, cliente_id, producto_id, cantidad, total, fecha

### Relaciones
- Productos → Proveedores (muchos a uno)
- Ventas → Clientes (muchos a uno)
- Ventas → Productos (muchos a uno)

## 🔧 Configuración

### Variables de Entorno (.env)
```env
POSTGRES_USER=wallygrow
POSTGRES_PASSWORD=wallygrow123
POSTGRES_DB=wallygrow_db
DATABASE_URL=postgresql://wallygrow:wallygrow123@db:5432/wallygrow_db
SECRET_KEY=tu-clave-secreta-cambiar-en-produccion
```

### Puertos
- **8000**: API FastAPI y archivos estáticos
- **5432**: PostgreSQL
- **5678**: n8n

## 🛠️ Desarrollo

### Estructura del Proyecto
```
wallygrow-test/
├── backend/
│   ├── app/
│   │   ├── main.py          # Aplicación FastAPI principal
│   │   ├── models.py        # Modelos SQLAlchemy
│   │   └── database.py      # Configuración de base de datos
│   ├── static/
│   │   ├── index.html       # Interfaz principal
│   │   ├── css/styles.css   # Estilos
│   │   └── js/
│   │       ├── app.js       # Lógica de la aplicación
│   │       └── api.js       # Cliente API
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml
├── .env
└── README.md
```

### Comandos Útiles

**Ver logs**:
```bash
docker-compose logs -f backend
```

**Reiniciar servicios**:
```bash
docker-compose restart
```

**Acceder al contenedor**:
```bash
docker-compose exec backend bash
```

**Backup de base de datos**:
```bash
docker-compose exec db pg_dump -U wallygrow wallygrow_db > backup.sql
```

## 🔄 Funcionalidades Avanzadas

### Control de Stock
- Validación automática de stock disponible
- Actualización en tiempo real tras ventas
- Alertas de stock insuficiente

### Interfaz Responsiva
- Diseño adaptable a móviles y tablets
- Navegación intuitiva por pestañas
- Modales para acciones rápidas

### Validaciones
- Validación de datos en frontend y backend
- Manejo de errores con mensajes informativos
- Prevención de ventas sin stock

## 🛑 Detener Servicios

```bash
docker-compose down
```

**Eliminar volúmenes** (⚠️ elimina datos):
```bash
docker-compose down -v
```

## 📝 Notas

- La aplicación incluye datos de prueba que se crean automáticamente
- El sistema maneja automáticamente la creación de tablas al iniciar
- Los archivos estáticos se sirven desde `/static/`
- La API incluye validación automática de esquemas con Pydantic
- n8n está preconfigurado para automatizaciones futuras
