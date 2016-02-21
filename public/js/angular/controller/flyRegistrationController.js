angular.module('trackControllers')
    .controller('flyRegistrationController', ['$scope', '$http', '$window', 'localStorageService', '$document', '$routeParams', '$location', 'FormUserValidator', 'ParcelService', 'CarrierService', '$timeout', 'ExtraApi',
        function ($scope, $http, $window, localStorageService, $document, $routeParams, $location, FormUserValidator, ParcelService, CarrierService, $timeout, ExtraApi) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            var carrier_uuid = $routeParams.carrier_uuid;

            $scope.trackingForm = {
                code_tracking: $routeParams.code_tracking
            };

            if (!$scope.trackingForm.code_tracking || !carrier_uuid) {
                $location.path("/home");
            }
            else {

                $scope.booleans = [
                    {
                        id: 1,
                        value: "Oui",
                        key: true
                    },
                    {
                        id: 2,
                        value: "Non",
                        key: false
                    }];

                CarrierService.query(function (carriers) {

                    $scope.carriers = carriers;

                    $("#autoCarrier").select2({placeholder: "Choisir un transporteur"});

                    //Setting the default carrier
                    var indexInSelectBox = 0;
                    for (var i = 0; i < carriers.length; i++) {
                        if (carriers[i].uuid == carrier_uuid) {
                            $scope.trackingForm.selectedCarrier = carriers[i];
                            indexInSelectBox = i;
                        }
                    }

                    $timeout(function () {
                        $("#autoCarrier").select2("val", indexInSelectBox);
                    }, 500);

                });

                $scope.submit = function (flyForm) {

                    if (flyForm) {
                        if (!flyForm.isRegister) {
                            flyForm.isRegister = {};
                            flyForm.isRegister.key = false;
                        }
                        if (!flyForm.isReceiveNotifications) {
                            flyForm.isReceiveNotifications = {};
                            flyForm.isReceiveNotifications.key = false;
                        }
                        if (!flyForm.isNameParcel) {
                            flyForm.isNameParcel = {};
                            flyForm.isNameParcel.key = false;
                        }
                    }

                    if (!flyForm || !flyForm.isRegister.key) {
                        //no register, continue to tracking results...
                        $location.path('/parcelTracking/' + $scope.trackingForm.selectedCarrier.uuid + '/' + $scope.trackingForm.code_tracking);
                    }
                    else if (flyForm.isRegister.key) {

                        if (!flyForm) {
                            swal("Erreur", "Merci de remplir le formulaire.", "error");
                        }
                        else {

                            //register
                            var userToAdd = {};
                            userToAdd.firstname = flyForm.firstname;
                            userToAdd.lastname = flyForm.lastname;
                            userToAdd.email = flyForm.email;
                            userToAdd.phone = flyForm.phone;
                            userToAdd.password = flyForm.password;
                            userToAdd.passwordConfirm = flyForm.passwordConfirm;
                            userToAdd.is_active = true;

                            var isFormValid = FormUserValidator.validateAdd(userToAdd);

                            if (isFormValid) {

                                //verify if this email address if not already registered.
                                ExtraApi.getUserByEmail(userToAdd.email, function (userTest) {

                                    if (userTest) {
                                        swal("Erreur", "Cet email existe déjà dans notre base de données...", "error");
                                    }
                                    else {

                                        ExtraApi.registerUser(userToAdd, function (response) {

                                            swal("Bienvenue !", "Bienvenue " + userToAdd.firstname + ", vous venez de vous inscrire avec succès !", "success");

                                            //wants to add this parcel OR receive notifications ? then a new parcel for it.
                                            if (flyForm.isReceiveNotifications.key || flyForm.isNameParcel.key) {

                                                var parcel = {
                                                    code_tracking: $scope.trackingForm.code_tracking,
                                                    parcel_name: flyForm.parcel_name ? flyForm.parcel_name : "",
                                                    receive_notification: flyForm.isReceiveNotifications.key,
                                                    user_id: response.data.user._id,
                                                    carrier_uuid: $scope.trackingForm.selectedCarrier.uuid,
                                                    carrier_name: $scope.trackingForm.selectedCarrier.name,
                                                    city_departure: "",
                                                    region_departure: "",
                                                    country_departure: "",
                                                    address_departure: "",
                                                    city_arrival: "",
                                                    region_arrival: "",
                                                    country_arrival: "",
                                                    address_arrival: ""
                                                };

                                                ExtraApi.createParcel(parcel, function (response) {
                                                    swal("Bon boulot !", "Votre colis a été enregistré avec succès !", "success");
                                                });

                                            }

                                            swal("Bon boulot !", "Nous venous de vous envoyer un email. Merci de cliquer sur le lien à l'intérieur pour activer votre compte !", "success");

                                            //then redirect to tracking results
                                            $location.path('/parcelTracking/' + $scope.trackingForm.selectedCarrier.uuid + '/' + $scope.trackingForm.code_tracking);
                                        });
                                    }
                                });

                            }
                        }
                    }
                };
            }

        }]
);