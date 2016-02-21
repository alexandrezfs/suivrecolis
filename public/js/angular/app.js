var trackApp;
var isDfpBlocked;

var modules = [
    'ngRoute',
    'trackControllers',
    'trackServices',
    'trackFilters',
    'trackDirectives',
    'ui.select',
    'LocalStorageModule',
    'angularUtils.directives.dirPagination',
    'uiGmapgoogle-maps',
    'angulartics',
    'angulartics.piwik',
    'viewhead',
    'angular-loading-bar',
    'angularMoment'
];

try {
    angular.module("ngDfp");
    isDfpBlocked = false;
}
catch (err) {
    isDfpBlocked = true;
}

if (!isDfpBlocked) {
    modules.push('ngDfp');
}

trackApp = angular.module('TrackApp', modules);

trackApp.constant('config', {
    anonymous_api_key: 'e564b6df48781a5fdf8ca5263ace1947'
});

if (!isDfpBlocked) {

    /*
    trackApp.config(function (DoubleClickProvider) {
        DoubleClickProvider.defineSlot('/33555800/content-square', [300, 250], 'div-gpt-ad-1426258913924-0')
            .defineSlot('/33555800/side-skyscraper', [160, 600], 'div-gpt-ad-1426258733475-0')
            .defineSlot('/33555800/top-728-90', [728, 90], 'div-gpt-ad-1426258854054-0');
    });
    */
}

trackApp.run(function(amMoment) {
    amMoment.changeLocale('fr');
});

trackApp.constant('angularMomentConfig', {
    timezone: 'Europe/Paris'
});

trackApp.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = true;
}]);

trackApp.run(function ($rootScope, $templateCache, cfpLoadingBar, $timeout) {
    $rootScope.$on('$viewContentLoaded', function () {

        cfpLoadingBar.start();
        cfpLoadingBar.complete();
        $templateCache.removeAll();

    });
});

trackApp.run(function ($rootScope, $location, $http, config, localStorageService, ExtraApi) {
    $rootScope.$watch(function () {
            return $location.path();
        },
        function (path) {

            //console.log('url has changed: ' + path);

            var userSession = localStorageService.get("userSession");
            $rootScope.userSession = userSession;

            var apiKey = $.cookie('apiKey');

            //No user, but an old API key (which isn't anonymous one) is registered.
            //Load user from that API key
            if (!userSession && apiKey && apiKey.length > 0 && apiKey != config.anonymous_api_key) {
                ExtraApi.getUserFromApiKey(apiKey, function (user) {
                    $rootScope.userSession = user;
                    localStorageService.set('userSession', JSON.stringify(user));
                    $.cookie('apiKey', apiKey); //renew key
                });
            }
            //No apiKey, no user, just like being nude in the street.
            //Setup apiKey to anonymous one.
            else if (!userSession && (!apiKey || apiKey.length === 0)) {
                $.cookie('apiKey', config.anonymous_api_key);
                apiKey = config.anonymous_api_key;
            }

            $http.defaults.headers.common.Authorization = apiKey;
            $http.defaults.headers.post.Authorization = apiKey;
            $http.defaults.headers.put.Authorization = apiKey;
            $http.defaults.headers.patch.Authorization = apiKey;
        });
});

trackApp.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('trackApp')
        .setStorageType('sessionStorage')
        .setNotify(true, true);
});

trackApp.config(['$locationProvider', function ($locationProvider) {

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

}]);

trackApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/home', {
                templateUrl: 'home.html',
                controller: 'homeController'
            }).
            when('/addNewParcel', {
                templateUrl: 'add_new_parcel.html',
                controller: 'addNewParcelController',
                resolve: {
                    auth: function (AuthService) {
                        return AuthService.isAuthenticated();
                    }
                }
            }).
            when('/addRating/:carrier_uuid/:code_tracking', {
                templateUrl: 'add_rating.html',
                controller: 'addRatingController'
            }).
            when('/carrierRatings', {
                templateUrl: 'carrier_ratings.html',
                controller: 'carrierRatingsController'
            }).
            when('/carrierRating/:carrier_uuid', {
                templateUrl: 'carrier_rating.html',
                controller: 'carrierRatingController'
            }).
            when('/contact', {
                templateUrl: 'contact.html',
                controller: 'contactController'
            }).
            when('/flyRegistration/:carrier_uuid/:code_tracking', {
                templateUrl: 'fly_registration.html',
                controller: 'flyRegistrationController'
            }).
            when('/help', {
                templateUrl: 'help.html',
                controller: 'helpController'
            }).
            when('/locationDetails/:location_id', {
                templateUrl: 'location_details_page.html',
                controller: 'locationDetailsController'
            }).
            when('/myParcel', {
                templateUrl: 'my_parcel.html',
                controller: 'myParcelController',
                resolve: {
                    auth: function (AuthService) {
                        return AuthService.isAuthenticated();
                    }
                }
            }).
            when('/myProfile', {
                templateUrl: 'my_profile.html',
                controller: 'myProfileController',
                resolve: {
                    auth: function (AuthService) {
                        return AuthService.isAuthenticated();
                    }
                }
            }).
            when('/parcelTracking/:carrier_uuid/:code_tracking', {
                templateUrl: 'parcel_tracking_page.html',
                controller: 'parcelTrackingController'
            }).
            when('/postOfficeLocation', {
                templateUrl: 'post_office_location.html',
                controller: 'postOfficeLocationController'
            }).
            when('/signRegister', {
                templateUrl: 'sign_register.html',
                controller: 'signRegisterController'
            }).
            when('/updates', {
                templateUrl: 'updates.html',
                controller: 'updatesController',
                resolve: {
                    auth: function (AuthService) {
                        return AuthService.isAuthenticated();
                    }
                }
            }).
            when('/forgotPassword', {
                templateUrl: 'forgot_password.html',
                controller: 'forgotPasswordController'
            }).
            when('/passwordReset/:activation_key', {
                templateUrl: 'reset_password.html',
                controller: 'resetPasswordController'
            }).
            when('/logout', {
                resolve: {
                    auth: function (AuthService) {
                        return AuthService.logout();
                    }
                }
            }).
            otherwise({
                redirectTo: '/home'
            });
    }]);