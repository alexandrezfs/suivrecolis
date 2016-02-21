angular.module('trackControllers')
    .controller('postOfficeLocationController', ['$scope', '$http', '$window', 'localStorageService', '$document', 'CarrierService', 'MarkerService', 'ExtraApi', '$timeout',
        function ($scope, $http, $window, localStorageService, $document, CarrierService, MarkerService, ExtraApi, $timeout) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            $scope.map = {center: {latitude: 46.71109, longitude: 1.7191036}, zoom: 6, bounds: {}};
            $scope.options = {scrollwheel: true};

            //getting locations
            ExtraApi.getPostsLocations(function (locations) {
                var markers = MarkerService.getMarkersFromLocations(locations);
                $scope.markers = markers;
                $scope.locations = locations;
            });

            CarrierService.query(function (carriers) {
                $scope.carriers = carriers;
                $("#selectLocationCarrier").select2({placeholder: "Choisir un transporteur"});
            });

            $scope.searchLocation = function (searchForm) {

                if (!searchForm) {
                    swal("Erreur", "Veuillez remplir le formulaire.", "error");
                }
                else if (!searchForm.text && searchForm.selectedCarrier) {

                    //filter markers
                    ExtraApi.getPostsLocationsByCarrier(searchForm.selectedCarrier.uuid, function (locations) {
                        var markers = MarkerService.getMarkersFromLocations(locations);
                        $scope.markers = markers;
                        $scope.locations = locations;
                    });

                }
                else if (searchForm.text && searchForm.text.length > 0) {

                    //getting all markers that match with this text
                    ExtraApi.getPostsLocationsByText(searchForm.text, function (response) {

                        var locations = response.data;

                        var markers = MarkerService.getMarkersFromLocations(locations);
                        $scope.markers = markers;
                        $scope.locations = locations;
                    });

                }

            };

        }]
);
