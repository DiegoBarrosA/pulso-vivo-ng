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
  name: string;
  description: string;
  quantity: number;
  category: string;
  active: boolean;
}

export interface InventoryUpdateRequest {
  quantityChanged: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.api.baseUrl + '/inventory';
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Crea los headers HTTP básicos (JWT manejado por AWS API Gateway)
   */
  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
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
  getProductos(): Observable<ProductoApi[]> {
    const headers = this.createHeaders();
    return this.http.get<ProductoApi[]>(`${this.baseUrl}/products`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Obtiene un producto por ID
   */
  getProducto(id: number): Observable<ProductoApi> {
    const headers = this.createHeaders();
    return this.http.get<ProductoApi>(`${this.baseUrl}/products/${id}`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Crea un nuevo producto
   */
  crearProducto(producto: Partial<ProductoApi>): Observable<ProductoApi> {
    const headers = this.createHeaders();
    return this.http.post<ProductoApi>(`${this.baseUrl}/products`, producto, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Actualiza un producto existente
   */
  actualizarProducto(id: number, producto: Partial<ProductoApi>): Observable<ProductoApi> {
    const headers = this.createHeaders();
    return this.http.put<ProductoApi>(`${this.baseUrl}/products/${id}`, producto, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Actualiza el stock de un producto
   */
  actualizarStock(id: number, quantityChanged: number): Observable<void> {
    const request: InventoryUpdateRequest = { quantityChanged };
    const headers = this.createHeaders();
    return this.http.patch<void>(`${this.baseUrl}/products/${id}/stock`, request, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Obtiene productos con stock bajo
   */
  getProductosStockBajo(): Observable<ProductoApi[]> {
    const headers = this.createHeaders();
    return this.http.get<ProductoApi[]>(`${this.baseUrl}/low-stock`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // === MÉTODOS NO DISPONIBLES EN INVENTORY SERVICE ===
  // TODO: Implementar estos endpoints en el inventory service o remover del frontend

  /**
   * Busca productos por término - TODO: Implementar en inventory service
   */
  buscarProductos(termino: string): Observable<ProductoApi[]> {
    // Fallback: filtrar localmente por ahora
    return this.getProductos().pipe(
      switchMap(productos => 
        [productos.filter(p => 
          p.name.toLowerCase().includes(termino.toLowerCase()) ||
          p.description.toLowerCase().includes(termino.toLowerCase())
        )]
      )
    );
  }

  /**
   * Filtra productos por categoría - TODO: Implementar en inventory service
   */
  filtrarProductosPorCategoria(categoria: string): Observable<ProductoApi[]> {
    // Fallback: filtrar localmente por ahora
    return this.getProductos().pipe(
      switchMap(productos => 
        [productos.filter(p => p.category === categoria)]
      )
    );
  }

  /**
   * Obtiene todas las categorías disponibles - TODO: Implementar en inventory service
   */
  getCategorias(): Observable<string[]> {
    // Fallback: extraer categorías de productos existentes
    return this.getProductos().pipe(
      switchMap(productos => {
        const categorias = [...new Set(productos.map(p => p.category))];
        return [categorias];
      })
    );
  }

  // === MÉTODOS UTILITARIOS ===

  // === MÉTODOS UTILITARIOS ===
  // TODO: Implementar health check y version endpoints en inventory service si son necesarios
}