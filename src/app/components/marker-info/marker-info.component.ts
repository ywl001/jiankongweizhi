import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ResizedEvent } from 'angular-resize-event';
import * as EventBus from 'eventbusjs';
import { FileUploader } from 'ng2-file-upload';
import { action_delCamera, action_getCameraImages, action_insertCameraImage, action_showCameraImage } from 'src/app/app-state/app-action';
import { selector_cameraImages, selector_currentCamera, selector_user } from 'src/app/app-state/app-selector';
import { Camera, CameraImage, User } from 'src/app/app-state/types';
import { EventType } from 'src/app/models/event-type';
import { SqlService } from 'src/app/services/sql.service';
import swal from 'sweetalert';
import * as toastr from 'toastr'
import { EditMarkComponent } from '../edit-mark/edit-mark.component';


@Component({
  selector: 'app-marker-info',
  templateUrl: './marker-info.component.html',
  styleUrls: ['./marker-info.component.css'],
})
export class MarkerInfoComponent implements OnInit {

  camera: Camera;

  isShowButton: boolean;

  private user: User;

  private uploadUrl = "/monitorBaidu/upload.php";

  imgUrls;

  uploader: FileUploader = new FileUploader({ url: this.uploadUrl, itemAlias: 'Filedata' });

  constructor(private sqlService: SqlService, private cdr: ChangeDetectorRef, public dialog: MatDialog, private store: Store) {
    console.log("info constructor");
    this.uploader.response.subscribe(res => { this.insertImageData(res) });
  }

  onResized(event: ResizedEvent) {
    console.log('mark info resize...')
    EventBus.dispatch(EventType.MARKER_INFO_RESIZE);
  }

  ngOnInit() {
    this.store.select(selector_currentCamera).subscribe(c => {
      this.camera = c
      console.log('mark info camera chagne')
      this.cdr.detectChanges()
    })

    // if (this.camera) {
    this.store.dispatch(action_getCameraImages({ cameraId: this.camera.id }))

    this.store.select(selector_user).subscribe(user => {
      if (user) {
        this.user = user;
        if (user.id == this.camera.userID || user.userType == 'admin')
          this.isShowButton = true;
      } else {
        this.user = null;
        this.isShowButton = false;
      }
      this.cdr.detectChanges()
    })

    this.store.select(selector_cameraImages).subscribe(res => {
      if (res?.length == 0)
        this.imgUrls = null;
      else
        this.imgUrls = res;
      this.cdr.detectChanges()
    })
    // }
  }

  ngOnDestroy() {
    console.log('mark info destory')
    this.imgUrls = undefined;
  }

  onImageClick(currentIndex) {
    this.store.dispatch(action_showCameraImage({cameraId:this.camera.id, index:currentIndex}))
  }

  onAddFile() {
    document.getElementById("inputFile").click();
  }

  onUpload(e) {
    this.uploader.uploadAll();
  }

  onMove() {
    toastr.options.timeOut = 0;
    EventBus.dispatch(EventType.HIDE_INFO_WINDOW);
    EventBus.dispatch(EventType.SET_CURSOR, EventType.CURSOR_CROSSHAIR);
    toastr.info('请在要移动的位置上点击');
    EventBus.dispatch(EventType.MOVE_MARKER);
  }

  private insertImageData(res: string) {
    console.log(res)
    const imgurl = res.substr(1);
    const thumbUrl = imgurl.split('.')[0] + '_thumb.jpg';
    console.log(thumbUrl);
    let ci: CameraImage = {
      monitorID: this.camera.id,
      imageUrl: imgurl,
      thumbUrl: thumbUrl,
      insertUser: this.user.id
    }

    this.store.dispatch(action_insertCameraImage({ cameraImage: ci }))
  }

  onDel() {
    console.log("del:", this.camera.id);
    EventBus.dispatch(EventType.HIDE_INFO_WINDOW);
    swal({
      title: "确定删除吗？",
      buttons: ['取消', '确定']
    }).then((res) => {
      if (res) {
        this.store.dispatch(action_delCamera({ cameraId: this.camera.id }))
      }
    })
  }

  onEdit() {
    this.dialog.open(EditMarkComponent, { data: { flag: 'edit', camera: this.camera } })
  }

}

