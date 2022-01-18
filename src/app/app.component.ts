import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import * as toastr from 'toastr';
import * as EventBus from 'eventbusjs';
import { LoginComponent } from './components/login/login.component';
import { EventType } from './models/event-type';
import { LocalStorgeService } from './services/local-storge.service';
import { Store } from '@ngrx/store';
import { selector_cameraImages, selector_isVecMap, selector_mapLevel, selector_showCameraImage, selector_user } from './app-state/app-selector';
import { filter } from 'rxjs';
import { action_delCameraImage, action_login, action_loginFailure } from './app-state/app-action';
import { User } from './app-state/types';
import swal from 'sweetalert';
import { concatLatestFrom } from '@ngrx/effects';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = '监控助手';

  /**地图类型绑定 */
  isVecMap: boolean;

  /**登录信息绑定 */
  welcome: string;
  isLogined: boolean;
  user: User

  @ViewChild('drawer', { static: false }) drawer: MatDrawer;

  /**监控图像绑定 */
  images;
  imageIndex = -1;
  showFlag = false;

  constructor(
    public dialog: MatDialog,
    private localStorge: LocalStorgeService,
    private store: Store
  ) {
    EventBus.addEventListener(EventType.CLOSE_DRAWER, e => { this.drawer.close() })
  }

  ngOnInit() {
    //地图类型切换
    this.store.select(selector_isVecMap).subscribe(val => this.isVecMap = val)

    //登录检测
    //1、本地存储检测是否登录过，如果有直接登录
    this.user = this.localStorge.getObject('user');
    if (this.user) {
      this.store.dispatch(action_login({ user: this.user }))
    }
    //登录成功后
    this.store.select(selector_user).subscribe(user => {
      if (user) {
        this.user = user;
        this.isLogined = true;
        this.localStorge.setObject('user', user);
        toastr.success('登录成功')
        this.welcome = `欢迎你，${user.realName}`;
      } else {
        this.isLogined = false;
        this.localStorge.setObject('user', null);
        this.welcome = null;
        this.user = null
      }
    })

    this.store.select(selector_mapLevel).subscribe(res=>{
      this.welcome = `地图级别：${res}`
    })

    //显示监控的图像
    this.store.select(selector_showCameraImage).pipe(
      concatLatestFrom(() => this.store.select(selector_cameraImages).pipe(
        filter(r => Boolean(r))
      ))
    ).subscribe(data => {
      console.log('showImage')
      const showData = data[0];
      const images = data[1];
      this.images = images.map((o) => {
        let img: any = {}
        img.id = o.id;
        img.image = `/monitorBaidu/monitor_image/${o.imageUrl}`;
        return img
      })
      this.showFlag = true;
      this.imageIndex = showData.index;
    })
  }

  /**点击登录按钮 */
  onLogin() {
    if (!this.isLogined)
      this.dialog.open(LoginComponent)
    else {
      swal({
        title: "确定要退出登录吗？",
        buttons: ['取消', '确定']
      }).then((res) => {
        if (res) {
          this.store.dispatch(action_loginFailure())
          toastr.info('用户已退出')
        }
      })
    }
  }

  /**点击切换地图类型按钮 */
  onMapLayerChange() {
    EventBus.dispatch(EventType.MAP_LAYER_CHANGE, this.isVecMap)
    this.isVecMap = !this.isVecMap;
  }

  /**点击搜索按钮 */
  onSearch() {
    this.drawer.toggle()
  }

  /**在图像中点击删除按钮 */
  onDel(e) {
    swal({ title: "確定要刪除嗎？", buttons: ['取消', '確定'] }).then((res) => {
      if (res) {
        const id = e.images[e.index].id
        this.store.dispatch(action_delCameraImage({ id }));
        // 视图更新，删除是最好一张，直接关闭图像
        this.images.splice(e.index, 1);
        this.closeEventHandler()
      }
    })
  }

  /**图像中点击删除按钮 */
  closeEventHandler() {
    console.log('close image')
    this.showFlag = false;
  }
}
