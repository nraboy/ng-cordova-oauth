angular.module('oauth.mercadolibre', ['oauth.utils'])
  .factory('$ngCordovaMercadolibre', mercadolibre);

function mercadolibre($q, $http, $cordovaOauthUtility) {
  return { signin: oauthMercadolibre };

  /*
   * Sign into the Mercadolibre service
   *
   * @param    string appId
   * @param    object options
   * @return   promise
   */
  function oauthMercadolibre(appId, options) {
    var deferred = $q.defer();
    if(window.cordova) {
      if($cordovaOauthUtility.isInAppBrowserInstalled()) {
        var redirect_uri = "http://localhost/callback";
        if(options !== undefined) {
          if(options.hasOwnProperty("redirect_uri")) {
            redirect_uri = options.redirect_uri;
          }
        }
        var browserRef = window.cordova.InAppBrowser.open("http://auth.mercadolibre.com.ar/authorization?client_id=" + appId + "&redirect_uri=" + redirect_uri + "&response_type=token", "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
        browserRef.addEventListener("loadstart", function(event) {
          if ((event.url).indexOf(redirect_uri) === 0) {
            browserRef.removeEventListener("exit",function(event){});
            browserRef.close();
            var callbackResponse = (event.url).split("#")[1];
            var responseParameters = (callbackResponse).split("&");
            var parameterMap = [];
            for(var i = 0; i < responseParameters.length; i++) {
              parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
            }
            if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
              deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in, user_id: parameterMap.user_id, domains: parameterMap.domains });
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

mercadolibre.$inject = ['$q', '$http', '$cordovaOauthUtility'];
