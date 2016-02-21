angular.module('trackControllers')
    .controller('myProfileController', ['$scope', '$http', '$window', 'localStorageService', 'FormUserValidator', 'UserService', '$document', 'ExtraApi', '$timeout',
        function ($scope, $http, $window, localStorageService, FormUserValidator, UserService, $document, ExtraApi, $timeout) {

            $timeout(function(){
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            $scope.userForm = angular.copy($scope.userSession);

            $scope.updateProfile = function () {

                var isFormValid = FormUserValidator.validateUpdate($scope.userForm);

                if (isFormValid) {

                    ExtraApi.updateProfile($scope.userForm._id, $scope.userForm, function (updatedUser) {
                        swal("Bon boulot !", "Votre profil a été mis à jour !", "success");
                        localStorageService.set("userSession", JSON.stringify(updatedUser));
                    });
                }
            };

            $scope.updatePassword = function (changePasswdForm) {

                if (!changePasswdForm || !changePasswdForm.newPassword || changePasswdForm.newPassword.length === 0) {
                    swal("Erreur", "Veuillez remplir ce formulaire.", "error");
                }
                else if (changePasswdForm.newPassword != changePasswdForm.newPasswordConfirmation) {
                    swal("Erreur", "Les deux mots de passe ne correspondent pas !", "error");
                }
                else {

                    ExtraApi.changeUserPassword(changePasswdForm.newPassword, $scope.userSession._id, function (response) {
                        swal("Bon boulot !", "Votre mot de passe a été mis à jour !", "success");
                    });

                }

            };

        }]
);