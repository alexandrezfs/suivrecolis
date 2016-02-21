angular.module('trackControllers')
    .controller('contactController', ['$scope', '$http', '$window', 'localStorageService', '$document', 'FormUserValidator', '$location', 'ExtraApi', '$timeout',
        function ($scope, $http, $window, localStorageService, $document, FormUserValidator, $location, ExtraApi, $timeout) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            $scope.sendMessage = function (contactForm) {

                //TODO: integrate a real captcha
                if (contactForm && contactForm.captcha != "54GFDDF") {
                    swal("Erreur", "Code captcha invalide.", "error");
                }
                else {

                    var isFormValid = FormUserValidator.validateContactForm(contactForm);

                    if (isFormValid) {
                        ExtraApi.sendContactForm(contactForm, function (response) {
                            swal("Bon boulot !", "Votre mesage a été envoyé avec succès !", "success");
                            $location.path("/home");
                        });
                    }
                }
            };
        }]
);