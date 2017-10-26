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
            var inputText = self.inputText().toLowerCase();
            var title;

            closeInfoWindowAndStopAnimation();

            for (var i = 0; i < self.locations().length; i++) {
                title = self.locations()[i].title();
                if (inputText === '' || title.toLowerCase().indexOf(inputText) !== -1) {
                    self.locations()[i].visible(true);
                    markers[i].setVisible(true);
                } else {
                    self.locations()[i].visible(false);
                    markers[i].setVisible(false);
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