import { Component, OnInit } from '@angular/core';
import { AngularXTimelineDataSource } from 'angularx-timeline';

import {Html5Qrcode} from 'html5-qrcode';

import { WheelService } from '../service/wheel.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  private dataHistory:any[] = [];
  dataSource: AngularXTimelineDataSource = [];
  private ProductID;
  private cameraId;
  private html5QrCode;

  ngOnInit() {
    this.html5QrCode = new Html5Qrcode("zonereader");
  Html5Qrcode.getCameras().then(devices => {
    /**
     * devices would be an array of objects of type:
     * { id: "id", label: "label" }
     */
    if (devices && devices.length) {
      this.cameraId = devices[0].id;
      console.log(this.cameraId);
      this.startScan()
      // .. use this to start scanning.
    }
  }).catch(err => {
    // handle err
  });


  }
startScan(){
  this.html5QrCode.start(
  this.cameraId, 
  {
    fps: 10,    // Optional, frame per seconds for qr code scanning
    qrbox: { width: 250, height: 250 }  // Optional, if you want bounded box UI
  },
  (decodedText, decodedResult) => {
    // do something when code is read
    console.log(decodedText);
   this.ProductID=decodedText;
  this.getHistoryOfOrder();
  this.stopscan(this.cameraId)

  },
  (errorMessage) => {
    // parse error, ignore it.
  })
.catch((err) => {
  // Start failed, handle it.
});

}
stopscan(cameraId){
  this.html5QrCode.stop().then((ignore) => {
    // QR Code scanning is stopped.
  }).catch((err) => {
    // Stop failed, handle it.
  });
}
  constructor(private ws:WheelService,private route: ActivatedRoute,private router: Router) { }
  
  getHistoryOfOrder(){
    
    
    var owners = ['Manufucturer','Manufucturer','Transporter','Transporter','Wholesaler','Wholesaler','Transporter','Transporter','Pharmacy','Pharmacy','Patient']
    let data = [
      { title: 'OrderHistory'},
       ];
    data.forEach(entry => this.dataSource.push(entry));
    this.ws.GetHistoryOfOrder(this.ProductID).subscribe((resp)=>{
      this.dataHistory = resp;
      for (let index = 0; index < this.dataHistory.length; index++) {
        const element = this.dataHistory[index];
        var Datedeliv= element['Timestamp'].substr(0,10)
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
        this.dataSource.push({date: Datedeliv, title:statusOrder, content: '<b>Product: </b>'+ element["Value"]["Product_Id"]+'<br><b>Current Owner:</b>'+owners[this.dataHistory.length-index-1]  +'<br> <b>Delivery Date:</b>'+ element["Value"]["Date_Of_delivery"]+'<br><b> Sended:</b>'+  element["Value"]["Sended"]+'<br> <b>Accepted:</b>'+  element["Value"]["Accepted"]})
       }
    });
      
 
  }

}
