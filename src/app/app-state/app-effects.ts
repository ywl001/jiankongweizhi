import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { tap, mergeMap, map, catchError, EMPTY, filter, concat, of, merge, exhaustMap, concatMap, switchMap, empty, skipUntil, skipWhile } from "rxjs";
import { SqlService } from "../services/sql.service";
import { action_delCamera, action_delCameraImage, action_delCameraImageSuccess, action_delCameraSuccess, action_getCameraImages, action_getCameraImageSuccess, action_getCameras, action_getCamerasSuccess, action_insertCamera, action_insertCameraImage, action_insertCameraSuccess, action_login, action_loginFailure, action_loginSuccess, action_registerUser, action_searchCamera, action_searchCameraSuccess, action_test, action_updateCamera, action_updateCameraSuccess } from "./app-action";

import * as toastr from "toastr";
import * as EventBus from 'eventbusjs';
import { TableName } from "./types";
import { selector_selectedId } from "./app-selector";
import { DelFileService } from "../services/delFile.services";
import { EventType } from "../models/event-type";


@Injectable()
export class AppEffects {

    constructor(
        private actions$: Actions,
        private sqlService: SqlService,
        private delFileService: DelFileService,
        private store: Store
    ) { }

    login$ = createEffect(() => this.actions$.pipe(
        ofType(action_login),
        tap(action => console.log(action)),
        mergeMap((action) => this.sqlService.login(action.user).pipe(
            tap(a => console.log(a)),
            map(res => {
                if (res.length > 0) {
                    return action_loginSuccess({ user: res[0] })
                } else {
                    toastr.warning('用户名或密码错误')
                    return action_loginFailure()
                }
            }),
            catchError(() => EMPTY)
        ))
    ));

    registerUser$ = createEffect(() => this.actions$.pipe(
        ofType(action_registerUser),
        mergeMap(action => this.sqlService.getUserByUsername(action.user).pipe(
            filter(res => res.length == 0),
            map(res => action.user),
        )),
        mergeMap(user => this.sqlService.insert('user', user).pipe(
            tap(res => {
                if (res > 0) {
                    toastr.success('注册成功')
                }
            }),
            map(()=>action_test())
        ))
    ));

    getCameras$ = createEffect(() => this.actions$.pipe(
        ofType(action_getCameras),
        map(action => action.extent),
        mergeMap(extent => this.sqlService.getCamerasByExtent(extent).pipe(
            // tap(res => console.log(res)),
            map(res => action_getCamerasSuccess({ cameras: res }))
        ))
    ))

    getCameraImage$ = createEffect(() => this.actions$.pipe(
        ofType(action_getCameraImages),
        map(action => action.cameraId),
        mergeMap(cameraId => this.sqlService.getMarkImages(cameraId).pipe(
            // tap(res => console.log(res)),
            map(res => action_getCameraImageSuccess({ cameraImages: res }))
        ))
    ))

    insertCameraImage$ = createEffect(() => this.actions$.pipe(
        ofType(action_insertCameraImage),
        map(action => action.cameraImage),
        mergeMap(cameraImage => this.sqlService.insert(TableName.monitorImage, cameraImage).pipe(
            tap(() => toastr.success('图片上传成功')),
            map(id => cameraImage.monitorID),
            map(cid => action_getCameraImages({ cameraId: cid }))
        ))
    ))

    insertCamera$ = createEffect(() => this.actions$.pipe(
        ofType(action_insertCamera),
        map(action => action.camera),
        mergeMap(camera => this.sqlService.insert(TableName.monitor, camera).pipe(
            tap(() => toastr.success('添加成功')),
            map(id => {
                const c = { ...camera, id: id + '' }
                return action_insertCameraSuccess({ camera: c })
            })
        ))
    ))

    delCamera$ = createEffect(() => this.actions$.pipe(
        ofType(action_delCamera),
        map(action => action.cameraId),
        //删除文件
        switchMap(cameraId => this.sqlService.getMarkImages(cameraId).pipe(
            tap(x => console.log(x)),
            map((res: any[]) => res.map(item => [item.imageUrl, item.thumbUrl]).flat()),
            mergeMap(r => {
                if (r.length > 0)
                    return this.delFileService.delFiles(r).pipe(
                        tap(r => console.log('del ' + r + ' file')),
                        map(r => cameraId)
                    )
                return of(cameraId)
            })
        )),

        mergeMap(cid => this.sqlService.delete(TableName.monitor, cid).pipe(
            map(r => {
                toastr.success('删除成功');
                return action_delCameraSuccess({ cameraId: cid })
            })
        ))
    ))

    updateCamera$ = createEffect(() => this.actions$.pipe(
        ofType(action_updateCamera),
        mergeMap(action => this.sqlService.update(TableName.monitor, action.data, action.id).pipe(
            tap((res) => toastr.success('修改成功',res)),
            map(() => action_updateCameraSuccess({ id: action.id, changes: action.data }))
        ))
    ))

    delCameraImage$ = createEffect(() => this.actions$.pipe(
        ofType(action_delCameraImage),
        map(action => action.id),
        //删除文件
        switchMap(id => this.sqlService.getImage(id).pipe(
            tap(x => console.log(x)),
            map((res: any[]) => res.map(item => [item.imageUrl, item.thumbUrl]).flat()),
            mergeMap(r => {
                if (r.length > 0)
                    return this.delFileService.delFiles(r).pipe(
                        tap(r => console.log('del ' + r + ' file')),
                        map(r => id)
                    )
                return of(id)
            })
        )),

        mergeMap(id => this.sqlService.delete(TableName.monitorImage, id).pipe(
            map(r => {
                toastr.success('删除成功');
                return action_delCameraImageSuccess({ id: id })
            })
        ))
    ))

    searchCamera$ = createEffect(() => this.actions$.pipe(
        ofType(action_searchCamera),
        map(action => action.keyword),
        mergeMap(keyword => this.sqlService.searchCamera(keyword).pipe(
            map(res => action_searchCameraSuccess({ cameras: res }))
        ))
    ))

}
