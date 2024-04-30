import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WheelService } from '../service/wheel.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {


  private Manufacturer
  private Label
  private ManufacturingDate
  private ExpirationDate
  private products:any[] = [];
 
  constructor(private toastr: ToastrService,private ws: WheelService,private router: Router) {
   
  }
 
  listOfProducts(){
    
    this.ws.GetProducts().subscribe((resp)=>{
      this.products = resp['data'];
    });
  }

  CreateProduct(){
    const data ={
  
      Label: this.Label,
      ManufacturingDate:this.ManufacturingDate,
      ExpirationDate: this.ExpirationDate,
      Manufacturer: "Manufacturer"
    }
   this.ws.CreateProduct(data).subscribe(()=>{
    this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/product']);
  }); 
    });
  }
  ngOnInit() {
    this.listOfProducts();
  }

}
