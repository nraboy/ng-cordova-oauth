ngCordovaOauth
==============================

ngCordovaOauth is an AngularJS Apache Cordova Oauth library.  The purpose of this library is to
quickly and easily obtain an access token from various web services to use their APIs.


Requirements
-------------

* Apache Cordova 3.5+
* [Apache Cordova InAppBrowser Plugin](http://cordova.apache.org/docs/en/3.0.0/cordova_inappbrowser_inappbrowser.md.html)


Installing ngCordovaOauth Into Your Project
-------------

Copy the following file from this repository to your Apache Cordova project:

    $ cd ng-cordova-oauth
    $ cp ng-cordova-oauth.js /path/to/project/www/js/ng-cordova-oauth.js

The JavaScript library must then be added to your **index.html** file found in your projects **www**
directory:

    <script src="js/ng-cordova-oauth.js"></script>

Once added to your index.html file, you must inject the library into your **app.js** module.  Make your
**app.js** file look something like the following:

    angular.module('starter', ['ionic', 'ngCordovaOauth'])

At this point, ngCordovaOauth is installed into your project and is ready for use.


Using ngCordovaOauth In Your Project
-------------

Each web service API acts independently in this library.  However, when configuring each web service, one thing must remain
consistent.  You must use **http://localhost/callback** as your callback / redirect URI.  This is because this library will
perform tasks when this URL is found.

    $cordovaOauth.dropbox(string appKey);
    $cordovaOauth.digitalOcean(string clientId, string clientSecret);
    $cordovaOauth.google(string clientId, string clientSecret, array appScope);
    $cordovaOauth.github(string clientId, string clientSecret, array appScope);
    $cordovaOauth.facebook(string clientId, array appScope);
    $cordovaOauth.linkedin(string clientId, string clientSecret, array appScope, string state);

Each API call returns a promise.  The success callback will provide a response object and the error
callback will return a string.

    $cordovaOauth.google("CLIENT_ID_HERE", "CLIENT_SECRET_HERE", ["https://www.googleapis.com/auth/userinfo.email"]).then(function(result) {
        console.log("Response Object -> " + JSON.stringify(result));
    }, function(error) {
        console.log("Error -> " + error);
    });


Version History
-------------

0.0.2 - TBA

* Add LinkedIn support

0.0.1 - October 20, 2014

* Add Digital Ocean support
* Add Dropbox support
* Add Google support
* Add GitHub support
* Add Facebook support


Have a question or found a bug (compliments work too)?
-------------

Email me via my website - [http://www.nraboy.com](http://www.nraboy.com/contact)

Tweet me on Twitter - [@nraboy](https://www.twitter.com/nraboy)


Resources
-------------

Ionic Framework - [http://www.ionicframework.com](http://www.ionicframework.com)

AngularJS - [http://www.angularjs.org](http://www.angularjs.org)

Apache Cordova - [http://cordova.apache.org](http://cordova.apache.org)
