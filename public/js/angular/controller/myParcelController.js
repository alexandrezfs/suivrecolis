angular.module('trackControllers')
    .controller('myParcelController', ['$scope', '$http', '$window', 'localStorageService', 'ParcelService', '$location', 'CarrierService', '$document', 'ExtraApi', '$timeout',
        function ($scope, $http, $window, localStorageService, ParcelService, $location, CarrierService, $document, ExtraApi, $timeout) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            $scope.toggleNotification = function (parcel) {

                ExtraApi.updateParcel(parcel._id, parcel, function (response) {
                    console.log("parcel updated: " + response);
                });

            };

            $scope.removeParcel = function (parcel) {

                swal({
                    title: "êtes vous sûr(e) ?",
                    text: "Vous n'allez pas pouvoir récupérer cette entrée si vous la supprimez !",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Oui, supprimer.",
                    closeOnConfirm: false
                }, function () {

                    ExtraApi.markParcelAsDeleted(parcel, function (response) {

                        swal("Suppression de colis", "Votre colis a bien été supprimé de votre inventaire.", "success");
                        getParcels();

                    });

                });

            };

            function getParcels() {
                ExtraApi.getParcelsByUser($scope.userSession, function (parcels) {
                    $scope.parcels = parcels;
                });
            }

            getParcels();

        }]
);