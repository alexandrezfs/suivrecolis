var model = require("./model");
var request_interface = require("./request_interface");
var resource = require("./resource");
var email_interface = require('./email_interface');
var config = require('./config');

/**
 * @param parcel_id
 * @param callback
 */
exports.parcelScanDifferent = function (parcel_id) {

    //Getting parcel
    model.ModelContainer.ParcelModel.findById(parcel_id, function (err, parcel) {

        if (err) {
            throw err;
        }

        //Getting carrier
        model.ModelContainer.CarrierModel.findOne({uuid: parcel.carrier_uuid}, function (err, carrier) {

            if (err) {
                throw err;
            }

            //Getting steps before
            model.ModelContainer.StepModel.find({parcel_id: parcel_id}, function (err, stepsBefore) {

                if (err) {
                    throw err;
                }

                if(!stepsBefore) {
                    stepsBefore = [];
                }

                //Getting steps now
                request_interface.requestForSteps(carrier, parcel.code_tracking, function (requestResponse) {

                    var stepsNow = requestResponse.steps;

                    if(stepsNow) {

                        //assigning pracel_id
                        stepsNow = assignParcelId(parcel_id, stepsNow);

                        console.log('STEPS NOW!');
                        console.log(stepsNow);
                        console.log('STEPS BEFORE!');
                        console.log(stepsBefore);


                        //Comparing steps before/now + Replying
                        compareSteps(stepsNow, stepsBefore, function(response) {

                            if(response.message == resource.compareStepsMessages.SINGLE_STEP_UPDATED) {
                                refreshSingleStep(response);
                                notifyUser(parcel, stepsNow[0].status);
                            }
                            else if(response.message == resource.compareStepsMessages.NEW_STEPS) {
                                registerNewSteps(response);
                                notifyUser(parcel, stepsNow[0].status);
                            }

                        });
                    }
                    else {
                        console.log("request failed on carrier " + carrier.uuid + " on parcel " + parcel.code_tracking);
                    }

                });
            });
        });
    });
};

/**
 * @param parcel
 */
var notifyUser = function(parcel, status) {

    var notification = {
        parcel_id: parcel._id,
        user_id: parcel.user_id,
        status: "new",
        description: status,
        carrier_uuid: parcel.carrier_uuid
    };

    var notificationModel = new model.ModelContainer.NotificationModel(notification);

    notificationModel.save(function(err, data) {

        //Getting user
        model.ModelContainer.UserModel.findOne({_id: notification.user_id}, function(err, user) {

            console.log("Notifying user : " + user);

            if(user) {

                console.log("Send mail...");

                email_interface.sendMailWithTemplate(
                    "",
                    "",
                    config.values.mandrill_templates['notification-message'].name,
                    config.values.email_system_address,
                    "SuivreColis",
                    user.email,
                    config.values.mandrill_templates['notification-message'].slug,
                    resource.emailMessages.getNotificationContent(user.email, parcel.code_tracking),
                    function (response) {
                        console.log(response);
                    });
            }
        });
    });
};

var refreshSingleStep = function(response) {

    var stepsBefore = response.stepsBefore;
    var stepsNow = response.stepsNow;

    //Removing single step
    var stepsToRemove = [];

    for(var i = 0; i < stepsBefore.length; i++) {
        var step = stepsBefore[i];
        console.log("removing " + step._id);
        stepsToRemove.push(step._id);
    }

    model.ModelContainer.StepModel.find({'_id': { $in: stepsToRemove }}).remove();

    //re creating single step
    var newStep = new model.ModelContainer.StepModel(stepsNow[0]);
    newStep.save(function(err, step) {
        console.log('new step created: ' + step._id);
    });

};

/**
 * @param response
 */
var registerNewSteps = function(response) {

    var stepsBefore = response.stepsBefore;
    var stepsNow = response.stepsNow;

    //Registering new steps + Notify
    if(response.message == resource.compareStepsMessages.NEW_STEPS || response.message == resource.compareStepsMessages.SINGLE_STEP_UPDATED) {

        var step, i;

        var stepsToRemove = [];

        //Removing all steps
        for(i = 0; i < stepsBefore.length; i++) {
            step = stepsBefore[i];
            console.log("removing " + step._id);
            stepsToRemove.push(step._id);
        }

        model.ModelContainer.StepModel.find({'_id': { $in: stepsToRemove }}).remove();

        //re add all steps
        for(i = 0; i < stepsNow.length; i++) {
            step = stepsNow[i];
            delete step._id;
        }

        model.ModelContainer.StepModel.create(stepsNow);

        console.log(stepsNow);

    }

};

/**
 * @param stepsNow
 * @param stepsBefore
 * @param callback
 */
var compareSteps = function (stepsNow, stepsBefore, callback) {

    var i;

    //Case 1: New steps
    if (stepsNow.length > stepsBefore.length) {

        console.log("NEW STEPS");

        //Getting new steps
        var newSteps = [];
        for(i = 0; i < stepsNow.length; i++) {

            var stepNow = stepsNow[i];

            if(!stepsBefore[i]) {
                newSteps.push(stepNow);
            }
        }

        callback(getCompareStruct(resource.compareStepsMessages.NEW_STEPS, newSteps, stepsNow, stepsBefore));
    }
    //Case 2: The single Step has been edited.
    else if(stepsNow.length === 1 && stepsBefore.length === 1) {

        for(i = 0; i < stepsNow.length; i++) {

            if (stepsNow[i].status != stepsBefore[i].status) {
                console.log("SINGLE STEP");
                callback(getCompareStruct(resource.compareStepsMessages.SINGLE_STEP_UPDATED, stepsNow, stepsNow, stepsBefore));
                break;
            }

        }

        callback(getCompareStruct(resource.compareStepsMessages.NO_UPDATES, null, stepsNow, stepsBefore));
    }
    else {
        callback(getCompareStruct(resource.compareStepsMessages.NO_UPDATES, null, stepsNow, stepsBefore));
    }
};

/**
 * @param message
 * @param newSteps
 * @param stepsNow
 * @param stepsBefore
 * @returns {{message: *, newSteps: *, stepsNow: *, stepsBefore: *}}
 */
var getCompareStruct = function (message, newSteps, stepsNow, stepsBefore) {

    return {
        message: message,
        newSteps: newSteps,
        stepsNow: stepsNow,
        stepsBefore: stepsBefore
    };

};

/**
 * @param parcel_id
 * @param steps
 * @returns {*}
 */
var assignParcelId = function(parcel_id, steps) {

    for(var i = 0; i < steps.length; i++) {
        steps[i].parcel_id = parcel_id;
    }

    return steps;
};

exports.compareSteps = compareSteps;