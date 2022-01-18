import { UpdateNum } from "@ngrx/entity/src/models";
import { createAction, props } from "@ngrx/store";
import { Camera, CameraImage, Extent, User } from "./types";


enum ActionType {
    LOGIN = "login",
    LOGIN_SUCCESS = "loginSuccess",
    LOGIN_FAILURE = "loginFailure",

    REGISTER_USER = "registerUser",
    MAP_TYPE_CHANGE = "mapTypeChange",

    GET_CAMERAS = "getCameras",
    GET_CAMERAS_SUCCESS = "getCamerasSuccess",
    SELECT_CAMERA = "selectCamera",
    GET_CAMERA_IMAGES = 'getCameraImages',
    GET_CAMERA_IMAGES_SUCCESS = 'getCameraImagesSuccess',

    INSER_CAMERA_IMAGE = "insertCameraImage",
    INSER_CAMERA = "insertCamera",
    INSER_CAMERA_SUCCESS = "insertCameraSuccess",

    DELETE_CAMERA = "deleteCamera",
    DELETE_CAMERA_SUCCESS = "deleteCameraSuccess",

    DELETE_CAMERA_IMAGE = "deleteCameraImage",
    DELETE_CAMERA_IMAGE_SUCCESS = "deleteCameraImageSuccess",
    SHOW_CAMERA_IMAGE = "showCameraImage",

    UPDATE_CAMERA = "updateCamera",
    UPDATE_CAMERA_SUCCESS = "updateCameraSuccess",

    SEARCH_CAMERA = "searchCamera",
    SEARCH_CAMERA_SUCCESS = "searchCameraSuccess",

    SELECTED_SEARCH_CAMERA = "selectedSearchCamera",

    MAP_LEVEL = "mapLevel"

}


export const action_test = createAction('testaaa');
export const action_login = createAction(ActionType.LOGIN, props<{ user: User }>());
export const action_loginSuccess = createAction(ActionType.LOGIN_SUCCESS, props<{ user: User }>());
export const action_loginFailure = createAction(ActionType.LOGIN_FAILURE);

export const action_registerUser = createAction(ActionType.REGISTER_USER, props<{ user: User }>());

export const action_mapTypeChange = createAction(ActionType.MAP_TYPE_CHANGE, props<{ isVecMap: boolean }>());

export const action_getCameras = createAction(ActionType.GET_CAMERAS, props<{ extent: Extent }>());
export const action_getCamerasSuccess = createAction(ActionType.GET_CAMERAS_SUCCESS, props<{ cameras: Camera[] }>());

export const action_selectCamera = createAction(ActionType.SELECT_CAMERA, props<{ camera: Camera }>());

export const action_getCameraImages = createAction(ActionType.GET_CAMERA_IMAGES, props<{ cameraId: string }>());
export const action_getCameraImageSuccess = createAction(ActionType.GET_CAMERA_IMAGES_SUCCESS, props<{ cameraImages: CameraImage[] }>());

export const action_insertCameraImage = createAction(ActionType.INSER_CAMERA_IMAGE, props<{ cameraImage: CameraImage }>());

export const action_insertCamera = createAction(ActionType.INSER_CAMERA, props<{ camera: Camera }>());
export const action_insertCameraSuccess = createAction(ActionType.INSER_CAMERA_SUCCESS, props<{ camera: Camera }>());

export const action_delCamera = createAction(ActionType.DELETE_CAMERA, props<{ cameraId: string }>());
export const action_delCameraSuccess = createAction(ActionType.DELETE_CAMERA_SUCCESS, props<{ cameraId: string }>());

export const action_updateCamera = createAction(ActionType.UPDATE_CAMERA, props<{ data: Camera, id: string }>());
export const action_updateCameraSuccess = createAction(ActionType.UPDATE_CAMERA_SUCCESS, props<{ id: string, changes: Camera }>());

export const action_delCameraImage = createAction(ActionType.DELETE_CAMERA_IMAGE,props<{id:string}>());
export const action_delCameraImageSuccess = createAction(ActionType.DELETE_CAMERA_IMAGE_SUCCESS,props<{id:string}>());
export const action_showCameraImage = createAction(ActionType.SHOW_CAMERA_IMAGE,props<{cameraId:string,index:number}>());
// export const action_updateCameraLocationSuccess = createAction(ActionType.UPDATE_CAMERA_SUCCESS,props<{x:number,y:number}>());
export const action_searchCamera = createAction(ActionType.SEARCH_CAMERA,props<{keyword:string}>());
export const action_searchCameraSuccess = createAction(ActionType.SEARCH_CAMERA_SUCCESS,props<{cameras:Camera[]}>());
export const action_selectedSearchCamera = createAction(ActionType.SELECTED_SEARCH_CAMERA,props<{camera:Camera}>());

export const aciton_mapLevel = createAction(ActionType.MAP_LEVEL,props<{level:number}>());



