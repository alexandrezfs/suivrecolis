/**
 * App initializer
 * @type {exports}
 */
var express = require('express');
var app = module.exports.app = express();
var appApi = module.exports.app = express();
var server = require('http').Server(app);
var serverApi = require('http').Server(appApi);
var bodyParser = require('body-parser');
var config = require('./config');
var routing = require('./routing');
var apiGenerator = require('./apiGenerator');
var cron = require('./cron');
var monitoring = require('./monitoring');
var caching = require('./caching');
var resource = require('./resource');

/**
 * App settings
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
appApi.use(bodyParser.json());
appApi.use(bodyParser.urlencoded({extended: true}));

/**
 * Generating REST API
 */

if (config.values.enable_api) {
    apiGenerator.generateRESTApi(appApi, "external-api");
    apiGenerator.generateApi(appApi, "external-api");
}

if (config.values.enable_website) {

    app.use(express.static(__dirname + '/public'));

    /**
     * GENERATE ENTRY POINT FOR ALL ROUTES
     */

    resource.frontRoutes.forEach(function (route) {
        app.route(route).get(routing.entryPointRoute);
    });

    apiGenerator.generateRESTApi(app, "internal-api");
    apiGenerator.generateApi(app, "internal-api");

    //Redirect no 200 status to /
    app.use(function(req, res, next) {
        if(res.status != 200) {
            res.redirect('/');
        }
    });
}

/**
 * RUNNING CRON
 */

if(config.values.enable_notif_cron) {
    cron.runCron();
}

/**
 * RUNNING MONITORING CRON
 */

if(config.values.enable_monit_cron) {
    monitoring.runCron();
}

/**
 * RUNNING CACHING CRON
 */

if(config.values.enable_caching_cron) {
    caching.runCron();
}

/**
 * LISTEN SERVER
 */
server.listen(config.values.server_port, function () {
    console.log("WEBSITE Listening on " + config.values.server_port);
});

serverApi.listen(config.values.api_server_port, function () {
    console.log("API Listening on " + config.values.api_server_port);
});