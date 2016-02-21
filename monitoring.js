var config = require("./config");
var email_interface = require("./email_interface");
var model = require("./model");
var resource = require('./resource');
var moment = require('moment');

exports.runCron = function () {

    sendParcelMonitNotification();
    checkForInactiveParcel();

    setInterval(function () {
        sendParcelMonitNotification();
        checkForInactiveParcel();
    }, 86400000);

};

exports.registerParcelMonitNotification = function (carrierEntity, code_tracking, builtResponse) {

    console.log("Registering monitoring alert: " + carrierEntity + " " + code_tracking);

    var message = {
        code_tracking: code_tracking,
        carrier_uuid: carrierEntity.uuid
    };

    message.status = '[STATUS] ' + builtResponse.statusCode + ' | [ERROR] ' + builtResponse.error;

    var parcelMonitoringModel = new model.ModelContainer.ParcelMonitoringModel(message);
    parcelMonitoringModel.save(function (err) {
        if (err) {
            console.log(err);
        }
    });

};

var sendParcelMonitNotification = function () {

    var q = model.ModelContainer.ParcelMonitoringModel.find()
        .where({created_at: {"$gte": moment().toDate(), "$lt": moment().subtract(1, 'days').toDate()}});

    q.exec(function (err, notifs) {

        var messageTxt = "";
        var messageHtml = "";

        messageHtml += "<strong>Recent monitoring notifications:</strong>";

        messageHtml += "<table>" +
        "<thead>" +
            "<tr style='border:1px solid black'>" +
                "<td style='border:1px solid black'>carrier_uuid</td>" +
                "<td style='border:1px solid black'>code_tracking</td>" +
                "<td style='border:1px solid black'>status</td>" +
                "<td style='border:1px solid black'>created_at</td>" +
            "</tr>" +
        "</thead>" +
        "<tbody>";

        for (var i = 0; i < notifs.length; i++) {

            var notif = notifs[i];

            messageTxt += resource.emailMessages.getParcelMonitMessage("text", notif.carrier_uuid, notif.code_tracking, notif.status, notif.created_at);

            messageHtml += "<tr style='border:1px solid black'>";
                messageHtml += resource.emailMessages.getParcelMonitMessage("html", notif.carrier_uuid, notif.code_tracking, notif.status, notif.created_at);
            messageHtml += "</tr>";
        }

        messageHtml +=
        "</tbody>" +
        "</table>";

        if (messageTxt.length > 0) {

            email_interface.sendMail(
                messageHtml,
                messageTxt,
                "SuivreColis monitoring",
                config.values.email_system_address,
                "SuivreColis",
                config.values.webmaster_email,
                function (response) {
                    console.log(response);
                });

        }
    });
};

var checkForInactiveParcel = function () {

    //We will foreach parcels and see if it has been updated at least 2 weeks ago.
    //If not, we'll disable notifications for this parcel and send an alert to user.
    model.ModelContainer.ParcelModel.find({receive_notification: true, is_deleted: false}, function (err, parcels) {

        parcels.forEach(function (parcel) {

            //2 weeks passed.
            if (parcel.updated_at.getTime() + (14 * 24 * 60 * 60 * 1000) < new Date().getTime()) {

                console.log("Inactive parcel detected: " + parcel._id);

                parcel.receive_notification = false;
                parcel.save();

                //Getting linked user
                model.ModelContainer.UserModel.findOne({
                    _id: parcel.user_id
                }, function (err, user) {

                    if(!user) {
                        console.log("user doesn't exist anymore... so remove that parcel.");
                        parcel.remove();
                    }
                    else {

                        console.log("send mail...");

                        //Finding the CARRIER NAME.
                        model.ModelContainer.CarrierModel.findOne({uuid: parcel.carrier_uuid}, function(err, carrier) {

                            email_interface.sendMailWithTemplate(
                                "",
                                "",
                                config.values.mandrill_templates['inactive-parcel'].name,
                                config.values.email_system_address,
                                "SuivreColis",
                                user.email,
                                config.values.mandrill_templates['inactive-parcel'].slug,
                                resource.emailMessages.getInactiveParcelContent(user.email, parcel.code_tracking, carrier.name),
                                function (response) {
                                    console.log(response);
                                });

                        });

                    }

                });

            }

        });

    });

};