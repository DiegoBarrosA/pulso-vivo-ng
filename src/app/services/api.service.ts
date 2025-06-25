import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ProductoApi {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  cantidadStock: number;
  stockMinimo: number;
  proveedor: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface MovimientoApi {
  id: number;
  productoId: number;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo: string;
  fecha: string;
  usuario: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.api.baseUrl;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Crea los headers HTTP con autenticación JWT
   */
  private createAuthHeaders(): Observable<HttpHeaders> {
    return from(this.authService.getBffToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        return [headers];
      })
    );
  }

  /**
   * Maneja errores de las llamadas HTTP
   */
  private handleError(error: any): Observable<never> {
    if (environment.app.enableLogging) {
      console.error('Error en llamada API:', error);
    }
    
    if (error.status === 401) {
      if (environment.app.enableLogging) {
        console.log('Token inválido, redirigiendo al login...');
      }
      this.authService.login();
    }
    
    return throwError(() => error);
  }

  // === MÉTODOS PARA PRODUCTOS ===

  /**
   * Obtiene todos los productos
   */
  getProductos(): Observable<ApiResponse<ProductoApi[]>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<ApiResponse<ProductoApi[]>>(`${this.baseUrl}/productos`, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  /**
   * Obtiene un producto por ID
   */
  getProducto(id: number): Observable<ApiResponse<ProductoApi>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.get<ApiResponse<ProductoApi>>(`${this.baseUrl}/productos/${id}`, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  /**
   * Crea un nuevo producto
   */
  crearProducto(producto: Partial<ProductoApi>): Observable<ApiResponse<ProductoApi>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.post<ApiResponse<ProductoApi>>(`${this.baseUrl}/productos`, producto, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  /**
   * Actualiza un producto existente
   */
  actualizarProducto(id: number, producto: Partial<ProductoApi>): Observable<ApiResponse<ProductoApi>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.put<ApiResponse<ProductoApi>>(`${this.baseUrl}/productos/${id}`, producto, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  /**
   * Elimina un producto
   */
  eliminarProducto(id: number): Observable<ApiResponse<void>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.delete<ApiResponse<void>>(`${this.baseUrl}/productos/${id}`, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  /**
   * Busca productos por término
   */
  buscarProductos(termino: string): Observable<ApiResponse<ProductoApi[]>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.get<ApiResponse<ProductoApi[]>>(`${this.baseUrl}/productos/buscar?q=${encodeURIComponent(termino)}`, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  /**
   * Filtra productos por categoría
   */
  filtrarProductosPorCategoria(categoria: string): Observable<ApiResponse<ProductoApi[]>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.get<ApiResponse<ProductoApi[]>>(`${this.baseUrl}/productos/categoria/${encodeURIComponent(categoria)}`, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  // === MÉTODOS PARA MOVIMIENTOS DE STOCK ===

  /**
   * Obtiene todos los movimientos de stock
   */
  getMovimientos(): Observable<ApiResponse<MovimientoApi[]>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.get<ApiResponse<MovimientoApi[]>>(`${this.baseUrl}/movimientos`, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  /**
   * Obtiene movimientos de un producto específico
   */
  getMovimientosProducto(productoId: number): Observable<ApiResponse<MovimientoApi[]>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.get<ApiResponse<MovimientoApi[]>>(`${this.baseUrl}/movimientos/producto/${productoId}`, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  /**
   * Registra un nuevo movimiento de stock
   */
  registrarMovimiento(movimiento: Partial<MovimientoApi>): Observable<ApiResponse<MovimientoApi>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.post<ApiResponse<MovimientoApi>>(`${this.baseUrl}/movimientos`, movimiento, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  // === MÉTODOS PARA CATEGORÍAS ===

  /**
   * Obtiene todas las categorías disponibles
   */
  getCategorias(): Observable<ApiResponse<string[]>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/categorias`, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  // === MÉTODOS PARA REPORTES ===

  /**
   * Obtiene estadísticas del inventario
   */
  getEstadisticasInventario(): Observable<ApiResponse<any>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.get<ApiResponse<any>>(`${this.baseUrl}/reportes/estadisticas`, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  /**
   * Obtiene productos con stock bajo
   */
  getProductosStockBajo(): Observable<ApiResponse<ProductoApi[]>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.get<ApiResponse<ProductoApi[]>>(`${this.baseUrl}/reportes/stock-bajo`, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  /**
   * Exporta inventario a CSV
   */
  exportarInventario(): Observable<Blob> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.get(`${this.baseUrl}/reportes/exportar-inventario`, { 
          headers, 
          responseType: 'blob' 
        }).pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  // === MÉTODOS PARA PROVEEDORES ===

  /**
   * Obtiene todos los proveedores
   */
  getProveedores(): Observable<ApiResponse<string[]>> {
    return this.createAuthHeaders().pipe(
      switchMap(headers =>
        this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/proveedores`, { headers })
          .pipe(catchError(this.handleError.bind(this)))
      )
    );
  }

  // === MÉTODOS UTILITARIOS ===

  /**
   * Verifica el estado de salud de la API
   */
  checkHealth(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/health`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Obtiene información de la versión de la API
   */
  getVersion(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/version`)
      .pipe(catchError(this.handleError.bind(this)));
  }
}