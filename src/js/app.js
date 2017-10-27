var map;
var geocoder;
var largeInfoWindow;
var selectedMarker;
var markers = [];
var initialLocations = [];

function initLocationsData() {
    var locationData = [
        ['Park Ave Penthouse', 40.7713024, -73.9632393, 'building'],
        ['Chelsea Apartments', 40.7444883, -73.9949465, 'building'],
        ['Union Square Open Floor Plan', 40.7347062, -73.9895759, 'building'],
        ['Momofuku Noodle Bar', 40.729246, -73.984444, 'food'],
        ['Gary Graham', 40.719562, -74.009226, 'shopping'],
        ['Deluxe Food Market', 40.718040, -73.996257, 'grocery']
    ];

    var locations;
    var storageData = window.localStorage.getItem('interestLocations');

    if (storageData === null) {
        locations = locationData;
        window.localStorage.setItem('interestLocations', JSON.stringify(locations));
    } else {
        locations = JSON.parse(storageData);
    }

    for (var i = 0; i < locations.length; i++) {
        var location = locations[i];
        initialLocations.push({
            title: location[0],
            location: {
                lat: location[1],
                lng: location[2]
            },
            type: location[3]
        });
    }
}

initLocationsData();

function initMap() {
    geocoder = new google.maps.Geocoder();

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7413549,
            lng: -73.9980244
        },
        zoom: 13,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        }
    });

    resizeMapHeight();

    window.onresize = function () {
        resizeMapHeight();

        if (map) {
            google.maps.event.trigger(map, 'resize');
            updateBounds();
        }
    }

    largeInfoWindow = new google.maps.InfoWindow();

    var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
    var icons = {
        building: {
            icon: iconBase + 'homegardenbusiness_maps.png'
        },
        food: {
            icon: iconBase + 'dining_maps.png'
        },
        grocery: {
            icon: iconBase + 'grocery_maps.png'
        },
        shopping: {
            icon: iconBase + 'shopping_maps.png'
        }
    };

    initialLocations.forEach(function (item, index) {
        var marker = new google.maps.Marker({
            position: item.location,
            title: item.title,
            animation: google.maps.Animation.DROP,
            icon: icons[item.type].icon,
        });

        markers.push(marker);

        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfoWindow);
        });
    });

    showMarkers(markers);

    function showMarkers(markers) {
        var bounds = new google.maps.LatLngBounds();
        var marker;

        for (var i = 0; i < markers.length; i++) {
            marker = markers[i];
            marker.setMap(map);
            bounds.extend(marker.position);
        }

        map.fitBounds(bounds);
    }

    function updateBounds() {
        var bounds = new google.maps.LatLngBounds();
        var marker;

        for (var i = 0; i < markers.length; i++) {
            marker = markers[i];
            // if (marker.getVisible()) {
            bounds.extend(marker.position);
            // }
        }

        map.fitBounds(bounds);
    }

    function resizeMapHeight() {
        var h = 0;
        var offset = 48;
        if (typeof (window.innerWidth) == 'number') {
            h = window.innerHeight;
        } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
            h = document.documentElement.clientHeight;
        } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
            h = document.body.clientHeight;
        }
        h -= offset;
        var m = document.getElementById('map');
        m.style.height = h + "px";
    }
}

function populateInfoWindow(marker, infoWindow) {
    if (infoWindow.marker != marker || !infoWindow.map) {
        infoWindow.marker = marker;
        infoWindow.setContent('<div id="infowindow-title">' + marker.title + '</div>' +
            '<div id="address"></div>' +
            '<div id="photo-pane"></div>');
        getAddress(marker);
        getFlickrPhoto(marker);
        infoWindow.open(map, marker);
        animateMarker(marker);
    }

    function getAddress(marker) {
        geocoder.geocode({
                location: marker.getPosition()
            },
            function (result, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (infoWindow.marker == marker) {
                        document.getElementById('address').innerHTML = result[0].formatted_address;
                    }
                } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                    window.alert('Could Not Find The Location');
                } else {
                    window.alert('Google Map Geocoder Failed');
                }
            });
    }

    function getFlickrPhoto(marker) {
        var flickrAPIUrl =
            'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=22caee340c6b324e3ca01e22c4a425ae&format=json&nojsoncallback=1&' +
            $.param({
                text: marker.title,
                lat: marker.getPosition().lat(),
                lon: marker.getPosition().lng()
            });

        $.getJSON(flickrAPIUrl, function (data) {
                if (data.stat === 'ok') {
                    if (infoWindow.marker != marker) {
                        return;
                    }

                    if (data.photos.photo.length > 0) {
                        var photoData = data.photos.photo[0];
                        var photoUrl = 'https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg';
                        photoUrl = photoUrl.replace('{farm-id}', photoData.farm)
                            .replace('{server-id}', photoData.server)
                            .replace('{id}', photoData.id)
                            .replace('{secret}', photoData.secret);
                        document.getElementById('photo-pane').innerHTML = '<div> Photo From Flickr </div>' +
                            '<img id="photo" src="' + photoUrl + '">';
                    } else {
                        document.getElementById('photo-pane').innerHTML = '<div> No Photo For This Location </div>';
                    }
                } else {
                    window.alert('Photo From Flickr Could Not Be Loaded');
                }
            })
            .fail(function (e) {
                window.alert('Get Photo From Flickr Failed');
            });
    }

    function animateMarker(marker) {

        if (selectedMarker && selectedMarker != marker && selectedMarker.getAnimation() !== null) {
            selectedMarker.setAnimation(null);
        }

        selectedMarker = marker;
        selectedMarker.setAnimation(google.maps.Animation.BOUNCE);

        map.panTo(marker.getPosition());
    }
}

function closeInfoWindowAndStopAnimation() {

    if (largeInfoWindow) {
        largeInfoWindow.close();
    }

    if (selectedMarker && selectedMarker.getAnimation() !== null) {
        selectedMarker.setAnimation(null);
    }
}

function mapErrorHandler() {
    window.alert('Load Google Map APIs Failed');
}

(function (window) {

    var Location = function (location) {
        var self = this;
        self.location = location;

        self.title = ko.observable(location.title);
        self.visible = ko.observable(true);
    };

    var AppViewModel = function () {
        var self = this;

        self.menuToggle = ko.observable(false);

        self.inputText = ko.observable('');

        self.locations = ko.observableArray();

        initialLocations.forEach(function (location) {
            self.locations.push(new Location(location));
        });

        self.onSelectLocation = function (location) {
            var index = self.locations.indexOf(location);

            if (index != -1 && largeInfoWindow) {
                populateInfoWindow(markers[index], largeInfoWindow);
            }
        }

        self.onFilterLocations = function () {

            closeInfoWindowAndStopAnimation();

            var inputText = self.inputText().toLowerCase();
            var title;
            var isShow;

            for (var i = 0; i < self.locations().length; i++) {
                title = self.locations()[i].title();
                isShow = inputText === '' || title.toLowerCase().indexOf(inputText) !== -1;

                self.locations()[i].visible(isShow);

                if (markers[i]) {
                    markers[i].setVisible(isShow);
                }
            }
        }

        self.onSwitchMenu = function () {
            self.menuToggle(!self.menuToggle());
        }

        self.onEnterKeyPress = function (data, event) {
            if (event.which == 13) {
                self.onFilterLocations();
                return false;
            }

            return true;
        }
    };

    ko.applyBindings(new AppViewModel());
}(window));