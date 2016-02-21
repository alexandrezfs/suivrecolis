var notification_center = require("./notification_center");
var model = require("./model");
var config = require("./config");
var moment = require('moment');

/**
 * This command will be called by the server every x minutes
 */
exports.runCron = function () {

    callFn();

    setInterval(function () {
        callFn();
    }, config.values.cron_frequency * 60000);
};

var callFn = function () {
    console.log("Running cron task...");

    model.ModelContainer.ParcelModel.find({receive_notification: true, is_deleted: false, created_at: {"$gte": moment().subtract(30, 'days').toDate()}}, function (err, parcels) {

        var timeToSpendPerParcel = getTimePerParcel(parcels.length);
        var timeToSpendPerParcelCron = 0;

        for (var i = 0; i < parcels.length; i++) {

            var parcel = parcels[i];

            setTimeoutParcelScan(parcel, timeToSpendPerParcelCron);
            timeToSpendPerParcelCron += timeToSpendPerParcel;
        }

    });
};

var setTimeoutParcelScan = function(parcel, timeToSpendPerParcel) {

    console.log('setTimeout running parcel scan... timeToSpendPerParcel ===> ' + timeToSpendPerParcel);

    setTimeout(function() {
        runParcelScan(parcel);
    }, timeToSpendPerParcel);

};

var runParcelScan = function(parcel) {

    notification_center.parcelScanDifferent(parcel._id);
};

var getTimePerParcel = function(parcelsCount) {

    var frequencyInMillisec = config.values.cron_frequency * 60000;
    var timeToSpendPerParcel = Math.ceil(frequencyInMillisec / parcelsCount);

    return timeToSpendPerParcel; //In milliseconds
};