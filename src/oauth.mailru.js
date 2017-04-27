(function() {
  'use strict';

  angular.module('oauth.mailru', ['oauth.utils'])
    .factory('$ngCordovaMailru', mailru);

  function mailru($q, $cordovaOauthUtility) {
    return { signin: oauthMailru };

    /*
     * Sign into the Mail.ru service
     *
     * @param    string clientId
     * @param    array appScope (optional)
     * @param    object options (defaults {
            display: 'mobile', 
            browserWindow: 'location=no' // see http://cordova.apache.org/docs/en/latest/reference/cordova-plugin-inappbrowser/index.html#cordovainappbrowseropen
        })
     * @return   promise
     *
     *
     * Required:
     * <meta http-equiv="Content-Security-Policy" content="default-src 'self' https://connect.mail.ru/ ... ">
     */
    function oauthMailru(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          if(options === undefined) { options = {}; }
          if(appScope === undefined) { appScope = []; }
          if( !options.hasOwnProperty("redirect_uri") ) {
            options.redirect_uri = "http://connect.mail.ru/oauth/success.html"; // http://localhost/callback
            //~ deferred.reject({error: "You must set option redirect_uri that is an any url within YOUR DOMAIN! The redirect_uri:'http://localhost/callback' doesnt works."});
            //~ return deferred.promise;
          }
          if( !options.hasOwnProperty("display") ) {
            options.display = "mobile";
          }
          if( !options.hasOwnProperty("browserWindow") ) {
            options.browserWindow = "location=no"; 
          }
          var flowUrl = "https://connect.mail.ru/oauth/authorize?response_type=token&client_id=" + clientId + "&redirect_uri=" + options.redirect_uri + '&display=' + options.display + '&scope=' + appScope.join(" ");

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

  mailru.$inject = ['$q', '$cordovaOauthUtility'];
})();