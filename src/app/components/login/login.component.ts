import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as EventBus from 'eventbusjs';
import { action_login, action_registerUser } from 'src/app/app-state/app-action';
import { User } from 'src/app/app-state/types';
import { EventType } from 'src/app/models/event-type';
import { LocalStorgeService } from 'src/app/services/local-storge.service';
import { SqlService } from 'src/app/services/sql.service';
import * as toastr from 'toastr'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  title = '用户登录'

  isLogin = true;

  userName: string;
  password: string;
  realName: string;
  unit: string;

  constructor(
    private dialogRef: MatDialogRef<LoginComponent>,
    private store: Store) { }

  ngOnInit() {
  }

  onLogin() {
    this.store.dispatch(action_login({ user: { userName: this.userName, password: this.password } }))
    this.dialogRef.close()
  }

  onRegister() {
    this.isLogin = false;
    this.title = '用户注册'
  }

  onSubmit() {
    this.dialogRef.close()
    if (!this.validate()) 
      return;
    
    let data: User = {
      userName: this.userName,
      password: this.password,
      realName: this.realName,
      unit: this.unit,
      userType: 'normal'
    }
    this.store.dispatch(action_registerUser({ user: data }));
    this.dialogRef.close()
  }

  private validate():boolean {
    if (this.userName == undefined || this.userName.trim() == '') {
      toastr.warning('用户名不能为空');
      return false;
    }

    if (this.password == undefined || this.password.trim() == '') {
      toastr.warning('密码不能为空');
      return false;
    }

    if (this.unit == undefined || this.unit.trim() == '') {
      toastr.warning('请填写单位');
      return false;
    }

    if (this.realName == undefined || this.realName.trim() == '') {
      toastr.warning('请填写姓名');
      return false;
    }
    return true;
  }
  onCancel() {
    this.dialogRef.close()
  }
}
