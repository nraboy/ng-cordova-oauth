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
 */

(function(){

    angular.module("ngCordovaOauth", []).factory('$cordovaOauth', ['$q', '$http', function ($q, $http) {

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
                        if((event.url).indexOf("http://localhost/callback") == 0) {
                            var callbackResponse = (event.url).split("#")[1];
                            var responseParameters = (callbackResponse).split("&");
                            var parameterMap = [];
                            for(var i = 0; i < responseParameters.length; i++) {
                                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                            }
                            if(parameterMap["access_token"] !== undefined && parameterMap["access_token"] !== null) {
                                var promiseResponse = {
                                    access_token: parameterMap["access_token"],
                                    token_type: parameterMap["token_type"],
                                    uid: parameterMap["uid"]
                                }
                                deferred.resolve(promiseResponse);
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
                        if((event.url).indexOf("http://localhost/callback") == 0) {
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
             * @param    string clientSecret
             * @param    array appScope
             * @return   promise
             */
            google: function(clientId, clientSecret, appScope) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var browserRef = window.open('https://accounts.google.com/o/oauth2/auth?client_id=' + clientId + '&redirect_uri=http://localhost/callback&scope=' + appScope.join(" ") + '&approval_prompt=force&response_type=code&access_type=offline', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                    browserRef.addEventListener('loadstart', function(event) { 
                        if((event.url).indexOf("http://localhost/callback") == 0) {
                            requestToken = (event.url).split("code=")[1];
                            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                            $http({method: "post", url: "https://accounts.google.com/o/oauth2/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=http://localhost/callback" + "&grant_type=authorization_code" + "&code=" + requestToken })
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
            }

        }

    }]);

})();