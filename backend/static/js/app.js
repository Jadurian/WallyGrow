let carrito = [];
let productos = [];
let clientes = [];
let proveedores = [];

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
    await cargarProveedores();
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
        <table class="tabla">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Proveedor</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${productos.map(p => {
                    const proveedor = proveedores.find(pr => pr.id === p.proveedor_id);
                    return `
                        <tr>
                            <td>${p.nombre}</td>
                            <td>$${p.precio.toFixed(2)}</td>
                            <td>${p.stock}</td>
                            <td>${proveedor ? proveedor.nombre : 'Sin proveedor'}</td>
                            <td>
                                <button onclick="eliminarProducto(${p.id})" class="btn-danger btn-small">Eliminar</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function renderProveedoresSelect() {
    const select = document.getElementById('producto-proveedor');
    select.innerHTML = '<option value="">Sin proveedor</option>' +
        proveedores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
}

document.getElementById('producto-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const proveedorId = document.getElementById('producto-proveedor').value;
    const data = {
        nombre: document.getElementById('producto-nombre').value,
        precio: parseFloat(document.getElementById('producto-precio').value),
        stock: parseInt(document.getElementById('producto-stock').value),
        proveedor_id: proveedorId ? parseInt(proveedorId) : null
    };
    try {
        await api.post('/productos', data);
        e.target.reset();
        await cargarProductos();
        mostrarMensaje('Producto agregado exitosamente', 'success');
    } catch (error) {
        mostrarMensaje('Error al agregar producto: ' + error.message, 'error');
    }
});

async function eliminarProducto(id) {
    if (confirm('¿Eliminar este producto?')) {
        try {
            await api.delete(`/productos/${id}`);
            await cargarProductos();
            mostrarMensaje('Producto eliminado exitosamente', 'success');
        } catch (error) {
            mostrarMensaje('Error al eliminar producto: ' + error.message, 'error');
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
        <table class="tabla">
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
                            <button onclick="eliminarCliente(${c.id})" class="btn-danger btn-small">Eliminar</button>
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
        mostrarMensaje('Cliente agregado exitosamente', 'success');
    } catch (error) {
        mostrarMensaje('Error al agregar cliente: ' + error.message, 'error');
    }
});

async function eliminarCliente(id) {
    if (confirm('¿Eliminar este cliente?')) {
        try {
            await api.delete(`/clientes/${id}`);
            await cargarClientes();
            mostrarMensaje('Cliente eliminado exitosamente', 'success');
        } catch (error) {
            mostrarMensaje('Error al eliminar cliente: ' + error.message, 'error');
        }
    }
}

// CARRITO
function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto || producto.stock === 0) {
        mostrarMensaje('Producto sin stock disponible', 'warning');
        return;
    }
    
    const itemExistente = carrito.find(item => item.producto_id === productoId);
    if (itemExistente) {
        if (itemExistente.cantidad < producto.stock) {
            itemExistente.cantidad++;
            mostrarMensaje(`${producto.nombre} agregado al carrito`, 'success');
        } else {
            mostrarMensaje('No hay más stock disponible', 'warning');
            return;
        }
    } else {
        carrito.push({
            producto_id: productoId,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
        mostrarMensaje(`${producto.nombre} agregado al carrito`, 'success');
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
            mostrarMensaje('No hay más stock disponible', 'warning');
        }
        renderCarrito();
    }
}

function renderCarrito() {
    const container = document.getElementById('carrito-items');
    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="carrito-vacio">
                <p>🛒 Carrito vacío</p>
                <small>Selecciona productos para agregar</small>
            </div>
        `;
    } else {
        container.innerHTML = carrito.map(item => `
            <div class="carrito-item">
                <div class="item-info">
                    <strong>${item.nombre}</strong>
                    <span class="item-precio">$${item.precio.toFixed(2)} c/u</span>
                </div>
                <div class="item-controls">
                    <div class="cantidad-control">
                        <button class="cantidad-btn" onclick="cambiarCantidad(${item.producto_id}, -1)">-</button>
                        <span class="cantidad-display">${item.cantidad}</span>
                        <button class="cantidad-btn" onclick="cambiarCantidad(${item.producto_id}, 1)">+</button>
                    </div>
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
        mostrarMensaje('El carrito está vacío. Agrega productos para continuar.', 'warning');
        return;
    }
    
    const clienteId = document.getElementById('cliente-select').value;
    if (!clienteId) {
        mostrarMensaje('Selecciona un cliente para continuar con la venta', 'warning');
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
        mostrarMensaje('Venta procesada exitosamente', 'success');
        carrito = [];
        renderCarrito();
        document.getElementById('cliente-select').value = '';
        await cargarProductos();
        await cargarReportes();
    } catch (error) {
        mostrarMensaje('Error al procesar la venta: ' + error.message, 'error');
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
        mostrarMensaje('Cliente agregado exitosamente', 'success');
    } catch (error) {
        mostrarMensaje('Error al agregar cliente: ' + error.message, 'error');
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
            <table class="tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    ${ventas.slice(-10).reverse().map(v => {
                        const cliente = clientes.find(c => c.id === v.cliente_id);
                        const producto = productos.find(p => p.id === v.producto_id);
                        return `
                            <tr>
                                <td>#${v.id}</td>
                                <td>${cliente?.nombre || 'N/A'}</td>
                                <td>${producto?.nombre || 'N/A'}</td>
                                <td>${v.cantidad}</td>
                                <td>$${v.total.toFixed(2)}</td>
                                <td>${new Date(v.fecha).toLocaleString()}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error cargando reportes:', error);
    }
}

// Sistema de mensajes
function mostrarMensaje(mensaje, tipo = 'info') {
    const container = document.getElementById('mensaje-container') || crearContenedorMensajes();
    
    const div = document.createElement('div');
    div.className = `mensaje mensaje-${tipo}`;
    div.innerHTML = `
        <span>${mensaje}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(div);
    
    setTimeout(() => {
        if (div.parentElement) {
            div.remove();
        }
    }, 5000);
}

function crearContenedorMensajes() {
    const container = document.createElement('div');
    container.id = 'mensaje-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
}

// PROVEEDORES
async function cargarProveedores() {
    try {
        proveedores = await api.get('/proveedores');
        renderProveedoresSelect();
        renderProveedoresTabla();
    } catch (error) {
        console.error('Error cargando proveedores:', error);
    }
}

function renderProveedoresTabla() {
    const tabla = document.getElementById('proveedores-tabla');
    tabla.innerHTML = `
        <table class="tabla">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${proveedores.map(p => `
                    <tr>
                        <td>${p.nombre}</td>
                        <td>${p.telefono || '-'}</td>
                        <td>${p.email || '-'}</td>
                        <td>
                            <button onclick="eliminarProveedor(${p.id})" class="btn-danger btn-small">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

document.getElementById('proveedor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        nombre: document.getElementById('proveedor-nombre').value,
        telefono: document.getElementById('proveedor-telefono').value,
        email: document.getElementById('proveedor-email').value
    };
    try {
        await api.post('/proveedores', data);
        e.target.reset();
        await cargarProveedores();
        mostrarMensaje('Proveedor agregado exitosamente', 'success');
    } catch (error) {
        mostrarMensaje('Error al agregar proveedor: ' + error.message, 'error');
    }
});

async function eliminarProveedor(id) {
    if (confirm('¿Eliminar este proveedor?')) {
        try {
            await api.delete(`/proveedores/${id}`);
            await cargarProveedores();
            await cargarProductos(); // Recargar productos para actualizar referencias
            mostrarMensaje('Proveedor eliminado exitosamente', 'success');
        } catch (error) {
            mostrarMensaje('Error al eliminar proveedor: ' + error.message, 'error');
        }
    }
}

// Inicializar
init();
