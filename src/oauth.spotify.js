angular.module('oauth.spotify', ['oauth.utils'])
  .factory('$spotify', spotify);

function spotify($q, $http, $cordovaOauthUtility) {
  return { signin: oauthSpotify };

  /*
   * Sign into the Spotify service
   *
   * @param    string clientId
   * @param    object options
   * @return   promise
   */
  function oauthSpotify(clientId, appScope, options) {
    var deferred = $q.defer();
    if(window.cordova) {
      if($cordovaOauthUtility.isInAppBrowserInstalled()) {
        var redirect_uri = "http://localhost/callback";
        if(options !== undefined) {
          if(options.hasOwnProperty("redirect_uri")) {
            redirect_uri = options.redirect_uri;
          }
        }
        var browserRef = window.cordova.InAppBrowser.open('https://accounts.spotify.com/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=token&scope=' + appScope.join(" "), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
        browserRef.addEventListener('loadstart', function(event) {
          if((event.url).indexOf(redirect_uri) === 0) {
            browserRef.removeEventListener("exit",function(event){});
            browserRef.close();
            var callbackResponse = (event.url).split("#")[1];
            var responseParameters = (callbackResponse).split("&");
            var parameterMap = [];
            for(var i = 0; i < responseParameters.length; i++) {
              parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
            }
            if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
              deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in, account_username: parameterMap.account_username });
            } else {
              deferred.reject("Problem authenticating");
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

spotify.$inject = ['$q', '$http', '$cordovaOauthUtility'];
