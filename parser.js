var cheerio = require('cheerio');
var moment = require('moment');
var util = require('./util');

exports.getParseFnName = function (uuid) {

    return ("parse" + util.UtilEntity.capitaliseFirstLetter(uuid));
};

/**
 * Add a parser method to this object to add a new carrier parser
 * The name MUST begin by "parse" in camelCase mode.
 */
exports.Parser = {

    parseTnt: function (body) {

        var $ = cheerio.load(body);
        var steps = [];

        $('.result__content').find('.roster').each(function (i, row) {

            var step = {};
            var scanDate = "";

            $(this).find(".roster__item").each(function (u, cell) {

                if (u === 0) {

                    step.status = $(cell).text().replace(/\n/g, "").replace(/\t/g, "").replace(/\\/g, "").trim();
                    step.step_level = util.UtilEntity.stepLevelConverter(step.status);
                }
                else if (u === 1) {
                    scanDate += $(cell).text().trim();
                }
                else if (u === 2) {
                    step.location = $(cell).text().length === 0 ? "Pas de localisation" : $(cell).text().trim();
                }
            });

            //converting date
            var formattedScanDate = moment(scanDate, "DD/MM/YYYY hh:mm").toDate();

            step.scan_date = formattedScanDate;

            console.log(step.location);

            if (step.location && step.status && step.scan_date) {
                steps.push(step);
            }

        });

        return steps;
    },
    parseDpd: function (body) {

        var steps = [];

        body = body.slice(6);
        body = body.substring(1, body.length - 1);

        var json = JSON.parse(body);

        var unformattedSteps = json.TrackingStatusJSON.statusInfos;

        var steps = [];

        unformattedSteps.forEach(function(unformattedStep) {

            var step = {};
            step.location = unformattedStep.city;

            var scanDate = unformattedStep.date + " " + unformattedStep.time;
            step.scan_date = moment(scanDate, "DD/MM/YYYY hh:mm").toDate();

            if(unformattedStep.contents && unformattedStep.contents.length > 0) {
                step.status = unformattedStep.contents[0].label;
                step.step_level = util.UtilEntity.stepLevelConverter(step.status);
            }
            else {
                step.step_level = 0;
            }

            steps.push(step);

        });

        return steps;
    },
    parseColissimo: function (body) {

        console.log("body:" + body);


        var stepsFromApi = JSON.parse(body);
        var steps = [];


        stepsFromApi.forEach(function (stepFromApi) {

            var newStep = {
                status: stepFromApi.message,
                step_level: util.UtilEntity.stepLevelConverter(stepFromApi.message),
                scan_date: moment(stepFromApi.date, "DD/MM/YYYY").toDate(),
                location: stepFromApi.lieu
            };


            //Little hack to keep step 3 at the end
            if (newStep.step_level == 3) {
                newStep.scan_date = moment(newStep.scan_date.getTime()).add(1, 'minutes');
            }

            steps.push(newStep);
        });

        return steps;
    }

};