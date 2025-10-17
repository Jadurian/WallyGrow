# Guía de Desarrollo - Enfoque Híbrido

## ✅ Configuración Completada

### Dependencias Instaladas Localmente:
- fastapi
- uvicorn
- sqlalchemy
- python-dotenv
- pydantic
- python-multipart
- psycopg2-binary

### Servicios en Docker:
- PostgreSQL (puerto 5432)

## 🚀 Cómo Trabajar

### 1. Levantar Base de Datos (Docker)
```bash
docker-compose up -d db
```

### 2. Activar Entorno Virtual
```bash
.venv\Scripts\activate
```

### 3. Ejecutar FastAPI Localmente
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Acceder a la Aplicación
- **Frontend**: http://localhost:8000/static/index.html
- **API Docs**: http://localhost:8000/docs
- **API**: http://localhost:8000

## 🛠️ Comandos Útiles

### Ver logs de PostgreSQL
```bash
docker-compose logs -f db
```

### Detener PostgreSQL
```bash
docker-compose down
```

### Reinstalar dependencias
```bash
.venv\Scripts\activate
pip install -r backend\requirements.txt
```

## 📝 Ventajas de este Enfoque

✅ **IDE funciona perfectamente**: Autocompletado, debugging, linting
✅ **Hot reload rápido**: Cambios instantáneos sin rebuilds
✅ **Base de datos consistente**: PostgreSQL en Docker
✅ **Desarrollo ágil**: Sin esperas de compilación

## 🔄 Para Producción

Usa Docker Compose completo:
```bash
docker-compose up -d
```

Esto levanta todo el stack (backend, db, n8n).
