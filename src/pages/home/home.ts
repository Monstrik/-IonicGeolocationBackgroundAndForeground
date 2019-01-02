import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LocationTrackerProvider } from "../../providers/location-tracker/location-tracker";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public locationTrackerProvider: LocationTrackerProvider) {

  }

  start() {
    this.locationTrackerProvider.startTracking();
  }

  stop() {
    this.locationTrackerProvider.stopTracking();
  }

  clear() {
    this.locationTrackerProvider.clearLogs();
  }

}
