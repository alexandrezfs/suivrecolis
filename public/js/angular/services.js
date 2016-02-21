var trackServices = angular.module('trackServices', ['ngResource']);

trackServices.factory('UserService', ['$resource',

    function ($resource) {

        return $resource('/api/user/:_id', {},
            {
                'query': {method: 'GET', isArray: true},
                'update': {method: 'PUT'}
            });

    }]);

trackServices.factory('CarrierService', ['$resource',

    function ($resource) {

        return $resource('/api/carrier/:_id', {},
            {
                'query': {method: 'GET', isArray: true},
                'update': {method: 'PUT'}
            });

    }]);

trackServices.factory('ParcelService', ['$resource',

    function ($resource) {

        return $resource('/api/parcel/:_id', {},
            {
                'query': {method: 'GET', isArray: true},
                'update': {method: 'PUT'}
            });

    }]);

trackServices.factory('RatingService', ['$resource',

    function ($resource) {

        return $resource('/api/rating/:_id', {},
            {
                'query': {method: 'GET', isArray: true},
                'update': {method: 'PUT'}
            });
    }]);

trackServices.factory('CountryService', ['$resource',

    function ($resource) {

        return $resource('/api/country/:_id', {},
            {
                'query': {method: 'GET', isArray: true},
                'update': {method: 'PUT'}
            });
    }]);


trackServices.factory("AuthService", function ($window, $location, localStorageService, $timeout, config) {
    return {
        isAuthenticated: function () {

            var userSession = localStorageService.get("userSession");

            if (!userSession) {
                $location.path("/signRegister");
            }
        },
        logout: function () {
            localStorageService.set("userSession", null);
            $.cookie('apiKey', config.anonymous_api_key);
            $location.path("/home");
        }
    };
});

trackServices.factory('ExtraApi', function ($http, $q) {

    return {
        getRegionByCountry: function (country, callback) {

            $http.get('/api/region/bycountry/' + country.code).
                success(function (data) {
                    callback(data);
                });
        },
        getCityByRegionAndCountry: function (country, region, callback) {

            $http.get('/api/city/bycountryregion/' + country.code + '/' + region.code).
                success(function (data) {
                    callback(data);
                });
        },
        trackIt: function (carrier_uuid, code_tracking, callback) {

            $http.get('/api/trackIt/' + carrier_uuid + "/" + code_tracking).
                success(function (data) {
                    callback(data);
                });
        },
        getCarrierByUuid: function (carrier_uuid, callback) {

            $http.get('/api/carrier/uuid/' + carrier_uuid).
                success(function (carrier) {
                    callback(carrier);
                });
        },
        getPromisedCarrierByUuid: function (carrier_uuid) {

            var deferred = $q.defer();

            $http.get('/api/carrier/uuid/' + carrier_uuid).
                success(function (carrier) {
                    deferred.resolve(carrier);
                });

            var promise = deferred.promise;

            return promise;
        },
        getRatingData: function (callback) {

            $http.get("/api/ratingdata/surveys").success(function (surveys) {
                callback(surveys);
            });
        },
        getRatingDataByCarrier: function (carrier_uuid, callback) {
            $http.get('/api/ratingdata/bycarrier/' + carrier_uuid).
                success(function (ratings) {
                    callback(ratings);
                });
        },
        sendContactForm: function (contactForm, callback) {
            $http({
                url: '/api/contact/send',
                method: "POST",
                data: contactForm
            }).then(function (response) {
                callback(response);
            });
        },
        getUserByEmail: function (email, callback) {

            $http.get("/api/userdata/byemail/" + email).success(function (user) {
                callback(user);
            });
        },
        registerUser: function (userToAdd, callback) {

            $http({
                url: '/api/user/register',
                method: "POST",
                data: userToAdd
            }).then(function (response) {
                callback(response);
            });
        },
        getPostsLocations: function (callback) {
            $http.get("/api/postslocations").success(function (locations) {
                callback(locations);
            });
        },
        markParcelAsDeleted: function (parcel, callback) {

            $http({
                url: '/api/parcels/setdeleted',
                method: "POST",
                data: {parcel_id: parcel._id}
            }).then(function (response) {
                callback(response);
            });
        },
        getParcelsByUser: function (user, callback) {
            $http.get('/api/parcels/byuser/' + user._id).
                success(function (parcels) {
                    callback(parcels);
                });
        },
        changeUserPassword: function (password, user_id, callback) {
            $http({
                url: '/api/user/changepassword',
                method: "POST",
                data: {password: password, user_id: user_id}
            }).then(function (response) {
                callback(response);
            });
        },
        getParcelByUserCodeCarrier: function (code_tracking, carrier_uuid, user_id, callback) {
            $http({
                url: '/api/parcels/byuser/bycarrieruuid/bytrackingcode',
                method: "POST",
                data: {
                    code_tracking: code_tracking,
                    carrier_uuid: carrier_uuid,
                    user_id: user_id
                }
            }).then(function (response) {
                callback(response);
            });
        },
        getPostsLocationsByCarrier: function (carrier_uuid, callback) {
            $http.get("/api/postslocations/bycarrier/" + carrier_uuid).success(function (locations) {
                callback(locations);
            });
        },
        getPostsLocationsByText: function (text, callback) {
            $http({
                url: '/api/postslocations/bytext',
                method: "POST",
                data: {text: text}
            }).then(function (response) {
                callback(response);
            });
        },
        authenticate: function (email, password, callback) {
            $http({
                url: '/api/user/authenticate',
                method: "POST",
                data: {email: email, password: password}
            }).then(function (response) {
                callback(response);
            });
        },
        getNotificationsByUser: function (user, callback) {
            $http.get('/api/notifications/byuser/' + user._id).
                success(function (notifications) {
                    callback(notifications);
                });
        },
        activateUser: function (activation_key, callback) {
            $http.get('/api/user/activate/' + activation_key).
                success(function (response) {
                    callback(response);
                });
        },
        getParcelByUser: function (user_id, carrier_uuid, code_tracking, callback) {
            $http({
                url: '/api/parcels/byuser/andcarrieruuid/andtrackingcode',
                method: "POST",
                data: {user_id: user_id, carrier_uuid: carrier_uuid, code_tracking: code_tracking}
            }).then(function (response) {
                callback(response.data);
            });
        },
        sendPasswordRecovering: function (email, callback) {
            $http.get('/api/user/password/recover/' + email).
                success(function (response) {
                    callback(response);
                });
        },
        resetPassword: function (password, activation_key, callback) {
            $http({
                url: '/api/user/passwordReset',
                method: "POST",
                data: {password: password, activation_key: activation_key}
            }).then(function (response) {
                callback(response.data);
            });
        },
        getUserByActivationKey: function (activation_key, callback) {
            $http.get('/api/user/byactivationkey/' + activation_key).
                success(function (response) {
                    callback(response);
                });
        },
        getLocationById: function (_id, callback) {
            $http.get('/api/postslocations/' + _id).
                success(function (response) {
                    callback(response);
                });
        },
        updateProfile: function (_id, updatedEntity, callback) {
            $http.put('/api/user/update/' + _id, updatedEntity).
                success(function (response) {
                    callback(response);
                });
        },
        updateParcel: function (_id, updatedEntity, callback) {
            $http.put('/api/parcel/' + _id, updatedEntity).
                success(function (response) {
                    callback(response);
                });
        },
        createParcel: function (newParcel, callback) {
            $http({
                url: '/api/parcel',
                method: "POST",
                data: newParcel
            }).then(function (response) {
                callback(response);
            });
        },
        rateParcel: function (rating, callback) {
            $http({
                url: '/api/parcel/rate',
                method: "POST",
                data: rating
            }).then(function (response) {
                callback(response);
            });
        },
        resendActivationEmail: function(user_id, callback) {
            $http.get('/api/activationemail/resend/' + user_id).
                success(function (response) {
                    callback(response);
                });
        },
        getUserFromApiKey: function(api_key, callback) {
            $http.get('/api/user/byapikey/' + api_key).
                success(function (response) {
                    callback(response);
                });
        }
    };

});

trackServices.factory("FormUserValidator", function () {
    return {
        validateAdd: function (user) {

            if (!user) {
                swal("Erreur", "Veuillez remplir ce formulaire.", "error");
            }
            else if (!user.firstname || user.firstname.length === 0 || user.firstname.length > 100) {
                swal("Erreur", "Prénom invalide.", "error");
            }
            else if (!user.lastname || user.lastname.length === 0 || user.lastname.length > 100) {
                swal("Erreur", "Nom invalide.", "error");
            }
            else if (!user.email || user.email.length === 0 || user.email.length > 50) {
                swal("Erreur", "Email invalide.", "error");
            }
            else if (!user.phone || user.phone.length === 0 || user.phone.length > 30) {
                swal("Erreur", "Numéro de téléphone invalide.", "error");
            }
            else if (!user.password || user.password === 0 || user.password.length > 50) {
                swal("Erreur", "Mot de passe invalide.", "error");
            }
            else if (user.password != user.passwordConfirm) {
                swal("Erreur", "Les deux mots de passe ne correspondent pas.", "error");
            }
            else {
                return true;
            }

            return false;

        },
        validateUpdate: function (user) {

            if (!user) {
                swal("Erreur", "Veuillez remplir ce formulaire.", "error");
            }
            else if (!user.firstname || user.firstname.length === 0 || user.firstname.length > 100) {
                swal("Erreur", "Prénom invalide.", "error");
            }
            else if (!user.lastname || user.lastname.length === 0 || user.lastname.length > 100) {
                swal("Erreur", "Nom invalide.", "error");
            }
            else if (!user.email || user.email.length === 0 || user.email.length > 50) {
                swal("Erreur", "Email invalide.", "error");
            }
            else if (!user.phone || user.phone.length === 0 || user.phone.length > 30) {
                swal("Erreur", "Numéro de téléphone invalide.", "error");
            }
            else {
                return true;
            }

            return false;
        },
        validateContactForm: function (form) {

            if (!form) {
                swal("Erreur", "Veuillez remplir ce formulaire.", "error");
            }
            else if (!form.firstname || form.firstname.length === 0 || form.firstname.length > 50) {
                swal("Erreur", "Prénom invalide.", "error");
            }
            else if (!form.lastname || form.lastname.length === 0 || form.lastname.length > 50) {
                swal("Erreur", "Nom invalide.", "error");
            }
            else if (!form.email || form.email.length === 0 || form.email.length > 50) {
                swal("Erreur", "Email invalide.", "error");
            }
            else if (!form.subject || form.subject.length === 0 || form.subject.length > 50) {
                swal("Erreur", "Le sujet est invalide.", "error");
            }
            else if (!form.message || form.message.length === 0 || form.message.length > 20000) {
                swal("Erreur", "Le message est invalide.", "error");
            }
            else {
                return true;
            }

            return false;
        }
    };
});

trackServices.factory("StepManagerService", function () {

    return {
        getDataStep: function (steps) {

            var response = {};

            for (var i = 0; i < steps.length; i++) {
                var step = steps[i];

                if (step.step_level == 1) {
                    response.firstStep = step;
                }
                else if (step.step_level == 3) {
                    response.lastStep = step;
                }
            }

            if (response.lastStep) {
                response.actualStep = 3;
            }
            else {
                response.actualStep = 2;
            }

            return response;
        }
    };

});

trackServices.factory("StarCounter", function () {

    return {
        getStarRange: function (starCount) {

            var range = [];

            //counting for a star range table
            for (var i = 0; i < 5; i++) {

                if (i < starCount) {
                    range.push({
                        highlight: 1
                    });
                }
                else {
                    range.push({
                        highlight: 0
                    });
                }
            }

            return range;

        }
    };

});

trackServices.factory("MarkerService", function () {

    return {
        getMarkersFromLocations: function (locations) {

            var markers = [];
            var maxMarkers = 30;

            var onClickMarker = function (marker) {
                marker.show = !marker.show;
            };

            for (var i = 0; i < locations.length; i++) {

                var location = locations[i];
                var marker = {};

                marker.longitude = location.longitude;
                marker.latitude = location.latitude;
                marker.title = location.office_name;
                marker.show = true;
                marker.id = i;
                marker.onClick = onClickMarker(marker);

                markers.push(marker);

                if(i > maxMarkers) {break;}
            }

            return markers;

        },

        getDepArrMarkerFromPosition: function (positionDep, positionArr) {

            var latDep = positionDep.k;
            var lonDep = positionDep.D;
            var latArr = positionArr.k;
            var lonArr = positionArr.D;

            var markerDep = {};
            markerDep.longitude = lonDep;
            markerDep.latitude = latDep;
            markerDep.title = "Departure";
            markerDep.show = false;
            markerDep.onClick = function () {
                markerDep.show = !markerDep.show;
            };
            markerDep.id = 0;

            var markerArr = {};
            markerArr.longitude = lonArr;
            markerArr.latitude = latArr;
            markerArr.title = "Arrival";
            markerArr.show = false;
            markerArr.onClick = function () {
                markerArr.show = !markerArr.show;
            };
            markerArr.id = 1;

            return [markerDep, markerArr];
        }
    };

});

trackServices.factory("UiService", function ($timeout) {

    return {
        loadingWheel: function () {

            $("body").css("cursor", "progress");

            $timeout(function () {
                $("body").css("cursor", "default");
            }, 1000);

        },
        cleanCodeTracking: function(code_tracking) {

            code_tracking = code_tracking.replace(/[^a-zA-Z0-9]+/g, "");

            return code_tracking;
        }
    };

});

