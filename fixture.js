var model = require('./model');
var config = require('./config');

exports.reloadCarriers = function () {

    model.ModelContainer.CarrierModel.remove({}, function (err) {

        console.log("Cleanup Carriers list");

        var carriers = config.values.carriers;

        model.ModelContainer.CarrierModel.create(carriers, function (err, jellybean, snickers) {
            process.exit();
        });
    });

};

exports.reloadOfficeLocations = function() {

    model.ModelContainer.OfficeLocationModel.remove({}, function(err) {

        console.log("Cleanup OfficeLocations list");

        var posts_locations = config.values.posts_locations;

        model.ModelContainer.OfficeLocationModel.create(posts_locations, function (err, jellybean, snickers) {
            process.exit();
        });
    });

};