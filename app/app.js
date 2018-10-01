var measure = {
    markers: {
        start: null,
        lookAt: null,
        target: null
    },

    getHeading: function() {
        return (360 + this.getBearing()) % 360;
    },

    getBearing: function() {
        return turf.bearing(this.leafletToTurf(this.markers.start.getLatLng()), this.leafletToTurf(this.markers.lookAt.getLatLng()));
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
        firstpolyline.setLatLngs(measure.getLookAtVector());
        secondpolyline.setLatLngs(measure.getTargetVector());
        measure.markers.start.setTooltipContent(Math.round(measure.getHeading()).toString() + "°");
        sector.setAngles(0, measure.getHeading());
        sector.setLatLng(measure.markers.start.getLatLng());

    }
}

var map = L.map('map').setView([51, 6], 10);
mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; ' + mapLink + ' Contributors',
        maxZoom: 18
    }).addTo(map);

measure.markers.start = L.marker([51.0053536788148, 5.9861111640930185], {
    "draggable": true,
    "title": "Start"
}).on("drag", update("start")).addTo(map);
measure.markers.start.bindTooltip("My Label", {permanent: true, className: "my-label", offset: [0, 0] });


measure.markers.lookAt = L.marker([51.0032506646835, 5.98658323287964], {
    "draggable": true,
    "title": "LookAt"
}).on("drag", update("lookAt")).addTo(map);

measure.markers.target = L.marker([52, 6], {
    "title": "Target"
}).addTo(map);
//measure.updateTarget();

var firstpolyline = L.polyline(measure.getLookAtVector(), {
    color: 'red',
    weight: 3,
    opacity: 0.5,
    smoothFactor: 1
});
firstpolyline.addTo(map);

var secondpolyline = L.polyline(measure.getTargetVector(), {
    color: 'blue',
    weight: 3,
    opacity: 0.5,
    smoothFactor: 1
});
secondpolyline.addTo(map);

var sector = L.circle(measure.markers.start.getLatLng(), {
	radius: 5000
});
sector.addTo(map);