class LineSegment {
    constructor(map, targetDistance = 50000) {
        this._map = map;
        this._targetDistance = 50000;
    }

    get start() {
        return this._start;
    }

    get startAsTurf() {
        let marker = this.leafletToTurf(this._start);
        return [marker.lng, marker.lat];
    }

    set start(newStart) {
        this._start = newStart;
    }

    get lookAt() {
        return this._lookAt;
    }

    get lookAtAsTurf() {
        let marker = leafletToTurf(this._lookAt);
        return [marker.lng, marker.lat];
    }

    set lookAt(newLookAt) {
        this._lookAt = newLookAt;
    }

    get target() {
        return this._target;
    }

    get targetDistance() {
        return this._targetDistance;
    }

    set targetDistance(distance) {
        this._targetDistance = distance;
    }

    get lookAtDistance() {
        return turf.distance(this.startAsTurf, this.lookAtAsTurf);
    }

    getBearing() {
        return turf.bearing(this.startAsTurf, this.lookAtAsTurf);
    }

    getHeading() {
        return (360 + this.getBearing()) % 360;
    }

    getLookAtVector() {
        return [this._start.getLatLng(), this._lookAt.getLatLng()];
    }

    getTargetVector() {
        return [this._lookAt.getLatLng(), this._target.getLatLng()];
    }

    updateTarget() {
        var destination = turf.destination(this.startAsTurf, this._targetDistance, this.getBearing(), "meters");
        this._target.setLatLng([destination.geometry.coordinates[1], destination.geometry.coordinates[0]]);
    }

    leafletToTurf(marker) {
        return [marker.getLatLng().lng, marker.getLatLng().lat];
    }

}

class Map {

}

var measure = {
    markers: {
        start: null,
        lookAt: null,
        target: null
    },

    markerGroup: null,

    getHeading: function () {
        return (360 + this.getBearing()) % 360;
    },

    getBearing: function () {
        return turf.bearing(this.leafletToTurf(this.markers.start.getLatLng()), this.leafletToTurf(this.markers.lookAt.getLatLng()));
    },

    getlookAtDistance() {
        return turf.distance(this.leafletToTurf(this.markers.start.getLatLng()), this.leafletToTurf(this.markers.lookAt.getLatLng()), "meters");
    },

    updateTarget: function () {
        var destination = turf.destination(this.leafletToTurf(this.markers.start.getLatLng()), 50, this.getBearing(), "kilometers");
        this.markers.target.setLatLng([destination.geometry.coordinates[1], destination.geometry.coordinates[0]]);
    },

    getLookAtVector: function () {
        return [this.markers.start.getLatLng(), this.markers.lookAt.getLatLng()];
    },

    getTargetVector: function () {
        return [this.markers.lookAt.getLatLng(), this.markers.target.getLatLng()];
    },

    leafletToTurf: function (latLng) {
        return [latLng.lng, latLng.lat];
    }
};

function update(sender) {
    return function (e) {
        measure.updateTarget();
        lookAtLine.setLatLngs(measure.getLookAtVector());
        targetLine.setLatLngs(measure.getTargetVector());
        measure.markers.start.setTooltipContent(Math.round(measure.getHeading()).toString() + "°");
        measure.markers.lookAt.setTooltipContent(Math.round(measure.getlookAtDistance()).toString() + " m");
        myCustomControl.setContent(Math.round(measure.getlookAtDistance()).toString() + " m");

    }
}

function onLocationFound(e) {
    console.log(e.latlng);
    measure.markers.start.setLatLng(e.latlng);
    measure.markers.lookAt.setLatLng([e.latlng.lat, e.latlng.lng + 0.01]);
    map.fitBounds(measure.markerGroup.getBounds(), {'padding' : [50, 50]});
    
    update(this)();

}

var map = L.map('map').setView([51, 6], 10);

L.control.locate({'flyTo': true}).addTo(map);

mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; ' + mapLink + ' Contributors',
        maxZoom: 18
    }).addTo(map);

let x = new LineSegment(map);

measure.markers.start = L.marker([0, 0], {
    "draggable": true,
    "title": "Start"
}).on("drag", update("start")).addTo(map);
measure.markers.start.bindTooltip("My Label", { permanent: true, className: "my-label", offset: [0, 0] });
x.start = measure.markers.start;

measure.markers.lookAt = L.marker([0, 0], {
    "draggable": true,
    "title": "LookAt"
}).on("drag", update("lookAt")).addTo(map);
measure.markers.lookAt.bindTooltip("Distance", { permanent: true, className: "my-label", offset: [0, 0] });

measure.markers.target = L.marker([52, 6], {
    "title": "Target"
}).addTo(map);
//measure.updateTarget();

x.start = measure.markers.start;
x.lookAt = measure.markers.lookAt;
x.target = measure.markers.target;

var lookAtLine = L.polyline(measure.getLookAtVector(), {
    color: 'red',
    weight: 3,
    opacity: 0.5,
    smoothFactor: 1
});
lookAtLine.addTo(map);

var targetLine = L.polyline(measure.getTargetVector(), {
    color: 'blue',
    weight: 3,
    opacity: 0.5,
    smoothFactor: 1
});
targetLine.addTo(map);

var MyCustomControl = L.Control.extend({
    options: {
        // Default control position
        position: 'bottomleft'
    },
    onAdd: function (map) {
        // Create a container with classname and return it
        return L.DomUtil.create('div', 'my-custom-control');
    },
    setContent: function (content) {
        // Set the innerHTML of the container
        this.getContainer().innerHTML = content;
    }
});

measure.markerGroup = new L.featureGroup([measure.markers.start, measure.markers.lookAt]);

// Assign to a variable so you can use it later and add it to your map
var myCustomControl = new MyCustomControl().addTo(map);
myCustomControl.setContent("Foo");
map.on('locationfound', onLocationFound);