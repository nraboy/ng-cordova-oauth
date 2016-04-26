(function () {
  'use strict';

  angular.module('oauth.pinterest', ['oauth.utils'])
    .factory('$ngCordovaPinterest', pinterest);

  function pinterest($q, $http, $cordovaOauthUtility) {
    return {
      signin: oauthPinterest
    };

    /*
     * Sign into the Pinterest service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthPinterest(clientId, clientSecret, appScope, options) {
      var deferred = $q.defer();
      if (window.cordova) {
        if ($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if (options !== undefined) {
            if (options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var flowUrlParam = $cordovaOauthUtility.generateUrlParameters({
            client_id: clientId,
            redirect_uri: redirect_uri,
            scope: appScope.join(","),
            response_type: "code"
          });
          var flowUrl = "https://api.pinterest.com/oauth/?" + flowUrlParam;
          var browserRef = window.cordova.InAppBrowser.open(flowUrl, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function (event) {
            if ((event.url).indexOf(redirect_uri) === 0) {
              var callbackResponse = (event.url).split("?")[1];
              var responeObject = $cordovaOauthUtility.parseResponseParameters(callbackResponse);
              if (responeObject.code !== undefined && responeObject.code !== null) {
                var accessTokenReqUrlParam = $cordovaOauthUtility.generateUrlParameters({
                  grant_type: "authorization_code",
                  client_id: clientId,
                  client_secret: clientSecret,
                  code: responeObject.code
                });
                var accessTokenReqUrl = "https://api.pinterest.com/v1/oauth/token?" + accessTokenReqUrlParam;
                $http({
                    method: "post",
                    url: accessTokenReqUrl
                  })
                  .then(function (result) {
                    deferred.resolve(result);
                  }, function (error) {
                    deferred.reject(error);
                  }).finally(function () {
                    setTimeout(function () {
                      browserRef.close();
                    }, 10);
                  });
              } else {
                deferred.reject("Problem authenticating");
                browserRef.close();
              }
            }
          });

          browserRef.addEventListener('exit', function (event) {
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

  pinterest.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();