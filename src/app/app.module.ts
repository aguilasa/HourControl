import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { SQLite } from '@ionic-native/sqlite';
import { DatabaseProvider, SQLiteMock } from '../providers/database/database';


import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ScriptProvider } from '../providers/script/script';

import { TimerComponent } from '../components/timer/timer';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TimerComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide:SQLite, useClass: SQLiteMock},
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatabaseProvider,
    ScriptProvider
  ]
})
export class AppModule {}
