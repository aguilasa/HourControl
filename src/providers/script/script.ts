import { Injectable } from '@angular/core';

@Injectable()
export class ScriptProvider {

  constructor() {

  }

  createScripts() {
    return [
      'CREATE TABLE IF NOT EXISTS mark ( id INTEGER PRIMARY KEY AUTOINCREMENT, markDay TEXT, markHour TEXT );'
    ];
  }

  deleteScripts() {
    return [
      'DELETE FROM mark;'
    ];
  }

  dropScripts() {
    return [
      'DROP TABLE IF EXISTS mark;'
    ];
  }

}
