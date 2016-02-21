angular.module('trackControllers')
    .controller('locationDetailsController', ['$scope', '$http', '$window', 'localStorageService', '$document', '$routeParams', '$location', 'ExtraApi', '$timeout',
        function ($scope, $http, $window, localStorageService, $document, $routeParams, $location, ExtraApi, $timeout) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            var location_id = $routeParams.location_id;

            ExtraApi.getLocationById(location_id, function (location) {

                if (!location) {
                    $location.path("/home");
                }
                else {
                    $scope.location = location;

                    $scope.map = {center: {latitude: $scope.location.latitude, longitude: $scope.location.longitude}, zoom: 6, bounds: {}};
                    $scope.options = {scrollwheel: true};

                    $scope.marker = {};
                    
                    $scope.marker.coords = {
                        longitude: $scope.location.longitude,
                        latitude: $scope.location.latitude
                    };
                    $scope.marker.options = {draggable: true};
                    $scope.marker.id = 0;
                }
            });

        }]
);