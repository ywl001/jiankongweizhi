export interface User {
    id?:string
    userName: string;
    password: string;
    unit?: string;
    realName?: string;
    userType?: string;
}

export interface Extent {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    mapLevel: number;
}

export interface AppState {
    user?: User;
    isVecMap: boolean;
    cameraImages?: CameraImage[];
    imageIndex?:number;
    showCameraImage?:any;
    searchCameras:Camera[];
    selectedSearchCamera?:Camera;
    mapLevel?:number;
}

export interface Camera {
    id?:string
    monitorID?: string;
    name?: string;
    type?: string;
    y?: number;
    x?: number;
    owner?: string;
    angle?: number;
    userID?: string;
    displayLevel?: number;
    telephone?: string;
    isRunning?: boolean;
}

export interface CameraImage {
    id?:string
    monitorID: string;
    imageUrl: string;
    thumbUrl: string;
    insertUser: string;
}

export enum TableName {
    monitor = "monitor",
    monitorImage = 'monitor_image',
    user = 'user'
}

export const CAMERA_TYPES = [
    {name:"枪机",src:"qiangji"},
    {name:"球机",src:"qiuji"},
    {name:"电警",src:"dianjing"},
    {name:"卡口",src:"kakou"},
    {name:"社会监控",src:"shehui"},
    {name:"高空瞭望",src:"gaokong"},
    {name:"全景",src:"quanjing"}
]