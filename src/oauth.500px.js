(function() {
  'use strict';

  angular.module('oauth.500px', ['oauth.utils'])
    .factory('$ngCordova500px', fiveHundredsPx);

  function fiveHundredsPx($q, $http, $cordovaOauthUtility) {
    return { signin: oauth500px };

    /*
     * Sign into the 500px service
     *
     * @param    string sdkKey
     * @param    object options
     * @return   promise
     */
    function oauth500px(sdkKey, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
                redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://api.500px.com/v1/api/js-sdk/authorize?sdk_key=' + sdkKey + '&callback=' + redirect_uri, '_blank', 'toolbar=no,zoom=no,location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var accessToken = (event.url).split("#token:")[1].split(',')[0];
                deferred.resolve({error: false, success: true, access_token: accessToken, callback: redirect_uri});
            } else {
              deferred.reject({success: false, callback: redirect_uri, error: true, access_token: null});
            }
          });
          browserRef.addEventListener('exit', function(event) {
            deferred.reject("The sign in flow was canceled");
          });
        } else {
          deferred.reject("Could not find InAppBrowser plugin");
        }
      } else {
        deferred.reject("Cannot authenticate via a web browser");
      }
      return deferred.promise;
    }
  }

  fiveHundredsPx.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
