var resource = require('./resource');
var fs = require('fs');
var model = require('./model');

exports.UtilEntity = {

    capitaliseFirstLetter: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    stepLevelConverter: function (string) {

        var level = -1;

        Object.keys(resource.LevelMap).forEach(function (levelKey) {

            var sentences = resource.LevelMap[levelKey];

            sentences.forEach(function (sentence) {
                if (string.indexOf(sentence) > -1 && level == -1) {
                    level = levelKey;
                }
            });
        });

        return level;
    },

    registerLocationData: function () {

        model.ModelContainer.CountryModel.remove({}, function (err) {
            model.ModelContainer.CityModel.remove({}, function (err) {
                model.ModelContainer.RegionModel.remove({}, function (err) {

                    fs.readFile("resource/cities.json", "utf8", function (err, data) {

                        if (err) {
                            throw err;
                        }

                        var cities = JSON.parse(data);
                        var citiesToSave = [];

                        for (var key in cities) {

                            var city = cities[key];
                            delete city.ID;

                            if (city.name && city.name.length > 0) {
                                citiesToSave.push(city);
                            }
                        }

                        model.ModelContainer.CityModel.create(citiesToSave, function(err, jellybean, snickers) {
                            console.log("cities saved");
                        });
                    });

                    fs.readFile("resource/countries.json", "utf8", function (err, data) {

                        if (err) {
                            throw err;
                        }

                        var countries = JSON.parse(data);
                        var countriesToSave = [];

                        for (var key in countries) {
                            var country = countries[key];
                            delete country.ID;

                            if (country.name && country.name.length > 0) {
                                countriesToSave.push(country);
                            }
                        }

                        model.ModelContainer.CountryModel.create(countriesToSave, function(err, jellybean, snickers) {
                            console.log("countries saved");
                        });

                    });

                    fs.readFile("resource/regions.json", "utf8", function (err, data) {

                        if (err) {
                            throw err;
                        }

                        var regions = JSON.parse(data);
                        var regionsToSave = [];

                        for (var key in regions) {
                            var region = regions[key];
                            delete region.ID;

                            if (region.name && region.name.length > 0) {
                                regionsToSave.push(region);
                            }
                        }

                        model.ModelContainer.RegionModel.create(regionsToSave, function(err, jellybean, snickers) {
                            console.log("regions saved");
                        });

                    });

                });
            });
        });

    },

    sortStepsByScanDate: function(array) {

        array.sort(function(a, b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return a.scan_date - b.scan_date;
        });

        return array;
    }

};