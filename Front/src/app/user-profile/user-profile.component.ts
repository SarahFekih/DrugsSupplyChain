import { Component, OnInit } from '@angular/core';
import { WheelService } from '../service/wheel.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularXTimelineDataSource } from 'angularx-timeline';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  private idOrder;
  private dataHistory:any[] = [];
 private dataOrder;

  dataSource: AngularXTimelineDataSource = [];
  constructor(private ws:WheelService,private route: ActivatedRoute,private router: Router) { }

  GetHistoryOfOrder(id){
    
    var owners = ['Manufucturer','Manufucturer','Transporter','Transporter','Wholesaler','Wholesaler','Transporter','Transporter','Pharmacy','Pharmacy','Patient']
    let data = [
      { title: 'OrderHistory'},
       ];
    data.forEach(entry => this.dataSource.push(entry));
    this.ws.GetHistoryOfOrder(id).subscribe((resp)=>{
      this.dataHistory = resp;
      for (let index = 0; index < this.dataHistory.length; index++) {
        const element = this.dataHistory[index];
        var Datedeliv= element['Timestamp'].substr(0,16)
        if(element["Value"]["Sended"]==false && element["Value"]["Accepted"]==false)
        {
          var statusOrder= 'In stock'
        }else if(element["Value"]["Sended"]==true && element["Value"]["Accepted"]==false){
          var statusOrder= 'Sent'
        }else if(element["Value"]["Sended"]==false && element["Value"]["Accepted"]==true){
          var statusOrder= 'Accepted'
        }else{
          var statusOrder='-'
        }
        this.dataSource.push({date: Datedeliv, title:statusOrder, content: '<b>Product: </b>'+ element["Value"]["Product_Id"]+'<br><b>Current Owner: </b>'+owners[this.dataHistory.length-index-1]  +'<br> <b>Delivery Date: </b>'+ element["Value"]["Date_Of_delivery"]+'<br><b> Sended: </b>'+  element["Value"]["Sended"]+'<br> <b>Accepted: </b>'+  element["Value"]["Accepted"]})
       }
    });
      
 
  }
  ngOnInit() {
     this.route.params.subscribe(params => {
     this.idOrder= +params['id'];
     this.doGetOrder(params['id']);
     this.GetHistoryOfOrder(params['id']);
     
   });
 
  }

  doGetOrder(id){
    this.idOrder=id;
    this.ws.GetOrderById(id).subscribe((resp)=>{
    this.dataOrder = resp;
    });
  }
  sendOrder(){
    const data ={
      OrderID:this.idOrder
    }
    this.ws.sendOrder(data).subscribe((resp)=>{
       this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
       this.router.navigate(['/user-profile/'+this.idOrder]);

      })
    })
  }
  acceptOrder(){
    const data ={
      OrderID:this.idOrder
    }
    this.ws.acceptOrder(data).subscribe((resp)=>{
       this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/user-profile/'+this.idOrder]);
 
       })
    })
  }
 

}
