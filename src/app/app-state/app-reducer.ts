import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity"
import { createReducer, on } from "@ngrx/store"
import { aciton_mapLevel, action_delCameraImageSuccess, action_delCameraSuccess, action_getCameraImageSuccess, action_getCamerasSuccess, action_insertCameraSuccess, action_loginFailure, action_loginSuccess, action_mapTypeChange, action_searchCameraSuccess, action_selectCamera, action_selectedSearchCamera, action_showCameraImage, action_updateCameraSuccess } from "./app-action"
import { AppState, Camera, User } from "./types"

const initAppState: AppState = { isVecMap: true,searchCameras:[] }

export interface CamerasState extends EntityState<Camera> {
    selectedId?: string | null;
    delId?: string | null;
    currentCamera?: Camera;
    updateCamera?: Camera;
    updateId?:string | null;
}

export const cameraAdapter: EntityAdapter<Camera> = createEntityAdapter<Camera>({});

export const initCameraState: CamerasState = cameraAdapter.getInitialState({});

export const camerasReducer = createReducer(
    initCameraState,
    on(action_getCamerasSuccess, (state, { cameras }) => cameraAdapter.setAll(cameras, state)),
    on(action_selectCamera, (state, { camera }) => ({ ...state, selectedId: camera.id})),
    on(action_insertCameraSuccess, (state, { camera }) => cameraAdapter.addOne(camera, state)),
    on(action_delCameraSuccess, (state, { cameraId }) => cameraAdapter.removeOne(cameraId, { ...state, delId: cameraId })),
    on(action_updateCameraSuccess, (state, { id, changes }) => cameraAdapter.updateOne({ id, changes },{...state,updateId:id})),
)

export const appReducer = createReducer(
    initAppState,
    on(action_loginSuccess, (state, { user }) => ({ ...state, user: user })),
    on(action_loginFailure, (state) => ({ ...state, user: null })),
    on(action_mapTypeChange, (state, { isVecMap }) => ({ ...state, isVecMap: isVecMap })),
    on(action_getCameraImageSuccess, (state, { cameraImages }) => ({ ...state, cameraImages: cameraImages })),
    on(action_delCameraImageSuccess, (state, { id }) => {
        let arr = state.cameraImages.slice();
        const index = arr.findIndex(e => e.id == id);
        arr.splice(index, 1)
        return {...state,cameraImages: arr};
    }),
    on(action_showCameraImage,(state,{cameraId,index})=>({...state,showCameraImage:{cameraId,index}})),
    on(action_searchCameraSuccess,(state,{cameras})=>({...state,searchCameras:cameras})),

    on(action_selectedSearchCamera,(state,{camera}) => ({...state,selectedSearchCamera: {...camera}})),
    
    on(aciton_mapLevel,(state,{level}) => ({...state,mapLevel: level})),
)

