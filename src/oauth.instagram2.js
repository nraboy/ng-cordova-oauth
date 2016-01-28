angular.module('oauth.instagram2', ['oauth.utils'])
    .factory('$ngCordovaInstagram2', instagram2);

function instagram2($q, $http, $cordovaOauthUtility) {
  return { signin: oauthInstagram2 };

  /*
   * Sign into the Instagram (Explicit) service
   *
   * @param    string clientId
   * @param    string clientSecret
   * @param    string appScope
   * @param    object options
   * @return   promise
   */
  function oauthInstagram2(clientId,clientSecret, appScope, options) {
    var deferred = $q.defer();
    if(window.cordova) {
      if($cordovaOauthUtility.isInAppBrowserInstalled()) {
        var redirect_uri = "http://localhost/callback";
        if(options !== undefined) {
          if(options.hasOwnProperty("redirect_uri")) {
            redirect_uri = options.redirect_uri;
          }
        }
        var browserRef = window.cordova.InAppBrowser.open('https://api.instagram.com/oauth/authorize/?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=' + appScope.join(" "), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');

        browserRef.addEventListener('loadstart', function(event) {
          if((event.url).indexOf(redirect_uri) === 0) {
            var requestToken = (event.url).split("code=")[1];

            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            $http({method: "post", url: "https://api.instagram.com/oauth/access_token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code&code=" + requestToken })
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

instagram2.$inject = ['$q', '$http', '$cordovaOauthUtility'];
