import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { fromEvent } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocalStorgeService } from 'src/app/services/local-storge.service';
import { Store } from '@ngrx/store';
import { Camera, CAMERA_TYPES, User } from 'src/app/app-state/types';
import { selector_user } from 'src/app/app-state/app-selector';
import { action_insertCamera, action_updateCamera } from 'src/app/app-state/app-action';

@Component({
  selector: 'app-edit-mark',
  templateUrl: './edit-mark.component.html',
  styleUrls: ['./edit-mark.component.css']
})
export class EditMarkComponent implements OnInit {

  title = '添加监控点'
  camera_types = CAMERA_TYPES;

  isShowSelectTypeUI = false;
  isShowZnzUI = false;
  isClickRadio;

  cameraType: string = '';
  cameraAngle: number = 0;
  cameraName: string;
  cameraOwner: string;
  cameraPhone: string;
  cameraNumber: string;
  cameraLevel: number = 16;
  isRunning: boolean = true;

  private user:User;

  private isClickZnz: boolean;

  // camera:Camera;

  @ViewChild('znz', { static: false }) znz: ElementRef

  constructor(
    public dialogRef: MatDialogRef<EditMarkComponent>,
    private localStorgeService: LocalStorgeService,
    private store:Store,
    //如果添加新mark，data：{x,y,flag:add},如果编辑{camera对象，flag:edit}
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit() {
    console.log(this.data)
    if(this.data.flag == 'add'){
      this.title = '添加监控点';
    }else{
      this.title = '编辑监控信息';
      let camera:Camera = this.data.camera;
      this.cameraAngle = camera.angle;
      this.cameraLevel = camera.displayLevel;
      this.cameraName = camera.name;
      this.cameraNumber = camera.monitorID +'';
      this.cameraOwner = camera.owner;
      this.cameraPhone = camera.telephone;
      this.cameraType = camera.type
    }
    this.store.select(selector_user).subscribe(user=>this.user = user)
  }

  onCameraTypeFocus() {
    this.isShowSelectTypeUI = true;
  }

  onCameraTypeBlur(e) {
    console.log(e)
    if (e.relatedTarget.localName == 'input') {
      this.isShowSelectTypeUI = false
    }
  }

  onCameraTypeChange(e) {
    this.cameraType = e.value
    this.isShowSelectTypeUI = false;
  }

  onDirectionFocus() {
    this.isShowZnzUI = true;
  }

  onDirectionBlur(e) {
    console.log('blur')
    if (!this.isClickZnz) this.isShowZnzUI = false
  }

  private move$
  private up$;
  onMouseDownZnz(e) {
    let deg;
    console.log('down', this.calcDeg(e))
    this.isClickZnz = true;
    this.isShowZnzUI = true;
    deg = this.calcDeg(e)
    this.znz.nativeElement.style.transform = `rotate(${deg}deg)`

    if (this.move$) this.move$.unsubscribe();
    if (this.up$) this.up$.unsubscribe();

    this.move$ = fromEvent(e.target, 'mousemove').subscribe(
      (e: any) => {
        console.log('move:', this.calcDeg(e))
        deg = this.calcDeg(e)
        this.znz.nativeElement.style.transform = `rotate(${deg}deg)`
      }
    )

    this.up$ = fromEvent(window, 'mouseup').subscribe(
      (e: any) => {
        this.cameraAngle = parseInt(deg + 90);
        this.isClickZnz = false;
        this.isShowZnzUI = false;
        if (this.move$) this.move$.unsubscribe()
        this.up$.unsubscribe()
      }
    )
  }

  private calcDeg(e: MouseEvent) {
    const w = (<any>(e.target)).offsetWidth;
    let x = e.offsetX - w / 2;
    let y = e.offsetY - w / 2;
    let rad = Math.atan2(y, x);
    return rad * 180 / Math.PI + 90;
  }

  onGetCameraName() {
    this.cameraName = this.localStorgeService.get('cameraName')
  }

  onGetCameraOwner() {
    this.cameraOwner = this.localStorgeService.get('cameraOwner')
  }

  onGetCameraPhone() {
    this.cameraPhone = this.localStorgeService.get('cameraPhone')
  }

  onCancel() {
    this.dialogRef.close()
  }

  onSubmit() {
    if (this.cameraName) this.localStorgeService.set('cameraName', this.cameraName)
    if (this.cameraOwner) this.localStorgeService.set('cameraOwner', this.cameraOwner)
    if (this.cameraPhone) this.localStorgeService.set('cameraPhone', this.cameraPhone)

    if (this.data.flag == 'add') {
      this.store.dispatch(action_insertCamera({camera:this.createData()}))
    } else if (this.data.flag = 'edit') {
      console.log(this.createData(),this.data.id)
      this.store.dispatch(action_updateCamera({data:this.createData(),id:this.data.camera.id}))
    }
    this.dialogRef.close()
  }

  private validate() {

  }

  private createData() {
    let data:Camera;
    if(this.data.flag == 'add'){
      data = {
        monitorID: this.cameraNumber,
        name: this.cameraName,
        type: this.cameraType,
        y: this.data.y,
        x: this.data.x,
        owner: this.cameraOwner,
        angle: this.cameraAngle,
        userID: this.user.id,
        displayLevel: this.cameraLevel,
        telephone: this.cameraPhone,
        isRunning: this.isRunning
      }
    }else{
      data = {
        monitorID: this.cameraNumber,
        name: this.cameraName,
        type: this.cameraType,
        owner: this.cameraOwner,
        angle: this.cameraAngle,
        displayLevel: this.cameraLevel,
        telephone: this.cameraPhone,
        isRunning: this.isRunning
      }
    }
    console.log(data)
    return data;
  }
}
