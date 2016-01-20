angular.module('oauth.strava', ['oauth.utils'])
  .factory('$ngCordovaStrava', strava);

function strava($q, $http, $cordovaOauthUtility) {
  return { signin: oauthStrava };

  /*
  * Sign into the Strava service
  *
  * @param    string clientId
  * @param    string clientSecret
  * @param    array appScope
  * @param    object options
  * @return   promise
  */
  function oauthStrava(clientId, clientSecret, appScope, options) {
    var deferred = $q.defer();
    if(window.cordova) {
      if($cordovaOauthUtility.isInAppBrowserInstalled()) {
        var redirect_uri = "http://localhost/callback";
        if(options !== undefined) {
          if(options.hasOwnProperty("redirect_uri")) {
            redirect_uri = options.redirect_uri;
          }
        }
        var browserRef = window.cordova.InAppBrowser.open('https://www.strava.com/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&scope=' + appScope.join(",") + '&response_type=code&approval_prompt=force', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
        browserRef.addEventListener('loadstart', function(event) {
          if((event.url).indexOf(redirect_uri) === 0) {
            requestToken = (event.url).split("code=")[1];
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            $http({method: "post", url: "https://www.strava.com/oauth/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&code=" + requestToken })
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

strava.$inject = ['$q', '$http', '$cordovaOauthUtility'];
