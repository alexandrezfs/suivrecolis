var config = require('./config');

exports.Routes = [
    {
        routeUri: config.values.api_root + '/public/trackIt/:carrier_uuid/:code_tracking',
        callbackFn: 'getStepsFromCarrierPublic',
        action_type: 'get',
        needAuth: false, //Oauth only access, without user context. We disable user auth in this case
        exposePublic: true
    },
    {
        routeUri: config.values.api_root + '/trackIt/:carrier_uuid/:code_tracking',
        callbackFn: 'getStepsFromCarrier',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/user/register',
        callbackFn: 'registerUser',
        action_type: 'post',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/user/authenticate',
        callbackFn: 'authenticateUser',
        action_type: 'post',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/user/activate/:activation_key',
        callbackFn: 'activateUser',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/user/byactivationkey/:activation_key',
        callbackFn: 'getUserByActivationKey',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/region/bycountry/:country',
        callbackFn: 'getRegionsByCountry',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/city/bycountryregion/:country/:region',
        callbackFn: 'getCitiesByCountryRegion',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/carrier/uuid/:carrier_uuid',
        callbackFn: 'getCarrierByUuid',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/parcels/byuser/:user_id',
        callbackFn: 'getParcelsByUser',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/parcels/byuser/andcarrieruuid/andtrackingcode',
        callbackFn: 'getParcelByUser',
        action_type: 'post',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/parcels/byuser/bycarrieruuid/bytrackingcode',
        callbackFn: 'getParcelsByCodeAndCarrierAndUser',
        action_type: 'post',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/notifications/byuser/:user_id',
        callbackFn: 'getNotificationsByUser',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/user/changepassword',
        callbackFn: 'changeUserPassword',
        action_type: 'post',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/ratingdata/surveys',
        callbackFn: 'getRatingSurveys',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/ratingdata/bycarrier/:carrier_uuid',
        callbackFn: 'getRatingByCarrier',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/parcels/setdeleted',
        callbackFn: 'deleteParcel',
        action_type: 'post',
        needAuth: true,
        exposePublic: false
    },

    {
        routeUri: config.values.api_root + '/userdata/byemail/:email',
        callbackFn: 'getUserByEmail',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/contact/send',
        callbackFn: 'sendContactEmail',
        action_type: 'post',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/postslocations',
        callbackFn: 'getPostsLocations',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/postslocations/bycarrier/:carrier_uuid',
        callbackFn: 'getPostsLocationsByCarrierUuid',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/postslocations/bytext',
        callbackFn: 'getPostsLocationsByText',
        action_type: 'post',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/postslocations/:_id',
        callbackFn: 'getPostLocationById',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/user/password/recover/:email',
        callbackFn: 'sendPasswordRecovering',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/user/passwordReset',
        callbackFn: 'passwordReset',
        action_type: 'post',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/user/update/:_id',
        callbackFn: 'updateProfile',
        action_type: 'put',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/parcel/:_id',
        callbackFn: 'updateParcel',
        action_type: 'put',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/parcel',
        callbackFn: 'createParcel',
        action_type: 'post',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/parcel/rate',
        callbackFn: 'rateParcel',
        action_type: 'post',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/activationemail/resend/:user_id',
        callbackFn: 'sendActivationEmail',
        action_type: 'get',
        needAuth: true,
        exposePublic: false
    },
    {
        routeUri: config.values.api_root + '/user/byapikey/:api_key',
        callbackFn: 'getUserFromApiKey',
        action_type: 'get',
        needAuth: false,
        exposePublic: false
    }
];