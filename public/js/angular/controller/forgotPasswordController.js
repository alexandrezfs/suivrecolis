angular.module('trackControllers')
    .controller('forgotPasswordController', ['$scope', '$http', '$window', '$location', 'localStorageService', '$document', 'ExtraApi', '$timeout',
        function ($scope, $http, $window, $location, localStorageService, $document, ExtraApi, $timeout) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            $scope.sendPasswordRecovering = function (email) {

                ExtraApi.sendPasswordRecovering(email, function (response) {
                    console.log(response);
                    if (response.message == "user.does.not.exists") {
                        swal("Récupération du mot de passe", "Désolé, nous n'avons pu trouver votre compte.", "error");
                    }
                    else {
                        swal("Récupération du mot de passe", "Un email contenant un lien vous a été envoyé. Merci de cliquer sur ce lien pour redéfinir votre mot de passe.", "success");
                        $location.path("/home");
                    }
                });

            };

        }]
);