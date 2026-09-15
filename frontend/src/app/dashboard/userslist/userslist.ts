import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user-service';

@Component({
  selector: 'app-userslist',
  imports: [],
  templateUrl: './userslist.html',
  styleUrl: './userslist.css',
})
export class Userslist implements OnInit{
  constructor(private _userService: UserService){

  }
  ngOnInit(): void {
   this._userService.getAllUsers()?.subscribe({
    next:(res)=>{
      console.log(res);
      
    }
   })
  }


}
