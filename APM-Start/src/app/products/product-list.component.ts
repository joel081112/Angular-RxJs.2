import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Product } from './product';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit{
  pageTitle = 'Product List';
  errorMessage = '';
  categories;

  //old way - products: Product[] = [];
  products$: Observable<Product[]>;
  // no longer need 
  //sub: Subscription;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    //old way
    /* this.sub = this.productService.getProducts()
      .subscribe(
        //observer is notified
        products => this.products = products,
        error => this.errorMessage = error
      ); */
      //this way uses async pipe
      this.products$ = this.productService.getProducts();
  }

  /* old way - ensure the stream is stopped by unsubscribing
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  } */

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    console.log('Not yet implemented');
  }
}
