angular.module('trackControllers')
    .controller('resetPasswordController', ['$scope', '$http', '$routeParams', '$window', '$location', 'localStorageService', '$document', 'ExtraApi', '$timeout',
        function ($scope, $http, $routeParams, $window, $location, localStorageService, $document, ExtraApi, $timeout) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            var activation_key = $routeParams.activation_key;

            if (!activation_key) {
                $location.path("/home");
            }

            ExtraApi.getUserByActivationKey(activation_key, function (user) {

                if (!user) {
                    swal("Lien expiré", "Ce lien a expiré.", "error");
                    $location.path("/");
                }

            });

            $scope.resetPassword = function (password, passwordC) {

                if (password != passwordC) {
                    swal("Réinitialisation du mot de passe", "Les deux mots de passe ne correspondent pas !", "error");
                }
                else if (!password || password.length === 0) {
                    swal("Réinitialisation du mot de passe", "Veuillez entrer un mot de passe.", "error");
                }
                else {

                    ExtraApi.resetPassword(password, activation_key, function (response) {
                        console.log(response);
                        if (response.message == "user.does.not.exists") {
                            $location.path("/");
                        }
                        else {
                            swal("Réinitialisation du mot de passe", "Mot de passe réinitialisé avec succès !", "success");
                            $location.path("/");
                        }
                    });

                }
            };
        }]
);
