from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from . import models
from .database import engine, get_db
from pydantic import BaseModel
from typing import Optional
import time
import logging

app = FastAPI(title="WallyGrow API")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos estáticos
import os
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.on_event("startup")
async def startup_event():
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            models.Base.metadata.create_all(bind=engine)
            logging.info("Database tables created successfully")
            
            # Crear datos de prueba
            db = next(get_db())
            if db.query(models.Cliente).count() == 0:
                crear_datos_prueba(db)
            
            break
        except Exception as e:
            retry_count += 1
            logging.warning(f"Database connection attempt {retry_count}/{max_retries} failed: {e}")
            if retry_count >= max_retries:
                logging.error("Could not connect to database after maximum retries")
                raise e
            time.sleep(2)

def crear_datos_prueba(db: Session):
    # Cliente por defecto (siempre ID=1)
    cliente_default = models.Cliente(nombre="Consumidor Final", telefono="", email="")
    db.add(cliente_default)
    db.commit()
    
    # Clientes de prueba
    clientes = [
        models.Cliente(nombre="Juan Pérez", telefono="555-0101", email="juan@email.com"),
        models.Cliente(nombre="María García", telefono="555-0102", email="maria@email.com"),
        models.Cliente(nombre="Carlos López", telefono="555-0103")
    ]
    
    # Proveedores de prueba
    proveedores = [
        models.Proveedor(nombre="Distribuidora ABC", telefono="555-1001", email="ventas@abc.com"),
        models.Proveedor(nombre="Mayorista XYZ", telefono="555-1002")
    ]
    
    for cliente in clientes:
        db.add(cliente)
    for proveedor in proveedores:
        db.add(proveedor)
    
    db.commit()
    
    # Productos de prueba
    productos = [
        models.Producto(nombre="Coca Cola 500ml", precio=2.50, stock=50, proveedor_id=1),
        models.Producto(nombre="Pan Integral", precio=1.80, stock=30, proveedor_id=2),
        models.Producto(nombre="Leche Entera 1L", precio=3.20, stock=25, proveedor_id=1),
        models.Producto(nombre="Arroz 1kg", precio=4.50, stock=40, proveedor_id=2),
        models.Producto(nombre="Aceite Girasol 900ml", precio=5.80, stock=20, proveedor_id=1)
    ]
    
    for producto in productos:
        db.add(producto)
    
    db.commit()
    logging.info("Datos de prueba creados exitosamente")

# Schemas
class ClienteCreate(BaseModel):
    nombre: str
    telefono: Optional[str] = None
    email: Optional[str] = None

class ProveedorCreate(BaseModel):
    nombre: str
    telefono: Optional[str] = None
    email: Optional[str] = None

class ProductoCreate(BaseModel):
    nombre: str
    precio: float
    stock: int = 0
    proveedor_id: Optional[int] = None

class VentaItemCreate(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float

class VentaCreate(BaseModel):
    cliente_id: int
    items: list[VentaItemCreate]

# Endpoints
@app.get("/")
def root():
    return {"message": "WallyGrow API - Sistema de Gestión Comercial"}

@app.post("/clientes")
def crear_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    db_cliente = models.Cliente(**cliente.dict())
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente

@app.get("/clientes")
def listar_clientes(db: Session = Depends(get_db)):
    return db.query(models.Cliente).all()

@app.post("/proveedores")
def crear_proveedor(proveedor: ProveedorCreate, db: Session = Depends(get_db)):
    db_proveedor = models.Proveedor(**proveedor.dict())
    db.add(db_proveedor)
    db.commit()
    db.refresh(db_proveedor)
    return db_proveedor

@app.get("/proveedores")
def listar_proveedores(db: Session = Depends(get_db)):
    return db.query(models.Proveedor).all()

@app.post("/productos")
def crear_producto(producto: ProductoCreate, db: Session = Depends(get_db)):
    db_producto = models.Producto(**producto.dict())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto

@app.get("/productos")
def listar_productos(db: Session = Depends(get_db)):
    return db.query(models.Producto).all()

@app.post("/ventas")
def crear_venta(venta: VentaCreate, db: Session = Depends(get_db)):
    total_venta = 0
    ventas_creadas = []
    
    for item in venta.items:
        producto = db.query(models.Producto).filter(models.Producto.id == item.producto_id).first()
        if not producto:
            raise HTTPException(status_code=404, detail=f"Producto {item.producto_id} no encontrado")
        if producto.stock < item.cantidad:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {producto.nombre}")
        
        total_item = item.precio_unitario * item.cantidad
        total_venta += total_item
        
        db_venta = models.Venta(
            cliente_id=venta.cliente_id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            total=total_item
        )
        producto.stock -= item.cantidad
        db.add(db_venta)
        ventas_creadas.append(db_venta)
    
    db.commit()
    return {"ventas": ventas_creadas, "total": total_venta}

@app.get("/ventas")
def listar_ventas(db: Session = Depends(get_db)):
    return db.query(models.Venta).all()

@app.delete("/clientes/{cliente_id}")
def eliminar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(models.Cliente).filter(models.Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    db.delete(cliente)
    db.commit()
    return {"message": "Cliente eliminado"}

@app.delete("/productos/{producto_id}")
def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()
    return {"message": "Producto eliminado"}

@app.delete("/proveedores/{proveedor_id}")
def eliminar_proveedor(proveedor_id: int, db: Session = Depends(get_db)):
    proveedor = db.query(models.Proveedor).filter(models.Proveedor.id == proveedor_id).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    db.delete(proveedor)
    db.commit()
    return {"message": "Proveedor eliminado"}
