import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EMPTY, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush //now binding observables can use change detection
})
export class ProductListAltComponent {
  pageTitle = 'Products';

  //to handle change detection for the UI
  private errorMessageSubject = new Subject<string>(); 
  //then we expose using asobservable
  errorMessage$ = this.errorMessageSubject.asObservable();

  products$ = this.productService.productsWithCategory$.pipe(
    //Catches an error and replaces with a new error so can notify the user of the issue with a new observable
    catchError(err => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  //stream that emits the product when it changes 
  selectedProduct$ = this.productService.selectedProduct$;

  //throw error creates an observable that emits no items and immediately emits
  //an error notification

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    //use product.service to create the on select method
    this.productService.selectedProductChanged(productId);
  }
}
