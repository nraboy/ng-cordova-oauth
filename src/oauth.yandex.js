(function() {
  'use strict';

  angular.module('oauth.yandex', ['oauth.utils'])
    .factory('$ngCordovaYandex', yandex);

  function yandex($q, $cordovaOauthUtility) {
    return { signin: oauthYandex };

    /*
     * Sign into the Yandex service
     *
     * @param    string clientId
     * @param    object options (defaults {
            force_confirm: 'yes', // allow account change
            browserWindow: 'location=no' // see http://cordova.apache.org/docs/en/latest/reference/cordova-plugin-inappbrowser/index.html#cordovainappbrowseropen
        })
     * @return   promise
     *
     * Required:
     * <meta http-equiv="Content-Security-Policy" content="default-src 'self' https://oauth.yandex.ru ... ">
     */
    function oauthYandex(clientId, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          if(options === undefined) { options = {}; }
          if( !options.hasOwnProperty("redirect_uri") ) {
            options.redirect_uri = "http://localhost/callback";
          }
          if( !options.hasOwnProperty("force_confirm") ) {
            options.force_confirm = "yes";
          }
          if( !options.hasOwnProperty("browserWindow") ) {
            options.browserWindow = "location=no"; 
          }
          var flowUrl = "https://oauth.yandex.ru/authorize?response_type=token&client_id=" + clientId + "&redirect_uri=" + options.redirect_uri + "&force_confirm=" + options.force_confirm;

          var browserRef = window.cordova.InAppBrowser.open(flowUrl, '_blank', options.browserWindow);
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(options.redirect_uri) === 0) {
              browserRef.removeEventListener("exit",function(event){});
              browserRef.close();
              var callbackResponse = (event.url).split("#")[1];
              var responseParameters = (callbackResponse).split("&");
              var parameterMap = {};
              for(var i = 0; i < responseParameters.length; i++) {
                var splitParam = responseParameters[i].split("=");
                parameterMap[splitParam[0]] = splitParam[1];
              }
              if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                deferred.resolve(parameterMap);
              } else {
                deferred.reject(parameterMap);
              }
            }
          });
          browserRef.addEventListener('exit', function(event) {
            deferred.reject({error: "The sign in flow was canceled"});
          });
        } else {
          deferred.reject({error: "Could not find InAppBrowser plugin"});
        }
      } else {
        deferred.reject({error: "Cannot authenticate via a web browser"});
      }

      return deferred.promise;
    }
  }

  yandex.$inject = ['$q', '$cordovaOauthUtility'];
})();