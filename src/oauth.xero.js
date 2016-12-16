(function() {
    'use strict';

    angular.module('oauth.xero', ['oauth.utils'])
        .factory('$ngCordovaXero', xero);

        function xero($q, $http, $cordovaOauthUtility) {
            return { signin: oauthXero };

            /*
             * Sign into the Xero service
             * Note that this service requires jsSHA for generating HMAC-SHA1 Oauth 1.0 signatures
             *
             * @param    string clientId
             * @param    string clientSecret
             * @return   promise
             */
            function oauthXero(clientId, clientSecret, options) {
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

                            var signatureObj = $cordovaOauthUtility.createSignature("GET", "https://api.xero.com/oauth/RequestToken", oauthObject,  { oauth_callback: redirect_uri }, clientSecret);

                            $http({
                                method: "get",
                                url: 'https://api.xero.com/oauth/RequestToken?oauth_consumer_key=' + clientId + '&oauth_nonce=' + oauthObject.oauth_nonce + '&oauth_signature_method=HMAC-SHA1&oauth_timestamp=' + oauthObject.oauth_timestamp + '&oauth_version=1.0&oauth_signature=' + signatureObj.signature + '&oauth_callback=' + encodeURIComponent(redirect_uri)
                            }).then(function(requestTokenResult) {
                                var requestTokenParameters = (requestTokenResult.data).split("&");
                                var parameterMap = {};

                                for(var i = 0; i < requestTokenParameters.length; i++) {
                                    parameterMap[requestTokenParameters[i].split("=")[0]] = requestTokenParameters[i].split("=")[1];
                                }

                                if(parameterMap.hasOwnProperty("oauth_token") === false) {
                                    deferred.reject("Oauth request token was not received");
                                }

                                var browserRef = window.cordova.InAppBrowser.open('https://api.xero.com/oauth/Authorize?oauth_token=' + parameterMap.oauth_token, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');

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
                                        oauthObject.oauth_verifier = parameterMap.oauth_verifier;
                                        oauthObject.oauth_nonce = $cordovaOauthUtility.createNonce(10);

console.log('Response Params: ', parameterMap);
console.log('Access Token Request oauthObject: ', oauthObject);

                                        var signatureObj = $cordovaOauthUtility.createSignature("GET", "https://api.xero.com/oauth/AccessToken", oauthObject,  { "oauth_verifier": oauthObject.oauth_verifier }, clientSecret);

console.log('Signature: ', signatureObj);

                                        $http({
                                            method: "get",
                                            url: "https://api.xero.com/oauth/AccessToken?oauth_consumer_key=" + clientId + "&oauth_nonce=" + oauthObject.oauth_nonce + "&oauth_signature_method=HMAC-SHA1&oauth_timestamp=" + oauthObject.oauth_timestamp + "&oauth_version=1.0&oauth_token=" + oauthObject.oauth_token + "&oauth_verifier=" + oauthObject.oauth_verifier + "&oauth_signature=" + signatureObj.signature
                                        }).then(function(response) {
                                            console.log('Response: ', response);
                                        }).catch(function(error) {
                                            console.log('Error: ', error);
                                        });

                                    }
                                });

                            }).catch(function(error) {
                                console.log('REQUEST TOKEN REQUEST ERROR', error);
                                deferred.reject(error);
                            });
                        } else {
                            deferred.reject("Missing jsSHA JavaScript library");
                        }

                        //var browserRef = window.cordova.InAppBrowser.open('https://api.xero.com/oauth/RequestToken?oauth_consumer_key=' + clientId + '&oauth_callback=' + redirect_uri + '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');


                        //
                        // browserRef.addEventListener('exit', function(event) {
                        //     deferred.reject("The sign in flow was canceled");
                        // });
                    } else {
                        deferred.reject("Could not find InAppBrowser plugin");
                    }
                } else {
                    deferred.reject("Cannot authenticate via a web browser");
                }

                return deferred.promise;
            }
        }

    xero.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();