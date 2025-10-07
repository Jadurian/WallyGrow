from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models
from .database import engine, get_db
from pydantic import BaseModel
from typing import Optional

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="WallyGrow API")

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

class VentaCreate(BaseModel):
    cliente_id: int
    producto_id: int
    cantidad: int

# Endpoints
@app.get("/")
def root():
    return {"message": "WallyGrow API"}

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
    producto = db.query(models.Producto).filter(models.Producto.id == venta.producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if producto.stock < venta.cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente")
    
    total = producto.precio * venta.cantidad
    db_venta = models.Venta(
        cliente_id=venta.cliente_id,
        producto_id=venta.producto_id,
        cantidad=venta.cantidad,
        total=total
    )
    producto.stock -= venta.cantidad
    db.add(db_venta)
    db.commit()
    db.refresh(db_venta)
    return db_venta

@app.get("/ventas")
def listar_ventas(db: Session = Depends(get_db)):
    return db.query(models.Venta).all()
