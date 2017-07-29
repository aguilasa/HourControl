import { Component } from '@angular/core';
import { NavController, ItemSliding } from 'ionic-angular';

import { DatabaseProvider } from '../../providers/database/database';
import { MarkModel } from '../../models/mark/mark';

const totalHoursOfWork: number = 30600;
const oneHour: number = 3600;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public doneText: string = 'Ok';
  public cancelText: string = 'Cancelar';
  public actualHour: string = '';
  public marks: Array<MarkModel> = [];
  public displayTime: string = '00:00';
  public option: string = 'remaining';
  public segments: Array<any> = [
    { value: "remaining", text: "Restantes" },
    { value: "worked", text: "Trabalhadas" },
    { value: "exit", text: "Saída" }
  ];

  constructor(public navCtrl: NavController, private database: DatabaseProvider) {
    this.refresh();
  }

  ionViewDidLoad() {
    this.database.getTodayMarks().then((data) => {
      this.marks = data;
      this.timerTick();
    });
  }

  timerTick() {
    setTimeout(() => {
      this.displayTime = this.calcTime();
      this.timerTick();
    }, 1000);
  }

  private calcTime() {
    if (this.option === 'remaining') {
      return this.remaining();
    } else if (this.option === 'worked') {
      return this.worked();
    } if (this.option === 'exit') {
      return this.exit();
    }
    return '00:00';
  }

  changeOption() {
    console.log(this.option);
  }

  refresh() {
    this.actualHour = this.getHour();
  }

  add() {
    this.database.addTodayMark(this.actualHour).then((mark) => {
      if (mark !== null) {
        this.marks.push(mark);
      }
    })
  }

  updateMark(mark: MarkModel) {
    this.database.updateMark(mark.id, mark.markDay, mark.markHour);
  }

  del(mark: MarkModel) {
    this.database.deleteMark(mark.id).then(() => {
      this.database.getTodayMarks().then((data) => {
        this.marks = data;
      });
    });
  }

  private getHour() {
    let d = new Date();

    var hours = d.getHours();
    var minutes = d.getMinutes();
    var hoursString = '';
    var minutesString = '';
    hoursString = (hours < 10) ? "0" + hours : hours.toString();
    minutesString = (minutes < 10) ? "0" + minutes : minutes.toString();
    return hoursString + ':' + minutesString;
  }

  remaining() {
    return '00:00';
  }

  worked() {
    return '00:00';
  }

  exit() {
    let seconds = this.secondsMarks();

    if (seconds.length == 0) {
      seconds.push(this.hourStringToSeconds(this.actualHourString()));
    }

    if (seconds.length == 1) {
      return this.secondsToHourString(seconds[0] + totalHoursOfWork + oneHour);
    } else {
      return this.actualHourString();
    }
  }

  private secondsMarks() {
    let value: Array<number> = [];
    for (let m of this.marks) {
      let seconds = this.hourStringToSeconds(m.markHour);
      console.log(m.markHour + ' = ' + seconds);
      value.push(seconds);
    }
    return value;
  }

  private actualHourString() {
    let today: Date = new Date();
    let hour = today.getHours();
    let minute = today.getMinutes();

    let hourString = (hour < 10) ? "0" + hour : hour.toString();
    let minuteString = (minute < 10) ? "0" + minute : minute.toString();
    return hourString + ":" + minuteString;
  }

  private hourStringToSeconds(value: string) {
    let array = value.split(':');
    return parseInt(array[0]) * oneHour + parseInt(array[1]) * 60;
  }

  private secondsToHourString(value: number) {
    var sec_num = parseInt(value.toString(), 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    var hoursString = '';
    var minutesString = '';
    hoursString = (hours < 10) ? "0" + hours : hours.toString();
    minutesString = (minutes < 10) ? "0" + minutes : minutes.toString();
    return hoursString + ':' + minutesString;
  }

}
