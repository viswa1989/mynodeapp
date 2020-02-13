var demoModule = angular.module('geomapLocation', []);

demoModule.directive('mygeoMap', function () {
    return {
        restrict: 'EA',
        require: '?ngModel',
        scope: {
            myModel: '=ngModel',
            locate: '='
        },
        link: function (scope, element, attrs, ngModel) {

            var mapOptions;
            var googleMap;
            var searchMarker;
            var searchLatLng;

            ngModel.$render = function () {
                searchLatLng = new google.maps.LatLng(scope.myModel.latitude, scope.myModel.longitude);

                mapOptions = {
                    center: searchLatLng,
                    zoom: 12,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                googleMap = new google.maps.Map(element[0], mapOptions);

                searchMarker = new google.maps.Marker({
                    position: searchLatLng,
                    map: googleMap,
                    draggable: true
                });

                google.maps.event.addListener(searchMarker, 'dragend', function () {
                    scope.$apply(function () {
                        scope.myModel.latitude = searchMarker.getPosition().lat();
                        scope.myModel.longitude = searchMarker.getPosition().lng();
                    });
                }.bind(this));

            };

            scope.$watch('myModel', function (value) {
                var myPosition = new google.maps.LatLng(scope.myModel.latitude, scope.myModel.longitude);

                var lat = scope.myModel.latitude;
                var long = scope.myModel.longitude;
                var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + long + "&sensor=false";
                $.get(url).success(function (data) {
                    var loc1 = data.results[0];
                    var locationbase = scope.locate.division_address;
                    $.each(loc1, function (k1, v1) {
                        if (k1 === "address_components") {
                            for (var i = 0; i < v1.length; i++) {
                                for (k2 in v1[i]) {
                                    if (k2 === "types") {
                                        var types = v1[i][k2];

                                        if (types[0] === "sublocality_level_1" && types[1] === "sublocality" && types[2] === "political") {
                                            var street = v1[i].long_name;
                                            scope.$apply(function () {
                                                scope.myModel.street = street;
                                                locationbase.address = street;
                                            });
                                        }

                                        if (types[0] === "locality" && types[1] === "political") {
                                            var city = v1[i].long_name;
                                            scope.$apply(function () {
                                                scope.myModel.city = city;
                                                locationbase.city = city;
                                            });
                                        }

                                        if (types[0] === "administrative_area_level_1" && types[1] === "political") {
                                            var state = v1[i].long_name;
                                            scope.$apply(function () {
                                                scope.myModel.state = state;
                                                locationbase.state = state;
                                            });
                                        }

                                        if (types[0] === "postal_code") {
                                            var postal_code = v1[i].long_name;
                                            scope.$apply(function () {
                                                scope.myModel.postal_code = postal_code;
                                                locationbase.pin_code = postal_code;
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    });
                    /// End of Address_components	 
                });
                searchMarker.setPosition(myPosition);
            }, true);
        }
    };
});

