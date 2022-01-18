import { Component, OnInit, ComponentFactory, ComponentFactoryResolver, ViewChild, ViewContainerRef, Injector, ComponentRef, ApplicationRef, ChangeDetectorRef } from '@angular/core';

import { MarkerInfoComponent } from '../marker-info/marker-info.component';
import * as EventBus from 'eventbusjs';
import * as toastr from 'toastr';
import { EditMarkComponent } from '../edit-mark/edit-mark.component';
import { MatDialog } from '@angular/material/dialog';
import { EventType } from 'src/app/models/event-type';
import { SqlService } from 'src/app/services/sql.service';
import { select, Store } from '@ngrx/store';
import { Camera, CAMERA_TYPES, Extent, User } from 'src/app/app-state/types';
import { selector_cameras, selector_selectedId, selector_user, selector_delId, selector_currentCamera, selector_updateCamera, selector_selectedSearchCamera } from 'src/app/app-state/app-selector';
import { aciton_mapLevel, action_getCameras, action_selectCamera, action_updateCamera } from 'src/app/app-state/app-action';
import { filter, map, tap } from 'rxjs';

declare var BMap;
declare var BMAP_SATELLITE_MAP;
declare var BMAP_NORMAL_MAP;
declare var BMAP_ANIMATION_DROP;
declare var BMAP_ANIMATION_BOUNCE;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  //百度地图
  private bdmap;
  private markLib: Map<string, any>;
  private focusIndex = 10000;

  private prevMarker;
  private nowMarker;
  private infoWindow;

  private isMoveMark: boolean;
  private pressTimer;
  private isDrag: boolean;

  private loseFocusMarkID;
  private foucusID;
  private user: User;

  private markInfoRef: ComponentRef<MarkerInfoComponent>;

  constructor(
    private sqlService: SqlService,
    private resolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef,
    private store: Store,
    public dialog: MatDialog,
    private injector: Injector) {
    EventBus.addEventListener(EventType.MARKER_INFO_RESIZE, e => { this.refreshInfoWindow() });
    EventBus.addEventListener(EventType.MOVE_MARKER, e => { this.isMoveMark = true });
    EventBus.addEventListener(EventType.HIDE_INFO_WINDOW, e => { this.hideInfoWindow() });
    EventBus.addEventListener(EventType.SET_CURSOR, e => { this.bdmap.setDefaultCursor(e.target) });
    EventBus.addEventListener(EventType.MAP_LAYER_CHANGE, e => { this.mapLayerChange(e.target) })
    EventBus.addEventListener(EventType.SHOW_SEARCH_MARK, e => { this.showSearchMark(e.target) })
  }

  ngOnInit() {
    this.initMap();
    this.markLib = new Map();
    this.store.select(selector_user).subscribe(user => this.user = user);

    //添加mark到地图
    this.store.select(selector_cameras).pipe(
      //对数据过滤并转换，过滤已经在地图中的，转换成mark
      tap(x => console.time('数据添加到地图')),
      map(cameras => cameras.filter(c => !this.markLib.has(c.id)).map(c => this.createMark(c))),
      // map(cameras => cameras.map(c => this.createMark(c))),
    ).subscribe(marks => {
      // this.bdmap.clearOverlays();
      // this.markLib.clear()
      marks.forEach(m => {
        this.bdmap.addOverlay(m)
        this.markLib.set(m.id, m)
      })
      this.setFocusMark(this.foucusID)
      this.clearOutExtentCamera()
      console.timeEnd('数据添加到地图')
    })

    this.store.select(selector_selectedId).subscribe(id => {
      console.log('bbbbbbbbb')
      this.foucusID = id;
      this.setFocusMark(id)
    })

    this.store.select(selector_delId).subscribe(
      id => {
        const m = this.markLib.get(id);
        this.bdmap.removeOverlay(m);
        this.markLib.delete(id);
      }
    )

    this.store.select(selector_updateCamera).subscribe(
      camera => {
        console.log('update camera chagne', camera)
        if (!camera) return
        const m = this.markLib.get(camera.id);
        this.bdmap.removeOverlay(m);
        this.markLib.delete(camera.id);
        const m2 = this.createMark(camera);
        this.bdmap.addOverlay(m2);
        this.markLib.set(camera.id, m2);
      }
    )

    this.store.select(selector_currentCamera).subscribe(c => {
      if (!c) {
        this.hideInfoWindow()
      }
    })

    this.store.select(selector_selectedSearchCamera).subscribe(res => {
      console.log('aaaaaaaaaa')
      this.showSearchMark(res);
      selector_selectedSearchCamera.release();
    })
  }

  // 初始化地图
  private initMap() {
    console.log('init map')
    this.bdmap = new BMap.Map("map", { enableMapClick: false });//禁止地图图标点击
    this.bdmap.centerAndZoom('洛阳', 11);
    this.bdmap.enableScrollWheelZoom(true);
    this.bdmap.disableDoubleClickZoom(false);

    this.bdmap.addEventListener('tilesloaded', e => { this.getCameras() })
    this.bdmap.addEventListener('click', e => { this.onMapClick(e) })
    this.bdmap.addEventListener('mousedown', e => { this.onMapMouseDown(e) })
    this.bdmap.addEventListener('dragstart', e => { this.onMapDragStart(e) })
    this.bdmap.addEventListener('dragend', e => { this.onMapDragEnd(e) })
    this.bdmap.addEventListener('mouseup', e => { this.onMapMouseUp(e) })
    this.bdmap.addEventListener('zoomend', e => { this.onZoomend(e) })
  }

  private getCameras() {
    const bounds = this.bdmap.getBounds();
    const p1 = bounds.getSouthWest();//西南
    const p2 = bounds.getNorthEast();//东北
    const extent: Extent = {
      xmin: p1.lat,
      ymin: p1.lng,
      xmax: p2.lat,
      ymax: p2.lng,
      mapLevel: this.bdmap.getZoom()
    }

    this.store.dispatch(action_getCameras({ extent }))
  }

  //清除范围外的mark
  private clearOutExtentCamera() {
    const overlays = this.bdmap.getOverlays();
    console.log('overlayer num:' + overlays.length)
    if (overlays.length > 0) {
      const currentBounds = this.bdmap.getBounds();
      const currentZoom = this.bdmap.getZoom();
      overlays.forEach(m => {
        if (!m || !m.attributes) return;
        if (!currentBounds.containsPoint(m.getPosition()) || m.attributes.displayLevel > currentZoom) {
          this.bdmap.removeOverlay(m);
          this.markLib.delete(m.attributes.id);
        }
      })
    }
  }

  //创建marker
  private createMark(c: Camera) {
    let marker;
    let point = new BMap.Point(c.y, c.x);
    // console.log(point);
    marker = new BMap.Marker(point);
    //创建icon
    let icon = this.createIcon(c);
    marker.setShadow(icon);//去除阴影
    marker.setIcon(icon);
    marker.setRotation(c.angle);

    //把station附加给marker
    marker.attributes = c;
    marker.id = c.id;
    marker.addEventListener('click', $event => { this.markClickListener($event) });
    return marker;
  }

  private createIcon(c: Camera, isFocus = false) {
    let url = "assets/normal.png";
    const type = this.getType(c);
    if (isFocus) {
      url = `assets/${type}_press.png`;
    } else if (!c.isRunning) {
      url = `assets/${type}_error.png`;
    } else {
      url = `assets/${type}.png`;
    }
    let icon = new BMap.Icon(url, new BMap.Size(24, 24), { anchor: new BMap.Size(12, 12) })
    return icon;
  }

  private getType(c: Camera) {
    if (c.type) {
      return CAMERA_TYPES.find(type => c.type == type.name).src
    }
    return "normal";
  }

  private setFocusMark(markId) {
    let mark = this.markLib.get(markId);
    if (!mark) {
      console.log('focus mark not exist');
      return
    };
    this.setFocusMarkerView(mark, true);
    if (this.loseFocusMarkID) {
      const loseFocusMark = this.markLib.get(this.loseFocusMarkID)
      if (loseFocusMark && loseFocusMark != mark)
        this.setFocusMarkerView(loseFocusMark, false)
    }
    this.loseFocusMarkID = mark.id;
  }

  //设置焦点marker
  private setFocusMarkerView(marker, isFocus) {
    const camera = marker.attributes
    //setZIndex 要放在setIcon和setRotation的前面,否则不起作用
    if (isFocus) {
      marker.setZIndex(this.focusIndex);
      this.focusIndex++;
    }
    marker.setIcon(this.createIcon(camera, isFocus));
    marker.setRotation(camera.angle);
  }

  private hideInfoWindow() {
    this.bdmap.closeInfoWindow();
    this.markInfoRef = null;
  }

  //mark的点击事件
  private markClickListener(e) {
    const m = e.target;
    this.nowMarker = m;
    this.store.dispatch(action_selectCamera({ camera: m.attributes }))
    const p = m.getPosition();
    this.showInfoWindow(m.attributes, p)
  }

  //显示markInfoWindow
  private showInfoWindow(c: Camera, p): void {
    const factory: ComponentFactory<MarkerInfoComponent> = this.resolver.resolveComponentFactory(MarkerInfoComponent);
    this.markInfoRef = factory.create(this.injector);
    let div = document.createElement('div');
    div.appendChild(this.markInfoRef.location.nativeElement);
    this.infoWindow = new BMap.InfoWindow(div);
    this.bdmap.openInfoWindow(this.infoWindow, p);
    this.markInfoRef.changeDetectorRef.detectChanges();
  }

  private refreshInfoWindow() {
    this.infoWindow?.redraw();
  }

  private onMapMouseDown(e: any) {
    this.pressTimer = setTimeout(() => {
      //拖到的时候不能添加
      if (this.isDrag) return;
      //没有登录的时候不能添加
      if (!this.user){
        toastr.warning('用户没有登录，不能添加监控')
        return;
      }

      console.log('long press')
      if (this.bdmap.getZoom() < 18) {
        this.zoomMapToMax(e.point);
      } else {
        this.showAddMarkDialog(e.point)
      }
    }, 1500);
  }

  private zoomMapToMax(center) {
    this.bdmap.centerAndZoom(center, 19)
  }

  private onMapDragStart(e) {
    // console.log('drag')
    this.isDrag = true;
  }

  private onMapDragEnd(e) {
    // console.log('drag stop')
    this.isDrag = false;
  }

  private onMapMouseUp(e) {
    clearTimeout(this.pressTimer)
  }

  onMapClick(e) {
    //移动mark到新位置
    if (this.isMoveMark) {
      console.log('map click')
      this.isMoveMark = false;
      EventBus.dispatch(EventType.SET_CURSOR, EventType.CURSOR_AUTO)
      toastr.clear();
      toastr.options.timeOut = 3000;
      const p = e.point;
      let data = { x: p.lat, y: p.lng };

      this.store.dispatch(action_updateCamera({ data: data, id: this.nowMarker.id }));

    }
  }

  private showAddMarkDialog(p) {
    const dialogRef = this.dialog.open(EditMarkComponent, {
      disableClose: true,
      data: { flag: 'add', x: p.lat, y: p.lng }
    });
  }

  private mapLayerChange(isVecLayer) {
    isVecLayer ? this.bdmap.setMapType(BMAP_SATELLITE_MAP) : this.bdmap.setMapType(BMAP_NORMAL_MAP)
  }

  showSearchMark(camera: Camera) {
    if (!camera) return;
    let zoom = camera.displayLevel;
    const center = new BMap.Point(camera.y, camera.x);
    this.bdmap.centerAndZoom(center, zoom)
    this.store.dispatch(action_selectCamera({ camera }));
  }

  private onZoomend(e) {
    this.store.dispatch(aciton_mapLevel({level:this.bdmap.getZoom()}))
  }
}
