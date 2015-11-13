angular.module('oauth.magento', ['oauth.utils'])
  .factory('$magento', magento);

function magento($q, $http, $cordovaOauthUtility) {
  return { signin: oauthMagento };

  /*
  * Sign into the Magento service
  * Note that this service requires jsSHA for generating HMAC-SHA1 Oauth 1.0 signatures
  *
  * @param    string baseUrl
  * @param    string clientId
  * @param    string clientSecret
  * @return   promise
  */
  function oauthMagento(baseUrl, clientId, clientSecret) {
    var deferred = $q.defer();
    if(window.cordova) {
      if($cordovaOauthUtility.isInAppBrowserInstalled()) {
        if(typeof jsSHA !== "undefined") {
          var oauthObject = {
            oauth_callback: "http://localhost/callback",
            oauth_consumer_key: clientId,
            oauth_nonce: $cordovaOauthUtility.createNonce(5),
            oauth_signature_method: "HMAC-SHA1",
            oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
            oauth_version: "1.0"
          };
          var signatureObj = $cordovaOauthUtility.createSignature("POST", baseUrl + "/oauth/initiate", oauthObject,  { oauth_callback: "http://localhost/callback" }, clientSecret);
          $http.defaults.headers.post.Authorization = signatureObj.authorization_header;
          $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
          $http({method: "post", url: baseUrl + "/oauth/initiate", data: "oauth_callback=http://localhost/callback" })
          .success(function(requestTokenResult) {
            var requestTokenParameters = (requestTokenResult).split("&");
            var parameterMap = {};

            for(var i = 0; i < requestTokenParameters.length; i++) {
              parameterMap[requestTokenParameters[i].split("=")[0]] = requestTokenParameters[i].split("=")[1];
            }

            if(parameterMap.hasOwnProperty("oauth_token") === false) {
              deferred.reject("Oauth request token was not received");
            }

            var tokenSecret = parameterMap.oauth_token_secret;
            var browserRef = window.cordova.InAppBrowser.open(baseUrl + '/oauth/authorize?oauth_token=' + parameterMap.oauth_token, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');

            browserRef.addEventListener('loadstart', function(event) {
              if ((event.url).indexOf("http://localhost/callback") === 0) {
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
                delete oauthObject.oauth_callback;
                oauthObject.oauth_token = parameterMap.oauth_token;
                oauthObject.oauth_nonce = $cordovaOauthUtility.createNonce(5);
                oauthObject.oauth_verifier = parameterMap.oauth_verifier;
                var signatureObj = $cordovaOauthUtility.createSignature("POST", baseUrl + "/oauth/token", oauthObject,  {}, clientSecret, tokenSecret);
                $http.defaults.headers.post.Authorization = signatureObj.authorization_header;
                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                $http({method: "post", url: baseUrl + "/oauth/token" })
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

magento.$inject = ['$q', '$http', '$cordovaOauthUtility'];
