var fixture = require('./fixture');
var model = require('./model');
var requestInterface = require("./request_interface");
var util = require("./util");
var cron = require("./cron");

/**
 * COMMAND MANAGER
 * @type {{displayHelp: displayHelp, requestCarrier: requestCarrier}}
 */
var TrackCommand = {

    displayHelp: function () {

        console.log(
            "--COMMANDS--\n" +
            "carrier:reload [Reloading carriers in mongoDB]\n" +
            "officeLocation:reload [Reloading officeLocation in mongoDB]\n" +
            "carrier:request <carrier_uuid> <code_tracking>\n" +
            "location:reload [Reloading locations]\n" +
            "cron:run [Running steps analyzer]\n"
        );

        process.exit(1);

    },

    requestCarrier: function (carrier_uuid, code_tracking, callback) {

        model.ModelContainer.CarrierModel.findOne({uuid: carrier_uuid}, function (err, carrier) {

            requestInterface.requestForSteps(carrier, code_tracking, function (response) {

                callback(response.steps);

            });

        });

    }

};

/**
 * CMD WORKFLOW
 */
if (process.argv[2]) {

    if (process.argv[2] == "carrier:reload") {
        fixture.reloadCarriers();
    }
    else if (process.argv[2] == "officeLocation:reload") {
        fixture.reloadOfficeLocations();
    }
    else if (process.argv[2] == "carrier:request" && process.argv.length > 3) {

        var carrier_uuid = process.argv[3];
        var code_tracking = process.argv[4];

        TrackCommand.requestCarrier(carrier_uuid, code_tracking, function (response) {

            console.log("---START QUERYING---");
            console.log(response);
            console.log("---END---");

        });
    }
    else if(process.argv[2] == "location:reload") {
        util.UtilEntity.registerLocationData();
    }
    else if(process.argv[2] == "cron:run") {
        cron.runCron();
    }
    else {
        TrackCommand.displayHelp();
    }

}
else {
    TrackCommand.displayHelp();
}