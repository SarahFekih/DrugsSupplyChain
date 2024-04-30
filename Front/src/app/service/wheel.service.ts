import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, filter, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AppComponent } from '../app.component';
import { UsersService } from '../service/users.service';
import { SharedService } from '../service/shared.service';

@Injectable({
  providedIn: 'root'
})
export class WheelService {

  constructor(private http : HttpClient,   private userService: UsersService,
    private sharedService: SharedService,) {  this.sharedService.currentUser.subscribe(x => this.currentUser = x);}
  private url = "http://localhost:3000";
  public currentUser =JSON.parse(localStorage.getItem('user'));

  GetProducts() : Observable<any[]>
  {
    const Newheaders = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this.http.get<any[]>(this.url+"/GetProducts/"+this.currentUser.username+"/"+this.currentUser.mspid, { headers: Newheaders, responseType:'json'});
  }
  CreateProduct(data)
  {
    const Newheaders = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this.http.post(this.url+"/CreateProduct/"+this.currentUser.username+"/"+this.currentUser.mspid,data, { headers: Newheaders });
  }
    CreateOrder(data)
  {
    const Newheaders = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this.http.post(this.url+"/CreateOrder/"+this.currentUser.username+"/"+this.currentUser.mspid,data, { headers: Newheaders });
  }
    ListOrders(): Observable<any[]>
    {
      const Newheaders = new HttpHeaders({ 'Content-Type': 'application/json'});
      return this.http.get<any[]>(this.url+"/GetOrders/"+this.currentUser.username+"/"+this.currentUser.mspid, { headers: Newheaders, responseType:'json'});
    }
   
  GetOrderById(id) : Observable<any[]>
  {
    const Newheaders = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this.http.get<any[]>(this.url+"/GetOrder/"+id+"/"+this.currentUser.username+"/"+this.currentUser.mspid, { headers: Newheaders });
  }
  GetHistoryOfOrder(id) : Observable<any[]>
  {
    const Newheaders = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this.http.get<any[]>(this.url+"/GetHistoryOfOrder/"+id+"/"+this.currentUser.username+"/"+this.currentUser.mspid, { headers: Newheaders });
  }
  sendOrder(data)
  {
    const Newheaders = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this.http.post(this.url+"/SendOrder/"+this.currentUser.username+"/"+this.currentUser.mspid,data, { headers: Newheaders });
  }
  acceptOrder(data)
  {
    const Newheaders = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this.http.post(this.url+"/AcceptOrder/"+this.currentUser.username+"/"+this.currentUser.mspid,data, { headers: Newheaders });
  }
}
