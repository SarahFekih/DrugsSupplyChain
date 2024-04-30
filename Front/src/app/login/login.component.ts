import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { first, map } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../service/users.service';
import { SharedService } from '../service/shared.service';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  currentUser : any ;
  loginForm: FormGroup ;
  result: any;
  registerForm: FormGroup;
  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private userService: UsersService,
    private sharedService: SharedService,
    ) { 
      this.sharedService.currentUser.subscribe(x => this.currentUser = x);
    }

  ngOnInit() {

    if(this.currentUser) this.router.navigate(['/dashboard']);
    this.initForm();
  }

  initForm() {
    this.loginForm = new FormGroup({
      username: new FormControl(),
      password: new FormControl(),
      mspid: new FormControl(),
   });
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      mspid: ['', [Validators.required]],
    });

    this.registerForm = new FormGroup({
      username: new FormControl(),
      password: new FormControl(),
      mspid: new FormControl(),
   });
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      mspid: ['', [Validators.required]],
    });
  }

  login() {
    console.log
    const formValue = this.loginForm.value;
    let data =formValue['username']+"-"+formValue['password']+"-"+formValue['mspid']

    this.userService.login(data).subscribe((res) => {
      if (res) {
        this.result = res;
        console.log(this.result)
        this.sharedService.changeUser(
          {
            'username': formValue['username'],
            'password': formValue['password'],
            'mspid': formValue['mspid']
          }
        );
        this.router.navigate(['/table-list'])
      }
    })
  }

  register() {
    console.log
    const formValue = this.registerForm.value;
    let data =formValue['username']+"-"+formValue['password']+"-"+formValue['mspid']

    this.userService.register(data).subscribe((res) => {
      if (res) {
        this.result = res;
        console.log(this.result)
        
        this.router.navigate(['/login'])
      }
    })
  }

}
