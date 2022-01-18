import { createFeatureSelector, createSelector } from "@ngrx/store";
import { cameraAdapter, CamerasState } from "./app-reducer";
import { AppState } from "./types";


export const selector_appState = createFeatureSelector<AppState>('appState');

export const selectCamerasState = createFeatureSelector<CamerasState>('cameras');

export const selector_user = createSelector(
    selector_appState,
    state => state.user
)
export const selector_isVecMap = createSelector(
    selector_appState,
    state => state.isVecMap
)

export const selector_showCameraImage = createSelector(
    selector_appState,
    state => state.showCameraImage
)

export const selector_cameras = createSelector(
    selectCamerasState,
    cameraAdapter.getSelectors().selectAll
)

export const selector_cameraEntities = createSelector(
    selectCamerasState,
    cameraAdapter.getSelectors().selectEntities
)

export const selector_selectedId = createSelector(
    selectCamerasState,
    state=>state.selectedId
)

export const selector_delId = createSelector(
    selectCamerasState,
    state=>state.delId
)

export const selector_updateId = createSelector(
    selectCamerasState,
    state=>state.updateId
)

export const selector_updateCamera = createSelector(
    selector_cameraEntities,
    selector_updateId,
    (entities,id)=> id && entities[id]
)

export const selector_currentCamera = createSelector(
    selector_cameraEntities,
    selector_selectedId,
    (entities,id)=> id && entities[id]
)

export const selector_cameraImages = createSelector(
    selector_appState,
    state=>state.cameraImages
)

export const selector_imageIndex = createSelector(
    selector_appState,
    state=>state.imageIndex
)

export const selector_searchCameras = createSelector(
    selector_appState,
    state=>state.searchCameras
)

export const selector_selectedSearchCamera = createSelector(
    selector_appState,
    state=>state.selectedSearchCamera
)

export const selector_mapLevel = createSelector(
    selector_appState,
    state=>state.mapLevel
)




