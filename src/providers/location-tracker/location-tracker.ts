import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import 'rxjs/add/operator/filter';
import { Platform } from "ionic-angular";

@Injectable()
export class LocationTrackerProvider {

  public history: Array<{ time: string, lat: number, lng: number, source: string }>;
  public logs: Array<string>;
  public watch: any;
  public lat: number = 0;
  public lng: number = 0;

  constructor(public zone: NgZone,
              public platform: Platform,
              public geolocation: Geolocation,
              public backgroundGeolocation: BackgroundGeolocation
  ) {
    this.history = [];
    this.logs = [];
  }

  getTimeString() {
    var currentdate = new Date();
    return currentdate.getDate() + "/"
      + (currentdate.getMonth() + 1) + "/"
      + currentdate.getFullYear() + " | "
      + currentdate.getHours() + ":"
      + currentdate.getMinutes() + ":"
      + currentdate.getSeconds();

  }

  startTracking() {

    // Background Tracking
    if (this.platform.is('cordova')) {
      let config = {
        desiredAccuracy: 0,
        stationaryRadius: 10,
        distanceFilter: 10,
        debug: true,
        interval: 1000
      };
      this.backgroundGeolocation.configure(config)
        .subscribe(
          (location) => {
            console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
            // Run update inside of Angular's zone
            this.zone.run(() => {
              this.lat = location.latitude;
              this.lng = location.longitude;
              this.history.push({
                time: this.getTimeString(),
                lat: location.latitude,
                lng: location.longitude,
                source: 'BackgroundGeolocation'
              })
            });
          },
          (err) => {
            this.logs.push(err.toString());
            console.log(err);
          }
        );
      // Turn ON the background-geolocation system.
      this.logs.push('backgroundGeolocation.start()');
      this.backgroundGeolocation.start()
        .then((i => {
          this.logs.push('backgroundGeolocation.started');
          console.log('backgroundGeolocation.started', i)
        }));
    }

    // Foreground Tracking

    let options = {
      frequency: 3000,
      enableHighAccuracy: true
    };
    this.logs.push('geolocation.watchPosition');
    this.watch = this.geolocation.watchPosition(options)
      .filter((p: any) => p.code === undefined)
      .subscribe((position: Geoposition) => {
        console.log(position);
        // Run update inside of Angular's zone
        this.zone.run(() => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          this.history.push({
            time: this.getTimeString(),
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            source: 'Geoposition'
          })
        });
      });

  }

  stopTracking() {
    console.log('stopTracking');

    this.logs.push('stopTracking invoked');
    if (this.platform.is('cordova')) {
      this.logs.push('backgroundGeolocation.finish()');
      this.backgroundGeolocation.finish()
        .then((i => {
          this.logs.push('backgroundGeolocation.finished');
          console.log('backgroundGeolocation.finish()', i)
        }));
    }
    this.watch.unsubscribe();
    this.logs.push('watch.unsubscribe');
  }

  clearLogs() {
    this.history = [];
    this.logs = [];
  }
}
