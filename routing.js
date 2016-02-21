var model = require('./model');
var request_interface = require('./request_interface');
var resource = require('./resource');
var bcrypt = require('bcrypt');
var config = require('./config');
var email_interface = require('./email_interface');
var request = require('request');
var clone = require('clone');
var uuid = require('node-uuid');
var crypto = require('crypto');
var moment = require('moment');

exports.entryPointRoute = function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
};

exports.getStepsFromCarrierPublic = function (req, res) {

    console.log(req.params);

    //query auth server to check if request is authorized

    request({
        url: config.values.auth_server_url + '/api/test',
        headers: {
            'Authorization': req.header('Authorization')
        }
    }, function (error, response, body) {

        var info = JSON.parse(body);

        if (!info.isValid) {
            res.json({message: 'OAUTH TOKEN ACCESS NOT VALID'});
            return;
        }

        var carrier_uuid = req.params.carrier_uuid;
        var code_tracking = req.params.code_tracking;

        if (carrier_uuid && code_tracking) {
            model.ModelContainer.CarrierModel.findOne({uuid: carrier_uuid}, function (err, carrier) {

                if (carrier) {
                    request_interface.requestForCachedSteps(carrier, code_tracking, function (response) {
                        res.json(response);
                    });
                }
                else {
                    res.json(resource.ApiMessages['404']);
                }

            });
        }
        else {
            res.json(resource.ApiMessages['404']);
        }

    });
};

exports.getStepsFromCarrier = function (req, res) {

    console.log(req.params);

    var carrier_uuid = req.params.carrier_uuid;
    var code_tracking = req.params.code_tracking;

    if (carrier_uuid && code_tracking) {
        model.ModelContainer.CarrierModel.findOne({uuid: carrier_uuid}, function (err, carrier) {

            if (carrier) {
                request_interface.requestForCachedSteps(carrier, code_tracking, function (response) {
                    res.json(response);
                });
            }
            else {
                res.json(resource.ApiMessages['404']);
            }

        });
    }
    else {
        res.json(resource.ApiMessages['404']);
    }
};

exports.registerUser = function (req, res) {

    //If it match with anonymous token
    var token = req.header('Authorization');

    if (token != config.values.anonymous_api_key) {
        res.json({message: 'ACCESS DENIED'});
        return;
    }

    var userEntity = req.body;

    bcrypt.hash(userEntity.password, 10, function (err, hash) {

        console.log(userEntity);

        userEntity.password = hash;
        userEntity.activation_key = uuid.v4();
        userEntity.api_key = uuid.v4();

        var userModel = new model.ModelContainer.UserModel(userEntity);

        userModel.save(function (err, userData) {
            if (err) {
                res.json(resource.ApiMessages['500']);
            }
            else {

                var confirm_addr = config.values.frontend_url + "/home?activation_key=" + userData.activation_key;

                email_interface.sendMailWithTemplate(
                    "",
                    "",
                    config.values.mandrill_templates['account-confirmation'].name,
                    config.values.email_system_address,
                    "SuivreColis",
                    userData.email,
                    config.values.mandrill_templates['account-confirmation'].slug,
                    resource.emailMessages.getRegisterContent(confirm_addr, userData.firstname),
                    function (response) {

                        console.log(response);

                        res.json({
                            user: userData,
                            response: "register success"
                        });
                    });
            }
        });
    });
};

exports.getUserByEmail = function (req, res) {

    //If it match with anonymous token
    var token = req.header('Authorization');

    if (token != config.values.anonymous_api_key) {
        res.json({message: 'ACCESS DENIED'});
        return;
    }

    model.ModelContainer.UserModel.findOne({email: req.params.email}, function (err, user) {
        res.json(user);
    });

};

exports.changeUserPassword = function (req, res) {

    var user_id = req.body.user_id;

    model.ModelContainer.UserModel.findOne({_id: user_id}, function (err, user) {

        //Authorize if token matches with user_id
        var token = req.header('Authorization');

        if (token != user.api_key) {
            console.log("API KEY REFUSED " + token + " != " + user.api_key);

            console.log(user);
            res.json({message: 'ACCESS DENIED'});
            return;
        }
        //End authorization

        bcrypt.hash(req.body.password, 10, function (err, hash) {

            user.password = hash;

            user.save(function (err) {

                email_interface.sendMail(
                    resource.emailMessages.getChangePasswordMessage("html", user.firstname, user.lastname),
                    resource.emailMessages.getChangePasswordMessage("text", user.firstname, user.lastname),
                    "[SuivreColis] Vous avez changé votre mot de passe",
                    config.values.email_system_address,
                    "SuivreColis",
                    user.email,
                    function (response) {

                        console.log(response);

                        res.json({
                            message: "success"
                        });
                    });

            });

        });

    });

};

exports.authenticateUser = function (req, res) {

    var password = req.body.password;
    var email = req.body.email;

    model.ModelContainer.UserModel.findOne({email: email}, function (err, user) {
            if (err) {
                res.json({
                    user: null,
                    response: "could not authenticate you"
                });
            }
            else if (password && email && user) {

                if (!user.is_active) {

                    res.json({
                        user: user,
                        response: "user not activated"
                    });

                }
                else {

                    model.ModelContainer.ParcelModel.find({user_id: user._id}, function (err, parcels) {

                        var parcels_count;

                        if (!parcels) {
                            parcels_count = 0;
                        }
                        else {
                            parcels_count = parcels.length;
                        }

                        //Getting parcels_count

                        if (crypto.createHash('sha1').update(password).digest("hex") == user.password) {

                            //Update login date
                            user.last_login = new Date();
                            user.save();

                            res.json({
                                user: user,
                                parcels_count: parcels_count,
                                response: "success"
                            });
                        }
                        else {

                            bcrypt.compare(password, user.password, function (err, result) {

                                if (err) {
                                    throw (err);
                                }

                                console.log(result);

                                if (result === true) {

                                    //Update login date
                                    user.last_login = new Date();
                                    user.save();

                                    res.json({
                                        user: user,
                                        parcels_count: parcels_count,
                                        response: "success"
                                    });
                                }
                                else {
                                    res.json({
                                        user: null,
                                        response: "password dismatch"
                                    });
                                }

                            });
                        }

                    });

                }

            }
            else {
                res.json({
                    user: null,
                    response: "Wrong data provided"
                });
            }
        }
    );
};

exports.getRegionsByCountry = function (req, res) {

    var country = req.params.country;

    model.ModelContainer.RegionModel.find({country: country}, function (err, regions) {

        if (err) {
            throw err;
        }

        res.json(regions);

    });

};

exports.getCitiesByCountryRegion = function (req, res) {

    var region = req.params.region;
    var country = req.params.country;

    model.ModelContainer.CityModel.find({region: region, country: country}, function (err, countries) {

        if (err) {
            throw err;
        }

        res.json(countries);
    });

};

exports.getCarrierByUuid = function (req, res) {

    model.ModelContainer.CarrierModel.findOne({uuid: req.params.carrier_uuid}, function (err, carrier) {

        if (err) {
            throw err;
        }

        res.json(carrier);
    });

};

exports.getParcelsByUser = function (req, res) {

    var user_id = req.params.user_id;

    //Auhtorize if api_key matches with user_id
    model.ModelContainer.UserModel.findOne({_id: user_id}, function (err, user) {

        //Authorize if token matches with user_id
        var token = req.header('Authorization');

        if (token != user.api_key) {
            console.log("API KEY REFUSED " + token + " != " + user.api_key);

            console.log(user);
            res.json({message: 'ACCESS DENIED'});
            return;
        }
        //End authorization

        model.ModelContainer.ParcelModel.find({
            user_id: user_id,
            is_deleted: false
        }, function (err, parcels) {
            res.json(parcels);
        });
    });

};

exports.getNotificationsByUser = function (req, res) {

    var user_id = req.params.user_id;

    //Auhtorize if api_key matches with user_id
    model.ModelContainer.UserModel.findOne({_id: user_id}, function (err, user) {

        //Authorize if token matches with user_id
        var token = req.header('Authorization');

        if (token != user.api_key) {
            console.log("API KEY REFUSED " + token + " != " + user.api_key);

            console.log(user);
            res.json({message: 'ACCESS DENIED'});
            return;
        }
        //End authorization

        model.ModelContainer.NotificationModel.find({user_id: user_id}).sort([['created_at', 'descending']]).exec(function (err, notifications) {
            res.json(notifications);
        });
    });

};

exports.getRatingSurveys = function (req, res) {

    res.json(resource.ratingDataSurveys);

};

exports.getRatingByCarrier = function (req, res) {

    model.ModelContainer.RatingModel.find({carrier_uuid: req.params.carrier_uuid}).sort([['created_at', 'descending']]).exec(function (err, ratings) {
        res.json(ratings);
    });

};

exports.deleteParcel = function (req, res) {

    var parcel_id = req.body.parcel_id;

    //Auhtorize if api_key matches with user_id
    model.ModelContainer.ParcelModel.findOne({_id: parcel_id}, function (err, parcel) { //find parcel

        model.ModelContainer.UserModel.findOne({_id: parcel.user_id}, function (err, user) { //then find user

            //Authorize if token matches with user_id
            var token = req.header('Authorization');

            if (token != user.api_key) {
                console.log("API KEY REFUSED " + token + " != " + user.api_key);

                console.log(user);
                res.json({message: 'ACCESS DENIED'});
                return;
            }
            //End authorization

            model.ModelContainer.ParcelModel.findByIdAndUpdate(parcel_id, {is_deleted: true}, function (err) {

                if (!err) {

                    //removing all notifications
                    model.ModelContainer.NotificationModel.remove({parcel_id: parcel_id}, function (err) {
                        res.json({
                            message: "success"
                        });
                    });

                }
                else {
                    res.json({
                        message: "error"
                    });
                }
            });

        });
    });

};

exports.sendContactEmail = function (req, res) {

    //If it match with anonymous token
    var token = req.header('Authorization');

    if (token != config.values.anonymous_api_key) {
        res.json({message: 'ACCESS DENIED'});
        return;
    }

    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.lastname;
    var subject = req.body.subject;
    var message = req.body.message;

    email_interface.sendMail(
        resource.emailMessages.getContactMessage("html", firstname, lastname, email, subject, message),
        resource.emailMessages.getContactMessage("text", firstname, lastname, email, subject, message),
        "SuivreColis: " + subject + " by " + firstname + " " + lastname,
        config.values.email_system_address,
        "SuivreColis",
        config.values.contact_email,
        function (response) {

            console.log(response);

            res.json({
                message: req.body,
                response: "send success"
            });
        });
};

exports.getPostsLocations = function (req, res) {

    model.ModelContainer.OfficeLocationModel.find({}, function (err, locations) {
        res.json(locations);
    });
};

exports.getPostsLocationsByCarrierUuid = function (req, res) {

    model.ModelContainer.OfficeLocationModel.find({carrier_uuid: req.params.carrier_uuid}, function (err, locations) {
        res.json(locations);
    });
};

exports.getPostsLocationsByText = function (req, res) {

    model.ModelContainer.OfficeLocationModel.find({location: {$regex: ".*" + req.body.text + ".*"}}, function (err, locations) {
        res.json(locations);
    });
};

exports.getParcelsByCodeAndCarrierAndUser = function (req, res) {

    var user_id = req.body.user_id;

    model.ModelContainer.UserModel.findOne({_id: user_id}, function (err, user) { //then find user

        //Authorize if token matches with user_id
        var token = req.header('Authorization');

        if (token != user.api_key) {
            console.log("API KEY REFUSED " + token + " != " + user.api_key);

            console.log(user);
            res.json({message: 'ACCESS DENIED'});
            return;
        }
        //End authorization

        model.ModelContainer.ParcelModel.findOne({
            carrier_uuid: req.body.carrier_uuid,
            code_tracking: req.body.code_tracking,
            user_id: user_id
        }, function (err, parcel) {
            res.json(parcel);
        });
    });
};

exports.activateUser = function (req, res) {

    model.ModelContainer.UserModel.findOneAndUpdate({activation_key: req.params.activation_key}, {is_active: true}, function (err, user) {

        if (!err) {

            email_interface.sendMailWithTemplate(
                "",
                "",
                config.values.mandrill_templates['account-activated'].name,
                config.values.email_system_address,
                "SuivreColis",
                user.email,
                config.values.mandrill_templates['account-activated'].slug,
                resource.emailMessages.getUserActivatedContent(user.email, user.firstname),
                function (response) {

                    console.log(response);

                    res.json({
                        message: "success"
                    });
                });
        }
        else {
            res.json({
                message: "error"
            });
        }
    });

};

exports.getParcelByUser = function (req, res) {

    var user_id = req.body.user_id;
    var code_tracking = req.body.code_tracking;
    var carrier_uuid = req.body.carrier_uuid;

    model.ModelContainer.UserModel.findOne({_id: user_id}, function (err, user) { //then find user

        //Authorize if token matches with user_id
        var token = req.header('Authorization');

        if (token != user.api_key) {
            console.log("API KEY REFUSED " + token + " != " + user.api_key);

            console.log(user);
            res.json({message: 'ACCESS DENIED'});
            return;
        }
        //End authorization

        model.ModelContainer.ParcelModel.findOne({
            carrier_uuid: carrier_uuid,
            code_tracking: code_tracking,
            user_id: user_id
        }, function (err, parcel) {

            if (!err) {
                res.json(parcel);
            }
            else {
                res.json({
                    message: "error"
                });
            }

        });
    });
};

exports.sendPasswordRecovering = function (req, res) {

    //If it match with anonymous token
    var token = req.header('Authorization');

    if (token != config.values.anonymous_api_key) {
        res.json({message: 'ACCESS DENIED'});
        return;
    }

    var email = req.params.email;

    model.ModelContainer.UserModel.findOne({email: email}, function (err, user) {

        if (!user) {
            res.json({
                message: "user.does.not.exists"
            });
        }
        else {

            var change_url = config.values.frontend_url + "/passwordReset/" + user.activation_key;

            email_interface.sendMailWithTemplate(
                "",
                "",
                config.values.mandrill_templates['password-reset-link'].name,
                config.values.email_system_address,
                "SuivreColis",
                email,
                config.values.mandrill_templates['password-reset-link'].slug,
                resource.emailMessages.getChangePasswordTemplateContent(change_url, email),
                function (response) {

                    console.log(response);

                    res.json({
                        user: user,
                        message: "success"
                    });
                });

        }

    });
};

exports.passwordReset = function (req, res) {

    //If it match with anonymous token
    var token = req.header('Authorization');

    if (token != config.values.anonymous_api_key) {
        res.json({message: 'ACCESS DENIED'});
        return;
    }

    var password = req.body.password;
    var activation_key = req.body.activation_key;

    model.ModelContainer.UserModel.findOne({activation_key: activation_key}, function (err, user) {

        if (!user) {
            res.json({
                message: "user.does.not.exists"
            });
        }
        else {

            bcrypt.hash(password, 10, function (err, hash) {

                user.password = hash;
                user.activation_key = uuid.v4();

                user.save(function (err) {

                    email_interface.sendMailWithTemplate(
                        "",
                        "",
                        config.values.mandrill_templates['password-reset'].name,
                        config.values.email_system_address,
                        "SuivreColis",
                        user.email,
                        config.values.mandrill_templates['password-reset'].slug,
                        resource.emailMessages.getChangePasswordSuccessTemplateContent(user.email),
                        function (response) {

                            console.log(response);

                            res.json({
                                message: "success"
                            });
                        });

                });

            });

        }

    });

};

exports.getUserByActivationKey = function (req, res) {

    var activation_key = req.params.activation_key;

    model.ModelContainer.UserModel.findOne({activation_key: activation_key}, function (err, user) {
        res.json(user);
    });
};

exports.updateProfile = function (req, res) {

    var _id = req.params._id;
    var userEntity = req.body;

    if (_id && userEntity) {

        model.ModelContainer.UserModel.findOne({_id: _id}, function (err, user) { //then find user

            //Authorize if token matches with user_id
            var token = req.header('Authorization');

            if (token != user.api_key) {
                console.log("API KEY REFUSED " + token + " != " + user.api_key);

                console.log(user);
                res.json({message: 'ACCESS DENIED'});
                return;
            }
            //End authorization

            model.ModelContainer.UserModel.update({_id: _id}, userEntity, function (err, numAffected) {

                if (!err && numAffected == 1) {
                    model.ModelContainer.UserModel.findOne({
                        _id: _id
                    }, function (err, user) {
                        res.json(user);
                    });
                }
                else {
                    res.json({message: 'error'});
                }

            });
        });
    }
    else {
        res.json({message: 'error'});
    }

};

exports.updateParcel = function (req, res) {

    var parcel_id = req.params._id;
    var newParcel = req.body;

    model.ModelContainer.ParcelModel.findOne({_id: parcel_id}, function (err, parcel) {

        if (!parcel) {
            res.json({message: 'PARCEL DOES NOT EXISTS'});
            return;
        }

        model.ModelContainer.UserModel.findOne({_id: parcel.user_id}, function (err, user) { //then find user

            //Authorize if token matches with user_id
            var token = req.header('Authorization');

            if (token != user.api_key) {
                console.log("API KEY REFUSED " + token + " != " + user.api_key);

                console.log(user);
                res.json({message: 'ACCESS DENIED'});
                return;
            }
            //End authorization

            //continue updating
            model.ModelContainer.ParcelModel.findByIdAndUpdate(parcel_id, newParcel, function (err) {
                res.json(newParcel);
            });

        });
    });
};

exports.createParcel = function (req, res) {

    var parcel = req.body;

    model.ModelContainer.UserModel.findOne({_id: parcel.user_id}, function (err, user) { //then find user

        //Authorize if token matches with user_id
        var token = req.header('Authorization');

        if (token != user.api_key) {
            console.log("API KEY REFUSED " + token + " != " + user.api_key);

            console.log(user);
            res.json({message: 'ACCESS DENIED'});
            return;
        }
        //End authorization

        //verify if the same parcel has not been added previously (by ME)
        model.ModelContainer.ParcelModel.findOne({
            carrier_uuid: parcel.carrier_uuid,
            code_tracking: parcel.code_tracking,
            is_deleted: false,
            user_id: user._id
        }, function (err, parcelVerif) {

            if (parcelVerif) {
                res.json({message: 'PARCEL ALREADY REGISTERED'});
            }
            else {
                //continue creating
                new model.ModelContainer.ParcelModel(parcel).save(function (err, parcel) {

                    if (!err) {
                        res.json(parcel);
                    }

                });
            }

        });
    });
};

exports.rateParcel = function (req, res) {

    var ratingToSave = req.body;

    console.log(ratingToSave);

    model.ModelContainer.RatingModel.findOne({code_tracking: ratingToSave.code_tracking}, function (err, checkRating) {

        if (checkRating) {
            res.json({
                message: 'already rated'
            });
        }
        else {

            new model.ModelContainer.RatingModel(ratingToSave).save(function (err, savedRating) {
                res.json(savedRating);
            });
        }

    });
};

exports.getPostLocationById = function (req, res) {

    model.ModelContainer.OfficeLocationModel.findOne({_id: req.params._id}, function (err, location) {

        if (location) {
            res.json(location);
        }
        else {
            res.json(null);
        }

    });

};

exports.sendActivationEmail = function (req, res) {

    model.ModelContainer.UserModel.findOne({_id: req.params.user_id}, function (err, user) {

        if (user) {

            //Send an activation link again
            var confirm_addr = config.values.frontend_url + "/home?activation_key=" + user.activation_key;

            email_interface.sendMailWithTemplate(
                "",
                "",
                config.values.mandrill_templates['account-confirmation'].name,
                config.values.email_system_address,
                "SuivreColis",
                user.email,
                config.values.mandrill_templates['account-confirmation'].slug,
                resource.emailMessages.getRegisterContent(confirm_addr, user.firstname),
                function (response) {

                    console.log(response);

                    res.json({message: "sent"});
                });
        }
        else {
            res.json(null);
        }
    });

};

exports.getUserFromApiKey = function (req, res) {

    model.ModelContainer.UserModel.findOne({api_key: req.params.api_key}, function (err, user) {

        res.json(user);
    });
};
