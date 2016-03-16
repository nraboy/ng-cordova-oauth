(function() {
  'use strict';

  angular.module('oauth.envato', ['oauth.utils'])
    .factory('$ngCordovaEnvato', envato);

  function envato($q, $http, $cordovaOauthUtility) {
    return { signin: oauthEnvato };

    /*
     * Sign into the Envato service
     *
     * @param    string clientId
     * @param    object options
     * @return   promise
     */
    function oauthEnvato(clientId, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://api.envato.com/authorization?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
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
                deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in });
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

  envato.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
