import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Subject } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  //selectedCategoryId = 1; //if set to 1, only see the garden products

  //that id is an number so create new subject of number
  //behaviorsubject works same way as piping with startwith 0
  private categorySelectedSubject = new BehaviorSubject<number>(0);
  //expose the subject
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  //provides same array of products but now with the category name property
  //use combine latest to show the string not the id
  //combined action stream with data stream
  products$ = combineLatest([
    this.productService.productsWithAdd$,
    //this.categorySelectedAction$, needs an initial value
    /* this.categorySelectedAction$.pipe(
      startWith(0)
    ) */
    this.categorySelectedAction$
  ]).pipe(
    //structure elements to get the chosen properties
    map(([products, selectedCategoryId]) =>
      //filtering logic
      products.filter((product) =>
        selectedCategoryId ? product.categoryId === selectedCategoryId : true
      )
    ),
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  categories$ = this.productCategoryService.productCategories$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  /* productsSimpleFilter$ = this.productService.productsWithCategory$.pipe(
    map((products) =>
      //use arrays filter method instead of rxjs operator
      products.filter(
        (product) =>
          //check the id
          this.selectedCategoryId
            ? product.categoryId === this.selectedCategoryId
            : true //otherwise none true so return all products
      )
    )
  ); */

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService
  ) {}

  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    /* set to id the user selected
    cast it to a number or the triple equal number wont match the value
    this.selectedCategoryId = +categoryId */

    //emit a value from the action stream everytime the action occurs
    this.categorySelectedSubject.next(+categoryId)
  }
}
