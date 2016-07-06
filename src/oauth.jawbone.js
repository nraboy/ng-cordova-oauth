(function() {
  'use strict';

  angular.module('oauth.jawbone', ['oauth.utils'])
    .factory('$ngCordovaJawbone', jawbone);

  function jawbone($q, $http, $cordovaOauthUtility) {
    return { signin: oauthJawbone };

    /*
     * Sign into the Jawbone service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    string appScope
     * @param    object options
     * @return   promise
     */
    function oauthJawbone(clientId,clientSecret, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://jawbone.com/auth/oauth2/auth?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=' + appScope.join(" "), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');

          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var requestToken = (event.url).split("code=")[1];

              $http({method: "post", headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: "https://jawbone.com/auth/oauth2/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&grant_type=authorization_code&code=" + requestToken })
                .success(function(data) {
                  deferred.resolve(data);
                })
                .error(function(data, status) {
                  deferred.reject("Problem authenticating");
                })
                .finally(function() {
                  setTimeout(function() {
                    browserRef.close();
                  }, 10);
                });

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

  jawbone.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
