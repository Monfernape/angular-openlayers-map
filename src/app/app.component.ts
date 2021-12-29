import { Component, OnInit, AfterViewInit } from "@angular/core";
import { interval } from "rxjs";
import { take } from "rxjs/operators";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import Overlay from "ol/Overlay";

class SocketService {
  getDriverLocation() {
    const index = Math.floor(Math.random() * 7);
    return interval(5000).pipe(take(index));
  }
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit, AfterViewInit {
  map: Map;
  socketService = new SocketService();
  userLocation = [];
  driverLocation = [];
  locations = [
    {
      latitude: 30.202618,
      longitude: 71.512263
    },
    {
      latitude: 30.20321685,
      longitude: 71.51480836074153
    },
    {
      latitude: 30.202188,
      longitude: 71.51458
    },
    {
      latitude: 30.2110949,
      longitude: 71.4748767
    },
    {
      latitude: 30.210342,
      longitude: 71.473231
    },
    {
      latitude: 30.210578,
      longitude: 71.471901
    },
    {
      latitude: 30.208478749999998,
      longitude: 71.50149569982526
    }
  ];

  ngOnInit() {
    // My Location
    // On my location change, update driver about the updated postion through signalR
    navigator.geolocation.watchPosition(
      ({ coords: { latitude, longitude } }) => {
        this.userLocation = [longitude, latitude];
        this.updateMapCoordinates();
      }
    );

    // Somewhere from socket
    this.socketService.getDriverLocation().subscribe((index) => {
      const { latitude, longitude } = this.locations[index];
      this.driverLocation = [longitude, latitude];
      this.updateMapCoordinates();
    });
  }

  ngAfterViewInit() {
    this.createMap();
  }

  createMap() {
    this.map = new Map({
      view: new View({
        center: fromLonLat([71.5031637, 30.1958097]),
        zoom: 13
      }),
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      target: "ol-map"
    });
  }

  updateMapCoordinates() {
    if (Boolean(this.map)) {
      const markers = [
        {
          type: "user",
          icon:
            "https://w7.pngwing.com/pngs/457/630/png-transparent-location-logo-location-computer-icons-symbol-location-miscellaneous-angle-heart.png",
          coordinates: this.userLocation
        },
        {
          type: "driver",
          icon:
            "https://w7.pngwing.com/pngs/24/15/png-transparent-car-scooter-motorcycle-helmets-computer-icons-motorcycle-scooter-logo-bicycle.png",
          coordinates: this.driverLocation
        }
      ];
      this.map.getOverlays().forEach((overlay) => {
        if (overlay.getId() === "user" || overlay.getId() === "driver") {
          this.map.removeOverlay(overlay);
        }
      });

      markers.forEach(({ icon, coordinates, type }) => {
        const element = document.createElement("div");
        element.innerHTML = `<img src="${icon}" width="40px" />`;
        const marker = new Overlay({
          position: fromLonLat(coordinates),
          positioning: "center-center",
          element,
          stopEvent: false,
          id: type
        });
        this.map.addOverlay(marker);
      });
    }
  }
}
