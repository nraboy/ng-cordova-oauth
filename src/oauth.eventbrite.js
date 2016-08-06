(function() {
  'use strict';

  angular.module('oauth.eventbrite', ['oauth.utils'])
    .factory('$ngCordovaEventbrite', eventbrite);

  function eventbrite($q, $http, $cordovaOauthUtility) {
    return { signin: oauthEventbrite };

    /*
     * Sign into the Eventbrite service
     *
     * @param    string clientId
     * @return   promise
     */
    function oauthEventbrite(clientId) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          var browserRef = window.cordova.InAppBrowser.open('https://www.eventbrite.com/oauth/authorize?response_type=token&client_id='+clientId,  '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener("loadstart", function(event) {
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
                deferred.resolve({ access_token: parameterMap.access_token, token_type: parameterMap.token_type});
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

  eventbrite.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
