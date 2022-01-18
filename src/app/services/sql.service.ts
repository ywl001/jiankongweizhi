import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Extent, TableName, User } from '../app-state/types';
import { tap } from 'rxjs';
import { LocalStorgeService } from './local-storge.service';
import * as toastr from 'toastr';

const PHP_SQL_URL = '/monitorBaidu/sql.php'

@Injectable({
  providedIn: 'root'
})
export class SqlService {

  ACTION_SELECT = 'select';
  private ACTION_INSERT = 'insert';
  private ACTION_DELETE = 'delete';
  private ACTION_UPDATE = 'update';


  constructor(private http: HttpClient,private localStorage:LocalStorgeService) { }

  /**
   * 获取当前范围内的监控
   * @param xmin 
   * @param xmax 
   * @param ymin 
   * @param ymax 
   * @param mapLevel 
   */
  getCamerasByExtent(extent:Extent) {
    const sql = `select m.*,u.realName insertUser from monitor m 
                left join user u on m.userID = u.id 
                where m.x > ${extent.xmin} 
                and m.y > ${extent.ymin} 
                and m.x < ${extent.xmax} 
                and m.y < ${extent.ymax} 
                and m.displayLevel <= ${extent.mapLevel}`;
    return this.execSql(sql, this.ACTION_SELECT);
  }

  getMarkImages(markID) {
    const sql = `select * from ${TableName.monitorImage} where monitorID = ${markID}`;
    return this.execSql(sql, this.ACTION_SELECT);
  }

  getImage(id) {
    const sql = `select * from ${TableName.monitorImage} where id = ${id}`;
    console.log(sql)
    return this.execSql(sql, this.ACTION_SELECT);
  }

  searchCamera(keyword) {
    let sql = `select * from monitor where monitorID like '%${keyword}%' or name like '%${keyword}%' or owner like '%${keyword}%'`;
    console.log(sql)
    return this.execSql(sql, this.ACTION_SELECT);
  }

  login(user:User){
    const sql  = `select * from ${TableName.user} where userName = '${user.userName}' and password = '${user.password}'`;
    return this.execSql(sql, this.ACTION_SELECT)
  }

  getUserByUsername(user:User){
    const sql = `select * from user where userName = '${user.userName}'`;
    return this.execSql(sql, this.ACTION_SELECT).pipe(
      tap(res=>{
        if(res.length > 0) {
            toastr.warning('用户名已经存在')
        }})
    );
  }

  insert(tableName, data) {
    let sql: string = `insert into ${tableName} (`;

    Object.keys(data).forEach(key => {
      sql += key + ",";
    })

    sql = sql.substring(0, sql.length - 1) + ") values (";

    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value == "now()")//php now（）函数，不能带引号
        sql += value + ",";
      else
        sql += "'" + value + "',";
    })

    sql = sql.substring(0, sql.length - 1) + ")";
    // console.log(sql);
    return this.execSql(sql, this.ACTION_INSERT);
  }

  update(tableName, data, id) {
    let sql = "update " + tableName + " set ";

    Object.keys(data).forEach(key => {
      const value = data[key];
      sql += (key + "='" + value + "',");
    })
    sql = sql.substring(0, sql.length - 1) + " where id =" + id;
    console.log(sql);
    return this.execSql(sql, this.ACTION_UPDATE);
  }

  delete(tableName,id){
    let sql =  `delete from ${tableName} where id = ${id}`;
    console.log(sql)
    return this.execSql(sql,this.ACTION_DELETE);
  }

  public execSql(sql: string, action: string) {
    return this.http.post<any>(PHP_SQL_URL, { 'sql': sql, 'action': action });
  }
}
