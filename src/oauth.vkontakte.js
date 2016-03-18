(function() {
  'use strict';

  angular.module('oauth.vkontakte', ['oauth.utils'])
    .factory('$ngCordovaVkontakte', vkontakte);

  function vkontakte($q, $http, $cordovaOauthUtility) {
    return { signin: oauthvKontakte };

    /*
     * Sign into the Vkontakte service
     *
     * @param    string clientId
     * @param    array appScope (for example: "friends,wall,photos,messages")
     * @return   promise
     */
    function oauthvKontakte(clientId, appScope) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var browserRef = window.cordova.InAppBrowser.open('https://oauth.vk.com/authorize?client_id=' + clientId + '&redirect_uri=http://oauth.vk.com/blank.html&response_type=token&scope=' + appScope.join(",") + '&display=touch&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            var tmp = (event.url).split("#");
            if (tmp[0] == 'https://oauth.vk.com/blank.html' || tmp[0] == 'http://oauth.vk.com/blank.html') {
              browserRef.removeEventListener("exit",function(event){});
              browserRef.close();
              var callbackResponse = (event.url).split("#")[1];
              var responseParameters = (callbackResponse).split("&");
              var parameterMap = [];
              for(var i = 0; i < responseParameters.length; i++) {
                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
              }
              if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                var output = { access_token: parameterMap.access_token, expires_in: parameterMap.expires_in };
                if(parameterMap.email !== undefined && parameterMap.email !== null){
                  output.email = parameterMap.email;
                }
                deferred.resolve(output);
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

  vkontakte.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
