import { Component, OnInit } from '@angular/core';
import { of, from } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Component({
  selector: 'pm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  pageTitle = 'Acme Product Management';
  name = 'Angular';

  ngOnInit() {
    // first type of observable can be called as of
    of(2, 4, 6, 8).subscribe(console.log);
    //second type can be called in a from inside an array
    from([8, 6, 4, 5]).subscribe(
      (item) => console.log(`resulting item.... ${item}`), //next
      (err) => console.error(`errror occured ${err}`), //error
      () => console.log('complete') //complete
    );
    // string example
    of('Apple1', 'Apple2', 'Apple3').subscribe(
      (apple) => console.log(`Apple ${apple} was emmitted`),
      (err) => console.error(`Error occured: ${err}`),
      () => console.log(`No more apples to emit, Go home`) //complete will automatically unsubscirbe the observable
    );

    //transform the observable values
    of(2, 4, 6, 8)
      .pipe(
        map((item) => item * 2),
        map((item) => item - 3)
      )
      .subscribe(console.log);

    //tap does not modify the stream but used for debugging
    of(3, 7, 11, 2, 25, 14)
      .pipe(
        tap(item => console.log(`emitted item .... ${item}`)),
        map(item => item * 2),
        take(4), //take means cuts the output to the number inside
        tap(item => console.log(`emitted item .... ${item}`)),
        map(item => item - 4),
        map(item => {
          if(item===0){
            throw new Error('zero detected'); //when there is an error the complete methodis not executed
          }
          return item;
        })
      )
      .subscribe(
        (item) => console.log(`resulting item.... ${item}`), //next
        (err) => console.error(`errror occured ${err}`), //when there is an error the complete methodis not executed
        () => console.log('complete') //complete);
      );

    //take is a filtering operator which only emits defined items
  } //end oninit
} //end class
