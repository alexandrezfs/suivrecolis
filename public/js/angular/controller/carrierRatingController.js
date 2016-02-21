angular.module('trackControllers')
    .controller('carrierRatingController', ['$scope', '$http', '$window', 'localStorageService', '$routeParams', '$location', 'CarrierService', 'ParcelService', 'StarCounter', '$document', 'ExtraApi', '$timeout', 'UiService',
        function ($scope, $http, $window, localStorageService, $routeParams, $location, CarrierService, ParcelService, StarCounter, $document, ExtraApi, $timeout, UiService) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            CarrierService.query(function (carriers) {
                $scope.carriersTrack = angular.copy(carriers);
                $("#carriersTrack").select2({placeholder: "Choisir un transporteur", width: "270px"});
                $scope.carriers = carriers;
            });

            $scope.trackIt = function (trackingForm) {

                if (!trackingForm) {
                    swal("Error", "Merci de remplir le formulaire", "error");
                }
                else if (!trackingForm.code_tracking) {
                    swal("Error", "Merci d'entrer le code de suivi", "error");
                }
                else if (!trackingForm.selectedCarrier) {
                    swal("Error", "Merci de séléctionner un transporteur", "error");
                }
                else {
                    $location.path("/parcelTracking/" + trackingForm.selectedCarrier.uuid + "/" + UiService.cleanCodeTracking(trackingForm.code_tracking));
                }
            };

            $scope.loadCarrierRatings = function (carrier_uuid) {

                //Getting carrier info
                ExtraApi.getCarrierByUuid(carrier_uuid, function (carrier) {

                    if (!carrier) {
                        $location.path('/home');
                    }
                    else {
                        $scope.carrier = carrier;
                    }

                    //now get all ratings of this carrier
                    ExtraApi.getRatingDataByCarrier(carrier_uuid, function (ratings) {

                        $scope.ratings = ratings;

                        //calculate counts
                        $scope.ratingData = {};
                        $scope.ratingData.starCount = 0;
                        $scope.ratingData.ratingCount = 0;
                        $scope.ratingData.mark = 0;
                        $scope.ratingData.onTimeCount = 0;
                        $scope.ratingData.lateCount = 0;
                        $scope.ratingData.neverCount = 0;

                        var totalStars = 0;

                        for (var i = 0; i < ratings.length; i++) {

                            var rating = ratings[i];

                            totalStars += rating.star_count;
                            $scope.ratingData.ratingCount++;

                            if (rating.deliver_type == "onTime" || rating.deliver_type == "onDayEarly") {
                                $scope.ratingData.onTimeCount++;
                                $scope.ratingData.mark += 5;
                            }
                            else if (rating.deliver_type == "lateButRightDay" || rating.deliver_type == "oneDayLateOrMore") {
                                $scope.ratingData.lateCount++;
                                $scope.ratingData.mark += 2.5;
                            }
                            else if (rating.deliver_type == "neverDelivered") {
                                $scope.ratingData.neverCount++;
                                $scope.ratingData.mark += 0;
                            }

                        }

                        $scope.ratingData.mark = totalStars / $scope.ratingData.ratingCount;
                        $scope.ratingData.mark = Math.round($scope.ratingData.mark * 10) / 10;
                        $scope.ratingData.starRange = [];

                        var starCount = Math.round($scope.ratingData.mark);
                        $scope.ratingData.starRange = StarCounter.getStarRange(starCount);

                        //Getting rating data
                        ExtraApi.getRatingData(function (surveys) {

                            //Assigning the rating value to each rating object
                            for (var i = 0; i < ratings.length; i++) {

                                var rating = $scope.ratings[i];

                                for (var u = 0; u < surveys.deliverSurvey.length; u++) {
                                    var surveyD = surveys.deliverSurvey[u];
                                    if (surveyD.key == rating.deliver_type) {
                                        rating.deliver_type_value = surveyD.value;
                                    }
                                }

                                for (var x = 0; u < surveys.userTypeSurvey.length; x++) {
                                    var surveyU = surveys.userTypeSurvey[x];
                                    if (surveyU.key == rating.user_type) {
                                        rating.user_type_value = surveyU.value;
                                    }
                                }

                                for (var y = 0; y < surveys.serviceQualitySurvey.length; y++) {
                                    var surveyS = surveys.serviceQualitySurvey[y];
                                    if (surveyS.key == rating.service_quality) {
                                        rating.service_quality_value = surveyS.value;
                                    }
                                }

                                //building a star range for each review
                                var star_count = rating.star_count;
                                rating.starRange = StarCounter.getStarRange(star_count);

                            }
                        });
                    });
                });
            };

            if (!$routeParams.carrier_uuid) {
                $location.path("/home");
            }
            else {
                $scope.loadCarrierRatings($routeParams.carrier_uuid);
            }

        }]
);