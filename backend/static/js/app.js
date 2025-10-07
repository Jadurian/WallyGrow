let carrito = [];
let productos = [];
let clientes = [];

// Navegación
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.section).classList.add('active');
    });
});

// Cargar datos iniciales
async function init() {
    await cargarProductos();
    await cargarClientes();
    await cargarReportes();
}

// PRODUCTOS
async function cargarProductos() {
    try {
        productos = await api.get('/productos');
        renderProductosGrid();
        renderProductosTabla();
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

function renderProductosGrid() {
    const grid = document.getElementById('productos-lista');
    grid.innerHTML = productos.map(p => `
        <div class="producto-card" onclick="agregarAlCarrito(${p.id})">
            <h4>${p.nombre}</h4>
            <p class="precio">$${p.precio.toFixed(2)}</p>
            <p class="stock">Stock: ${p.stock}</p>
        </div>
    `).join('');
}

function renderProductosTabla() {
    const tabla = document.getElementById('productos-tabla');
    tabla.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${productos.map(p => `
                    <tr>
                        <td>${p.nombre}</td>
                        <td>$${p.precio.toFixed(2)}</td>
                        <td>${p.stock}</td>
                        <td>
                            <button onclick="eliminarProducto(${p.id})" class="btn-danger">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

document.getElementById('producto-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        nombre: document.getElementById('producto-nombre').value,
        precio: parseFloat(document.getElementById('producto-precio').value),
        stock: parseInt(document.getElementById('producto-stock').value)
    };
    try {
        await api.post('/productos', data);
        e.target.reset();
        await cargarProductos();
    } catch (error) {
        alert('Error al agregar producto');
    }
});

async function eliminarProducto(id) {
    if (confirm('¿Eliminar este producto?')) {
        try {
            await api.delete(`/productos/${id}`);
            await cargarProductos();
        } catch (error) {
            alert('Error al eliminar producto');
        }
    }
}

// CLIENTES
async function cargarClientes() {
    try {
        clientes = await api.get('/clientes');
        renderClientesSelect();
        renderClientesTabla();
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

function renderClientesSelect() {
    const select = document.getElementById('cliente-select');
    select.innerHTML = '<option value="">Seleccionar Cliente</option>' +
        clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
}

function renderClientesTabla() {
    const tabla = document.getElementById('clientes-tabla');
    tabla.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${clientes.map(c => `
                    <tr>
                        <td>${c.nombre}</td>
                        <td>${c.telefono || '-'}</td>
                        <td>${c.email || '-'}</td>
                        <td>
                            <button onclick="eliminarCliente(${c.id})" class="btn-danger">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

document.getElementById('cliente-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        nombre: document.getElementById('cliente-nombre').value,
        telefono: document.getElementById('cliente-telefono').value,
        email: document.getElementById('cliente-email').value
    };
    try {
        await api.post('/clientes', data);
        e.target.reset();
        await cargarClientes();
    } catch (error) {
        alert('Error al agregar cliente');
    }
});

async function eliminarCliente(id) {
    if (confirm('¿Eliminar este cliente?')) {
        try {
            await api.delete(`/clientes/${id}`);
            await cargarClientes();
        } catch (error) {
            alert('Error al eliminar cliente');
        }
    }
}

// CARRITO
function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto || producto.stock === 0) {
        alert('Producto sin stock');
        return;
    }
    
    const itemExistente = carrito.find(item => item.producto_id === productoId);
    if (itemExistente) {
        if (itemExistente.cantidad < producto.stock) {
            itemExistente.cantidad++;
        } else {
            alert('No hay más stock disponible');
            return;
        }
    } else {
        carrito.push({
            producto_id: productoId,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }
    renderCarrito();
}

function eliminarDelCarrito(productoId) {
    carrito = carrito.filter(item => item.producto_id !== productoId);
    renderCarrito();
}

function cambiarCantidad(productoId, delta) {
    const item = carrito.find(i => i.producto_id === productoId);
    const producto = productos.find(p => p.id === productoId);
    
    if (item) {
        item.cantidad += delta;
        if (item.cantidad <= 0) {
            eliminarDelCarrito(productoId);
        } else if (item.cantidad > producto.stock) {
            item.cantidad = producto.stock;
            alert('No hay más stock disponible');
        }
        renderCarrito();
    }
}

function renderCarrito() {
    const container = document.getElementById('carrito-items');
    if (carrito.length === 0) {
        container.innerHTML = '<p class="carrito-vacio">Carrito vacío</p>';
    } else {
        container.innerHTML = carrito.map(item => `
            <div class="carrito-item">
                <div class="item-info">
                    <strong>${item.nombre}</strong>
                    <span>$${item.precio.toFixed(2)}</span>
                </div>
                <div class="item-controls">
                    <button onclick="cambiarCantidad(${item.producto_id}, -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${item.producto_id}, 1)">+</button>
                    <button onclick="eliminarDelCarrito(${item.producto_id})" class="btn-remove">×</button>
                </div>
            </div>
        `).join('');
    }
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('total-amount').textContent = total.toFixed(2);
}

document.getElementById('procesar-venta').addEventListener('click', async () => {
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    const clienteId = document.getElementById('cliente-select').value;
    if (!clienteId) {
        alert('Selecciona un cliente');
        return;
    }
    
    const venta = {
        cliente_id: parseInt(clienteId),
        items: carrito.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio
        }))
    };
    
    try {
        await api.post('/ventas', venta);
        alert('Venta procesada exitosamente');
        carrito = [];
        renderCarrito();
        await cargarProductos();
        await cargarReportes();
    } catch (error) {
        alert('Error al procesar la venta');
    }
});

// MODAL CLIENTE
const modal = document.getElementById('cliente-modal');
const btnNuevoCliente = document.getElementById('nuevo-cliente-btn');
const spanClose = document.querySelector('.close');

btnNuevoCliente.onclick = () => modal.style.display = 'block';
spanClose.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

document.getElementById('cliente-modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        nombre: document.getElementById('modal-cliente-nombre').value,
        telefono: document.getElementById('modal-cliente-telefono').value,
        email: document.getElementById('modal-cliente-email').value
    };
    try {
        await api.post('/clientes', data);
        e.target.reset();
        modal.style.display = 'none';
        await cargarClientes();
    } catch (error) {
        alert('Error al agregar cliente');
    }
});

// REPORTES
async function cargarReportes() {
    try {
        const ventas = await api.get('/ventas');
        document.getElementById('ventas-hoy').textContent = 
            '$' + ventas.reduce((sum, v) => sum + v.total, 0).toFixed(2);
        document.getElementById('total-productos').textContent = productos.length;
        document.getElementById('total-clientes').textContent = clientes.length;
        
        const tabla = document.getElementById('ventas-tabla');
        tabla.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    ${ventas.slice(-10).reverse().map(v => `
                        <tr>
                            <td>#${v.id}</td>
                            <td>${clientes.find(c => c.id === v.cliente_id)?.nombre || 'N/A'}</td>
                            <td>$${v.total.toFixed(2)}</td>
                            <td>${new Date(v.fecha).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error cargando reportes:', error);
    }
}

// Inicializar
init();
