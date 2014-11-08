/*
 * Cordova AngularJS Oauth
 *
 * Created by Nic Raboy
 * http://www.nraboy.com
 *
 *
 *
 * DESCRIPTION:
 *
 * Use Oauth sign in for various web services.
 *
 *
 * REQUIRES:
 *
 *    Apache Cordova 3.5+
 *    Apache InAppBrowser Plugin
 *
 *
 * SUPPORTS:
 *
 *    Dropbox
 *    Digital Ocean
 *    Google
 *    GitHub
 *    Facebook
 *    LinkedIn
 *    Instagram
 *    Box
 *    Reddit
 */

(function(){

    angular.module("ngCordovaOauth", ['ngCordovaOauthUtility']).factory('$cordovaOauth', ['$q', '$http', '$cordovaOauthUtility', function ($q, $http, $cordovaOauthUtility) {

        return {

            /*
             * Sign into the Dropbox service
             *
             * @param    string appKey
             * @return   promise
             */
            dropbox: function(appKey) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var browserRef = window.open("https://www.dropbox.com/1/oauth2/authorize?client_id=" + appKey + "&redirect_uri=http://localhost/callback" + "&response_type=token", "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
                    browserRef.addEventListener("loadstart", function(event) {
                        if((event.url).indexOf("http://localhost/callback") === 0) {
                            var callbackResponse = (event.url).split("#")[1];
                            var responseParameters = (callbackResponse).split("&");
                            var parameterMap = [];
                            for(var i = 0; i < responseParameters.length; i++) {
                                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                            }
                            if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                                deferred.resolve({ access_token: parameterMap.access_token, token_type: parameterMap.token_type, uid: parameterMap.uid });
                            } else {
                                deferred.reject("Problem authenticating");
                            }
                            browserRef.close();
                        }
                    });
                } else {
                    deferred.reject("Cannot authenticate via a web browser");
                }
                return deferred.promise;
            },

            /*
             * Sign into the Digital Ocean service
             *
             * @param    string clientId
             * @param    string clientSecret
             * @return   promise
             */
            digitalOcean: function(clientId, clientSecret) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var browserRef = window.open("https://cloud.digitalocean.com/v1/oauth/authorize?client_id=" + clientId + "&redirect_uri=http://localhost/callback&response_type=code&scope=read%20write", "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
                    browserRef.addEventListener("loadstart", function(event) {
                        if((event.url).indexOf("http://localhost/callback") === 0) {
                            var requestToken = (event.url).split("code=")[1];
                            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                            $http({method: "post", url: "https://cloud.digitalocean.com/v1/oauth/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=http://localhost/callback" + "&grant_type=authorization_code" + "&code=" + requestToken })
                                .success(function(data) {
                                    deferred.resolve(data);
                                })
                                .error(function(data, status) {
                                    deferred.reject("Problem authenticating");
                                });
                            browserRef.close();
                        }
                    });
                } else {
                    deferred.reject("Cannot authenticate via a web browser");
                }
                return deferred.promise;
            },

            /*
             * Sign into the Google service
             *
             * @param    string clientId
             * @param    array appScope
             * @return   promise
             */
            google: function(clientId, appScope) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var browserRef = window.open('https://accounts.google.com/o/oauth2/auth?client_id=' + clientId + '&redirect_uri=http://localhost/callback&scope=' + appScope.join(" ") + '&approval_prompt=force&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                    browserRef.addEventListener("loadstart", function(event) {
                        if((event.url).indexOf("http://localhost/callback") === 0) {
                            var callbackResponse = (event.url).split("#")[1];
                            var responseParameters = (callbackResponse).split("&");
                            var parameterMap = [];
                            for(var i = 0; i < responseParameters.length; i++) {
                                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                            }
                            if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                                deferred.resolve({ access_token: parameterMap.access_token, token_type: parameterMap.token_type, expires_in: parameterMap.expires_in });
                            } else {
                                deferred.reject("Problem authenticating");
                            }
                            browserRef.close();
                        }
                    });
                } else {
                    deferred.reject("Cannot authenticate via a web browser");
                }
                return deferred.promise;
            },

            /*
             * Sign into the GitHub service
             *
             * @param    string clientId
             * @param    string clientSecret
             * @param    array appScope
             * @return   promise
             */
            github: function(clientId, clientSecret, appScope) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var browserRef = window.open('https://github.com/login/oauth/authorize?client_id=' + clientId + '&redirect_uri=http://localhost/callback&scope=' + appScope.join(","), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                    browserRef.addEventListener('loadstart', function(event) {
                        if((event.url).indexOf("http://localhost/callback") === 0) {
                            requestToken = (event.url).split("code=")[1];
                            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                            $http.defaults.headers.post.accept = 'application/json';
                            $http({method: "post", url: "https://github.com/login/oauth/access_token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=http://localhost/callback" + "&code=" + requestToken })
                                .success(function(data) {
                                    deferred.resolve(data);
                                })
                                .error(function(data, status) {
                                    deferred.reject("Problem authenticating");
                                });
                            browserRef.close();
                        }
                    });
                } else {
                    deferred.reject("Cannot authenticate via a web browser");
                }
                return deferred.promise;
            },

            /*
             * Sign into the Facebook service
             *
             * @param    string clientId
             * @param    array appScope
             * @return   promise
             */
            facebook: function(clientId, appScope) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var browserRef = window.open('https://www.facebook.com/dialog/oauth?client_id=' + clientId + '&redirect_uri=http://localhost/callback&response_type=token&scope=' + appScope.join(","), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                    browserRef.addEventListener('loadstart', function(event) {
                        if((event.url).indexOf("http://localhost/callback") === 0) {
                            var callbackResponse = (event.url).split("#")[1];
                            var responseParameters = (callbackResponse).split("&");
                            var parameterMap = [];
                            for(var i = 0; i < responseParameters.length; i++) {
                                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                            }
                            if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                                deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in });
                            } else {
                                deferred.reject("Problem authenticating");
                            }
                            browserRef.close();
                        }
                    });
                } else {
                    deferred.reject("Cannot authenticate via a web browser");
                }
                return deferred.promise;
            },

            /*
             * Sign into the LinkedIn service
             *
             * @param    string clientId
             * @param    string clientSecret
             * @param    array appScope
             * @param    string state
             * @return   promise
             */
            linkedin: function(clientId, clientSecret, appScope, state) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var browserRef = window.open('https://www.linkedin.com/uas/oauth2/authorization?client_id=' + clientId + '&redirect_uri=http://localhost/callback&scope=' + appScope.join(" ") + '&response_type=code&state=' + state, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                    browserRef.addEventListener('loadstart', function(event) {
                        if((event.url).indexOf("http://localhost/callback") === 0) {
                            requestToken = (event.url).split("code=")[1];
                            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                            $http({method: "post", url: "https://www.linkedin.com/uas/oauth2/accessToken", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=http://localhost/callback" + "&grant_type=authorization_code" + "&code=" + requestToken })
                                .success(function(data) {
                                    deferred.resolve(data);
                                })
                                .error(function(data, status) {
                                    deferred.reject("Problem authenticating");
                                });
                            browserRef.close();
                        }
                    });
                } else {
                    deferred.reject("Cannot authenticate via a web browser");
                }
                return deferred.promise;
            },

            /*
             * Sign into the Instagram service
             *
             * @param    string clientId
             * @param    array appScope
             * @return   promise
             */
            instagram: function(clientId, appScope) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var browserRef = window.open('https://api.instagram.com/oauth/authorize/?client_id=' + clientId + '&redirect_uri=http://localhost/callback&scope=' + appScope.join(" ") + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                    browserRef.addEventListener('loadstart', function(event) {
                        if((event.url).indexOf("http://localhost/callback") === 0) {
                            var callbackResponse = (event.url).split("#")[1];
                            var responseParameters = (callbackResponse).split("&");
                            var parameterMap = [];
                            for(var i = 0; i < responseParameters.length; i++) {
                                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                            }
                            if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                                deferred.resolve({ access_token: parameterMap.access_token });
                            } else {
                                deferred.reject("Problem authenticating");
                            }
                            browserRef.close();
                        }
                    });
                } else {
                    deferred.reject("Cannot authenticate via a web browser");
                }
                return deferred.promise;
            },

            /*
             * Sign into the Box service
             *
             * @param    string clientId
             * @param    string clientSecret
             * @param    string appState
             * @return   promise
             */
            box: function(clientId, clientSecret, appState) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var browserRef = window.open('https://app.box.com/api/oauth2/authorize/?client_id=' + clientId + '&redirect_uri=http://localhost/callback&state=' + appState + '&response_type=code', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                    browserRef.addEventListener('loadstart', function(event) {
                        if((event.url).indexOf("http://localhost/callback") === 0) {
                            requestToken = (event.url).split("code=")[1];
                            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                            $http({method: "post", url: "https://app.box.com/api/oauth2/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=http://localhost/callback" + "&grant_type=authorization_code" + "&code=" + requestToken })
                                .success(function(data) {
                                    deferred.resolve(data);
                                })
                                .error(function(data, status) {
                                    deferred.reject("Problem authenticating");
                                });
                            browserRef.close();
                        }
                    });
                } else {
                    deferred.reject("Cannot authenticate via a web browser");
                }
                return deferred.promise;
            },

            /*
             * Sign into the Reddit service
             *
             * @param    string clientId
             * @param    string clientSecret
             * @param    array appScope
             * @return   promise
             */
            reddit: function(clientId, clientSecret, appScope) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var browserRef = window.open('https://ssl.reddit.com/api/v1/authorize?client_id=' + clientId + '&redirect_uri=http://localhost/callback&duration=permanent&state=ngcordovaoauth&scope=' + appScope.join(",") + '&response_type=code', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                    browserRef.addEventListener('loadstart', function(event) {
                        if((event.url).indexOf("http://localhost/callback") === 0) {
                            requestToken = (event.url).split("code=")[1];
                            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                            $http.defaults.headers.post.Authorization = 'Basic ' + btoa(clientId + ":" + clientSecret);
                            $http({method: "post", url: "https://ssl.reddit.com/api/v1/access_token", data: "redirect_uri=http://localhost/callback" + "&grant_type=authorization_code" + "&code=" + requestToken })
                                .success(function(data) {
                                    deferred.resolve(data);
                                })
                                .error(function(data, status) {
                                    deferred.reject("Problem authenticating");
                                });
                            browserRef.close();
                        }
                    });
                } else {
                    deferred.reject("Cannot authenticate via a web browser");
                }
                return deferred.promise;
            },

            twitter: function(clientId, clientSecret) {
                var deferred = $q.defer();
                if(typeof jsSHA !== "undefined") {
                    var nonceObj = new jsSHA(Math.round((new Date()).getTime() / 1000.0), "TEXT");
                    var oauthObject = {
                        oauth_consumer_key: clientId,
                        oauth_nonce: nonceObj.getHash("SHA-1", "HEX"),
                        oauth_signature_method: "HMAC-SHA1",
                        oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
                        oauth_version: "1.0"
                    };
                    var test = $cordovaOauthUtility.createSignature("POST", "https://api.twitter.com/oauth/request_token", oauthObject,  { oauth_callback: "http://localhost/callback" }, clientSecret);
                    $http.defaults.headers.post.Authorization = test.authorization_header;
                    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                    $http({method: "post", url: "https://api.twitter.com/oauth/request_token", data: "oauth_callback=http://localhost/callback" })
                        .success(function(requestTokenResult) {
                            console.log("REQUEST TOKEN -> " + requestTokenResult);
                            var requestTokenParameters = (requestTokenResult).split("&");
                            var parameterMap = [];
                            for(var i = 0; i < requestTokenParameters.length; i++) {
                                if(requestTokenParameters[i].split("=")[0] === "oauth_token") {

                                }
                                parameterMap[requestTokenParameters[i].split("=")[0]] = requestTokenParameters[i].split("=")[1];
                            }
                            var browserRef = window.open('https://api.twitter.com/oauth/authenticate?oauth_token=' + parameterMap.oauth_token, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                            browserRef.addEventListener('loadstart', function(event) {
                                if((event.url).indexOf("http://localhost/callback") === 0) {
                                    var callbackResponse = (event.url).split("?")[1];
                                    var responseParameters = (callbackResponse).split("&");
                                    var parameterMap = [];
                                    for(var i = 0; i < responseParameters.length; i++) {
                                        parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                                    }
                                    delete oauthObject.oauth_signature;
                                    oauthObject.oauth_token = parameterMap.oauth_token;
                                    var signatureObj = $cordovaOauthUtility.createSignature("POST", "https://api.twitter.com/oauth/access_token", oauthObject,  { oauth_verifier: parameterMap.oauth_verifier }, clientSecret);
                                    $http.defaults.headers.post.Authorization = signatureObj.authorization_header;
                                    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                                    $http({method: "post", url: "https://api.twitter.com/oauth/access_token", data: "oauth_verifier=" + parameterMap.oauth_verifier })
                                        .success(function(result) {
                                            console.log(result);
                                        })
                                        .error(function(error) {
                                            deferred.reject(error);
                                        });
                                    browserRef.close();
                                }
                            });
                        })
                        .error(function(error) {
                            deferred.reject(error);
                        });
                } else {
                    deferred.reject("Missing jsSHA JavaScript library");
                }
                return deferred.promise;
            }

        };

    }]);

    angular.module("ngCordovaOauthUtility", []).factory('$cordovaOauthUtility', ['$q', function ($q) {

        return {

            createSignature: function(method, endPoint, headerParameters, bodyParameters, secretKey) {
                if(typeof jsSHA !== "undefined") {
                    var headerAndBodyParameters = angular.copy(headerParameters);
                    var bodyParameterKeys = Object.keys(bodyParameters);
                    for(var i = 0; i < bodyParameterKeys.length; i++) {
                        headerAndBodyParameters[bodyParameterKeys[i]] = encodeURIComponent(bodyParameters[bodyParameterKeys[i]]);
                    }
                    var signatureBaseString = method + "&" + encodeURIComponent(endPoint) + "&";
                    var headerAndBodyParameterKeys = (Object.keys(headerAndBodyParameters)).sort();
                    for(i = 0; i < headerAndBodyParameterKeys.length; i++) {
                        if(i == headerAndBodyParameterKeys.length - 1) {
                            signatureBaseString += encodeURIComponent(headerAndBodyParameterKeys[i] + "=" + headerAndBodyParameters[headerAndBodyParameterKeys[i]]);
                        } else {
                            signatureBaseString += encodeURIComponent(headerAndBodyParameterKeys[i] + "=" + headerAndBodyParameters[headerAndBodyParameterKeys[i]] + "&");
                        }
                    }
                    var oauthSignatureObject = new jsSHA(signatureBaseString, "TEXT");
                    headerParameters.oauth_signature = encodeURIComponent(oauthSignatureObject.getHMAC(encodeURIComponent(secretKey) + "&", "TEXT", "SHA-1", "B64"));
                    var headerParameterKeys = Object.keys(headerParameters);
                    var authorizationHeader = 'OAuth ';
                    for(i = 0; i < headerParameterKeys.length; i++) {
                        if(i == headerParameterKeys.length - 1) {
                            authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '"';
                        } else {
                            authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '",';
                        }
                    }
                    return { signature_base_string: signatureBaseString, authorization_header: authorizationHeader };
                } else {
                    return "Missing jsSHA JavaScript library";
                }
            }

        };

    }]);

})();
