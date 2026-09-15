import { Component, effect, signal } from '@angular/core';

@Component({
  selector: 'app-my-signals',
  imports: [],
  templateUrl: './my-signals.html',
  styleUrl: './my-signals.css',
})
export class MySignals {

  constructor(){
    effect(()=>{
      console.log('count:',this.count());
      
    })
  }
  count = signal(0)

  do(){
   // console.log(this.count());
    //set
    //this.count.set(10);

    this.count.update(v=> v + 20)
  }
}
