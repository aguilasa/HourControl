import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SQLite, SQLiteDatabaseConfig, SQLiteObject } from '@ionic-native/sqlite';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ScriptProvider } from '../script/script';
import { MarkModel } from '../../models/mark/mark';

declare var SQL;

class MSQLiteObject {
  _objectInstance: any;

  constructor(_objectInstance: any) {
    this._objectInstance = _objectInstance;
  };

  executeSql(statement: string, params: any): Promise<any> {

    return new Promise((resolve, reject) => {
      try {
        var st = this._objectInstance.prepare(statement, params);
        var rows: Array<any> = [];
        while (st.step()) {
          var row = st.getAsObject();
          rows.push(row);
        }
        var payload = {
          rows: {
            item: function (i) {
              return rows[i];
            },
            length: rows.length
          },
          rowsAffected: this._objectInstance.getRowsModified() || 0,
          insertId: this._objectInstance.insertId || void 0
        };

        //save database after each sql query 

        var arr: ArrayBuffer = this._objectInstance.export();
        localStorage.setItem("database", String(arr));
        resolve(payload);
      } catch (e) {
        reject(e);
      }
    });
  };

}


export class SQLiteMock {
  public create(config: SQLiteDatabaseConfig): Promise<any> {

    if (document.URL.includes('https://') || document.URL.includes('http://')) {
      var db;
      var storeddb = localStorage.getItem("database");

      if (storeddb) {
        var arr = storeddb.split(',');
        db = new SQL.Database(arr);
      }
      else {
        db = new SQL.Database();
      }

      return new Promise((resolve, reject) => {
        resolve(new MSQLiteObject(db));
      });
    } else {
      return new Promise((resolve, reject) => {
        resolve(new SQLiteObject(new Object()));
      });
    }
  }
}

@Injectable()
export class DatabaseProvider {

  private database: any;
  private dbReady = new BehaviorSubject<boolean>(false);

  constructor(private platform: Platform, private sqlite: SQLite, private scripts: ScriptProvider) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'data.db',
        location: 'default'
      })
        .then((db: any) => {
          this.database = db;
          this.createTables().then(() => {
            this.dbReady.next(true);
          });
        })

    });
  }

  private promiseSerial(scripts: Array<any>) {
    let funcs: Array<any> = [];

    for (let cmd of scripts) {
      funcs.push(this.database.executeSql(cmd, {}));
    }

    return Promise.all(funcs);
  }

  private createTables() {
    return this.promiseSerial(this.scripts.createScripts());
  }

  private isReady() {
    return new Promise((resolve, reject) => {
      if (this.dbReady.getValue()) {
        resolve();
      }
      else {
        this.dbReady.subscribe((ready) => {
          if (ready) {
            resolve();
          }
        });
      }
    })
  }

  isFirstTime() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * FROM mark`, [])
          .then((data) => {
            return data.rows.length === 0;
          })
      })
  }

  getMarks() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * FROM mark`, [])
          .then((data) => {
            let marks: Array<MarkModel> = [];
            for (let i = 0; i < data.rows.length; i++) {
              marks.push(MarkModel.fromJson(data.rows.item(i)));
            }
            return marks;
          })
      })
  }

  getTodayMarks() {
    return this.isReady()
      .then(() => {
        let markDay:string = this.getTodayString();
        return this.database.executeSql(`SELECT * FROM mark WHERE markDay = '${markDay}'`, [])
          .then((data) => {
            let marks: Array<MarkModel> = [];
            for (let i = 0; i < data.rows.length; i++) {
              marks.push(MarkModel.fromJson(data.rows.item(i)));
            }
            return marks;
          })
      })
  }

  addMark(markDay: string, markHour: string) {
    return this.isReady()
      .then(() => {
        return this.existsMark(markDay, markHour).then((exists) => {
          if (!exists) {
            return this.database.executeSql(`INSERT INTO mark(markDay, markHour) VALUES ('${markDay}', '${markHour}');`, {}).then((result) => {
              if (result.insertId) {
                return this.getMarkById(result.insertId);
              } else {
                return this.getMark(markDay, markHour);
              }
            })
          }
          return null;
        })
      });
  }

  addTodayMark(markHour: string) {
    let markDay = this.getTodayString();
    return this.addMark(markDay, markHour);
  }

  private existsMark(markDay: string, markHour: string) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * FROM mark WHERE markDay = '${markDay}' AND markHour = '${markHour}'`, [])
          .then((data) => {
            return data.rows.length > 0;
          })
      });
  }

  private getTodayString() {
    let today: Date = new Date();
    let day = today.getDate();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    let dayString = (day < 10) ? "0" + day : day.toString();
    let monthString = (month < 10) ? "0" + month : month.toString();
    return dayString + "-" + monthString + "-" + year;
  }

  getMarkById(id: number) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * FROM mark WHERE id = ${id}`, [])
          .then((data) => {
            if (data.rows.length) {
              return MarkModel.fromJson(data.rows.item(0));
            }
            return null;
          })
      })
  }

  getMark(markDay: string, markHour: string) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * FROM mark WHERE markDay = '${markDay}' AND markHour = '${markHour}'`, [])
          .then((data) => {
            if (data.rows.length) {
              return MarkModel.fromJson(data.rows.item(0));
            }
            return null;
          })
      })
  }

  updateMark(id:number, markDay: string, markHour: string) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`UPDATE mark SET markDay = '${markDay}', markHour = '${markHour}' WHERE id = ${id}`, []);
      })
  }

  deleteMark(id: number) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`DELETE FROM mark WHERE id = ${id}`, [])
      })
  }
}
