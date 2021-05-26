import { Component } from '@angular/core';

import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html'
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  errorMessage = '';
  selectedProductId;

  products$ = this.productService.products$.pipe(
    //Catches an error and replaces with a new error so can notify the user of the issue with a new observable
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  //throw error creates an observable that emits no items and immediately emits
  //an error notification

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    console.log('Not yet implemented');
  }
}
