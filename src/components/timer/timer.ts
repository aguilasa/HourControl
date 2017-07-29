import { Component } from '@angular/core';

/**
 * Generated class for the TimerComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'timer',
  templateUrl: 'timer.html'
})
export class TimerComponent {

  text: string;

  constructor() {
    console.log('Hello TimerComponent Component');
    this.text = 'Hello World';
  }

}
