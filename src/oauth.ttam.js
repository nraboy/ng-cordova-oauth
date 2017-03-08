(function() {
  'use strict';

  angular.module('oauth.ttam', ['oauth.utils'])
    .factory('$ngCordovaTtam', ttam);

  function ttam($q, $http, $cordovaOauthUtility) {
    return { 
      signin: oauthTtam,
    };

    /*
     * Sign into the Ttam service
     *
     * @param    string clientId
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthTtam(clientId, clientSecret,appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var flowUrl = "https:/api.23andme.com/authorize/?client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=" + appScope;
          if(options !== undefined && options.hasOwnProperty("auth_type")) {
            flowUrl += "&auth_type=" + options.auth_type;
          }

          var browserRef;
          browserRef = window.cordova.InAppBrowser.open(flowUrl, '_blank', 'location=no');

          browserRef.addEventListener('loadstart', function(event) {
             if((event.url).indexOf(redirect_uri) === 0) {
              try {
                var requestToken = (event.url).split("code=")[1].split("&")[0];
               $http({
                  method: "post", 
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
                  url: "https://api.23andme.com/token", 
                  data: 
                     "client_id=" + clientId + 
                     "&client_secret=" + clientSecret + 
                     "&redirect_uri=" + redirect_uri + 
                     "&grant_type=authorization_code" + 
                     "&code=" + requestToken + 
                     "&scope="+appScope})
                  .success(function(data) {
                    deferred.resolve(data);
                  })
                  .error(function(data, status) {
                    deferred.reject("Problem authenticating: "+data.error_description);
                  })
                  .finally(function() {
                    setTimeout(function() {
                        browserRef.close();
                    }, 10);
                  });
              }catch(e){
                setTimeout(function() {
                    browserRef.close();
                }, 10);
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

  ttam.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
