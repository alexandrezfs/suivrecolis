var request = require('request');

var request = require('request');
request('http://ifconfig.co/', {proxy: 'http://188.226.129.201:4645'}, function (error, response, body) {

    console.log(error);

    if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the Google homepage.
    }
})