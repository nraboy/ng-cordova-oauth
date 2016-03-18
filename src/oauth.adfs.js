(function() {
  'use strict';

  angular.module('oauth.adfs', ['oauth.utils'])
    .factory('$ngCordovaAdfs', adfs);

  function adfs($q, $http, $cordovaOauthUtility) {
    return { signin: oauthAdfs };

    /*
     * Sign into the ADFS service (ADFS 3.0 onwards)
     *
     * @param    string clientId (client registered in ADFS, with redirect_uri configured to: http://localhost/callback)
     * @param  string adfsServer (url of the ADFS Server)
     * @param  string relyingPartyId (url of the Relying Party (resource relying on ADFS for authentication) configured in ADFS)
     * @return   promise
    */
    function oauthAdfs(clientId, adfsServer, relyingPartyId) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var browserRef = window.cordova.InAppBrowser.open(adfsServer + '/adfs/oauth2/authorize?response_type=code&client_id=' + clientId +'&redirect_uri=http://localhost/callback&resource=' + relyingPartyId, '_blank', 'location=no');

          browserRef.addEventListener("loadstart", function(event) {
            if((event.url).indexOf('http://localhost/callback') === 0) {
              var requestToken = (event.url).split("code=")[1];
              $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
              $http({method: "post", url: adfsServer + "/adfs/oauth2/token", data: "client_id=" + clientId + "&code=" + requestToken + "&redirect_uri=http://localhost/callback&grant_type=authorization_code"  })
                .success(function(data) {
                  deferred.resolve(data);
                })
                .error(function(data, status) {
                  deferred.reject("Problem authenticating");
                })
                .finally(function() {
                  setTimeout(function() {
                    browserRef.close();
                  }, 10);
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

  adfs.$inject = ['$q', '$http', '$cordovaOauthUtility'];

})();
