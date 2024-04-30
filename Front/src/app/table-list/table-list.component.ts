import { Component, OnInit } from '@angular/core';
import { WheelService } from '../service/wheel.service';

@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.css']
})
export class TableListComponent implements OnInit {

  constructor(private ws : WheelService) { }
  private ordersList:any[] = [];
  private emplacement = ['Manufucturer','Transporter','Wholesaler','Transporter','Pharmacy','Patient']
  

  ngOnInit() {
  this.GetOrdersList();
  console.log(this.ordersList);
  }
  GetOrdersList(){
     var owners = ['Manufucturer','Transporter','Wholesaler','Transporter','Pharmacy','Patient']
  
    this.ws.ListOrders().subscribe((resp)=>{
      this.ordersList = resp['data'];
    });
  }

}
