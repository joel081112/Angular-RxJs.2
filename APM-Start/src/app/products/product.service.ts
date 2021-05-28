import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  combineLatest,
  from,
  merge,
  Observable,
  Subject,
  throwError,
} from 'rxjs';
import {
  catchError,
  filter,
  map,
  mergeMap,
  scan,
  shareReplay,
  tap,
  toArray,
} from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';

import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  //make a product stream
  products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    //tap display debugging information
    //tap((data) => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  //combine latest to combine products and categories
  //hover over and now get a product with category name not just an id
  productsWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$,
  ]).pipe(
    // combine emits one item
    map(([products, categories]) =>
      products.map(
        (product) =>
          ({
            ...product,
            price: product.price * 1.5,
            //find products category using the category id
            category: categories.find((c) => product.categoryId === c.id).name,
            searchKey: [product.productName],
          } as Product)
      )
    ),
    shareReplay(1)
  );

  //since both product list and alt use this we put in the product service
  //emits at least once so we assign behaviour of 0
  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  //get a single product
  selectedProduct$ = combineLatest([
    this.productsWithCategory$, //so we get the product names
    this.productSelectedAction$, //so reacts
  ]).pipe(
    map(
      ([products, selectedProductId]) =>
        products.find((product) => product.id === selectedProductId) //find the product in the list
    ),
    tap((product) => console.log('selectProduct ', product)),
    shareReplay(1) //stream share and cache the data if doesnt change option
  );

  //______ start data stream____________
  //there are three steps for reacting to actions
  //1. declare private property; 2. expose the subject asboservable, 3. combine the action stream with data stream for new observable
  private productInsertedSubject = new Subject<Product>(); //1
  productInsertedAction$ = this.productInsertedSubject.asObservable(); //2
  productsWithAdd$ = merge(
    //3
    this.productsWithCategory$, //data stream to dispaly name instead of id
    this.productInsertedAction$ //action stream
  ).pipe(scan((acc: Product[], value: Product) => [...acc, value]));
  //______ end data stream __________________

  //combine product stream with suppliers - get it all at once
  /* selectedProductSuppliers$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.suppliers$,
  ]).pipe(
    map(([selectedProduct, suppliers]) => //use array destructuring to assign variable to each emmission
      suppliers.filter((supplier) =>
        selectedProduct.supplierIds.includes(supplier.id) //filter to those suppliers
      )
    )
  ); */
  //use in product-detail.component

  //array of suppliers - just when its needed
  selectedProductSuppliers$ = this.selectedProduct$.pipe(
    //skip proces if undefined or null
    filter(selectedProduct => Boolean(selectedProduct)),
    mergeMap((selectedProduct) =>
      from(selectedProduct.supplierIds).pipe(
        mergeMap((supplierId) =>
          this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)
        ),
        toArray()
      )
    )
  );

  constructor(
    private http: HttpClient,
    private productCategoryService: ProductCategoryService,
    private supplierService: SupplierService
  ) {}

  //takes in sleceted product id and calls the subject next method to emit its values
  //any code in the application can call this method to emit a value
  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  addProduct(newProduct?: Product) {
    newProduct = newProduct || this.fakeProduct(); //set to passed in product or to the fake product
    this.productInsertedSubject.next(newProduct); //emit that new produyct
  }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: 30,
    };
  }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  } //end handle error
} //end class
