var mongoose = require('mongoose');
var config = require('./config');
var Schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * MONGOOSE DRIVER CONNECTION
 */
mongoose.connect(config.values.mongodb_addr, function (err) {
    if (err) {
        throw err;
    }
    console.log("connected to mongoDB");
});

var CitySchema = new Schema({
    country: String,
    region: String,
    url: String,
    name: String,
    latitude: String,
    longitude: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var RegionSchema = new Schema({
    country: String,
    code: String,
    url: String,
    name: String,
    latitude: String,
    longitude: String,
    cities: Number,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var CountrySchema = new Schema({
    code: String,
    url: String,
    name: String,
    latitude: String,
    longitude: String,
    regions: Number,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var UserSchema = new Schema({
    firstname: String,
    lastname: String,
    email: String,
    phone: String,
    password: String,
    ip: {type: String, default: ''},
    is_active: Boolean,
    activation_key: String,
    api_key: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
    last_login: {type: Date, default: Date.now}
});

var CarrierSchema = new Schema({
    uuid: String,
    name: String,
    description: String,
    image: String,
    request_params: Object,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var ParcelSchema = new Schema({
    code_tracking: String,
    parcel_name: String,
    receive_notification: Boolean,
    user_id: ObjectId,
    carrier_uuid: String,
    carrier_name: String,
    city_departure: String,
    region_departure: String,
    country_departure: String,
    address_departure: String,
    city_arrival: String,
    region_arrival: String,
    country_arrival: String,
    address_arrival: String,
    is_deleted: {type: Boolean, default: false},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var RatingSchema = new Schema({
    user_type: String,
    service_quality: String,
    deliver_type: String,
    suggest_comment: String,
    appreciate_comment: String,
    carrier_uuid: String,
    star_count: Number,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

//Used for cron notifications
var StepSchema = new Schema({
    parcel_id: ObjectId,
    status: String,
    location: String,
    carrier_uuid: String,
    step_level: Number,
    scan_date: {type: Date, default: Date.now},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

//Used for caching
var StepCacheSchema = new Schema({
    parcel_cache_id: ObjectId,
    status: String,
    location: String,
    carrier_uuid: String,
    step_level: Number,
    scan_date: {type: Date, default: Date.now},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var ParcelCacheSchema = new Schema({
    code_tracking: String,
    carrier_uuid: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var NotificationSchema = new Schema({
    parcel_id: ObjectId,
    user_id: ObjectId,
    status: String,
    description: String,
    carrier_uuid: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var OfficeLocationSchema = new Schema({
    latitude: String,
    longitude: String,
    carrier_uuid: String,
    office_name: String,
    location: String,
    country: String,
    city: String,
    phone: String,
    director: String,
    show: {type: Boolean, default: false}
});

var ParcelMonitoringSchema = new Schema({
    code_tracking: String,
    carrier_uuid: String,
    status: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});


/**
 * @type {{UserModel: (*|Model), CarrierModel: (*|Model), RatingModel: (*|Model), ParcelModel: (*|Model), StepModel: (*|Model), NotificationModel: (*|Model), CityModel: (*|Model), RegionModel: (*|Model), CountryModel: (*|Model)}}
 */
exports.ModelContainer = {
    UserModel: mongoose.model('User', UserSchema),
    CarrierModel: mongoose.model('Carrier', CarrierSchema),
    RatingModel: mongoose.model('Rating', RatingSchema),
    ParcelModel: mongoose.model('Parcel', ParcelSchema),
    ParcelCacheModel: mongoose.model('ParcelCache', ParcelCacheSchema),
    StepModel: mongoose.model('Step', StepSchema),
    StepCacheModel: mongoose.model('StepCache', StepCacheSchema),
    NotificationModel: mongoose.model('Notification', NotificationSchema),
    CityModel: mongoose.model('City', CitySchema),
    RegionModel: mongoose.model('Region', RegionSchema),
    CountryModel: mongoose.model('Country', CountrySchema),
    OfficeLocationModel: mongoose.model('OfficeLocation', OfficeLocationSchema),
    ParcelMonitoringModel: mongoose.model('ParcelMonitoring', ParcelMonitoringSchema)
};