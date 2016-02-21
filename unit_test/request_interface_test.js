var requestInterface = require("../request_interface");
var model = require('../model');

console.log("---REQUEST INTERFACE UNIT TEST---");

var trackingCode;

model.CarrierModel.find({}, function (err, carriers) {

    console.log(carriers.length + " found.");

    carriers.forEach(function (carrier) {

        console.log("fetching " + carrier);

        if (carrier.uuid == "sapo") {
            trackingCode = "PE817071802ZA";
        }
        else if (carrier.uuid == "tnt") {
            trackingCode = "GD358968683WW";
        }
        else if (carrier.uuid == "dcb") {
            trackingCode = "100041357";
        }

        requestInterface.requestForSteps(carrier, trackingCode, function (response) {

            console.log(response.steps);

        });

    });

});