import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { throwError, Observable, of } from 'rxjs';
import {
  catchError,
  concatMap,
  map,
  mergeMap,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Supplier } from './supplier';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  suppliersUrl = 'api/suppliers';

  //map response to supplier array
  suppliers$ = this.http.get<Supplier[]>(this.suppliersUrl).pipe(
    tap((data) => console.log('suppliers', JSON.stringify(data))),
    shareReplay(1),
    catchError(this.handleError)
  );
  //list pf suppliers for the product so put it in the product.service.ts file

  //observable emits an observable emits a supplier
  suppliersWithMap$ = of(1, 2, 8).pipe(
    //mock observable ids
    map((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)) //map each id to http get
  );

  //maps items one at a time - each one must be complete to proceed
  suppliersWithConcatMap$ = of(1, 5, 8).pipe(
    tap((id) => console.log('concatMap source Observable', id)), //log the id coming in from the observable
    concatMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)) //new inner observable
  );

  //maps item in parallel
  suppliersWithMergeMap$ = of(1, 5, 8).pipe(
    tap((id) => console.log('mergeMap source Observable', id)), //log the id coming in from the observable
    mergeMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)) //new inner observable
  );

  //cancels earlier items
  suppliersWithSwitchMap$ = of(1, 5, 8).pipe(
    tap((id) => console.log('switchMap source Observable', id)), //log the id coming in from the observable
    switchMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)) //new inner observable
  );

  constructor(private http: HttpClient) {
    /* this.suppliersWithMap$.subscribe( o => o.subscribe(
      item=>console.log('map result ', item))
    ); */
    this.suppliersWithConcatMap$.subscribe((item) =>
      console.log('concatMap result', item)
    );
    this.suppliersWithMergeMap$.subscribe((item) =>
      console.log('mergeMap result', item)
    );
    this.suppliersWithSwitchMap$.subscribe((item) =>
      console.log('switchMap result', item)
    );
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
  }
}
