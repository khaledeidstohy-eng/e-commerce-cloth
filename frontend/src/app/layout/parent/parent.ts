import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Child } from './child/child';

@Component({
  selector: 'app-parent',
  imports: [Child],
  templateUrl: './parent.html',
  styleUrl: './parent.css',
})
export class Parent implements OnInit,AfterViewInit{

  @ViewChildren(Child) myChildren!: QueryList<Child>
names=['ali','mona','sara','omr'];

//1
constructor(){}

//2 ngOnChanges(){}

//3
 ngOnInit(): void {
   
  }

  //4 ngDoCheck(){}

  //5 ngAfterContentInit(){}  <ng-content>

  // 6 ngAfterContentChecked(){} 

//7
  ngAfterViewInit(): void {
  // this.myChild.msg ='First message'
  }

  //8 ngAfterViewChecked(){}

  // 9
   ngOnDestroy(){
    console.log('bye bye');
    
   }
 

  //@ViewChild(Child) myChild!:Child


  do(){
    // this.myChild.msg = "Hello from parent"

    // this.myChild.sayHi();

    this.myChildren.forEach((item,i)=>{
      item.myName = i + "-" + item.myName 
    })
  }

}
