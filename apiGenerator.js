var model = require('./model');
var config = require('./config');
var router = require('./router');
var routing = require('./routing');
var api_auth = require('./api_auth');

/**
 * This funcntion generates an API that is a complement of REST API.
 * @param app
 */
exports.generateApi = function (app, api_type) {

    var routes = router.Routes;

    for (var key in routes) {

        var routeEntity = routes[key];

        //If we are trying to generate a route of public API and if this route is exposed...
        if((api_type == "external-api" && routeEntity.exposePublic) || api_type == "internal-api") {

            if (routeEntity.needAuth) {
                app.route(routeEntity.routeUri)[routeEntity.action_type](api_auth.authMiddleware, routing[routeEntity.callbackFn]);
            }
            else {
                app.route(routeEntity.routeUri)[routeEntity.action_type](routing[routeEntity.callbackFn]);
            }

            console.log("Generated route : " + routeEntity.routeUri + " (" + routeEntity.action_type + ")");
        }
    }

};

/**
 * This function generates a REST Api from Mongoose models compatible with AnuglarJS services.
 */
exports.generateRESTApi = function (app, api_type) {

    var routes = generateRESTRoutingEntities();

    for (var key in routes) {

        var routeEntity = routes[key];
        var routeUri = config.values.api_root + '/' + routeEntity.modelName.toLowerCase();

        if (routeEntity.actionType == "get" || routeEntity.actionType == "update" || routeEntity.actionType == "delete") {

            routeUri += "/:_id";
        }

        //If we are trying to generate a route of public API and if this route is exposed...
        if((api_type == "external-api" && routeEntity.exposePublic) || api_type == "internal-api") {

            if (routeEntity.needAuth) {
                app.route(routeUri)[routeEntity.expressFnName](api_auth.authMiddleware, routeEntity.callbackFn(routeEntity.modelEntityName));
            }
            else {
                app.route(routeUri)[routeEntity.expressFnName](routeEntity.callbackFn(routeEntity.modelEntityName));
            }

            console.log("Generated REST route : " + routeUri + " (" + routeEntity.actionType + ")");

        }
    }
};

var generateRESTRoutingEntities = function () {

    var routes = [];
    var services = config.values.api_rest_models;

    for (var serviceKey in services) {

        var service = services[serviceKey];

        for (var methodKey in service.methods) {

            var routeEntity = {};

            var method = service.methods[methodKey];

            routeEntity.modelName = service.modelName;
            routeEntity.modelEntityName = service.modelName + 'Model';
            routeEntity.expressFnName = method.expressFnName;
            routeEntity.actionType = method.actionType;
            routeEntity.needAuth = method.needAuth;
            routeEntity.callbackFn = fnModelCallbackSet[routeEntity.actionType + 'Fn'];

            routes.push(routeEntity);

        }
    }

    return routes;
};

var fnModelCallbackSet = {

    createFn: function (model_entity_name) {

        var fn = function (req, res) {

            console.log("EXECUTE CREATE " + model_entity_name);

            console.log("API KEY IS: " + req.header('Authorization'));

            console.log(req.body);

            var Entity = new model.ModelContainer[model_entity_name](req.body);

            Entity.save(function (err, entity) {
                if (err) {
                    throw err;
                }

                res.json(entity);
            });

        };

        return fn;
    },

    updateFn: function (model_entity_name) {

        var fn = function (req, res) {

            console.log("EXECUTE UPDATE " + model_entity_name + " " + req.params._id);

            console.log("API KEY IS: " + req.header('Authorization'));

            console.log(req.body);

            model.ModelContainer[model_entity_name].findByIdAndUpdate(req.params._id, req.body, function (err, entity) {
                if (err) {
                    throw err;
                }

                res.json(entity);
            });
        };

        return fn;
    },

    deleteFn: function (model_entity_name) {

        var fn = function (req, res) {

            console.log("EXECUTE DELETE " + model_entity_name + " " + req.params._id);

            console.log("API KEY IS: " + req.header('Authorization'));

            model.ModelContainer[model_entity_name].findByIdAndRemove(req.params._id, function (err, entity) {

                if (err) {
                    throw err;
                }

                res.json(entity);

            });
        };

        return fn;
    },

    getFn: function (model_entity_name) {

        var fn = function (req, res) {

            console.log("EXECUTE GET " + model_entity_name + " " + req.params._id);

            console.log("API KEY IS: " + req.header('Authorization'));

            model.ModelContainer[model_entity_name].findById(req.params._id, function (err, entity) {

                if (err) {
                    throw err;
                }

                res.json(entity);

            });

        };

        return fn;
    },

    getAllFn: function (model_entity_name) {

        var fn = function (req, res) {

            console.log("EXECUTE GET ALL " + model_entity_name);

            console.log("API KEY IS: " + req.header('Authorization'));

            model.ModelContainer[model_entity_name].find({}, function (err, entities) {

                if (err) {
                    throw err;
                }

                res.json(entities);
            });

        };

        return fn;
    }
};