angular.module('trackControllers')
    .controller('addNewParcelController', ['$scope', '$http', 'CountryService', 'CarrierService', 'ParcelService', '$window', 'localStorageService', '$document', '$location', 'ExtraApi', '$timeout',
        function ($scope, $http, CountryService, CarrierService, ParcelService, $window, localStorageService, $document, $location, ExtraApi, $timeout) {

            $timeout(function () {
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            $scope.trackingForm = {};

            CountryService.query(function (countries) {
                $scope.countriesDeparture = angular.copy(countries);
                $("#selectPrettyCountriesDeparture").select2({placeholder: "Choose country"});
                $scope.countriesArrival = angular.copy(countries);
                $("#selectPrettyCountriesArrival").select2({placeholder: "Choose country"});
            });

            CarrierService.query(function (carriers) {
                $scope.carriers = carriers;
                $("#selectPrettyCarrier").select2({placeholder: "Choisir un transporteur"});
            });

            $scope.loadRegionsByCountry = function (country, type) {

                ExtraApi.getRegionByCountry(country, function (regions) {
                    if (type == "departure") {
                        $scope.regionsDeparture = angular.copy(regions);
                    }
                    else if (type == "arrival") {
                        $scope.regionsArrival = angular.copy(regions);
                    }
                });

            };

            $scope.loadCitiesByCountryRegion = function (region, type) {

                var country = type == "departure" ? $scope.trackingForm.country_departure : $scope.trackingForm.country_arrival;

                ExtraApi.getCityByRegionAndCountry(country, region, function (cities) {
                    if (type == "departure") {
                        $scope.citiesDeparture = cities;
                    }
                    else if (type == "arrival") {
                        $scope.citiesArrival = cities;
                    }
                });

            };

            $scope.addParcel = function () {

                var parcel = angular.copy($scope.trackingForm);

                if (!parcel.code_tracking || parcel.code_tracking.length === 0) {
                    swal("Erreur", "Le code de suivi est manquant", "error");
                }
                else if (!$scope.trackingForm.carrier) {
                    swal("Erreur", "Pas de transporteur séléctionné", "error");
                }
                else {

                    //Verifying parcel existence
                    ExtraApi.getParcelByUser($scope.userSession._id, parcel.carrier.uuid, parcel.code_tracking, function (parcelExists) {

                        console.log(parcelExists);

                        parcel.carrier_uuid = $scope.trackingForm.carrier.uuid;
                        parcel.carrier_name = $scope.trackingForm.carrier.name;
                        parcel.user_id = $scope.userSession._id;
                        parcel.receive_notification = true;

                        swal({
                            title: "Please wait",
                            text: "Registering parcel...",
                            timer: 2000
                        });

                        ExtraApi.createParcel(parcel, function (response) {

                            if (response.data.message == 'PARCEL ALREADY REGISTERED') {
                                swal("Erreur", "Vous avez déjà ajouté ce colis.", "error");
                            }
                            else {
                                swal("Félicitations !", "Colis ajouté avec succès !", "success");
                                $location.path("/myParcel");
                            }
                        });

                    });

                }

            };

        }]
);