[![Build Status](https://travis-ci.org/nraboy/ng-cordova-oauth.svg?branch=master)](https://travis-ci.org/nraboy/ng-cordova-oauth)
[![PayPal](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XK2JBEZ2PD2QS)

# ngCordovaOauth

ngCordovaOauth is an AngularJS Apache Cordova Oauth library.  The purpose of this library is to quickly and easily obtain an access token from various web services to use their APIs.

If you are using Angular 2, you should check out [ng2-cordova-oauth](https://github.com/nraboy/ng2-cordova-oauth) instead.


## Requirements

* Apache Cordova 3.5+
* AngularJS
* [Apache Cordova InAppBrowser Plugin](http://cordova.apache.org/docs/en/3.0.0/cordova_inappbrowser_inappbrowser.md.html)
* [Apache Cordova Whitelist Plugin](https://github.com/apache/cordova-plugin-whitelist)
* [jsSHA 1.6.0](https://github.com/Caligatio/jsSHA) Secure Hash Library (Twitter, Withings, and Magento only)


## Installing ngCordovaOauth Into Your Project

### Bower way:

Add this repository as dependency:

    $ bower install ng-cordova-oauth -S

This action will set the dependency and add it to the `bower.json` file.

The JavaScript library must then be added to your **index.html** file found in your projects **www**
directory:

    <script src="../ng-cordova-oauth/dist/ng-cordova-oauth.min.js"></script>

### Outdated way:

Copy the following file from this repository to your Apache Cordova project:

    $ cd ng-cordova-oauth
    $ cp ng-cordova-oauth.js /path/to/project/www/js/ng-cordova-oauth.min.js

The JavaScript library must then be added to your **index.html** file found in your projects **www**
directory:

    <script src="js/ng-cordova-oauth.min.js"></script>

### Injecting:

Once added to your index.html file, you must inject the library into your **app.js** module.  Make your
**app.js** file look something like the following:

    angular.module('starter', ['ionic', 'ngCordovaOauth'])

At this point, ngCordovaOauth is installed into your project and is ready for use.


## Using ngCordovaOauth In Your Project

Each web service API acts independently in this library.  However, when configuring each web service, one thing must remain consistent.  You must use **http://localhost/callback** as your callback / redirect URI.  This is because this library will perform tasks when this URL is found.

    $cordovaOauth.azureAD(string clientId, string tenantId, string resourceURL);
    $cordovaOauth.dropbox(string appKey, object options);
    $cordovaOauth.digitalOcean(string clientId, string clientSecret, object options);
    $cordovaOauth.google(string clientId, array appScope, object options);
    $cordovaOauth.github(string clientId, string clientSecret, array appScope, object options);
    $cordovaOauth.facebook(string clientId, array appScope, object options);
    $cordovaOauth.linkedin(string clientId, string clientSecret, array appScope, string state);
    $cordovaOauth.instagram(string clientId, array appScope, object options);
    $cordovaOauth.box(string clientId, string clientSecret, string state, object options);
    $cordovaOauth.reddit(string clientId, string clientSecret, array appScope, object options);
    $cordovaOauth.twitter(string consumerKey, string consumerSecretKey, object options);
    $cordovaOauth.meetup(string consumerKey, object options);
    $cordovaOauth.salesforce(string loginUrl, string clientId);
    $cordovaOauth.strava(string clientId, string clientSecret, array appScope, object options);
    $cordovaOauth.withings(string clientId, string clientSecret);
    $cordovaOauth.foursquare(string clientId, object options);
    $cordovaOauth.magento(string baseUrl, string clientId, string clientSecret)
    $cordovaOauth.vkontakte(string clientId, array appScope)
    $cordovaOauth.adfs(string clientId, string adfsServer, string relyingPartyId)
    $cordovaOauth.imgur(string clientId, object options)
    $cordovaOauth.spotify(string clientId, array appScope, object options)
    $cordovaOauth.uber(string clientId, array appScope, object options)
    $cordovaOauth.windowsLive(string clientId, array appScope, object options)
    $cordovaOauth.yammer(string clientId, object options)
    $cordovaOauth.venmo(string clientId, array appScope, object options)
    $cordovaOauth.stripe(string clientId, string clientSecret, string appScope, object options)
    $cordovaOauth.slack(string clientId, string clientSecret, array appScope, object options)
    $cordovaOauth.rally(string clientId, string clientSecret, string appScope, object options)
    $cordovaOauth.familySearch(string clientId, string state, object options);
    $cordovaOauth.envato(string clientId, object options);
    $cordovaOauth.weibo(string clientId, string clientSecret, array appScope, object options);
    $cordovaOauth.untappd(string clientId, object options);
    $cordovaOauth.pocket(string clientId, object options);
    $cordovaOauth.xing(string clientId, string clientSecret, object options);
    $cordovaOauth.fiveHundredsPx(string sdkKey, object options);
    $cordovaOauth.netatmo(object options);
    $cordovaOauth.trakttv(string clientId, string clientSecret, string state);

Each API call returns a promise.  The success callback will provide a response object and the error
callback will return a string.

```javascript
$cordovaOauth.google("CLIENT_ID_HERE", ["email"]).then(function(result) {
    console.log("Response Object -> " + JSON.stringify(result));
}, function(error) {
    console.log("Error -> " + error);
});
```

To authenticate with Twitter, Withings, Magento and Xing an additional library is required.  These services require HMAC-SHA1 signatures in their Oauth implementation.  Including the sha1.js component of jsSHA will accomplish this task.

As of Apache Cordova 5.0.0, the [whitelist plugin](https://www.thepolyglotdeveloper.com/2015/05/whitelist-external-resources-for-use-in-ionic-framework/) must be used in order to reach external web services.

### Important Note About Testing

This library will **NOT** work with a web browser, ionic serve, ionic live-reload, or ionic view.  It **MUST** be used via installing to a device or simulator.

## Content-Security-Policy

When using the Content-Security-Policy as mentioned in the [Apache Cordova Whitelist Plugin](https://github.com/apache/cordova-plugin-whitelist) documentation, you'll need to allow content from the OAuth Provider. For example, if using Google Login, you'll need to add `https://www.googleapis.com` to your `default-src` list. Your meta tag would look something like this for Google and Facebook:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' https://www.googleapis.com https://graph.facebook.com">
```

## Version History

[View CHANGELOG](CHANGELOG.md)


## Contribution Rules

All contributions must be made via the `development` branch.  This keeps the project more maintainable in terms of versioning as well as code control.

If you want to contribute please use the new architecture of files. Each provider need to be in a separated file following this pattern: `oauth.<provider name>.js` and add it to the `oauth.provider` module as a dependency.

(If you have any doubt about the architecture take a look other providers to see how it is.)


```javascript
//oauth.js

angular.module("oauth.providers", [
  "oauth.utils", "oauth.azuread", "oauth.adfs", 'oauth.dropbox',
  'oauth.digitalOcean', 'oauth.google', 'oauth.github', 'oauth.facebook',
  'oauth.linkedin', 'oauth.instagram', 'oauth.box', 'oauth.reddit', 'oauth.slack',
  'oauth.twitter', 'oauth.meetup', 'oauth.salesforce', 'oauth.strava',
  'oauth.withings', 'oauth.foursquare', 'oauth.magento', 'oauth.vkontakte',
  'oauth.odnoklassniki', 'oauth.imgur', 'oauth.spotify', 'oauth.uber',
  'oauth.windowslive', 'oauth.yammer', 'oauth.venmo', 'oauth.stripe', 'oauth.rally',
  'oauth.familySearch', 'oauth.envato', 'oauth.weibo', 'oauth.jawbone', 'oauth.untappd',
  'oauth.dribble', '<YOUR PROVIDER MODULE HERE>']).factory("$cordovaOauth", cordovaOauth);

function cordovaOauth(
    $q, $http, $cordovaOauthUtility, $azureAD, $adfs, $dropbox, $digitalOcean,
    $google, $github, $facebook, $linkedin, $instagram, $box, $reddit, $slack,
    $twitter, $meetup, $salesforce, $strava, $withings, $foursquare, $magento
    $vkontakte, $odnoklassniki, $imgur, $spotify, $uber, $windowslive, $yammer,
    $venmo, $stripe, $rally, $familySearch, $envato, $weibo, $jawbone, $untappd,
    $dribble, <YOUR FACTORY NAME>) {

    return {
        // A lot of providers...
        yourProvider: $yourProvider.signinFuncion,
    }
}

$cordovaOauth.$inject = [
  "$q", '$http', "$cordovaOauthUtility", "$azureAD", "$adfs", '$dropbox',
  '$digitalOcean', '$google', '$github', '$facebook', '$linkedin',
  '$instagram', '$box', '$reddit', '$slack', '$twitter' '$meetup', '$salesforce',
  '$strava', '$withings', '$foursquare', '$magento', '$vkontakte',
  '$odnoklassniki', '$imgur', '$spotify', '$uber', '$windowslive', '$yammer',
  '$venmo', '$stripe', '$rally', '$familySearch', '$envato', '$weibo',
  '$jawbone', '$untappd', '$dribble', '<YOUR FACTORY NAME>'
];
```

## Support

This project is maintained by **Nic Raboy** and **Matheus Rocha**.  This plugin is and will always be open source.  That said, support is not.  If you'd like to **purchase** paid support for this library, please contact either of us on Twitter.

Nic Raboy on Twitter - [@nraboy](https://www.twitter.com/nraboy)

Matheus Rocha on Twitter - [@matheusrocha](https://www.twitter.com/matheusrocha)

The issue tracker is to be used for bug reporting only.  We will not help you build your application, diagnose your problems, or teach you how to use the various oauth providers through the issue tracker.  Free support can be found in the forums or on Stack Overflow.


## Resources

Ionic Framework - [http://www.ionicframework.com](http://www.ionicframework.com)

AngularJS - [http://www.angularjs.org](http://www.angularjs.org)

Apache Cordova - [http://cordova.apache.org](http://cordova.apache.org)

The Polyglot Developer - [https://www.thepolyglotdeveloper.com](https://www.thepolyglotdeveloper.com)
