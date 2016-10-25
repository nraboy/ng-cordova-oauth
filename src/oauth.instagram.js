(function() {
  'use strict';

  angular.module('oauth.instagram', ['oauth.utils'])
    .factory('$ngCordovaInstagram', instagram);

  function instagram($q, $http, $cordovaOauthUtility) {
    return { signin: oauthInstagram };

    /*
     * Sign into the Instagram service
     *
     * @param    string clientId
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthInstagram(clientId, appScope, options) {
      var deferred = $q.defer();
      var split_tokens = {
          'code':'?',
          'token':'#'
      };

      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          var response_type = "token";
          var instagramUrl = 'https://www.instagram.com/';
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
            if(options.hasOwnProperty("response_type")) {
              response_type = options.response_type;
            }
          }

          var scope = '';
          if (appScope && appScope.length > 0) {
            scope = '&scope=' + appScope.join('+');
          }

          var url='https://api.instagram.com/oauth/authorize/?client_id=' + clientId + scope + '&response_type=' + response_type + '&redirect_uri=' + redirect_uri;
          var browserRef = window.cordova.InAppBrowser.open(url, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
                browserRef.removeEventListener("exit",function(event){});
                browserRef.close();
                var callbackResponse = (event.url).split(split_tokens[response_type])[1];
                var parameterMap = $cordovaOauthUtility.parseResponseParameters(callbackResponse);
                if(parameterMap.access_token) {
                  deferred.resolve({ access_token: parameterMap.access_token });
                } else if(parameterMap.code !== undefined && parameterMap.code !== null) {
                  deferred.resolve({ code: parameterMap.code });
                } else {
                  deferred.reject("Problem authenticating");
                }
            } else if ((event.url)===instagramUrl) {
                browserRef.executeScript({
                    code: "window.location = '"+url+"';"
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

  instagram.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
