import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ApiService, ProductoApi } from '../../services/api.service';
import { Observable } from 'rxjs';

export interface ProductoMedico {
  id: number;
  name: string;
  description: string;
  quantity: number;
  category: string;
  active: boolean;
  // Legacy fields for display compatibility
  nombre?: string;
  descripcion?: string;
  precio?: number;
  categoria?: string;
  imagen?: string;
  enStock?: boolean;
  cantidadDisponible?: number;
}

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.less']
})
export class TiendaComponent implements OnInit {
  productos: ProductoMedico[] = [];
  productosFiltrados: ProductoMedico[] = [];
  categorias: string[] = [];
  categoriaSeleccionada: string = '';
  terminoBusqueda: string = '';
  isAuthenticated$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
  }

  // === CARGA DE DATOS DESDE API ===
  private cargarProductos(): void {
    this.apiService.getProductos().subscribe({
      next: (productos) => {
        // Convert API products to display format with legacy field mapping
        this.productos = productos
          .filter(p => p.active) // Only show active products in store
          .map(p => ({
            ...p,
            // Legacy field mappings for existing UI
            nombre: p.name,
            descripcion: p.description,
            cantidadDisponible: p.quantity,
            categoria: p.category,
            enStock: p.quantity > 0,
            // Default values for fields not in API
            precio: 0, // Price not available in inventory service
            imagen: 'assets/images/producto-placeholder.jpg'
          }));
        this.productosFiltrados = [...this.productos];
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.cargarProductosMuestra(); // Fallback to sample data
      }
    });
  }

  private cargarCategorias(): void {
    this.apiService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.extraerCategorias(); // Fallback to extracting from products
      }
    });
  }

  // === DATOS DE MUESTRA (FALLBACK) ===
  private cargarProductosMuestra(): void {
    const productosMuestra: ProductoMedico[] = [
      {
        id: 1,
        name: 'Tensiómetro Digital',
        description: 'Tensiómetro automático de brazo con pantalla LCD',
        quantity: 15,
        category: 'Equipos de Diagnóstico',
        active: true,
        // Legacy mappings
        nombre: 'Tensiómetro Digital',
        descripcion: 'Tensiómetro automático de brazo con pantalla LCD',
        precio: 89.99,
        categoria: 'Equipos de Diagnóstico',
        imagen: 'assets/images/tensiometro.jpg',
        enStock: true,
        cantidadDisponible: 15
      },
      {
        id: 2,
        name: 'Estetoscopio Profesional',
        description: 'Estetoscopio de doble campana para adultos',
        quantity: 8,
        category: 'Equipos de Diagnóstico',
        active: true,
        // Legacy mappings
        nombre: 'Estetoscopio Profesional',
        descripcion: 'Estetoscopio de doble campana para adultos',
        precio: 45.50,
        categoria: 'Equipos de Diagnóstico',
      imagen: 'assets/images/estetoscopio.jpg',
      enStock: true,
      cantidadDisponible: 8
    },
    {
      id: 3,
      nombre: 'Termómetro Infrarrojo',
      descripcion: 'Termómetro sin contacto para frente',
      precio: 25.99,
      categoria: 'Equipos de Diagnóstico',
      imagen: 'assets/images/termometro.jpg',
      enStock: false,
      cantidadDisponible: 0
    },
    {
      id: 4,
      nombre: 'Guantes de Nitrilo (100 unidades)',
      descripcion: 'Guantes desechables sin polvo, talla M',
      precio: 12.99,
      categoria: 'Suministros Desechables',
      imagen: 'assets/images/guantes.jpg',
      enStock: true,
      cantidadDisponible: 50
    },
    {
      id: 5,
      nombre: 'Mascarillas Quirúrgicas (50 unidades)',
      descripcion: 'Mascarillas desechables de 3 capas',
      precio: 8.99,
      categoria: 'Suministros Desechables',
      imagen: 'assets/images/mascarillas.jpg',
      enStock: true,
      cantidadDisponible: 100
    },
    {
      id: 6,
      nombre: 'Jeringuillas Desechables (100 unidades)',
      descripcion: 'Jeringuillas de 5ml con aguja',
      precio: 15.99,
      categoria: 'Suministros Desechables',
      imagen: 'assets/images/jeringuillas.jpg',
      enStock: true,
      cantidadDisponible: 25
    },
    {
      id: 7,
      nombre: 'Camilla Plegable',
      descripcion: 'Camilla de aluminio ligera y resistente',
      precio: 299.99,
      categoria: 'Mobiliario Médico',
      imagen: 'assets/images/camilla.jpg',
      enStock: true,
      cantidadDisponible: 3
    },
    {
      id: 8,
      nombre: 'Silla de Ruedas Estándar',
      descripcion: 'Silla de ruedas manual con frenos',
      precio: 179.99,
      categoria: 'Mobiliario Médico',
      imagen: 'assets/images/silla-ruedas.jpg',
      enStock: true,
      cantidadDisponible: 5
    }
  ];

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.extraerCategorias();
  }

  cargarProductos(): void {
    // En una aplicación real, esto vendría de una API
    this.productos = this.productosMuestra;
    this.productosFiltrados = [...this.productos];
  }

  private extraerCategorias(): void {
    this.categorias = [...new Set(this.productos.map(p => p.category || p.categoria || ''))];
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    this.aplicarFiltros();
  }

  buscarProductos(termino?: string): void {
    if (termino !== undefined) {
      this.terminoBusqueda = termino.toLowerCase();
    }
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    let productosFiltrados = [...this.productos];

    // Filtrar por categoría
    if (this.categoriaSeleccionada) {
      productosFiltrados = productosFiltrados.filter(
        p => (p.category || p.categoria) === this.categoriaSeleccionada
      );
    }

    // Filtrar por término de búsqueda
    if (this.terminoBusqueda) {
      productosFiltrados = productosFiltrados.filter(
        p => (p.name || p.nombre || '').toLowerCase().includes(this.terminoBusqueda) ||
             (p.description || p.descripcion || '').toLowerCase().includes(this.terminoBusqueda)
      );
    }

    this.productosFiltrados = productosFiltrados;
  }

  limpiarFiltros(): void {
    this.categoriaSeleccionada = '';
    this.terminoBusqueda = '';
    this.productosFiltrados = [...this.productos];
  }

  agregarAlCarrito(producto: ProductoMedico): void {
    const enStock = producto.enStock || (producto.quantity || producto.cantidadDisponible || 0) > 0;
    const cantidad = producto.cantidadDisponible || producto.quantity || 0;
    
    if (enStock && cantidad > 0) {
      const nombre = producto.name || producto.nombre || 'Producto';
      console.log('Producto agregado al carrito:', nombre);
      // Implementar lógica del carrito aquí
    }
  }

  verDetalle(producto: ProductoMedico): void {
    const nombre = producto.name || producto.nombre || 'Producto';
    console.log('Ver detalle del producto:', nombre);
    // Implementar navegación a detalle del producto
  }

  async iniciarSesion(): Promise<void> {
    await this.authService.login();
  }

  async cerrarSesion(): Promise<void> {
    await this.authService.logout();
  }
}