angular.module('oauth.untappd', ['oauth.utils'])
  .factory('$untappd', untappd);

function untappd($q, $http, $cordovaOauthUtility) {
  return { signin: oauthUntappd };

  /*
  * Sign into the Untappd service
  *
  * @param    string clientId
  * @param    object options
  * @return   promise
  */
  function oauthUntappd(clientId, options) {
    var deferred = $q.defer();
    if (window.cordova) {
      if ($cordovaOauthUtility.isInAppBrowserInstalled()) {
        var redirect_url = "http://localhost/callback";
        if(options !== undefined) {
          if(options.hasOwnProperty("redirect_url")) {
            redirect_url = options.redirect_url;
          }
        }
        var browserRef = window.cordova.InAppBrowser.open('https://untappd.com/oauth/authenticate/?client_id=' + clientId + '&redirect_url=' + redirect_url + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
        browserRef.addEventListener('loadstart', function (event) {
          if ((event.url).indexOf(redirect_url) === 0) {
            browserRef.removeEventListener("exit",function(event){});
            browserRef.close();
            var callbackResponse = (event.url).split("#")[1];
            var responseParameters = (callbackResponse).split("&");
            var parameterMap = [];

            for (var i = 0; i < responseParameters.length; i++) {
              parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
            }

            if (parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
              var promiseResponse = {
                access_token: parameterMap.access_token
              };
              deferred.resolve(promiseResponse);
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

untappd.$inject = ['$q', '$http', '$cordovaOauthUtility'];
