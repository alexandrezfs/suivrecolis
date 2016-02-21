var request = require('requestretry');
var querystring = require('querystring');
var parser = require('./parser');
var config = require('./config');
var monitoring = require('./monitoring');
var model = require('./model');
var caching = require('./caching');
var moment = require('moment');
var util = require('./util');

exports.requestForCachedSteps = function (carrierEntity, code_tracking, callback) {

    //Checking if this parcel is cached...
    model.ModelContainer.ParcelCacheModel.findOne({
        code_tracking: code_tracking,
        carrier_uuid: carrierEntity.uuid
    }, function (err, parcel) {

        if (parcel && parcel !== null) {

            //PARCEL CACHED !
            //FINDING STEPS...
            model.ModelContainer.StepCacheModel.find({parcel_cache_id: parcel._id}).sort([['scan_date', 'ascending']]).exec(function (err, steps) {

                //This parcel is cached. Check when if it has been updated 15 min ago.
                if (moment().subtract(15, 'minutes').toDate().getTime() > parcel.updated_at.getTime()) {

                    console.log('Parcel ' + parcel.code_tracking + ' has been cached more than 15 minutes ago. Request and reload cache !');

                    //15 minutes passed. Request !
                    requestForSteps(carrierEntity, code_tracking, function (builtResponse) {

                        //If request is OK, reply with the request response
                        if (builtResponse.statusCode == 200) {

                            //Cache this parcel
                            caching.cacheTrackingResult(code_tracking, carrierEntity.uuid, builtResponse.steps);

                            console.log('LOAD STEPS FROM REQUEST !');

                            callback(builtResponse);
                        }
                        //Otherwise, reply with cached steps even if it's > 15 minutes.
                        else {
                            console.log('LOAD STEPS FROM CACHE !');
                            callback({
                                steps: steps
                            });
                        }

                    });
                }
                else {

                    console.log('Parcel ' + parcel.code_tracking + ' is cached. Load it from the cache.');

                    //There are steps.
                    if (steps && steps.length > 0) {
                        console.log('LOAD STEPS FROM CACHE !');
                        callback({
                            steps: steps
                        });
                    }
                    //No cached steps ? Request !
                    else {
                        requestForSteps(carrierEntity, code_tracking, function (builtResponse) {
                            //Cache this parcel
                            caching.cacheTrackingResult(code_tracking, carrierEntity.uuid, builtResponse.steps);

                            console.log('LOAD STEPS FROM REQUEST !');

                            callback(builtResponse);
                        });
                    }

                }

            });

        }
        else {

            //This parcel is not cached. Forward to a real request.
            console.log('Parcel ' + code_tracking + ' is not cached. Load it from request, then cache it.');

            requestForSteps(carrierEntity, code_tracking, function (builtResponse) {
                //Cache this parcel
                caching.cacheTrackingResult(code_tracking, carrierEntity.uuid, builtResponse.steps);

                console.log('LOAD STEPS FROM REQUEST !');

                callback(builtResponse);
            });
        }

    });
};

var requestForSteps = function (carrierEntity, code_tracking, callback) {

    //Perform request
    request(
        RequestBuilder.buildRequestParams(carrierEntity, code_tracking),
        function (error, response, body) {

            /**
             * [builtResponse] can be null. In this case, the request couldn't be called (networking issue)
             * It can not be null, but without [steps]. In this case there may be a parsing problem.
             * It can not be null, but with an [error] and a [statusCode] other than 200 (success).
             * In theses 3 cases we'll notify the webmaster.
             * We'll reply only if [steps] exists.
             */

            //Building a consistent response object with request response
            var builtResponse = RequestBuilder.buildResponse(carrierEntity, error, response, body);

            //If no steps were detected, there may be a parsing error.
            //We'll notify the webmaster in this case
            if (!builtResponse.steps || builtResponse.steps.length === 0) {
                monitoring.registerParcelMonitNotification(carrierEntity, code_tracking, builtResponse);
            }
            else if (builtResponse.statusCode != 200) {
                //A problem has been detected with the request itself.
                monitoring.registerParcelMonitNotification(carrierEntity, code_tracking, builtResponse);
            }

            //We'll reply in any case
            callback(builtResponse);

        });

};

exports.requestForSteps = requestForSteps;

var RequestBuilder = {

    buildRequestParams: function (carrierEntity, code_tracking) {

        var default_params = carrierEntity.request_params.default_call_params;
        var proxyToConnect = config.values.proxies[Math.floor(Math.random() * config.values.proxies.length)];
        console.log('Using proxy : ' + proxyToConnect);

        if (carrierEntity.request_params.call_method == "POST") {

            var postParams = {};
            postParams.uri = carrierEntity.request_params.call_uri;
            postParams.method = carrierEntity.request_params.call_method;
            postParams.form = default_params ? default_params : {};
            postParams.form[carrierEntity.request_params.tracker_code_call_param_name] = code_tracking;
            postParams.maxAttempts = 5;   // (default) try 5 times
            postParams.retryDelay = 1000;  // (default) wait for 5s before trying again
            postParams.retryStrategy = request.RetryStrategies.HTTPOrNetworkError; // (default) retry on 5xx or network errors

            //postParams.proxy = proxyToConnect;

            return postParams;

        }
        else if (carrierEntity.request_params.call_method == "GET") {

            var options = {};

            var getParams = carrierEntity.request_params.default_call_params;

            if (carrierEntity.request_params.default_call_params) {
                getParams = carrierEntity.request_params.default_call_params;
            }
            else {
                getParams = {};
            }

            getParams[carrierEntity.request_params.tracker_code_call_param_name] = code_tracking;

            var finalUri = (carrierEntity.request_params.call_uri += "?" + querystring.stringify(getParams));

            options.url = finalUri;
            options.maxRedirects = 100;
            options.maxAttempts = 5;   // (default) try 5 times
            options.retryDelay = 1000;  // (default) wait for 5s before trying again
            options.retryStrategy = request.RetryStrategies.HTTPOrNetworkError; // (default) retry on 5xx or network errors

            options.headers = {
                'User-Agent': config.values.fake_user_agent
            };
            options.timeout = config.values.request_timeout;
            //options.proxy = proxyToConnect;

            return options;
        }

    },

    buildResponse: function (carrierEntity, error, response, body) {

        var responseObject = {};

        if (!response) {
            responseObject.error = "Object request is NULL";
            responseObject.statusCode = 404;
        }
        else {
            responseObject.error = error;
            responseObject.statusCode = response.statusCode;

            if (!error && response.statusCode == 200) {

                var parseFnName = parser.getParseFnName(carrierEntity.uuid);
                var parseFn = parser.Parser[parseFnName];

                var steps = [];
                try {
                    steps = parseFn(body);
                }
                catch (err) {
                    console.log(err);
                }

                //Ordering steps by date
                steps = util.UtilEntity.sortStepsByScanDate(steps);
                responseObject.steps = steps;
            }
            else {
                responseObject.error = 'No steps detected. Please verify the parsing function of this carrier.';
            }
        }

        return responseObject;

    }

};