(function() {
  'use strict';

  angular.module('oauth.passport', ['oauth.utils'])
    .factory('$ngCordovaPassport', passport);

  function passport($q, $http, $cordovaOauthUtility) {
    return { signin: oauthPassport };

    /*
     * Sign into the Laravel Passport service
     *
     * @param    string clientId
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthPassport(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          var target_url = '';
          var client_secret = '';
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
            if(options.hasOwnProperty("target_url")) {
              target_url = options.target_url;
            }
            if(options.hasOwnProperty('client_secret')) {
              client_secret = options.client_secret;
            }
          }

          var browserRef = window.cordova.InAppBrowser.open(target_url + '/oauth/authorize?response_type=code&client_id=' + clientId + '&redirect_uri='+ redirect_uri +'&scope=' + appScope.join(' '), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener("loadstart", function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var requestToken = (event.url).split("code=")[1];

              $http({method: "post", headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: target_url+ '/oauth/token', data: "client_id=" + clientId + "&client_secret=" + client_secret + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code" + "&code=" + requestToken })
                .then(function(data) {
                  deferred.resolve(data);
                })
                .catch(function(data, status) {
                  deferred.reject(data);
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
  passport.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
