import { Component} from '@angular/core';
	import { Router } from '@angular/router';
	import { SharedService } from './service/shared.service';


	@Component({
	  selector: 'app-root',
	  templateUrl: './app.component.html',
	  styleUrls: ['./app.component.css']
	})
	export class AppComponent {
	  currentUser : any ;
	  constructor(private router: Router,
	    private sharedService: SharedService,
	    ) { 
	      this.sharedService.currentUser.subscribe(x => this.currentUser = x);
		}
	  ngOnInit() {
	    if(this.currentUser) this.router.navigate(['/search'])
	    else this.router.navigate(['/login'])
	  
	  }
	  
	}