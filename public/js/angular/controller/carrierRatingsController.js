angular.module('trackControllers')
    .controller('carrierRatingsController', ['$scope', '$http', '$window', 'localStorageService', 'CarrierService', '$location', '$routeParams', 'StarCounter', 'ParcelService', 'RatingService', '$location', '$document', 'ExtraApi', '$q', 'UiService', '$timeout',
        function ($scope, $http, $window, localStorageService, CarrierService, $location, $routeParams, StarCounter, ParcelService, RatingService, $location, $document, ExtraApi, $q, UiService, $timeout) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            $scope.toSingleCarrierRating = function (carrier_uuid) {
                $location.path("/carrierRating/" + carrier_uuid);
            };

            CarrierService.query(function (carriers) {
                $scope.carriersTrack = angular.copy(carriers);
                $("#carriersTrack").select2({placeholder: "Choisir un transporteur", width: "270px"});
                $scope.carriersRating = angular.copy(carriers);
                $("#carriersRating").select2({placeholder: "Choisir un transporteur", width: "270px"});
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

            //Getting ratings info
            RatingService.query(function (ratings) {

                $scope.ratings = ratings;
                ratings.reverse();

                //calculate counts

                $scope.ratingData = {};
                $scope.ratingData.thirdPartyCount = 0;
                $scope.ratingData.senderCount = 0;
                $scope.ratingData.recipientCount = 0;
                $scope.ratingData.starCount = 0;
                $scope.ratingData.ratingCount = 0;
                $scope.ratingData.mark = 0;
                $scope.ratingData.onTimeCount = 0;
                $scope.ratingData.onDayEarlyCount = 0;
                $scope.ratingData.lateButRightDayCount = 0;
                $scope.ratingData.oneDayLateOrMoreCount = 0;
                $scope.ratingData.neverDeliveredCount = 0;
                $scope.ratingData.total = 0;

                var totalStars = 0;

                for (var i = 0; i < ratings.length; i++) {

                    var rating = ratings[i];

                    totalStars += rating.star_count;
                    $scope.ratingData.ratingCount++;

                    if (rating.deliver_type == "neverDelivered") {
                        $scope.ratingData.neverDeliveredCount++;
                        $scope.ratingData.mark += 1;
                    }
                    else if (rating.deliver_type == "oneDayLateOrMore") {
                        $scope.ratingData.oneDayLateOrMoreCount++;
                        $scope.ratingData.mark += 2;
                    }
                    else if (rating.deliver_type == "onDayEarly") {
                        $scope.ratingData.onDayEarlyCount++;
                        $scope.ratingData.mark += 3;
                    }
                    else if (rating.deliver_type == "lateButRightDay") {
                        $scope.ratingData.lateButRightDayCount++;
                        $scope.ratingData.mark += 4;
                    }
                    else if (rating.deliver_type == "onTime") {
                        $scope.ratingData.onTimeCount++;
                        $scope.ratingData.mark += 5;
                    }

                    if (rating.user_type == "thirdParty") {
                        $scope.ratingData.thirdPartyCount++;
                    }
                    else if (rating.user_type == "sender") {
                        $scope.ratingData.senderCount++;
                    }
                    else if (rating.user_type == "recipient") {
                        $scope.ratingData.recipientCount++;
                    }

                    $scope.ratingData.total++;

                }

                //calculate percents
                $scope.ratingData.neverDeliveredCount_percent = Math.round(($scope.ratingData.neverDeliveredCount * 100) / $scope.ratingData.total);
                $scope.ratingData.oneDayLateOrMoreCount_percent = Math.round(($scope.ratingData.oneDayLateOrMoreCount * 100) / $scope.ratingData.total);
                $scope.ratingData.onDayEarlyCount_percent = Math.round(($scope.ratingData.onDayEarlyCount * 100) / $scope.ratingData.total);
                $scope.ratingData.lateButRightDayCount_percent = Math.round(($scope.ratingData.lateButRightDayCount * 100) / $scope.ratingData.total);
                $scope.ratingData.onTimeCount_percent = Math.round(($scope.ratingData.onTimeCount * 100) / $scope.ratingData.total);

                $scope.ratingData.mark /= $scope.ratingData.ratingCount;
                $scope.ratingData.mark = Math.round($scope.ratingData.mark * 10) / 10;
                $scope.ratingData.starRange = [];

                var starCount = Math.round($scope.ratingData.mark);
                $scope.ratingData.starRange = StarCounter.getStarRange(starCount);

                var assignCarrier = function (rating) {
                    (function (rating) {
                        ExtraApi.getPromisedCarrierByUuid(rating.carrier_uuid).then(function (carrier) {
                            rating.carrier = carrier;
                        });
                    })(rating);
                };

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

                        for (var x = 0; x < surveys.userTypeSurvey.length; x++) {
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

                        //To display stars on the front
                        rating.starRange = StarCounter.getStarRange(rating.star_count);

                        //getting carrier by carrier using a closure
                        assignCarrier(rating);

                        //building a star range for each review
                        var star_count = rating.star_count;
                        rating.star_range = StarCounter.getStarRange(star_count);

                    }
                });

            });

        }]
);
