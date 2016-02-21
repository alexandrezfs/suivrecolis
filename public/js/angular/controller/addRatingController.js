angular.module('trackControllers')
    .controller('addRatingController', ['$scope', '$http', '$window', 'localStorageService', 'RatingService', '$routeParams', 'ParcelService', 'StepManagerService', '$location', '$document', '$location', 'ExtraApi', '$timeout',
        function ($scope, $http, $window, localStorageService, RatingService, $routeParams, ParcelService, StepManagerService, $location, $document, $location, ExtraApi, $timeout) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            var carrier_uuid = $routeParams.carrier_uuid;
            var code_tracking = $routeParams.code_tracking;

            if (!carrier_uuid || !code_tracking) {
                $location.path("/home");
            }
            else {

                var fail = function () {
                    swal("Erreur", "Vous avez tenté de voter pour un colis qui n'existe pas.", "error");
                    $timeout.cancel(promise);
                    $location.path("/home");
                };

                var timeout = 20000; //We won't wait more than 20 seconds
                var promise = $timeout(function () {
                    fail();
                }, timeout);


                //Verify if parcel_id is exists.
                ExtraApi.trackIt(carrier_uuid, code_tracking, function (response) {

                    var steps = response.steps;

                    console.log(steps);

                    if (steps && steps.length > 0 && steps[0].status.length > 2) {

                        //Clearing timeout
                        $timeout.cancel(promise);
                    }
                    else {
                        $timeout(function () {
                            fail();
                        }, 5000);
                    }
                });

                $scope.rating = {};

                ExtraApi.getCarrierByUuid(carrier_uuid, function (carrier) {

                    if (!carrier) {
                        $location.path('/home');
                    }
                    else {
                        $scope.carrier = carrier;
                    }

                });

                ExtraApi.getRatingData(function (ratingData) {
                    $scope.ratingData = ratingData;
                    $("#selectUserType").select2({placeholder: "choisir"});
                    $("#selectServiceQuality").select2({placeholder: "choisir"});
                    $("#selectDeliverSurvey").select2({placeholder: "choisir"});
                });

                $scope.submitRating = function () {

                    if (!$scope.rating.selectedUserType || !$scope.rating.selectedServiceQuality || !$scope.rating.selectedDeliverSurvey || !$scope.rating.suggest_comment || !$scope.rating.appreciate_comment) {

                        swal("Erreur", "Formulaire d'évaluation incomplet", "error");
                    }
                    else {

                        var rating = {};
                        rating.user_type = $scope.rating.selectedUserType.key;
                        rating.service_quality = $scope.rating.selectedServiceQuality.key;
                        rating.star_count = $scope.rating.selectedServiceQuality.star_count;
                        rating.deliver_type = $scope.rating.selectedDeliverSurvey.key;
                        rating.suggest_comment = $scope.rating.suggest_comment;
                        rating.appreciate_comment = $scope.rating.appreciate_comment;
                        rating.carrier_uuid = $scope.carrier.uuid;
                        rating.code_tracking = code_tracking;

                        ExtraApi.rateParcel(rating, function (response) {

                            if (response.data.message && response.data.message == 'already rated') {
                                swal("Erreur", "Ce transporteur a déjà été évalué.", "error");
                                $location.path("/carrierRatings");
                            }
                            else {
                                swal("Bon boulot !", "Vous avez évalué ce transporteur avec succès !", "success");
                                $location.path("/carrierRatings");
                            }

                        });
                    }
                };

            }
        }]
);