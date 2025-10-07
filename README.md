# WallyGrow - Sistema de Gestión Comercial

Proyecto dedicado a dar un sistema completo de comercio para gestión de ventas, inventario, clientes y proveedores.

## Tecnologías
- FastAPI (Backend)
- PostgreSQL (Base de datos)
- Docker & Docker Compose
- n8n (Automatizaciones)

## Inicio Rápido

1. Levantar servicios:
```bash
docker-compose up -d
```

2. Acceder a:
- API: http://localhost:8000
- Documentación API: http://localhost:8000/docs
- n8n: http://localhost:5678 (admin/admin123)

## Endpoints Disponibles

### Clientes
- POST /clientes - Crear cliente
- GET /clientes - Listar clientes

### Proveedores
- POST /proveedores - Crear proveedor
- GET /proveedores - Listar proveedores

### Productos
- POST /productos - Crear producto
- GET /productos - Listar productos

### Ventas
- POST /ventas - Registrar venta
- GET /ventas - Listar ventas

## Detener servicios
```bash
docker-compose down
```
