(function() {
  'use strict';

  angular.module('oauth.twitter', ['oauth.utils'])
    .factory('$ngCordovaTwitter', twitter);

  function twitter($q, $http, $cordovaOauthUtility) {
    return { signin: oauthTwitter };

    /*
     * Sign into the Twitter service
     * Note that this service requires jsSHA for generating HMAC-SHA1 Oauth 1.0 signatures
     *
     * @param    string clientId
     * @param    string clientSecret
     * @return   promise
     */
    function oauthTwitter(clientId, clientSecret, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
                redirect_uri = options.redirect_uri;
            }
          }

          if(typeof jsSHA !== "undefined") {
            var oauthObject = {
              oauth_consumer_key: clientId,
              oauth_nonce: $cordovaOauthUtility.createNonce(10),
              oauth_signature_method: "HMAC-SHA1",
              oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
              oauth_version: "1.0"
            };
            var signatureObj = $cordovaOauthUtility.createSignature("POST", "https://api.twitter.com/oauth/request_token", oauthObject,  { oauth_callback: redirect_uri }, clientSecret);
            $http({
              method: "post",
              url: "https://api.twitter.com/oauth/request_token",
              headers: {
                  "Authorization": signatureObj.authorization_header,
                  "Content-Type": "application/x-www-form-urlencoded"
              },
              data: "oauth_callback=" + encodeURIComponent(redirect_uri)
            })
              .success(function(requestTokenResult) {
                var requestTokenParameters = (requestTokenResult).split("&");
                var parameterMap = {};
                for(var i = 0; i < requestTokenParameters.length; i++) {
                  parameterMap[requestTokenParameters[i].split("=")[0]] = requestTokenParameters[i].split("=")[1];
                }
                if(parameterMap.hasOwnProperty("oauth_token") === false) {
                  deferred.reject("Oauth request token was not received");
                }
                var browserRef = window.cordova.InAppBrowser.open('https://api.twitter.com/oauth/authenticate?oauth_token=' + parameterMap.oauth_token, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                browserRef.addEventListener('loadstart', function(event) {
                  if((event.url).indexOf(redirect_uri) === 0) {
                    var callbackResponse = (event.url).split("?")[1];
                    var responseParameters = (callbackResponse).split("&");
                    var parameterMap = {};
                    for(var i = 0; i < responseParameters.length; i++) {
                      parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                    }
                    if(parameterMap.hasOwnProperty("oauth_verifier") === false) {
                      deferred.reject("Browser authentication failed to complete.  No oauth_verifier was returned");
                    }
                    delete oauthObject.oauth_signature;
                    oauthObject.oauth_token = parameterMap.oauth_token;
                    var signatureObj = $cordovaOauthUtility.createSignature("POST", "https://api.twitter.com/oauth/access_token", oauthObject,  { oauth_verifier: parameterMap.oauth_verifier }, clientSecret);
                    $http({
                      method: "post",
                      url: "https://api.twitter.com/oauth/access_token",
                      headers: {
                          "Authorization": signatureObj.authorization_header
                      },
                      params: {
                          "oauth_verifier": parameterMap.oauth_verifier
                      }
                    })
                      .success(function(result) {
                        var accessTokenParameters = result.split("&");
                        var parameterMap = {};
                        for(var i = 0; i < accessTokenParameters.length; i++) {
                          parameterMap[accessTokenParameters[i].split("=")[0]] = accessTokenParameters[i].split("=")[1];
                        }
                        if(parameterMap.hasOwnProperty("oauth_token_secret") === false) {
                          deferred.reject("Oauth access token was not received");
                        }
                        deferred.resolve(parameterMap);
                      })
                      .error(function(error) {
                        deferred.reject(error);
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
              })
              .error(function(error) {
                deferred.reject(error);
              });
          } else {
              deferred.reject("Missing jsSHA JavaScript library");
          }
        } else {
            deferred.reject("Could not find InAppBrowser plugin");
        }
      } else {
        deferred.reject("Cannot authenticate via a web browser");
      }

      return deferred.promise;
    }
  }

  twitter.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
