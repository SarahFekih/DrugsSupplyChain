import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators'
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({
  providedIn: 'root'
})
export class UsersService {
  
  constructor(private httpclient: HttpClient) { }
   apiUrl= 'http://localhost:3000/';


  login(data: string) {
    return this.httpclient
      .get<any>(this.apiUrl +'SignInUser/'+ data, {  })
      .pipe(
        map((result) => {
          return result;
        })
      );
  }

  register(data: string) {
    return this.httpclient
      .get<any>(this.apiUrl +'RegisterUser/'+ data, {  })
      .pipe(
        map((result) => {
          return result;
        })
      );
  }




}