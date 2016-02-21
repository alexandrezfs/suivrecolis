var model = require('./model');
var config = require('./config');

exports.authMiddleware = function (req, res, next) {

    var api_key;

    if (req.header('Authorization')) {
        api_key = req.header('Authorization');
    }
    else {
        try {
            res.json({message: 'API KEY NOT RECOGNIZED'});
        } catch (Exception) {
        }
    }

    if (api_key == config.values.anonymous_api_key) {
        next();
    }
    else {

        //Looking for an existing API key...
        model.ModelContainer.UserModel.findOne({api_key: api_key}, function (err, user) {

            if (err || !user) {
                try {
                    res.json({message: 'API KEY NOT RECOGNIZED'});
                } catch (Exception) {
                }
            }
            else {
                console.log("AUTHORIZATION ACCEPTED !");
                next();
            }

        });
    }
};