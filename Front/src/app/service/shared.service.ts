import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { BehaviorSubject, Observable } from 'rxjs';

const STORAGE_KEY = 'USER';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  creds: any;

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) {
    if (this.getStorageValue()) this.creds = this.getStorageValue()

    this.currentUserSubject = new BehaviorSubject<any>(this.creds);
    this.currentUser = this.currentUserSubject.asObservable();

  }


  public get currentUserValue(): any {
    if (!this.currentUserSubject.value)
      this.changeUser(this.getStorageValue())
    return this.currentUserSubject.value;

  }
  public changeUser(newValue: any) {
    this.currentUserSubject.next(newValue)
    this.storeStorageValue(newValue);
  }


  storeStorageValue(user: any) {
    this.storage.set(STORAGE_KEY, JSON.stringify(user));
  }

  getStorageValue() {
    if(this.storage.get(STORAGE_KEY))
    return JSON.parse(this.storage.get(STORAGE_KEY));
  }

  removeValue() {
    this.changeUser(null);
    this.storage.remove(STORAGE_KEY);
  }

}