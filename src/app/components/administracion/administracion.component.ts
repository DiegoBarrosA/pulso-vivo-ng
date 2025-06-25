import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Observable } from 'rxjs';

export interface ProductoStock {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  cantidadStock: number;
  stockMinimo: number;
  proveedor: string;
  fechaActualizacion: Date;
  activo: boolean;
}

export interface MovimientoStock {
  id: number;
  productoId: number;
  productoNombre: string;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo: string;
  fecha: Date;
  usuario: string;
}

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './administracion.component.html',
  styleUrls: ['./administracion.component.less']
})
export class AdministracionComponent implements OnInit {
  // Estado del componente
  vistaActual: 'inventario' | 'movimientos' | 'reportes' = 'inventario';
  
  // Datos del inventario
  productos: ProductoStock[] = [];
  productosFiltrados: ProductoStock[] = [];
  movimientos: MovimientoStock[] = [];
  
  // Filtros y búsqueda
  terminoBusqueda: string = '';
  categoriaFiltro: string = '';
  estadoFiltro: string = '';
  categorias: string[] = [];
  
  // Modal y formularios
  mostrarModal: boolean = false;
  modoModal: 'crear' | 'editar' | 'movimiento' = 'crear';
  productoSeleccionado: ProductoStock | null = null;
  
  // Formulario de producto
  formularioProducto: Partial<ProductoStock> = {
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: '',
    cantidadStock: 0,
    stockMinimo: 1,
    proveedor: '',
    activo: true
  };
  
  // Formulario de movimiento
  formularioMovimiento = {
    tipo: 'entrada' as 'entrada' | 'salida' | 'ajuste',
    cantidad: 0,
    motivo: ''
  };
  
  // Estadísticas
  estadisticas = {
    totalProductos: 0,
    productosActivos: 0,
    productosStockBajo: 0,
    valorInventario: 0
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarDatosMuestra();
    this.calcularEstadisticas();
    this.extraerCategorias();
  }

  // === DATOS DE MUESTRA ===
  private cargarDatosMuestra(): void {
    this.productos = [
      {
        id: 1,
        nombre: 'Tensiómetro Digital',
        descripcion: 'Tensiómetro automático de brazo con pantalla LCD',
        precio: 89.99,
        categoria: 'Equipos de Diagnóstico',
        cantidadStock: 15,
        stockMinimo: 5,
        proveedor: 'MedTech Solutions',
        fechaActualizacion: new Date('2024-01-15'),
        activo: true
      },
      {
        id: 2,
        nombre: 'Estetoscopio Profesional',
        descripcion: 'Estetoscopio de doble campana para adultos',
        precio: 45.50,
        categoria: 'Equipos de Diagnóstico',
        cantidadStock: 8,
        stockMinimo: 10,
        proveedor: 'Medical Instruments Co.',
        fechaActualizacion: new Date('2024-01-10'),
        activo: true
      },
      {
        id: 3,
        nombre: 'Termómetro Infrarrojo',
        descripcion: 'Termómetro sin contacto para frente',
        precio: 25.99,
        categoria: 'Equipos de Diagnóstico',
        cantidadStock: 0,
        stockMinimo: 5,
        proveedor: 'ThermoTech',
        fechaActualizacion: new Date('2024-01-12'),
        activo: true
      },
      {
        id: 4,
        nombre: 'Guantes de Nitrilo (100 unidades)',
        descripcion: 'Guantes desechables sin polvo, talla M',
        precio: 12.99,
        categoria: 'Suministros Desechables',
        cantidadStock: 50,
        stockMinimo: 20,
        proveedor: 'SafeGuard Medical',
        fechaActualizacion: new Date('2024-01-14'),
        activo: true
      },
      {
        id: 5,
        nombre: 'Mascarillas Quirúrgicas (50 unidades)',
        descripcion: 'Mascarillas desechables de 3 capas',
        precio: 8.99,
        categoria: 'Suministros Desechables',
        cantidadStock: 100,
        stockMinimo: 30,
        proveedor: 'ProtectMed',
        fechaActualizacion: new Date('2024-01-13'),
        activo: true
      }
    ];

    this.movimientos = [
      {
        id: 1,
        productoId: 1,
        productoNombre: 'Tensiómetro Digital',
        tipo: 'entrada',
        cantidad: 10,
        motivo: 'Compra a proveedor',
        fecha: new Date('2024-01-15'),
        usuario: 'admin@pulsovivo.com'
      },
      {
        id: 2,
        productoId: 2,
        productoNombre: 'Estetoscopio Profesional',
        tipo: 'salida',
        cantidad: 2,
        motivo: 'Venta a cliente',
        fecha: new Date('2024-01-14'),
        usuario: 'admin@pulsovivo.com'
      },
      {
        id: 3,
        productoId: 3,
        productoNombre: 'Termómetro Infrarrojo',
        tipo: 'salida',
        cantidad: 5,
        motivo: 'Venta a cliente',
        fecha: new Date('2024-01-12'),
        usuario: 'admin@pulsovivo.com'
      }
    ];

    this.productosFiltrados = [...this.productos];
  }

  // === NAVEGACIÓN ===
  cambiarVista(vista: 'inventario' | 'movimientos' | 'reportes'): void {
    this.vistaActual = vista;
  }

  // === GESTIÓN DE INVENTARIO ===
  private extraerCategorias(): void {
    this.categorias = [...new Set(this.productos.map(p => p.categoria))];
  }

  private calcularEstadisticas(): void {
    this.estadisticas.totalProductos = this.productos.length;
    this.estadisticas.productosActivos = this.productos.filter(p => p.activo).length;
    this.estadisticas.productosStockBajo = this.productos.filter(p => p.cantidadStock <= p.stockMinimo).length;
    this.estadisticas.valorInventario = this.productos.reduce((total, p) => total + (p.precio * p.cantidadStock), 0);
  }

  // === FILTROS Y BÚSQUEDAS ===
  buscarProductos(): void {
    this.aplicarFiltros();
  }

  filtrarPorCategoria(): void {
    this.aplicarFiltros();
  }

  filtrarPorEstado(): void {
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    let productosFiltrados = [...this.productos];

    // Filtro por búsqueda
    if (this.terminoBusqueda) {
      const termino = this.terminoBusqueda.toLowerCase();
      productosFiltrados = productosFiltrados.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino) ||
        p.proveedor.toLowerCase().includes(termino)
      );
    }

    // Filtro por categoría
    if (this.categoriaFiltro) {
      productosFiltrados = productosFiltrados.filter(p => p.categoria === this.categoriaFiltro);
    }

    // Filtro por estado
    if (this.estadoFiltro) {
      switch (this.estadoFiltro) {
        case 'activo':
          productosFiltrados = productosFiltrados.filter(p => p.activo);
          break;
        case 'inactivo':
          productosFiltrados = productosFiltrados.filter(p => !p.activo);
          break;
        case 'stock_bajo':
          productosFiltrados = productosFiltrados.filter(p => p.cantidadStock <= p.stockMinimo);
          break;
        case 'sin_stock':
          productosFiltrados = productosFiltrados.filter(p => p.cantidadStock === 0);
          break;
      }
    }

    this.productosFiltrados = productosFiltrados;
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.categoriaFiltro = '';
    this.estadoFiltro = '';
    this.productosFiltrados = [...this.productos];
  }

  // === GESTIÓN DE MODALES ===
  abrirModalCrear(): void {
    this.modoModal = 'crear';
    this.formularioProducto = {
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: '',
      cantidadStock: 0,
      stockMinimo: 1,
      proveedor: '',
      activo: true
    };
    this.mostrarModal = true;
  }

  abrirModalEditar(producto: ProductoStock): void {
    this.modoModal = 'editar';
    this.productoSeleccionado = producto;
    this.formularioProducto = { ...producto };
    this.mostrarModal = true;
  }

  abrirModalMovimiento(producto: ProductoStock): void {
    this.modoModal = 'movimiento';
    this.productoSeleccionado = producto;
    this.formularioMovimiento = {
      tipo: 'entrada',
      cantidad: 0,
      motivo: ''
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.productoSeleccionado = null;
  }

  // === OPERACIONES CRUD ===
  guardarProducto(): void {
    if (this.modoModal === 'crear') {
      const nuevoProducto: ProductoStock = {
        ...this.formularioProducto as ProductoStock,
        id: Math.max(...this.productos.map(p => p.id)) + 1,
        fechaActualizacion: new Date()
      };
      this.productos.push(nuevoProducto);
    } else if (this.modoModal === 'editar' && this.productoSeleccionado) {
      const index = this.productos.findIndex(p => p.id === this.productoSeleccionado!.id);
      if (index !== -1) {
        this.productos[index] = {
          ...this.formularioProducto as ProductoStock,
          id: this.productoSeleccionado.id,
          fechaActualizacion: new Date()
        };
      }
    }

    this.calcularEstadisticas();
    this.aplicarFiltros();
    this.cerrarModal();
  }

  eliminarProducto(producto: ProductoStock): void {
    if (confirm(`¿Está seguro de que desea eliminar "${producto.nombre}"?`)) {
      const index = this.productos.findIndex(p => p.id === producto.id);
      if (index !== -1) {
        this.productos.splice(index, 1);
        this.calcularEstadisticas();
        this.aplicarFiltros();
      }
    }
  }

  toggleEstadoProducto(producto: ProductoStock): void {
    const index = this.productos.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      this.productos[index].activo = !this.productos[index].activo;
      this.productos[index].fechaActualizacion = new Date();
      this.calcularEstadisticas();
    }
  }

  // === MOVIMIENTOS DE STOCK ===
  registrarMovimiento(): void {
    if (!this.productoSeleccionado) return;

    const nuevoMovimiento: MovimientoStock = {
      id: Math.max(...this.movimientos.map(m => m.id)) + 1,
      productoId: this.productoSeleccionado.id,
      productoNombre: this.productoSeleccionado.nombre,
      tipo: this.formularioMovimiento.tipo,
      cantidad: this.formularioMovimiento.cantidad,
      motivo: this.formularioMovimiento.motivo,
      fecha: new Date(),
      usuario: this.authService.getCurrentUser()?.username || 'admin@pulsovivo.com'
    };

    this.movimientos.unshift(nuevoMovimiento);

    // Actualizar stock del producto
    const index = this.productos.findIndex(p => p.id === this.productoSeleccionado!.id);
    if (index !== -1) {
      const cantidad = this.formularioMovimiento.cantidad;
      switch (this.formularioMovimiento.tipo) {
        case 'entrada':
          this.productos[index].cantidadStock += cantidad;
          break;
        case 'salida':
          this.productos[index].cantidadStock = Math.max(0, this.productos[index].cantidadStock - cantidad);
          break;
        case 'ajuste':
          this.productos[index].cantidadStock = cantidad;
          break;
      }
      this.productos[index].fechaActualizacion = new Date();
    }

    this.calcularEstadisticas();
    this.aplicarFiltros();
    this.cerrarModal();
  }

  // === UTILIDADES ===
  getEstadoStock(producto: ProductoStock): 'normal' | 'bajo' | 'agotado' {
    if (producto.cantidadStock === 0) return 'agotado';
    if (producto.cantidadStock <= producto.stockMinimo) return 'bajo';
    return 'normal';
  }

  getClaseEstado(estado: string): string {
    switch (estado) {
      case 'normal': return 'badge bg-success';
      case 'bajo': return 'badge bg-warning';
      case 'agotado': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(fecha);
  }

  exportarInventario(): void {
    // Implementar exportación a CSV/Excel
    console.log('Exportando inventario...');
    alert('Funcionalidad de exportación en desarrollo');
  }

  async cerrarSesion(): Promise<void> {
    await this.authService.logout();
  }
}