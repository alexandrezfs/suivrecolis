angular.module('trackControllers')
    .controller('helpController', ['$scope', '$http', '$window', 'localStorageService', '$document', '$timeout',
        function ($scope, $http, $window, localStorageService, $document, $timeout) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

        }]
);