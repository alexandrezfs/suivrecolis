angular.module('trackControllers')
    .controller('homeController', ['$scope', '$http', '$timeout', '$location', '$routeParams', 'CarrierService', '$window', 'localStorageService', '$document', '$routeParams', 'ExtraApi', 'UiService',
        function ($scope, $http, $timeout, $location, $routeParams, CarrierService, $window, localStorageService, $document, $routeParams, ExtraApi, UiService) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            $scope.trackingForm = {};

            CarrierService.query(function (carriers) {
                $scope.carriers = carriers;
                $scope.trackingForm.selectedCarrier = carriers[0];

                //If carrier is stored into cookies... (a carrier is stored when a user once tracked his parcel)
                var storedParcelChoice = $.cookie('parcelChoice');
                if(storedParcelChoice) {
                    try{
                        storedParcelChoice = JSON.parse(storedParcelChoice);
                        $scope.trackingForm.selectedCarrier = storedParcelChoice;
                    }
                    catch(err) {}
                }

                //Setup dropdown
                $("#selectCarriers").select2({placeholder: $scope.trackingForm.selectedCarrier.name, width: "270px"});
            });

            var activation_key = $routeParams.activation_key;

            if (activation_key) {
                ExtraApi.getUserByActivationKey(activation_key, function (user) {

                    if (user) {
                        ExtraApi.activateUser(activation_key, function (response) {
                            if (response.message == "success") {
                                swal("Compte activé", "Vous avez activé votre compte avec succès !", "success");
                            }
                        });
                    }
                    else {
                        swal("Compte déjà confirmé ?", "Votre compte a sûrement déjà été validé...", "error");
                    }

                });
            }

            $scope.trackIt = function () {

                if ($scope.trackingForm.code_tracking && $scope.trackingForm.code_tracking.length > 0 && $scope.trackingForm.selectedCarrier && $scope.trackingForm.selectedCarrier.uuid.length > 0) {

                    var code_tracking = UiService.cleanCodeTracking($scope.trackingForm.code_tracking);

                    var params = {
                        carrier_uuid: $scope.trackingForm.selectedCarrier.uuid,
                        code_tracking: code_tracking
                    };

                    //Register carrier choice in cookie.
                    $.cookie('parcelChoice', JSON.stringify($scope.trackingForm.selectedCarrier));

                    if ($scope.userSession) {
                        $location.path("/parcelTracking/" + params.carrier_uuid + "/" + params.code_tracking);
                    }
                    else {
                        $location.path("/flyRegistration/" + params.carrier_uuid + "/" + params.code_tracking);
                    }

                }
                else {
                    swal("Erreur", "Veuillez entrer un code de suivi et choisissez un transporteur.", "error");
                }

            };

        }]
);