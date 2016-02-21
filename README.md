TrackMyParcel
================
[![Build Status](https://magnum.travis-ci.com/ovox/track.svg?token=7TeUXsLxApBfKxBpPMiz&branch=master)](https://magnum.travis-ci.com/ovox/track)

##Requirements

+ NodeJS + NPM `v0.10.24` or higher
+ MongoDB `2.6.x`
+ Forever (highly recommended)

##Setup

    sudo npm install
    
##Configuration

The server config file is located at `./config.js`

##Install assets

    cd public/
    bower install
    
##Running server

    forever start app.js


##Testing

    npm test
    
##Public API

###Getting Oauth 2 Authtorization

Oauth server is usually running on port 3003.

1) Make a get request to (contact system admin to get your client ID and secret) `http://<trackmyparcel-oauth-server>/oauth/authorize?client_id=1&response_type=code&redirect_uri=http://google.com&scope=profile`

Response example:

    { redirectUri: 'http://google.com?code=93e19d16-929f-4582-9225-5c1b3f218365&expires_in=3600&scope=profile,',
      state: null }

2) Using the output from `#1` make another request with the code to `http://<trackmyparcel-oauth-server>/oauth/token?client_id=1&grant_type=authorization_code&code=[THE CODE FROM STEP 1]&client_secret=[CLIENT SECRET]`

You will get an access token from Oauth such as this: 

    { access_token: '674b10f9-52d7-413a-ab9b-14dccaa1f357',
      token_type: 'bearer',
      expires_in: Sun Feb 15 2015 11:06:49 GMT+0100 (CET),
      refresh_token: '7cb7d814-eb14-4dec-be0f-441a159f5de2' }

You can now query any service listed below in this README with a `Authorization` header field.

    Authorization: Bearer [ACCESS TOKEN GOES HERE]
    
##Services:

###Tracking a parcel

    [GET]
    http://<trackmyparcel-api-server>/api/public/trackIt/:carrier_uuid/:code_tracking
    
Query example:

    curl http://127.0.0.1:3002/api/public/trackIt/sapo/PE817071802ZA -H "Authorization: Bearer eaaa320d-32e4-450e-b7d0-a31b94c3308e"

Reponse example:

    {"error":null,"statusCode":200,"steps":[{"status":"Item delivered to:  DU TOIT","step_level":"3","location":"VERWOERDPARK","scan_date":"2013-10-09T08:18:00.000Z"},{"status":"At Office","step_level":"2","location":"VERWOERDPARK","scan_date":"2013-09-26T08:38:00.000Z"},{"status":"In transit","step_level":"2","location":"GERIn TransitTON (HUB)","scan_date":"2013-09-25T07:42:00.000Z"},{"status":"In transit","step_level":"2","location":"GEORGE (HUB)","scan_date":"2013-09-19T12:51:00.000Z"},{"status":"Other","step_level":"2","location":"SEDGEFIELD","scan_date":"2013-09-19T10:56:00.000Z"},{"status":"Item accepted by branch","step_level":"1","location":"SEDGEFIELD","scan_date":"2013-09-18T13:28:00.000Z"}]}
