(function() {
  'use strict';

  angular.module('oauth.yahoo', ['oauth.utils'])
    .factory('$ngCordovaYahoo', yahoo);

  function yahoo($q, $cordovaOauthUtility) {
    return { signin: oauthYahoo };

    /*
     * Sign into the Yahoo service
     *
     * @param    string clientId
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthYahoo(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";

          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }

          var providerUrl = 'https://api.login.yahoo.com/oauth2/request_auth?client_id=' + clientId;
          providerUrl += '&redirect_uri=' + redirect_uri;
          providerUrl += '&response_type=token';
          providerUrl += '&scope=' + appScope.join(" ");

          var browserRef = window.cordova.InAppBrowser.open(
              providerUrl, 
              '_blank', 
              'location=no,clearsessioncache=yes,clearcache=yes'
          );

          browserRef.addEventListener("loadstart", function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              browserRef.removeEventListener("exit",function(event){});
              browserRef.close();

              var callbackResponse = (event.url).split("#")[1];
              var responseParameters = (callbackResponse).split("&");
              var parameterMap = {};
              for(var i = 0; i < responseParameters.length; i++) {
                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
              }

              if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                deferred.resolve({ 
                  access_token: parameterMap.access_token, 
                  token_type: parameterMap.token_type, 
                  expires_in: parameterMap.expires_in, 
                  id_token: parameterMap.id_token 
                });
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

  yahoo.$inject = ['$q', '$cordovaOauthUtility'];
})();
