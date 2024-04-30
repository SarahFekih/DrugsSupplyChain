import { Component, OnInit } from '@angular/core';
import { WheelService } from '../../service/wheel.service';
import { SharedService } from '../../service/shared.service';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [

    { path: '/notifications', title: 'Create Order',  icon:'ui-1_bell-53', class: '' },
    { path: '/product', title: 'create product',  icon:'ui-1_bell-53', class: '' },
    { path: '/search', title: 'search Order',  icon:'now-ui-icons ui-1_zoom-bold', class: '' },
    { path: '/user-profile', title: 'Order details ',  icon:'users_single-02', class: '' },
    { path: '/table-list', title: 'List Orders',  icon:'design_bullet-list-67', class: '' },


];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];
  company:string;
  currentUser: any;

  constructor(private ws : WheelService, private sharedService: SharedService,) { 
    this.sharedService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit() {
    
  }
  isMobileMenu() {
      if ( window.innerWidth > 991) {
          return false;
      }
      return true;
  };
}
