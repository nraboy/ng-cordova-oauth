(function() {
  'use strict';

  angular.module('oauth.trakttv', ['oauth.utils'])
    .factory('$ngCordovaTraktTv', trakttv);

  function trakttv($q, $http, $cordovaOauthUtility) {
    return { signin: oauthTraktTv };

    /*
     * Sign into the Trakt.tv service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    string state
     * @param    object options
     * @return   promise
     */
    function oauthTraktTv(clientId, clientSecret, appScope, state, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://trakt.tv/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=code&state=' + state, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              try {
                var requestToken = (event.url).split("code=")[1].split("&")[0];
                $http({method: "post", headers: {'Content-Type': 'application/json'}, url: "https://trakt.tv/oauth/token", data: {'code': requestToken, 'client_id': clientId, 'client_secret': clientSecret, 'redirect_uri': redirect_uri, 'grant_type': 'authorization_code'} })
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
              }catch(e){
                setTimeout(function() {
                    browserRef.close();
                }, 10);
              }
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

  trakttv.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
