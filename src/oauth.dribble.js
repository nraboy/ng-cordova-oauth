(function() {
  'use strict';

  angular.module('oauth.dribble', ['oauth.utils'])
    .factory('$ngCordovaDribble', dribble);

  function dribble($q, $http, $cordovaOauthUtility) {
    return { signin: oauthDribble };

    /*
     * Sign into the Dribble service
     *
     * @param    string clientId                  REQUIRED
     * @param    string clientSecret              REQUIRED
     * @param    object Array appScope            REQUIRED
     * @param    object options (redirect_uri)    OPTIONAL
     * @param    state  string                    OPTIONAL
     * @return   promise
     */
    function oauthDribble(clientId, clientSecret, appScope, options, state) {

      var deferred = $q.defer();
      if (window.cordova) {
        if ($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          var OAUTH_URL = 'https://dribbble.com/oauth/authorize';
          var ACCESS_TOKEN_URL = 'https://dribbble.com/oauth/token';
          if (options !== undefined) {
            if (options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }

          if (state === undefined) {
            state = $cordovaOauthUtility.createNonce(5);
          }

          var scope = appScope.join(",").replace(/,/g, '+');  //dribble scopes are passed with +
          var browserRef = window.cordova.InAppBrowser.open(OAUTH_URL + '?client_id=' + clientId + '&redirect_uri=' + redirect_uri +
          '&scope=' + scope + '&state=' + state, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function (event) {
            if ((event.url).indexOf(redirect_uri) === 0) {
              var callBackCode = (event.url).split("code=")[1];
              var code = callBackCode.split("&")[0];

              $http({
                method: "post",
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                url: ACCESS_TOKEN_URL,
                data: "client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&client_secret=" + clientSecret + "&code=" + code
              })
              .success(function (res) {
                deferred.resolve(res);
              }).error(function (data, status) {
                deferred.reject("Problem authenticating " );
              }).finally(function () {
                setTimeout(function () {
                  browserRef.close();
                }, 10);
              });
            }
          });
          browserRef.addEventListener('exit', function (event) {
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

  dribble.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
