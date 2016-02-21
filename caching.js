var model = require("./model");
var config = require("./config");
var moment = require('moment');
var request_interface = require('./request_interface');

//Start cron
exports.runCron = function() {

    callFn();

    setInterval(function() {
        callFn();
    }, config.values.cron_cache_frequency * 60000);

};

//Cache tracking results
var cacheTrackingResult = function(code_tracking, carrier_uuid, steps) {

    console.log('Trying to cache parcel ==> ' + code_tracking + " +++++ " + carrier_uuid);

    if(!steps || (steps && steps.length === 0)) {console.log('cache ==> no steps to renew'); return;}

    model.ModelContainer.ParcelCacheModel.findOne({code_tracking: code_tracking, carrier_uuid: carrier_uuid}, function(err, cachedParcel) {

        if(!cachedParcel) {

            console.log('Parcel ' + code_tracking + ' ' + carrier_uuid + ' is not cached. Will cache it now.');

            //Parcel not cached.
            var parcel = {
                code_tracking: code_tracking,
                carrier_uuid: carrier_uuid
            };

            new model.ModelContainer.ParcelCacheModel(parcel).save(function(err, savedCachedParcel) {

                //Register steps
                steps.forEach(function(step) {
                    step.parcel_cache_id = savedCachedParcel._id;
                });

                model.ModelContainer.StepCacheModel.create(steps);

                console.log('Parcel ' + code_tracking + ' ' + carrier_uuid + ' has successfully been cached.');
            });
        }
        else {

            console.log('Parcel ' + code_tracking + ' ' + carrier_uuid + ' is cached. Renew steps...');

            //Parcel cached. Remove steps...
            model.ModelContainer.StepCacheModel.remove({parcel_cache_id: cachedParcel._id}, function(err) {

                steps.forEach(function(step) {
                    step.parcel_cache_id = cachedParcel._id;
                });

                //Update updated_at...
                cachedParcel.updated_at = moment().toDate();
                cachedParcel.save();

                console.log('Parcel ' + code_tracking + ' ' + carrier_uuid + ' caching reloaded !');

                //Register new steps
                model.ModelContainer.StepCacheModel.create(steps);
            });
        }
    });
};

exports.cacheTrackingResult = cacheTrackingResult;

var queryForCachedParcel = function(parcel) {

    //Get the carrier and use request_interface to query
    model.ModelContainer.CarrierModel.findOne({uuid: parcel.carrier_uuid}, function(err, carrier) {

        if(carrier) {
            request_interface.requestForSteps(carrier, parcel.code_tracking, function (response) {
                if(response.steps) {
                    //If query succeed, cache it.
                    cacheTrackingResult(parcel.code_tracking, carrier.uuid, response.steps);
                }
            });
        }
    });
};

var setTimeoutCacheParcel = function(parcel, timeToSpendPerParcel) {

    console.log('setTimeout running parcel cache... timeToSpendPerParcel ===> ' + timeToSpendPerParcel + "===" + parcel.code_tracking);

    setTimeout(function() {
        //Query a parcel for steps
        queryForCachedParcel(parcel);
    }, timeToSpendPerParcel);
};

//Loop over cached parcels and update them.
var callFn = function() {

    //Only select parcels registered in the last 30 days
    model.ModelContainer.ParcelCacheModel.find({created_at: {"$lt": moment().add(1, 'days').toDate(), "$gte": moment().subtract(30, 'days').toDate()}}, function(err, cachedParcels) {

        if(cachedParcels) {

            var timeToSpendPerParcel = getTimePerParcel(cachedParcels.length);
            var timeToSpendPerParcelCount = 0;

            for (var i = 0; i < cachedParcels.length; i++) {

                var parcel = cachedParcels[i];

                setTimeoutCacheParcel(parcel, timeToSpendPerParcelCount);
                timeToSpendPerParcelCount += timeToSpendPerParcel;
            }
        }

    });
};

var getTimePerParcel = function(parcelsCount) {

    var frequencyInMillisec = config.values.cron_cache_frequency * 60000;
    var timeToSpendPerParcel = Math.ceil(frequencyInMillisec / parcelsCount);

    return timeToSpendPerParcel; //In milliseconds
};