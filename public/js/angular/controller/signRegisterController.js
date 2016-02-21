angular.module('trackControllers')
    .controller('signRegisterController', ['$scope', '$window', '$http', '$location', 'localStorageService', 'FormUserValidator', '$document', 'ExtraApi', '$timeout',
        function ($scope, $window, $http, $location, localStorageService, FormUserValidator, $document, ExtraApi, $timeout) {

            $timeout(function () {
                onLoadScript();
                onLoadScriptADS();
            });

            $scope.userSession = localStorageService.get("userSession");

            $document.scrollTop(0, 700);

            $scope.signup = function (user) {

                if (!user) {
                    swal("Erreur", "Veuillez remplir ce formulaire.", "error");
                }
                else {

                    var userToAdd = {};
                    userToAdd.firstname = user.firstname;
                    userToAdd.lastname = user.lastname;
                    userToAdd.email = user.email;
                    userToAdd.phone = user.phone;
                    userToAdd.password = user.password;
                    userToAdd.passwordConfirm = user.passwordConfirm;
                    userToAdd.is_active = false;

                    var isFormValid = FormUserValidator.validateAdd(userToAdd);

                    if (isFormValid) {

                        //verify if this email address if not already registered.
                        ExtraApi.getUserByEmail(userToAdd.email, function (userTest) {

                            if (userTest) {
                                swal("Erreur", "Cette adresse email semble déjà enregistrée...", "error");
                            }
                            else {
                                ExtraApi.registerUser(userToAdd, function () {
                                    swal("Fantastique!", "Nous venons juste de vous envoyer un email contenant un lien d'activation du compte. Veuillez cliquer sur ce lien afin de pouvoir vous connecter.", "success");
                                    $location.path("/home");
                                });
                            }
                        });

                    }
                }
            };

            $scope.login = function (userAuth) {

                if (userAuth) {

                    var email = userAuth.email;
                    var password = userAuth.password;

                    ExtraApi.authenticate(email, password, function (response) {

                        if (response.data.response == 'user not activated') {

                            swal({
                                title: "Erreur",
                                text: "Votre compte n'a pas été activé. Souhaitez-vous recevoir le mail d'activation du compte une nouvelle fois?",
                                type: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Oui, renvoyez moi ce mail d'activation.",
                                cancelButtonText: "Annuler",
                                closeOnConfirm: false,
                                closeOnCancel: true
                            }, function (isConfirm) {
                                if (isConfirm) {
                                    ExtraApi.resendActivationEmail(response.data.user._id, function(response) {
                                        if(response.message == 'sent') {
                                            swal("Email envoyé !", "Nous venons juste de vous envoyer un email contenant un lien d'activation du compte. Veuillez cliquer sur ce lien afin de pouvoir vous connecter.", "success");
                                        }
                                        else {
                                            swal(":(", "Oops ! Notre service de mails est temporairement indisponible, veuillez réessayer plus tard.", "error");
                                        }
                                    });
                                }
                            });
                        }
                        else if (response.data.user) {

                            //Storing user...
                            localStorageService.set("userSession", JSON.stringify(response.data.user));
                            $.cookie("apiKey", response.data.user.api_key);

                            //Redirect user...
                            $location.path("/myParcel");

                        }
                        else {
                            swal("Erreur", "Email / Mot de passe non reconnus.", "error");
                        }
                    });
                }
                else {
                    swal("Erreur", "Veuillez remplir le formulaire de connexion.", "error");
                }
            };
        }]
);
