(function() {
  'use strict';

  angular.module('oauth.yandex', ['oauth.utils'])
    .factory('$ngCordovaYandex', yandex);

  function yandex($q, $http, $cordovaOauthUtility) {
    return { signin: oauthYandex };

    /*
     * Sign into the Yandex service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    object options (defaults force_confirm:'yes')
     * @return   promise
     *
     * Required:
     * <meta http-equiv="Content-Security-Policy" content="default-src 'self' https://oauth.yandex.ru ... ">
     */
    function oauthYandex(clientId, clientSecret, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          var force_confirm="yes";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
            if(options.hasOwnProperty("force_confirm")) {
              force_confirm = options.force_confirm;
            }
          }
          var flowUrl = "https://oauth.yandex.ru/authorize?response_type=code&client_id=" + clientId + "&force_confirm="+force_confirm+"&redirect_uri=" + redirect_uri;

          var browserRef = window.cordova.InAppBrowser.open(flowUrl, '_blank', 'location=no');//,clearsessioncache=yes,clearcache=yes
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var requestToken = (event.url).split("code=")[1];
              $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
              $http({method: "post", url: "https://oauth.yandex.ru/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&grant_type=authorization_code&code=" + requestToken})
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

  yandex.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();