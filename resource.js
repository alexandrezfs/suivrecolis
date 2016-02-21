var config = require('./config');
var moment = require('moment');

exports.frontRoutes = [
    '/home',
    '/addNewParcel',
    '/addRating/:carrier_uuid/:code_tracking',
    '/carrierRatings', '/carrierRating/:carrier_uuid',
    '/contact',
    '/flyRegistration/:carrier_uuid/:code_tracking',
    '/help',
    '/locationDetails/:location_id',
    '/myParcel',
    '/myProfile',
    '/parcelTracking/:parcel_uuid/:code_tracking',
    '/postOfficeLocation',
    '/signRegister',
    '/updates',
    '/forgotPassword',
    '/passwordReset/:activation_key',
    '/logout'
];

exports.LevelMap = {

    1: [
        "Départ en livraison",
        "Votre colis a été déposé dans",
        "Shipment data transmitted",
        "Colis chez l'expéditeur",
        "Colis chez l\'expéditeur",
        "Order information has been transmitted to DPD."
    ],
    2: [
        "sortie de livraison",
        "entrée",
        "transit hub",
        "Arrivée à",
        "Colis en cours",
        "Colis pris en compte par",
        "Pre delivery notification sent",
        "Votre colis est arrivé en",
        "Votre colis a quitté le pays",
        "Le colis doit être remis en mains propres au destinataire",
        "Votre colis est pris en charge par",
        "Votre colis est prêt à être livré",
        "Votre colis est arrivé sur son site de distribution",
        "In transit",
        "At parcel delivery centre",
        "Out for delivery",
        "Unfortunately we have not been able to deliver your parcel",
        "Transfer to Pickup parcelshop by DPD driver",
        "Delivery to Pickup parcelshop",
        "The consignee did not collect the parcel",
        "Pick-up from the Pickup parcelshop by DPD driver"
    ],
    3: [
        "Votre colis est livré",
        "5002 livraison",
        "Colis livr"
    ]

};

exports.ApiMessages = {
    404: {
        errCode: 404,
        errMessage: "404 Not Found"
    },
    500: {
        errCode: 500,
        errMessage: "500 Internal Server Error"
    }
};

exports.salt = '1f2ifaz66flxr';

exports.compareStepsMessages = {
    NEW_STEPS: "New steps detected",
    SINGLE_STEP_UPDATED: "Single step updated",
    NO_UPDATES: "No updates"
};

exports.ratingDataSurveys = {
    deliverSurvey: [
        {
            key: "onTime",
            value: "On Time"
        },
        {
            key: "onDayEarly",
            value: "One day early"
        },
        {
            key: "lateButRightDay",
            value: "Late, but on the right day"
        },
        {
            key: "oneDayLateOrMore",
            value: "One day late or more"
        },
        {
            key: "neverDelivered",
            value: "Never Delivered"
        }
    ],
    userTypeSurvey: [
        {
            key: "sender",
            value: "Sender"
        },
        {
            key: "recipient",
            value: "Recipient"
        },
        {
            key: "thirdParty",
            value: "Third Party"
        }
    ],
    serviceQualitySurvey: [
        {
            key: "worst",
            value: "The worst",
            star_count: 1
        },
        {
            key: "bad",
            value: "Bad",
            star_count: 2
        },
        {
            key: "normal",
            value: "Normal",
            star_count: 3
        },
        {
            key: "good",
            value: "Good",
            star_count: 4
        },
        {
            key: "perfect",
            value: "Perfect",
            star_count: 5
        }
    ]
};

exports.emailMessages = {

    getRegisterContent: function (activate_addr, fname) {
        return [{
            name: "ACTIVATE_ADDR",
            content: activate_addr
        },
            {
                name: "FNAME",
                content: fname
            }];
    },

    getUserActivatedContent: function (email, fname) {
        return [{
            name: "EMAIL",
            content: email
        },
            {
                name: "FNAME",
                content: fname
            }];
    },

    getChangePasswordSuccessTemplateContent: function (email) {

        return [{
            name: "EMAIL",
            content: email
        }];

    },

    getInactiveParcelContent: function (email, parcel, courier) {

        return [{
            name: "EMAIL",
            content: email
        },
            {
                name: "PARCEL",
                content: parcel
            },
            {
                name: "COURIER",
                content: courier
            }];
    },

    getNotificationContent: function (email, parcel) {
        return [{
            name: "EMAIL",
            content: email
        },
            {
                name: "PARCEL",
                content: parcel
            }];
    },

    getContactMessage: function (email_content_type, firstname, lastname, email, subject, message) {

        if (email_content_type == "html") {
            return "firstname: " + firstname + " // lastname: " + lastname + " // email: " + email + " // subject: " + subject + " // message:" + message;
        }
        else if (email_content_type == "text") {
            return "firstname: " + firstname + " // lastname: " + lastname + " // email: " + email + " // subject: " + subject + " // message:" + message;
        }

    },


    getChangePasswordTemplateContent: function (addr_change, email) {

        return [{
            name: "ADDR_CHANGE",
            content: addr_change
        }, {
            name: "EMAIL",
            content: email
        }];

    },

    getParcelMonitMessage: function (email_content_type, carrier_uuid, code_tracking, status, created_at) {

        if (email_content_type == "html") {
            return "<td style='border:1px solid black'>" + carrier_uuid + "</td>" +
                "<td style='border:1px solid black'>" + code_tracking + "</td>" +
                "<td style='border:1px solid black'>" + status + "</td>" +
                "<td style='border:1px solid black'>" + moment(created_at).format('LLLL') + "</td>";
        }
        else if (email_content_type == "text") {
            return "A monitoring message has been generated: CARRIER:" + carrier_uuid + " TRACKER CODE:" + code_tracking + " STATUS:" + status + " CREATED_AT:" + moment(created_at).format('LLLL');
        }

    }

};
