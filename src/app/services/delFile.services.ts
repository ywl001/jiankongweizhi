import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

const PHP_URL = '/monitorBaidu/delFile.php'
@Injectable({
    providedIn: 'root'
})
export class DelFileService {
    constructor(private http: HttpClient,) { }

    delFiles(paths:string[]){
        return this.http.post<any>(PHP_URL, { 'files':paths });
    }
}