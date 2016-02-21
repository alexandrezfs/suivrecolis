angular.module('trackControllers')
    .controller('parcelTrackingController', ['$scope', '$http', '$routeParams', '$document', '$window', 'localStorageService', 'StepManagerService', 'ParcelService', '$location', 'MarkerService', '$timeout', 'ExtraApi', 'StarCounter',
        function ($scope, $http, $routeParams, $document, $window, localStorageService, StepManagerService, ParcelService, $location, MarkerService, $timeout, ExtraApi, StarCounter) {

            $timeout(function () {
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            $scope.showTimeline = true;
            $scope.tableTextBtn = 'Montrer le tableau';

            $scope.toggleTimeline = function () {

                if ($scope.showTimeline) {
                    $scope.showTimeline = false;
                    $scope.tableTextBtn = 'Montrer la timeline';
                }
                else {
                    $scope.showTimeline = true;
                    $scope.tableTextBtn = 'Montrer le tableau';
                }
            };

            var fail = function () {
                $timeout.cancel(promise);
                swal("Erreur", "Ce colis n'est pas disponible au suivi pour le moment. Veuillez vous inscrire et l'enregistrer, ainsi nous vous avertirons lorsqu'il sera disponible.", "error");
                $location.path("/home");
            };

            var timeout = 40000; //We won't wait more than 40 seconds
            var promise = $timeout(function () {
                fail();
            }, timeout);

            if (!$routeParams.carrier_uuid || !$routeParams.code_tracking) {
                $location.path('/home');
            }
            else {

                //MAP
                $scope.map = {center: {latitude: -28.4792625, longitude: 24.6727135}, zoom: 5, bounds: {}};
                $scope.options = {scrollwheel: true};

                $scope.code_tracking = $routeParams.code_tracking;

                $scope.toggleNotification = function (parcel) {

                    //This parcel is not mine ...
                    if (!parcel._id) {
                        $location.path("/addNewParcel").search({
                            carrier_uuid: $routeParams.carrier_uuid,
                            code_tracking: $routeParams.code_tracking
                        });
                        swal("Erreur", "Merci de vous enregistrer pour être notifié.", "error");
                    }
                    //This parcel is mine ! Let's update it
                    else {

                        ExtraApi.updateParcel(parcel._id, parcel, function (response) {
                            console.log("updated parcel : " + response);
                        });

                    }
                };

                if ($scope.userSession) {

                    ExtraApi.getParcelByUserCodeCarrier($routeParams.code_tracking, $routeParams.carrier_uuid, $scope.userSession._id, function (response) {

                        $scope.parcel = response.data;

                        //setting markers only if cities are setup
                        if ($scope.parcel && $scope.parcel.city_departure && $scope.parcel.city_arrival) {

                            var addrDep = $scope.parcel.city_departure;
                            var addrArr = $scope.parcel.city_arrival;

                            var geocoder = new google.maps.Geocoder();

                            if (addrDep && addrArr) {

                                //Let's place marker for departure
                                geocoder.geocode({address: addrDep}, function (resultsDep, status) {
                                    if (status == google.maps.GeocoderStatus.OK) {

                                        var posDep = resultsDep[0].geometry.location;

                                        //Let's place marker for arrival
                                        geocoder.geocode({address: addrArr}, function (resultsArr, status) {
                                            if (status == google.maps.GeocoderStatus.OK) {

                                                var posArr = resultsArr[0].geometry.location;
                                                $scope.markers = MarkerService.getDepArrMarkerFromPosition(posDep, posArr);
                                                console.log($scope.markers);
                                            }
                                        });
                                    }
                                });

                            }
                        }
                    });

                }

                ExtraApi.getCarrierByUuid($routeParams.carrier_uuid, function (carrier) {

                    $scope.carrier = carrier;

                });

                ExtraApi.getRatingDataByCarrier($routeParams.carrier_uuid, function (ratings) {

                    $scope.ratingData = {};
                    $scope.ratingData.mark = 0;
                    $scope.ratingData.ratingCount = 0;

                    var totalStars = 0;

                    for (var i = 0; i < ratings.length; i++) {
                        var rating = ratings[i];
                        totalStars += rating.star_count;
                        $scope.ratingData.ratingCount++;
                    }

                    $scope.ratingData.mark = totalStars / $scope.ratingData.ratingCount;
                    $scope.ratingData.mark = Math.round($scope.ratingData.mark * 10) / 10;
                    $scope.ratingData.starRange = [];

                    var starCount = Math.round($scope.ratingData.mark);
                    console.log($scope.ratingData.ratingCount);
                    $scope.ratingData.starRange = StarCounter.getStarRange(starCount);

                });

                ExtraApi.trackIt($routeParams.carrier_uuid, $routeParams.code_tracking, function (response) {

                    var steps = response.steps;

                    console.log(steps);

                    if (steps && steps.length > 0) {

                        $scope.steps = steps;

                        var dataStep = StepManagerService.getDataStep(steps);

                        $scope.firstStep = dataStep.firstStep;
                        $scope.lastStep = dataStep.lastStep;
                        $scope.actualStep = dataStep.actualStep;

                        //Clearing timeout
                        $timeout.cancel(promise);
                    }
                    else {
                        $timeout(function () {
                            fail();
                        }, 10000);
                    }
                });
            }
        }]
);