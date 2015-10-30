angular.module("oauth.providers", [
  "oauth.utils", "oauth.azuread", "oauth.adfs", 'oauth.dropbox',
  'oauth.digitalOcean', 'oauth.google', 'oauth.github', 'oauth.facebook',
  'oauth.linkedin', 'oauth.instagram', 'oauth.box', 'oauth.reddit', 'oauth.slack',
  'oauth.twitter', 'oauth.meetup', 'oauth.salesforce', 'oauth.strava',
  'oauth.withings', 'oauth.foursquare'])
    .factory("$cordovaOauth", [
      "$q", '$http', "$cordovaOauthUtility", "$azureAD", "$adfs", '$dropbox',
      '$digitalOcean', '$google', '$github', '$facebook', '$linkedin',
      '$instagram', '$box', '$reddit', '$slack', '$twitter' '$meetup', '$salesforce',
      '$strava', '$withings', '$foursquare', function(
      $q, $http, $cordovaOauthUtility, $azureAD, $adfs, $dropbox, $digitalOcean,
      $google, $github, $facebook, $linkedin, $instagram, $box, $reddit, $slack,
      $twitter, $meetup, $salesforce, $strava, $withings, $foursquare) {

        return {
          azureAD: $azureAD.signin,
          adfs: $adfs.signin,
          dropbox: $dropbox.signin,
          digitalOcean: $digitalOcean.signin,
          google: $google.signin,
          github: $github.signin,
          facebook: $facebook.signin,
          linkedin: $linkedin.signin,
          instagram: $instagram.signin,
          box: $box.signin,
          reddit: $reddit.signin,
          slack: $slack.signin,
          twitter: $twitter.signin,
          meetup: $meetup.signin,
          salesforce: $salesforce.signin,
          strava: $strava.signin,
          withings: $withings.signin,
          foursquare: $foursquare.signin,

            /*
            * Sign into the Magento service
            * Note that this service requires jsSHA for generating HMAC-SHA1 Oauth 1.0 signatures
            *
            * @param    string baseUrl
            * @param    string clientId
            * @param    string clientSecret
            * @return   promise
            */
            magento: function(baseUrl, clientId, clientSecret) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
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
                                var browserRef = window.open(baseUrl + '/oauth/authorize?oauth_token=' + parameterMap.oauth_token, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                                browserRef.addEventListener('loadstart', function(event) {
                                    if((event.url).indexOf("http://localhost/callback") === 0) {
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
            },

            /*
             * Sign into the Vkontakte service
             *
             * @param    string clientId
             * @param    array appScope (for example: "friends,wall,photos,messages")
             * @return   promise
             */
            vkontakte: function(clientId, appScope) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var browserRef = window.open('https://oauth.vk.com/authorize?client_id=' + clientId + '&redirect_uri=http://oauth.vk.com/blank.html&response_type=token&scope=' + appScope.join(",") + '&display=touch&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function(event) {
                            var tmp = (event.url).split("#");
                            if (tmp[0] == 'https://oauth.vk.com/blank.html' || tmp[0] == 'http://oauth.vk.com/blank.html') {
                            	browserRef.removeEventListener("exit",function(event){});
                            	browserRef.close();
                                var callbackResponse = (event.url).split("#")[1];
                                var responseParameters = (callbackResponse).split("&");
                                var parameterMap = [];
                                for(var i = 0; i < responseParameters.length; i++) {
                                    parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                                }
                                if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                                    var output = { access_token: parameterMap.access_token, expires_in: parameterMap.expires_in };
                                    if(parameterMap.email !== undefined && parameterMap.email !== null){
                                        output.email = parameterMap.email;
                                    }
                                    deferred.resolve(output);
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
            },

			/*
            * Sign into the Odnoklassniki service
            *
            * @param    string clientId
            * @param    array appScope (for example: "VALUABLE_ACCESS ,GROUP_CONTENT,VIDEO_CONTENT")
            * @return   promise
            */
            odnoklassniki: function (clientId, appScope)
            {
                var deferred = $q.defer();
                if (window.cordova)
                {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if ($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true)
                    {
                        var browserRef = window.open('http://www.odnoklassniki.ru/oauth/authorize?client_id=' + clientId + '&scope=' + appScope.join(",") + '&response_type=token&redirect_uri=http://localhost/callback' + '&layout=m', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function (event)
                        {
                            if ((event.url).indexOf("http://localhost/callback") === 0)
                            {
                                var callbackResponse = (event.url).split("#")[1];
                                var responseParameters = (callbackResponse).split("&");
                                var parameterMap = [];
                                for (var i = 0; i < responseParameters.length; i++)
                                {
                                    parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                                }
                                if (parameterMap.access_token !== undefined && parameterMap.access_token !== null)
                                {
                                    deferred.resolve({ access_token: parameterMap.access_token, session_secret_key: parameterMap.session_secret_key });
                                } else
                                {
                                    deferred.reject("Problem authenticating");
                                }
                                setTimeout(function ()
                                {
                                    browserRef.close();
                                }, 10);
                            }
                        });
                        browserRef.addEventListener('exit', function (event)
                        {
                            deferred.reject("The sign in flow was canceled");
                        });
                    } else
                    {
                        deferred.reject("Could not find InAppBrowser plugin");
                    }
                } else
                {
                    deferred.reject("Cannot authenticate via a web browser");
                }
                return deferred.promise;
            },


            /*
             * Sign into the Imgur service
             *
             * @param    string clientId
             * @param    object options
             * @return   promise
             */
            imgur: function(clientId, options) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "http://localhost/callback";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_uri")) {
                                redirect_uri = options.redirect_uri;
                            }
                        }
                        var browserRef = window.open('https://api.imgur.com/oauth2/authorize?client_id=' + clientId + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function(event) {
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
                                    deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in, account_username: parameterMap.account_username });
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
            },

            /*
             * Sign into the Spotify service
             *
             * @param    string clientId
             * @param    object options
             * @return   promise
             */
            spotify: function(clientId, appScope, options) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "http://localhost/callback";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_uri")) {
                                redirect_uri = options.redirect_uri;
                            }
                        }
                        var browserRef = window.open('https://accounts.spotify.com/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=token&scope=' + appScope.join(" "), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function(event) {
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
                                    deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in, account_username: parameterMap.account_username });
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
            },

            /*
             * Sign into the Uber service
             *
             * @param    string clientId
             * @param    appScope array
             * @param    object options
             * @return   promise
             */
            uber: function(clientId, appScope, options) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "http://localhost/callback";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_uri")) {
                                redirect_uri = options.redirect_uri;
                            }
                        }
                        var browserRef = window.open('https://login.uber.com/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=token&scope=' + appScope.join(" "), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function(event) {
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
                                    deferred.resolve({ access_token: parameterMap.access_token, token_type: parameterMap.token_type, expires_in: parameterMap.expires_in, scope: parameterMap.scope });
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
            },

            /*
             * Sign into the Windows Live Connect service
             *
             * @param    string clientId
             * @param    array appScope
             * @param    object options
             * @return   promise
            */
            windowsLive: function (clientId, appScope, options) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "https://login.live.com/oauth20_desktop.srf";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_uri")) {
                                redirect_uri = options.redirect_uri;
                            }
                        }
                        var browserRef = window.open('https://login.live.com/oauth20_authorize.srf?client_id=' + clientId + "&scope=" + appScope.join(",") + '&response_type=token&display=touch' + '&redirect_uri=' + redirect_uri, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function (event) {
                            if((event.url).indexOf(redirect_uri) === 0) {
                                browserRef.removeEventListener("exit", function (event) { });
                                browserRef.close();
                                var callbackResponse = (event.url).split("#")[1];
                                var responseParameters = (callbackResponse).split("&");
                                var parameterMap = [];
                                for (var i = 0; i < responseParameters.length; i++) {
                                    parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                                }
                                if (parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                                    deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in });
                                } else {
                                    deferred.reject("Problem authenticating");
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
            },

            /*
             * Sign into the Yammer service
             *
             * @param    string clientId
             * @param    object options
             * @return   promise
             */
            yammer: function(clientId, options) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "http://localhost/callback";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_uri")) {
                                redirect_uri = options.redirect_uri;
                            }
                        }
                        var browserRef = window.open('https://www.yammer.com/dialog/oauth?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function(event) {
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
                                    deferred.resolve({ access_token: parameterMap.access_token });
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
            },

            /*
             * Sign into the Venmo service
             *
             * @param    string clientId
             * @param    array appScope
             * @param    object options
             * @return   promise
             */
            venmo: function(clientId, appScope, options) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "http://localhost/callback";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_uri")) {
                                redirect_uri = options.redirect_uri;
                            }
                        }
                        var browserRef = window.open('https://api.venmo.com/v1/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=token&scope=' + appScope.join(" "), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function(event) {
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
                                    deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in });
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
            },

            /*
             * Sign into the Stripe service
             *
             * @param    string clientId
             * @param    string clientSecret
             * @param    string appScope
             * @param    object options
             * @return   promise
             */
            stripe: function(clientId, clientSecret, appScope, options) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "http://localhost/callback";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_uri")) {
                                redirect_uri = options.redirect_uri;
                            }
                        }
                        var browserRef = window.open('https://connect.stripe.com/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&scope=' + appScope + '&response_type=code', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function(event) {
                            if((event.url).indexOf("http://localhost/callback") === 0) {
                                requestToken = (event.url).split("code=")[1];
                                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                                $http({method: "post", url: "https://connect.stripe.com/oauth/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code" + "&code=" + requestToken })
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
            },

            /*
             * Sign into the Rally service
             *
             * @param    string clientId
             * @param    string clientSecret
             * @param    string appScope
             * @param    object options
             * @return   promise
             */
            rally: function(clientId, clientSecret, appScope, options) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "http://localhost/callback";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_uri")) {
                                redirect_uri = options.redirect_uri;
                            }
                        }
                        var browserRef = window.open('https://rally1.rallydev.com/login/oauth2/auth?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&scope=' + appScope + '&response_type=code', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function(event) {
                            if((event.url).indexOf("http://localhost/callback") === 0) {
                                requestToken = (event.url).split("code=")[1];
                                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                                $http({method: "post", url: "https://rally1.rallydev.com/login/oauth2/auth", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code" + "&code=" + requestToken })
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
            },

            /*
             * Sign into the FamilySearch service
             *
             * @param    string clientId
             * @param    object options
             * @return   promise
             */
            familySearch: function(clientId, state, options) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if(cordovaMetadata.hasOwnProperty("cordova-plugin-inappbrowser") === true) {
                        var redirect_uri = "http://localhost/callback";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_uri")) {
                                redirect_uri = options.redirect_uri;
                            }
                        }
                        var browserRef = window.open("https://ident.familysearch.org/cis-web/oauth2/v3/authorization?client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&response_type=code&state=" + state, "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
                        browserRef.addEventListener("loadstart", function(event) {
                            if((event.url).indexOf(redirect_uri) === 0) {
                                var requestToken = (event.url).split("code=")[1];
                                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                                $http({method: "post", url: "https://ident.familysearch.org/cis-web/oauth2/v3/token", data: "client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code&code=" + requestToken })
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
            },

            /*
             * Sign into the Envato service
             *
             * @param    string clientId
             * @param    object options
             * @return   promise
             */
            envato: function(clientId, options) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "http://localhost/callback";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_uri")) {
                                redirect_uri = options.redirect_uri;
                            }
                        }
                        var browserRef = window.open('https://api.envato.com/authorization?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function(event) {
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
                                    deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in });
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
            },

            /*
             * Sign into the Weibo service
             *
             * @param    string clientId
             * @param    string clientSecret
             * @param    array appScope
             * @param    object options
             * @return   promise
             */
            weibo: function(clientId, clientSecret, appScope, options) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "http://localhost/callback";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_uri")) {
                                redirect_uri = options.redirect_uri;
                            }
                        }
                        var flowUrl = "https://open.weibo.cn/oauth2/authorize?display=mobile&client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&scope=" + appScope.join(",");
                        if(options !== undefined) {
                            if(options.hasOwnProperty("language")) {
                                flowUrl += "&language=" + options.language;
                            }
                            if(options.hasOwnProperty("forcelogin")) {
                                flowUrl += "&forcelogin=" + options.forcelogin;
                            }

                        }
                        var browserRef = window.open(flowUrl, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function(event) {
                            if((event.url).indexOf(redirect_uri) === 0) {
                                requestToken = (event.url).split("code=")[1];
                                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                                $http({method: "post", url: "https://api.weibo.com/oauth2/access_token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&grant_type=authorization_code&code=" + requestToken + "&redirect_uri=" + redirect_uri})
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
            },

            /*
             * Sign into the Jawbone service
             *
             * @param    string clientId
             * @param    string clientSecret
             * @param    string appScope
             * @param    object options
             * @return   promise
             */
            jawbone: function(clientId,clientSecret, appScope, options) {
                var deferred = $q.defer();
                if(window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "http://localhost/callback";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_uri")) {
                                redirect_uri = options.redirect_uri;
                            }
                        }
                        var browserRef = window.open('https://jawbone.com/auth/oauth2/auth?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=' + appScope.join(" "), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');

                        browserRef.addEventListener('loadstart', function(event) {
                            if((event.url).indexOf(redirect_uri) === 0) {
                              var requestToken = (event.url).split("code=")[1];

                              $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                              $http({method: "post", url: "https://jawbone.com/auth/oauth2/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&grant_type=authorization_code&code=" + requestToken })
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
            },

            /*
            * Sign into the Untappd service
            *
            * @param    string clientId
            * @param    object options
            * @return   promise
            */
            untappd: function(clientId, options) {
                var deferred = $q.defer();
                if (window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if ($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_url = "http://localhost/callback";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_url")) {
                                redirect_url = options.redirect_url;
                            }
                        }
                        var browserRef = window.open('https://untappd.com/oauth/authenticate/?client_id=' + clientId + '&redirect_url=' + redirect_url + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function (event) {
                            if ((event.url).indexOf(redirect_url) === 0) {
                                browserRef.removeEventListener("exit",function(event){});
                                browserRef.close();
                                var callbackResponse = (event.url).split("#")[1];
                                var responseParameters = (callbackResponse).split("&");
                                var parameterMap = [];
                                for (var i = 0; i < responseParameters.length; i++) {
                                    parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                                }
                                if (parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                                    var promiseResponse = {
                                        access_token: parameterMap.access_token
                                    };
                                    deferred.resolve(promiseResponse);
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
            },

            /*
             * Sign into the Dribble service
             *
             * @param    string clientId                  REQUIRED
             * @param    string clientSecret              REQUIRED
             * @param    object Array appScope            REQUIRED
             * @param    object options (redirect_uri)    OPTIONAL
             * @param    state  string                    OPTIONAL
             * @return   promise
             */

            dribble: function (clientId, clientSecret, appScope, options, state) {
                var deferred = $q.defer();
                if (window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if ($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_uri = "http://localhost/callback";
                        var OAUTH_URL = 'https://dribbble.com/oauth/authorize';
                        var ACCESS_TOKEN_URL = 'https://dribbble.com/oauth/token';
                        if (options !== undefined) {
                            if (options.hasOwnProperty("redirect_uri")) {
                                redirect_uri = options.redirect_uri;
                            }
                        }
                        if (state === undefined) {
                            state = $cordovaOauthUtility.createNonce(5);
                        }
                        var scope = appScope.join(",").replace(/,/g, '+');  //dribble scopes are passed with +
                        var browserRef = window.open(OAUTH_URL + '?client_id=' + clientId + '&redirect_uri=' + redirect_uri +
                        '&scope=' + scope + '&state=' + state, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                        browserRef.addEventListener('loadstart', function (event) {
                            if ((event.url).indexOf(redirect_uri) === 0) {
                                var callBackCode = (event.url).split("code=")[1];
                                var code = callBackCode.split("&")[0];
                                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                                $http(
                                    {   method: "post",
                                        url: ACCESS_TOKEN_URL,
                                        data: "client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&client_secret=" + clientSecret + "&code=" + code
                                    })
                                    .success(function (res) {
                                        deferred.resolve(res);
                                    }).error(function (data, status) {
                                        deferred.reject("Problem authenticating " );
                                    }).finally(function () {
                                        setTimeout(function () {
                                            browserRef.close();
                                        }, 10);
                                    });
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
            },
            /*
            * Sign into the Pocket service
            *
            * @param    string clientId
            * @param    object options
            * @return   promise
            */
            pocket: function(clientId, options) {
                var deferred = $q.defer();
                if (window.cordova) {
                    var cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
                    if ($cordovaOauthUtility.isInAppBrowserInstalled(cordovaMetadata) === true) {
                        var redirect_url = "http://localhost/callback";
                        if(options !== undefined) {
                            if(options.hasOwnProperty("redirect_url")) {
                                redirect_url = options.redirect_url;
                            }
                        }

                        var data = "consumer_key=" + clientId + "&redirect_uri=" + encodeURIComponent(redirect_url);
                        console.log(data);
                        $http({
                            method: "post",
                            url: "https://getpocket.com/v3/oauth/request",
                            headers: {
                                "X-Accept": "application/x-www-form-urlencoded",
                                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                            },
                            data: data
                        })
                            .success(function(data) {
                                var code = data.split("code=")[1];
                                var browserRef = window.open('https://getpocket.com/auth/authorize?request_token=' + code + '&redirect_uri=' + redirect_url, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                                browserRef.addEventListener('loadstart', function(event) {
                                    if((event.url).indexOf(redirect_url) === 0) {
                                        browserRef.removeEventListener("exit",function(event){});
                                        data = "consumer_key=" + clientId + "&code=" + code;
                                        $http({
                                            method: "post",
                                            url: "https://getpocket.com/v3/oauth/authorize",
                                            headers: {
                                                "X-Accept": "application/x-www-form-urlencoded",
                                                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                                            },
                                            data: data
                                        })
                                            .success(function(result) {
                                                deferred.resolve(result);
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
                        deferred.reject("Could not find InAppBrowser plugin");
                    }
                } else {
                    deferred.reject("Cannot authenticate via a web browser");
                }
                return deferred.promise;
            }


        };

    }]);
