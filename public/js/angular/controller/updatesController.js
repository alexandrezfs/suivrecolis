angular.module('trackControllers')
    .controller('updatesController', ['$scope', '$http', '$window', 'localStorageService', 'ParcelService', '$document', 'ExtraApi', '$timeout',
        function ($scope, $http, $window, localStorageService, ParcelService, $document, ExtraApi, $timeout) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            ExtraApi.getNotificationsByUser($scope.userSession, function (notifications) {

                $scope.notifications = notifications;

                //Populating parcels objects
                for (var i = 0; i < $scope.notifications.length; i++) {
                    var notification = $scope.notifications[i];
                    notification.parcel = ParcelService.get({_id: notification.parcel_id});
                }
            });

        }]
);