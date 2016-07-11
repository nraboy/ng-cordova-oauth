(function() {
  'use strict';

  angular.module('oauth.500px', ['oauth.utils'])
    .factory('$ngCordova500px', fiveHundredsPx);

  function fiveHundredsPx($q, $http, $cordovaOauthUtility) {
    return { signin: oauth500px };

    /*
     * Sign into the 500px service
     *
     * @param    string sdkKey
     * @param    object options
     * @return   promise
     */
    function oauth500px(sdkKey, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
                redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://api.500px.com/v1/api/js-sdk/authorize?sdk_key=' + sdkKey + '&callback=' + redirect_uri, '_blank', 'toolbar=no,zoom=no,location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var accessToken = (event.url).split("#token:")[1].split(',')[0];
                deferred.resolve({error: false, success: true, access_token: accessToken, callback: redirect_uri});
            } else {
              deferred.reject({success: false, callback: redirect_uri, error: true, access_token: null});
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

  fiveHundredsPx.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

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
              $http({method: "post", headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: adfsServer + "/adfs/oauth2/token", data: "client_id=" + clientId + "&code=" + requestToken + "&redirect_uri=http://localhost/callback&grant_type=authorization_code"  })
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

(function() {
  'use strict';

  angular.module('oauth.azuread', ['oauth.utils'])
    .factory('$ngCordovaAzureAD', azureAD);

  function azureAD($q, $http, $cordovaOauthUtility) {
    return { signin: oauthAzureAD };

    /*
     * Sign into the Azure AD Authentication Library
     *
     * @param    string clientId (client registered in ADFS, with redirect_uri configured to: http://localhost/callback)
     * @param    string tenantId (the tenants UUID, can be found in oauth endpoint)
     * @param    string resourceURL (This is your APP ID URI in Azure Config)
     * @return   promise
     */
    function oauthAzureAD(clientId, tenantId, resourceURL) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {

          var browserRef = window.cordova.InAppBrowser.open('https://login.microsoftonline.com/' + tenantId + '/oauth2/authorize?response_type=code&client_id=' + clientId + '&redirect_uri=http://localhost/callback', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener("loadstart", function(event) {
            if((event.url).indexOf('http://localhost/callback') === 0) {
              var requestToken = (event.url).split("code=")[1];
              console.log(requestToken);

              $http({method: "post", headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: "https://login.microsoftonline.com/" + tenantId + "/oauth2/token", data:
                "client_id=" + clientId +
                "&code=" + requestToken +
                "&redirect_uri=http://localhost/callback&" +
                "grant_type=authorization_code&" +
                "resource=" + resourceURL})
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

  azureAD.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.box', ['oauth.utils'])
    .factory('$ngCordovaBox', box);

  function box($q, $http, $cordovaOauthUtility) {
    return { signin: oauthBox };

    /*
     * Sign into the Box service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    string appState
     * @param    object options
     * @return   promise
     */
    function oauthBox(clientId, clientSecret, appState, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
                redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://app.box.com/api/oauth2/authorize/?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&state=' + appState + '&response_type=code', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var requestToken = (event.url).split("code=")[1];

              $http({method: "post", headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: "https://app.box.com/api/oauth2/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code" + "&code=" + requestToken })
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

  box.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.digitalOcean', ['oauth.utils'])
    .factory('$ngCordovaDigitalOcean', digitalOcean);

  function digitalOcean($q, $http, $cordovaOauthUtility) {
    return { signin: oauthDigitalOcean };

    /*
     * Sign into the Digital Ocean service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    object options
     * @return   promise
     */
    function oauthDigitalOcean(clientId, clientSecret, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open("https://cloud.digitalocean.com/v1/oauth/authorize?client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=read%20write", "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
          browserRef.addEventListener("loadstart", function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var requestToken = (event.url).split("code=")[1];

              $http({method: "post", headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: "https://cloud.digitalocean.com/v1/oauth/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code" + "&code=" + requestToken })
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

  digitalOcean.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.dribble', ['oauth.utils'])
    .factory('$ngCordovaDribble', dribble);

  function dribble($q, $http, $cordovaOauthUtility) {
    return { signin: oauthDribble };

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
    function oauthDribble(clientId, clientSecret, appScope, options, state) {

      var deferred = $q.defer();
      if (window.cordova) {
        if ($cordovaOauthUtility.isInAppBrowserInstalled()) {
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
          var browserRef = window.cordova.InAppBrowser.open(OAUTH_URL + '?client_id=' + clientId + '&redirect_uri=' + redirect_uri +
          '&scope=' + scope + '&state=' + state, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function (event) {
            if ((event.url).indexOf(redirect_uri) === 0) {
              var callBackCode = (event.url).split("code=")[1];
              var code = callBackCode.split("&")[0];

              $http({
                method: "post",
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
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
    }
  }

  dribble.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.dropbox', ['oauth.utils'])
    .factory('$ngCordovaDropbox', dropbox);

  function dropbox($q, $http, $cordovaOauthUtility) {
    return { signin: oauthDropbox };

    /*
     * Sign into the Dropbox service
     *
     * @param    string appKey
     * @param    object options
     * @return   promise
     */
    function oauthDropbox(appKey, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open("https://www.dropbox.com/1/oauth2/authorize?client_id=" + appKey + "&redirect_uri=" + redirect_uri + "&response_type=token", "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
          browserRef.addEventListener("loadstart", function(event) {
            if ((event.url).indexOf(redirect_uri) === 0) {
              browserRef.removeEventListener("exit",function(event){});
              browserRef.close();
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

  dropbox.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.envato', ['oauth.utils'])
    .factory('$ngCordovaEnvato', envato);

  function envato($q, $http, $cordovaOauthUtility) {
    return { signin: oauthEnvato };

    /*
     * Sign into the Envato service
     *
     * @param    string clientId
     * @param    object options
     * @return   promise
     */
    function oauthEnvato(clientId, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://api.envato.com/authorization?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
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
    }
  }

  envato.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.facebook', ['oauth.utils'])
    .factory('$ngCordovaFacebook', facebook);

  function facebook($q, $http, $cordovaOauthUtility) {
    return { signin: oauthFacebook };

    /*
     * Sign into the Facebook service
     *
     * @param    string clientId
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthFacebook(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var flowUrl = "https://www.facebook.com/v2.6/dialog/oauth?client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&response_type=token&scope=" + appScope.join(",");
          if(options !== undefined && options.hasOwnProperty("auth_type")) {
            flowUrl += "&auth_type=" + options.auth_type;
          }
          var browserRef = window.cordova.InAppBrowser.open(flowUrl, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
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
                if ((event.url).indexOf("error_code=100") !== 0) {
                  deferred.reject("Facebook returned error_code=100: Invalid permissions");
                } else {
                  deferred.reject("Problem authenticating");
                }
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

  facebook.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.familySearch', ['oauth.utils'])
    .factory('$ngCordovaFamilySearch', familySearch);

  function familySearch($q, $http, $cordovaOauthUtility) {
    return { signin: oauthFamilySearch };

    /*
     * Sign into the FamilySearch service
     *
     * @param    string clientId
     * @param    object options
     * @return   promise
     */
    function oauthFamilySearch(clientId, state, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open("https://ident.familysearch.org/cis-web/oauth2/v3/authorization?client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&response_type=code&state=" + state, "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
          browserRef.addEventListener("loadstart", function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var requestToken = (event.url).split("code=")[1];
              $http({method: "post", headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: "https://ident.familysearch.org/cis-web/oauth2/v3/token", data: "client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code&code=" + requestToken })
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

  familySearch.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.foursquare', ['oauth.utils'])
    .factory('$ngCordovaFoursquare', foursquare);

  function foursquare($q, $http, $cordovaOauthUtility) {
    return { signin: oauthFoursquare };

    /*
    * Sign into the Foursquare service
    *
    * @param    string clientId
    * @param    object options
    * @return   promise
    */
    function oauthFoursquare(clientId, options) {
      var deferred = $q.defer();
      if (window.cordova) {
        if ($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://foursquare.com/oauth2/authenticate?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function (event) {
            if ((event.url).indexOf(redirect_uri) === 0) {
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
                    access_token: parameterMap.access_token,
                    expires_in: parameterMap.expires_in
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
    }
  }

  foursquare.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.github', ['oauth.utils'])
    .factory('$ngCordovaGithub', github);

  function github($q, $http, $cordovaOauthUtility) {
    return { signin: oauthGithub };

    /*
     * Sign into the GitHub service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthGithub(clientId, clientSecret, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://github.com/login/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&scope=' + appScope.join(","), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var requestToken = (event.url).split("code=")[1];
              $http({method: "post", headers: {'Content-Type': 'application/x-www-form-urlencoded', 'accept': 'application/json'}, url: "https://github.com/login/oauth/access_token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&code=" + requestToken })
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

  github.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.google', ['oauth.utils'])
    .factory('$ngCordovaGoogle', google);

  function google($q, $http, $cordovaOauthUtility) {
    return { signin: oauthGoogle };

    /*
     * Sign into the Google service
     *
     * @param    string clientId
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthGoogle(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://accounts.google.com/o/oauth2/auth?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&scope=' + appScope.join(" ") + '&approval_prompt=force&response_type=token id_token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener("loadstart", function(event) {
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
                deferred.resolve({ access_token: parameterMap.access_token, token_type: parameterMap.token_type, expires_in: parameterMap.expires_in, id_token: parameterMap.id_token });
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
    }
  }

  google.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.imgur', ['oauth.utils'])
    .factory('$ngCordovaImgur', imgur);

  function imgur($q, $http, $cordovaOauthUtility) {
    return { signin: oauthImgur };

    /*
     * Sign into the Imgur service
     *
     * @param    string clientId
     * @param    object options
     * @return   promise
     */
    function oauthImgur(clientId, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://api.imgur.com/oauth2/authorize?client_id=' + clientId + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
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
    }
  }

  imgur.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.instagram', ['oauth.utils'])
    .factory('$ngCordovaInstagram', instagram);

  function instagram($q, $http, $cordovaOauthUtility) {
    return { signin: oauthInstagram };

    /*
     * Sign into the Instagram service
     *
     * @param    string clientId
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthInstagram(clientId, appScope, options) {
      var deferred = $q.defer();
      var split_tokens = {
          'code':'?',
          'token':'#'
      };

      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          var response_type = "token";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
            if(options.hasOwnProperty("response_type")) {
              response_type = options.response_type;
            }
          }

          var scope = '';
          if (appScope && appScope.length > 0) {
            scope = '&scope' + appScope.join('+');
          }

          var browserRef = window.cordova.InAppBrowser.open('https://api.instagram.com/oauth/authorize/?client_id=' + clientId + '&redirect_uri=' + redirect_uri + scope + '&response_type='+response_type, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
                browserRef.removeEventListener("exit",function(event){});
                browserRef.close();
                var callbackResponse = (event.url).split(split_tokens[response_type])[1];
                var parameterMap = $cordovaOauthUtility.parseResponseParameters(callbackResponse);
                if(parameterMap.access_token) {
                  deferred.resolve({ access_token: parameterMap.access_token });
                } else if(parameterMap.code !== undefined && parameterMap.code !== null) {
                  deferred.resolve({ code: parameterMap.code });
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
    }
  }

  instagram.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.jawbone', ['oauth.utils'])
    .factory('$ngCordovaJawbone', jawbone);

  function jawbone($q, $http, $cordovaOauthUtility) {
    return { signin: oauthJawbone };

    /*
     * Sign into the Jawbone service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    string appScope
     * @param    object options
     * @return   promise
     */
    function oauthJawbone(clientId,clientSecret, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://jawbone.com/auth/oauth2/auth?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=' + appScope.join(" "), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');

          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var requestToken = (event.url).split("code=")[1];

              $http({method: "post", headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: "https://jawbone.com/auth/oauth2/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&grant_type=authorization_code&code=" + requestToken })
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

  jawbone.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module("oauth.providers", [
    "oauth.utils",
    "oauth.500px",
    "oauth.azuread",
    "oauth.adfs",
    'oauth.dropbox',
    'oauth.digitalOcean',
    'oauth.google',
    'oauth.github',
    'oauth.facebook',
    'oauth.linkedin',
    'oauth.instagram',
    'oauth.box',
    'oauth.reddit',
    'oauth.slack',
    'oauth.twitter',
    'oauth.meetup',
    'oauth.salesforce',
    'oauth.strava',
    'oauth.withings',
    'oauth.foursquare',
    'oauth.magento',
    'oauth.vkontakte',
    'oauth.odnoklassniki',
    'oauth.imgur',
    'oauth.spotify',
    'oauth.uber',
    'oauth.windowslive',
    'oauth.yammer',
    'oauth.venmo',
    'oauth.stripe',
    'oauth.rally',
    'oauth.familySearch',
    'oauth.envato',
    'oauth.weibo',
    'oauth.jawbone',
    'oauth.untappd',
    'oauth.dribble',
    'oauth.pocket',
    'oauth.mercadolibre',
    'oauth.xing',
    'oauth.netatmo',
    'oauth.trakttv',
    'oauth.yahoo'])
    .factory("$cordovaOauth", cordovaOauth);

  function cordovaOauth(
    $q, $http, $cordovaOauthUtility, $ngCordovaAzureAD, $ngCordovaAdfs, $ngCordovaDropbox, $ngCordovaDigitalOcean,
    $ngCordovaGoogle, $ngCordovaGithub, $ngCordovaFacebook, $ngCordovaLinkedin, $ngCordovaInstagram, $ngCordovaBox, $ngCordovaReddit, $ngCordovaSlack,
    $ngCordovaTwitter, $ngCordovaMeetup, $ngCordovaSalesforce, $ngCordovaStrava, $ngCordovaWithings, $ngCordovaFoursquare, $ngCordovaMagento,
    $ngCordovaVkontakte, $ngCordovaOdnoklassniki, $ngCordovaImgur, $ngCordovaSpotify, $ngCordovaUber, $ngCordovaWindowslive, $ngCordovaYammer,
    $ngCordovaVenmo, $ngCordovaStripe, $ngCordovaRally, $ngCordovaFamilySearch, $ngCordovaEnvato, $ngCordovaWeibo, $ngCordovaJawbone, $ngCordovaUntappd,
    $ngCordovaDribble, $ngCordovaPocket, $ngCordovaMercadolibre, $ngCordovaXing, $ngCordovaNetatmo, $ngCordovaTraktTv, $ngCordovaYahoo) {

    return {
      azureAD: $ngCordovaAzureAD.signin,
      adfs: $ngCordovaAdfs.signin,
      dropbox: $ngCordovaDropbox.signin,
      digitalOcean: $ngCordovaDigitalOcean.signin,
      google: $ngCordovaGoogle.signin,
      github: $ngCordovaGithub.signin,
      facebook: $ngCordovaFacebook.signin,
      linkedin: $ngCordovaLinkedin.signin,
      instagram: $ngCordovaInstagram.signin,
      box: $ngCordovaBox.signin,
      reddit: $ngCordovaReddit.signin,
      slack: $ngCordovaSlack.signin,
      twitter: $ngCordovaTwitter.signin,
      meetup: $ngCordovaMeetup.signin,
      salesforce: $ngCordovaSalesforce.signin,
      strava: $ngCordovaStrava.signin,
      withings: $ngCordovaWithings.signin,
      foursquare: $ngCordovaFoursquare.signin,
      magento: $ngCordovaMagento.signin,
      vkontakte: $ngCordovaVkontakte.signin,
      odnoklassniki: $ngCordovaOdnoklassniki.signin,
      imgur: $ngCordovaImgur.signin,
      spotify: $ngCordovaSpotify.signin,
      uber: $ngCordovaUber.signin,
      windowsLive: $ngCordovaWindowslive.signin,
      yammer: $ngCordovaYammer.signin,
      venmo: $ngCordovaVenmo.signin,
      stripe: $ngCordovaStripe.signin,
      rally: $ngCordovaRally.signin,
      familySearch: $ngCordovaFamilySearch.signin,
      envato: $ngCordovaEnvato.signin,
      weibo: $ngCordovaWeibo.signin,
      jawbone: $ngCordovaJawbone.signin,
      untappd: $ngCordovaUntappd.signin,
      dribble: $ngCordovaDribble.signin,
      pocket: $ngCordovaPocket.signin,
      mercadolibre: $ngCordovaMercadolibre.signin,
      xing: $ngCordovaXing.signin,
      netatmo: $ngCordovaNetatmo.signin,
      trakttv: $ngCordovaTraktTv.signin,
      yahoo: $ngCordovaYahoo.signin
    };
  }

  cordovaOauth.$inject = [
    "$q", '$http', "$cordovaOauthUtility",
    "$ngCordovaAzureAD",
    "$ngCordovaAdfs",
    '$ngCordovaDropbox',
    '$ngCordovaDigitalOcean',
    '$ngCordovaGoogle',
    '$ngCordovaGithub',
    '$ngCordovaFacebook',
    '$ngCordovaLinkedin',
    '$ngCordovaInstagram',
    '$ngCordovaBox',
    '$ngCordovaReddit',
    '$ngCordovaSlack',
    '$ngCordovaTwitter',
    '$ngCordovaMeetup',
    '$ngCordovaSalesforce',
    '$ngCordovaStrava',
    '$ngCordovaWithings',
    '$ngCordovaFoursquare',
    '$ngCordovaMagento',
    '$ngCordovaVkontakte',
    '$ngCordovaOdnoklassniki',
    '$ngCordovaImgur',
    '$ngCordovaSpotify',
    '$ngCordovaUber',
    '$ngCordovaWindowslive',
    '$ngCordovaYammer',
    '$ngCordovaVenmo',
    '$ngCordovaStripe',
    '$ngCordovaRally',
    '$ngCordovaFamilySearch',
    '$ngCordovaEnvato',
    '$ngCordovaWeibo',
    '$ngCordovaJawbone',
    '$ngCordovaUntappd',
    '$ngCordovaDribble',
    '$ngCordovaPocket',
    '$ngCordovaMercadolibre',
    '$ngCordovaXing',
    '$ngCordovaNetatmo',
    '$ngCordovaTraktTv',
    '$ngCordovaYahoo'
  ];
})();

(function() {
  'use strict';

  angular.module('oauth.linkedin', ['oauth.utils'])
    .factory('$ngCordovaLinkedin', linkedin);

  function linkedin($q, $http, $cordovaOauthUtility) {
    return { signin: oauthLinkedin };

    /*
     * Sign into the LinkedIn service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    array appScope
     * @param    string state
     * @param    object options
     * @return   promise
     */
    function oauthLinkedin(clientId, clientSecret, appScope, state, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://www.linkedin.com/uas/oauth2/authorization?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&scope=' + appScope.join(" ") + '&response_type=code&state=' + state, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              try {
                var requestToken = (event.url).split("code=")[1].split("&")[0];
                $http({method: "post", headers: {'Content-Type': 'application/x-www-form-urlencoded'}, url: "https://www.linkedin.com/uas/oauth2/accessToken", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code" + "&code=" + requestToken })
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

  linkedin.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.magento', ['oauth.utils'])
    .factory('$ngCordovaMagento', magento);

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
})();

(function() {
  'use strict';

  angular.module('oauth.meetup', ['oauth.utils'])
    .factory('$ngCordovaMeetup', meetup);

  function meetup($q, $http, $cordovaOauthUtility) {
    return { signin: oauthMeetup };

    /*
    * Sign into the Meetup service
    *
    * @param    string clientId
    * @param    object options
    * @return   promise
    */
    function oauthMeetup(clientId, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://secure.meetup.com/oauth2/authorize/?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              browserRef.removeEventListener("exit",function(event){});
                browserRef.close();
                var callbackResponse = (event.url).split("#")[1];
                var responseParameters = (callbackResponse).split("&");
                var parameterMap = {};
                for(var i = 0; i < responseParameters.length; i++) {
                  parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                }
                if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                  deferred.resolve(parameterMap);
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
    }
  }

  meetup.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.mercadolibre', ['oauth.utils'])
    .factory('$ngCordovaMercadolibre', mercadolibre);

  function mercadolibre($q, $http, $cordovaOauthUtility) {
    return { signin: oauthMercadolibre };

    /*
     * Sign into the Mercadolibre service
     *
     * @param    string appId
     * @param    object options
     * @return   promise
     */
    function oauthMercadolibre(appId, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open("http://auth.mercadolibre.com.ar/authorization?client_id=" + appId + "&redirect_uri=" + redirect_uri + "&response_type=token", "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
          browserRef.addEventListener("loadstart", function(event) {
            if ((event.url).indexOf(redirect_uri) === 0) {
              browserRef.removeEventListener("exit",function(event){});
              browserRef.close();
              var callbackResponse = (event.url).split("#")[1];
              var responseParameters = (callbackResponse).split("&");
              var parameterMap = [];
              for(var i = 0; i < responseParameters.length; i++) {
                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
              }
              if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in, user_id: parameterMap.user_id, domains: parameterMap.domains });
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
    }
  }

  mercadolibre.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.netatmo', ['oauth.utils']).factory('$ngCordovaNetatmo', netatmo);

  function netatmo($q, $http, $cordovaOauthUtility) {
    return { signin: oauthNetatmo };

    /*
     * Sign into the Netatmo service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    string appScope
     * @param    object options
     * @return   promise
     */
    function oauthNetatmo(options) {
      
      var deferred = $q.defer();
      var fetchingToken = false;
      var clientId = (options.clientId)? options.clientId: null;
      var clientSecret = (options.clientSecret)? options.clientSecret: null;
      var appScope = (options.appScope)? options.appScope: null;
      var state = (options.state)? options.state: Math.random().toString(36).substr(2, 5);
      var inappbrowserOptions = (options.inappbrowserOptions)? options.inappbrowserOptions: 'location=no,clearsessioncache=yes,clearcache=yes';

      if(window.cordova) {        
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          
          var redirect_uri = "http://localhost/callback";
          var authorize_uri = 'https://api.netatmo.com/oauth2/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&scope=' + appScope +'&state='+ state;
          var browserRef = window.cordova.InAppBrowser.open(authorize_uri, '_blank', inappbrowserOptions);

          browserRef.addEventListener('loadstart', inappbrowserLoadStarted);          
          browserRef.addEventListener('exit', inapbrowserExited);
        } else {
          deferred.reject({error: "no_inappbrowser_plugin"});
        }
      } else {
        deferred.reject({error: "no_inappbrowser_plugin"});
      }

      function inappbrowserLoadStarted(event){

        var hasNoRedirectUri = (event.url).indexOf(redirect_uri) === 0;
        var redirectUriMatch = (event.url).split("?")[0] === redirect_uri;

        if(hasNoRedirectUri && redirectUriMatch) {

          fetchingToken = true;
          browserRef.close();

          //get response url parameters
          var callbackResponse = (event.url).split("?")[1];
          var responseParameters = (callbackResponse).split("&");
          var urlParameters = [];
          for(var i = 0; i < responseParameters.length; i++) {
            urlParameters[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
          }

          var requestToken = urlParameters.code;
          var responseState = urlParameters.state;

          if(state === responseState){

            var httpOptions = {
              method: "post", 
              url: "https://api.netatmo.com/oauth2/token", 
              data: 'grant_type=authorization_code&client_id='+ clientId +'&client_secret='+ clientSecret +'&code='+ requestToken +'&scope='+ appScope +'&redirect_uri='+ redirect_uri,
              headers: {
                 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
               },
            };

            $http(httpOptions).success(requestTokenSuccess).error(requestTokenError).finally(requestTokenFinally);
          } else {
            deferred.reject({error: "string_missmatch"});
          }
        }
        function requestTokenSuccess(success){
          deferred.resolve(success);
        }
        function requestTokenError(error){
          deferred.reject(error);
        }
        function requestTokenFinally(){}
      }
      function inapbrowserExited(event){

        if(!fetchingToken){

          var error = {error: "flow_canceled"};
          deferred.reject(error);
        }
      }

      return deferred.promise;
    }
  }

  netatmo.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.odnoklassniki', ['oauth.utils'])
    .factory('$ngCordovaOdnoklassniki', odnoklassniki);

  function odnoklassniki($q, $http, $cordovaOauthUtility) {
    return { signin: oauthOdnoklassniki };

    /*
     * Sign into the Odnoklassniki service
     *
     * @param    string clientId
     * @param    array appScope (for example: "VALUABLE_ACCESS ,GROUP_CONTENT,VIDEO_CONTENT")
     * @return   promise
     */
    function oauthOdnoklassniki(clientId, appScope) {
      var deferred = $q.defer();
      if (window.cordova) {
        if ($cordovaOauthUtility.isInAppBrowserInstalled()) {
            var browserRef = window.cordova.InAppBrowser.open('http://www.odnoklassniki.ru/oauth/authorize?client_id=' + clientId + '&scope=' + appScope.join(",") + '&response_type=token&redirect_uri=http://localhost/callback' + '&layout=m', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
            browserRef.addEventListener('loadstart', function (event) {
              if ((event.url).indexOf("http://localhost/callback") === 0) {
                var callbackResponse = (event.url).split("#")[1];
                var responseParameters = (callbackResponse).split("&");
                var parameterMap = [];
                for (var i = 0; i < responseParameters.length; i++) {
                  parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                }
                if (parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                  deferred.resolve({ access_token: parameterMap.access_token, session_secret_key: parameterMap.session_secret_key });
                } else {
                  deferred.reject("Problem authenticating");
                }
                setTimeout(function () {
                  browserRef.close();
                }, 10);
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

  odnoklassniki.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.pocket', ['oauth.utils'])
    .factory('$ngCordovaPocket', pocket);

  function pocket($q, $http, $cordovaOauthUtility) {
    return { signin: oauthPocket };

    /*
    * Sign into the Pocket service
    *
    * @param    string clientId
    * @param    object options
    * @return   promise
    */
    function oauthPocket(clientId, options) {
      var deferred = $q.defer();
      if (window.cordova) {
        if ($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_url = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_url")) {
              redirect_url = options.redirect_url;
            }
          }

          var data = "consumer_key=" + clientId + "&redirect_uri=" + encodeURIComponent(redirect_url);
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
              var browserRef = window.cordova.InAppBrowser.open('https://getpocket.com/auth/authorize?request_token=' + code + '&redirect_uri=' + redirect_url, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
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
  }

  pocket.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.rally', ['oauth.utils'])
    .factory('$ngCordovaRally', rally);

  function rally($q, $http, $cordovaOauthUtility) {
    return { signin: oauthRally };

    /*
     * Sign into the Rally service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    string appScope
     * @param    object options
     * @return   promise
     */
    function oauthRally(clientId, clientSecret, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
          if($cordovaOauthUtility.isInAppBrowserInstalled()) {
            var redirect_uri = "http://localhost/callback";
            if(options !== undefined) {
              if(options.hasOwnProperty("redirect_uri")) {
                redirect_uri = options.redirect_uri;
              }
            }
            var browserRef = window.cordova.InAppBrowser.open('https://rally1.rallydev.com/login/oauth2/auth?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&scope=' + appScope + '&response_type=code', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
            browserRef.addEventListener('loadstart', function(event) {
              if((event.url).indexOf("http://localhost/callback") === 0) {
                var requestToken = (event.url).split("code=")[1];
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
    }
  }

  rally.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.reddit', ['oauth.utils'])
    .factory('$ngCordovaReddit', reddit);

  function reddit($q, $http, $cordovaOauthUtility) {
    return { signin: oauthReddit };

    /*
     * Sign into the Reddit service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthReddit(clientId, clientSecret, appScope, compact, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
                redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://ssl.reddit.com/api/v1/authorize' + (compact ? '.compact' : '') + '?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&duration=permanent&state=ngcordovaoauth&scope=' + appScope.join(",") + '&response_type=code', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var requestToken = (event.url).split("code=")[1];
              $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
              $http.defaults.headers.post.Authorization = 'Basic ' + btoa(clientId + ":" + clientSecret);
              $http({method: "post", url: "https://ssl.reddit.com/api/v1/access_token", data: "redirect_uri=" + redirect_uri + "&grant_type=authorization_code" + "&code=" + requestToken })
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

  reddit.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.salesforce', ['oauth.utils'])
    .factory('$ngCordovaSalesforce', salesforce);

  function salesforce($q, $http, $cordovaOauthUtility) {
    return { signin: oauthSalesforce };

    /*
     * Sign into the Salesforce service
     *
     * Suggestion: use salesforce oauth with forcetk.js(as SDK)
     *
     * @param    string loginUrl (such as: https://login.salesforce.com ; please notice community login)
     * @param    string clientId (copy from connection app info)
     * @param    string redirectUri (callback url in connection app info)
     * @return   promise
     */
    function oauthSalesforce(loginUrl, clientId) {
      var redirectUri = 'http://localhost/callback';
      var getAuthorizeUrl = function (loginUrl, clientId, redirectUri) {
        return loginUrl+'services/oauth2/authorize?display=touch'+
          '&response_type=token&client_id='+escape(clientId)+
          '&redirect_uri='+escape(redirectUri);
      };
      var startWith = function(string, str) {
        return (string.substr(0, str.length) === str);
      };

      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var browserRef = window.cordova.InAppBrowser.open(getAuthorizeUrl(loginUrl, clientId, redirectUri), "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
          browserRef.addEventListener("loadstart", function(event) {
            if(startWith(event.url, redirectUri)) {
                var oauthResponse = {};

                var fragment = (event.url).split('#')[1];

                if (fragment) {
                  var nvps = fragment.split('&');
                  for (var nvp in nvps) {
                    var parts = nvps[nvp].split('=');
                    oauthResponse[parts[0]] = unescape(parts[1]);
                  }
                }

                if (typeof oauthResponse === 'undefined' ||
                  typeof oauthResponse.access_token === 'undefined') {
                  deferred.reject("Problem authenticating");
                } else {
                  deferred.resolve(oauthResponse);
                }
                setTimeout(function() {
                  browserRef.close();
                }, 10);
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

  salesforce.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.slack', ['oauth.utils'])
    .factory('$ngCordovaSlack', slack);

  function slack($q, $http, $cordovaOauthUtility) {
    return { signin: oauthSlack };

    /*
     * Sign into the Slack service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthSlack(clientId, clientSecret, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }

          var browserRef = window.cordova.InAppBrowser.open('https://slack.com/oauth/authorize' + '?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&state=ngcordovaoauth&scope=' + appScope.join(","), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var requestToken = (event.url).split("code=")[1];
              $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
              $http({method: "post", url: "https://slack.com/api/oauth.access", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code" + "&code=" + requestToken })
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

  slack.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.spotify', ['oauth.utils'])
    .factory('$ngCordovaSpotify', spotify);

  function spotify($q, $http, $cordovaOauthUtility) {
    return { signin: oauthSpotify };

    /*
     * Sign into the Spotify service
     *
     * @param    string clientId
     * @param    object options
     * @return   promise
     */
    function oauthSpotify(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          var response_type = "token";
          var state = "";
          var show_dialog = "";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
            if(options.hasOwnProperty("response_type")) {
              response_type = options.response_type;
            }
            if(options.hasOwnProperty("state")) {
              state = "&state=" + options.state;
            }
            if(options.hasOwnProperty("show_dialog")) {
              show_dialog = "&show_dialog=" + options.show_dialog;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://accounts.spotify.com/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=' + response_type + state + '&scope=' + appScope.join(" ") + show_dialog, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              browserRef.removeEventListener("exit",function(event){});
              browserRef.close();
              var splitChar = (response_type === "code") ? "?" : "#";
              var callbackResponse = (event.url).split(splitChar)[1];
              var responseParameters = (callbackResponse).split("&");
              var parameterMap = [];
              for(var i = 0; i < responseParameters.length; i++) {
                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
              }
              if(response_type === "token" && parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                deferred.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in, account_username: parameterMap.account_username });
              } else if(response_type === "code" && parameterMap.code !== undefined && parameterMap.code !== null) {
                deferred.resolve({ code: parameterMap.code, state: parameterMap.state });
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
    }
  }

  spotify.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.strava', ['oauth.utils'])
    .factory('$ngCordovaStrava', strava);

  function strava($q, $http, $cordovaOauthUtility) {
    return { signin: oauthStrava };

    /*
    * Sign into the Strava service
    *
    * @param    string clientId
    * @param    string clientSecret
    * @param    array appScope
    * @param    object options
    * @return   promise
    */
    function oauthStrava(clientId, clientSecret, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://www.strava.com/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&scope=' + appScope.join(",") + '&response_type=code&approval_prompt=force', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var requestToken = (event.url).split("code=")[1];
              $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
              $http({method: "post", url: "https://www.strava.com/oauth/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&code=" + requestToken })
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

  strava.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.stripe', ['oauth.utils'])
    .factory('$ngCordovaStripe', stripe);

  function stripe($q, $http, $cordovaOauthUtility) {
    return { signin: oauthStripe };

    /*
     * Sign into the Stripe service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    string appScope
     * @param    object options
     * @return   promise
     */
    function oauthStripe(clientId, clientSecret, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://connect.stripe.com/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&scope=' + appScope + '&response_type=code', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf("http://localhost/callback") === 0) {
              var requestToken = (event.url).split("code=")[1];
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
    }
  }

  stripe.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.trakttv', ['oauth.utils'])
    .factory('$ngCordovaTraktTv', trakttv);

  function trakttv($q, $http, $cordovaOauthUtility) {
    return { signin: oauthTraktTv };

    /*
     * Sign into the Trakt.tv service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    string state
     * @param    object options
     * @return   promise
     */
    function oauthTraktTv(clientId, clientSecret, appScope, state, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://trakt.tv/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=code&state=' + state, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              try {
                var requestToken = (event.url).split("code=")[1].split("&")[0];
                $http({method: "post", headers: {'Content-Type': 'application/json'}, url: "https://trakt.tv/oauth/token", data: {'code': requestToken, 'client_id': clientId, 'client_secret': clientSecret, 'redirect_uri': redirect_uri, 'grant_type': 'authorization_code'} })
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

  trakttv.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

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

(function() {
  'use strict';

  angular.module('oauth.uber', ['oauth.utils'])
    .factory('$ngCordovaUber', uber);

  function uber($q, $http, $cordovaOauthUtility) {
    return { signin: oauthUber };

    /*
     * Sign into the Uber service
     *
     * @param    string clientId
     * @param    appScope array
     * @param    object options
     * @return   promise
     */
    function oauthUber(clientId, appScope, options) {

      var deferred = $q.defer();
      if(window.cordova) {

        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://login.uber.com/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=token&scope=' + appScope.join(" "), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
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

    }
  }

  uber.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.untappd', ['oauth.utils'])
    .factory('$ngCordovaUntappd', untappd);

  function untappd($q, $http, $cordovaOauthUtility) {
    return { signin: oauthUntappd };

    /*
    * Sign into the Untappd service
    *
    * @param    string clientId
    * @param    object options
    * @return   promise
    */
    function oauthUntappd(clientId, options) {
      var deferred = $q.defer();
      if (window.cordova) {
        if ($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_url = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_url")) {
              redirect_url = options.redirect_url;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://untappd.com/oauth/authenticate/?client_id=' + clientId + '&redirect_url=' + redirect_url + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
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
    }
  }

  untappd.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.venmo', ['oauth.utils'])
    .factory('$ngCordovaVenmo', venmo);

  function venmo($q, $http, $cordovaOauthUtility) {
    return { signin: oauthVenmo };

    /*
     * Sign into the Venmo service
     *
     * @param    string clientId
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthVenmo(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://api.venmo.com/v1/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=token&scope=' + appScope.join(" "), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              browserRef.removeEventListener("exit",function(event){});
              browserRef.close();
              var callbackResponse = (event.url).split("?")[1];
              var responseParameters = (callbackResponse).split("&");
              var parameterMap = [];

              for(var i = 0; i < responseParameters.length; i++) {
                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
              }

              if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                deferred.resolve({ access_token: parameterMap.access_token });
              } else if(parameterMap.error !== undefined && parameterMap.error !== null) {
                deferred.reject((parameterMap.error).replace("+", " "));
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
    }
  }

  venmo.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.vkontakte', ['oauth.utils'])
    .factory('$ngCordovaVkontakte', vkontakte);

  function vkontakte($q, $http, $cordovaOauthUtility) {
    return { signin: oauthvKontakte };

    /*
     * Sign into the Vkontakte service
     *
     * @param    string clientId
     * @param    array appScope (for example: "friends,wall,photos,messages")
     * @return   promise
     */
    function oauthvKontakte(clientId, appScope) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var browserRef = window.cordova.InAppBrowser.open('https://oauth.vk.com/authorize?client_id=' + clientId + '&redirect_uri=http://oauth.vk.com/blank.html&response_type=token&scope=' + appScope.join(",") + '&display=touch&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
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
    }
  }

  vkontakte.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.weibo', ['oauth.utils'])
    .factory('$ngCordovaWeibo', weibo);

  function weibo($q, $http, $cordovaOauthUtility) {
    return { signin: oauthWeibo };

    /*
     * Sign into the Weibo service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthWeibo(clientId, clientSecret, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
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

          var browserRef = window.cordova.InAppBrowser.open(flowUrl, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var requestToken = (event.url).split("code=")[1];
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
    }
  }

  weibo.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.windowslive', ['oauth.utils'])
    .factory('$ngCordovaWindowslive', windowslive);

  function windowslive($q, $http, $cordovaOauthUtility) {
    return { signin: oauthWindowslive };

    /*
     * Sign into the Windows Live Connect service
     *
     * @param    string clientId
     * @param    array appScope
     * @param    object options
     * @return   promise
    */
    function oauthWindowslive(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "https://login.live.com/oauth20_desktop.srf";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://login.live.com/oauth20_authorize.srf?client_id=' + clientId + "&scope=" + appScope.join(",") + '&response_type=token&display=touch' + '&redirect_uri=' + redirect_uri, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
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
    }
  }

  windowslive.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.withings', ['oauth.utils'])
    .factory('$ngCordovaWithings', withings);

  function withings($q, $http, $cordovaOauthUtility) {
    return { signin: oauthWithings };

    /*
     * Sign into the Withings service
     * Note that this service requires jsSHA for generating HMAC-SHA1 Oauth 1.0 signatures
     *
     * @param    string clientId
     * @param    string clientSecret
     * @return   promise
     */
    function oauthWithings(clientId, clientSecret) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          if(typeof jsSHA !== "undefined") {

            // Step 1 : get a oAuth "request token"
            var oauthObject = $cordovaOauthUtility.generateOauthParametersInstance(clientId);
            oauthObject.oauth_callback = 'http://localhost/callback';

            var requestTokenUrlBase = "https://oauth.withings.com/account/request_token";
            var signatureObj = $cordovaOauthUtility.createSignature("GET", requestTokenUrlBase, {}, oauthObject, clientSecret);
            oauthObject.oauth_signature = signatureObj.signature;

            var requestTokenParameters = $cordovaOauthUtility.generateUrlParameters(oauthObject);

            $http({method: "get", url: requestTokenUrlBase + "?" + requestTokenParameters })
              .success(function(requestTokenResult) {

                // Step 2 : End-user authorization
                var parameterMap = $cordovaOauthUtility.parseResponseParameters(requestTokenResult);
                if(!parameterMap.oauth_token) {
                  deferred.reject("Oauth request token was not received");
                }
                var oauthObject = $cordovaOauthUtility.generateOauthParametersInstance(clientId);
                oauthObject.oauth_token = parameterMap.oauth_token;

                // used in step 3
                var oauthTokenSecret = parameterMap.oauth_token_secret;

                var authorizeUrlBase = "https://oauth.withings.com/account/authorize";
                var signatureObj = $cordovaOauthUtility.createSignature("GET", authorizeUrlBase, {}, oauthObject, clientSecret);
                oauthObject.oauth_signature = signatureObj.signature;

                var authorizeParameters = $cordovaOauthUtility.generateUrlParameters(oauthObject);
                var browserRef = window.cordova.InAppBrowser.open(authorizeUrlBase + '?' + authorizeParameters, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');

                // STEP 3: User Data Access token
                browserRef.addEventListener('loadstart', function(event) {
                  if((event.url).indexOf("http://localhost/callback") === 0) {
                    var callbackResponse = (event.url).split("?")[1];
                    parameterMap = $cordovaOauthUtility.parseResponseParameters(callbackResponse);
                    if(!parameterMap.oauth_verifier) {
                      deferred.reject("Browser authentication failed to complete.  No oauth_verifier was returned");
                    }

                    var oauthObject = $cordovaOauthUtility.generateOauthParametersInstance(clientId);
                    oauthObject.oauth_token = parameterMap.oauth_token;

                    var accessTokenUrlBase = "https://oauth.withings.com/account/access_token";
                    var signatureObj = $cordovaOauthUtility.createSignature("GET", accessTokenUrlBase, {}, oauthObject, clientSecret, oauthTokenSecret);
                    oauthObject.oauth_signature = signatureObj.signature;

                    var accessTokenParameters = $cordovaOauthUtility.generateUrlParameters(oauthObject);

                    $http({method: "get", url: accessTokenUrlBase + '?' + accessTokenParameters})
                      .success(function(result) {
                        var parameterMap = $cordovaOauthUtility.parseResponseParameters(result);
                        if(!parameterMap.oauth_token_secret) {
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

  withings.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.xing', ['oauth.utils'])
    .factory('$ngCordovaXing', xing);

  function xing($q, $http, $cordovaOauthUtility) {
    return { signin: oauthXing };

    /*
     * Sign into the Xing service
     * Note that this service requires jsSHA for generating HMAC-SHA1 Oauth 1.0 signatures
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    object options
     * @return   promise
     */
    function oauthXing(clientId, clientSecret, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = 'http://localhost/callback';
          if(options !== undefined) {
            if(options.hasOwnProperty('redirect_uri')) {
              redirect_uri = options.redirect_uri;
            }
          }

          if(typeof jsSHA !== 'undefined') {
            var oauthObject = {
              oauth_consumer_key: clientId,
              oauth_nonce: $cordovaOauthUtility.createNonce(10),
              oauth_signature_method: 'HMAC-SHA1',
              oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
              oauth_version: '1.0'
            };
            var signatureObj = $cordovaOauthUtility.createSignature('POST', 'https://api.xing.com/v1/request_token', oauthObject,  { oauth_callback: redirect_uri }, clientSecret);
            $http({
              method: 'post',
              url: 'https://api.xing.com/v1/request_token',
              headers: {
                  'Authorization': signatureObj.authorization_header,
                  'Content-Type': 'application/x-www-form-urlencoded'
              },
              data: 'oauth_callback=' + encodeURIComponent(redirect_uri)
            })
              .success(function(requestTokenResult) {
                var requestTokenParameters = (requestTokenResult).split('&');
                var parameterMap = {};
                for(var i = 0; i < requestTokenParameters.length; i++) {
                  parameterMap[requestTokenParameters[i].split('=')[0]] = requestTokenParameters[i].split('=')[1];
                }
                if(parameterMap.hasOwnProperty('oauth_token') === false) {
                  deferred.reject('Oauth request token was not received');
                }
                var oauthTokenSecret = parameterMap.oauth_token_secret;
                var browserRef = window.cordova.InAppBrowser.open('https://api.xing.com/v1/authorize?oauth_token=' + parameterMap.oauth_token, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                browserRef.addEventListener('loadstart', function(event) {
                  if((event.url).indexOf(redirect_uri) === 0) {
                    var callbackResponse = (event.url).split('?')[1];
                    var responseParameters = (callbackResponse).split('&');
                    var parameterMap = {};
                    for(var i = 0; i < responseParameters.length; i++) {
                      parameterMap[responseParameters[i].split('=')[0]] = responseParameters[i].split('=')[1];
                    }
                    if(parameterMap.hasOwnProperty('oauth_verifier') === false) {
                      deferred.reject('Browser authentication failed to complete.  No oauth_verifier was returned');
                    }
                    delete oauthObject.oauth_signature;
                    oauthObject.oauth_token = parameterMap.oauth_token;
                    var signatureObj = $cordovaOauthUtility.createSignature('POST', 'https://api.xing.com/v1/access_token', oauthObject,  { oauth_verifier: parameterMap.oauth_verifier }, clientSecret, oauthTokenSecret);
                    $http({
                      method: 'post',
                      url: 'https://api.xing.com/v1/access_token',
                      headers: {
                          'Authorization': signatureObj.authorization_header
                      },
                      params: {
                          'oauth_verifier': parameterMap.oauth_verifier
                      }
                    })
                      .success(function(result) {
                        var accessTokenParameters = result.split('&');
                        var parameterMap = {};
                        for(var i = 0; i < accessTokenParameters.length; i++) {
                          parameterMap[accessTokenParameters[i].split('=')[0]] = accessTokenParameters[i].split('=')[1];
                        }
                        if(parameterMap.hasOwnProperty('oauth_token_secret') === false) {
                          deferred.reject('Oauth access token was not received');
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
                  deferred.reject('The sign in flow was canceled');
                });
              })
              .error(function(error) {
                deferred.reject(error);
              });
          } else {
              deferred.reject('Missing jsSHA JavaScript library');
          }
        } else {
            deferred.reject('Could not find InAppBrowser plugin');
        }
      } else {
        deferred.reject('Cannot authenticate via a web browser');
      }

      return deferred.promise;
    }
  }

  xing.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.yahoo', ['oauth.utils'])
    .factory('$ngCordovaYahoo', yahoo);

  function yahoo($q, $cordovaOauthUtility) {
    return { signin: oauthYahoo };

    /*
     * Sign into the Yahoo service
     *
     * @param    string clientId
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthYahoo(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";

          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }

          var providerUrl = 'https://api.login.yahoo.com/oauth2/request_auth?client_id=' + clientId;
          providerUrl += '&redirect_uri=' + redirect_uri;
          providerUrl += '&response_type=token';
          providerUrl += '&scope=' + appScope.join(" ");

          var browserRef = window.cordova.InAppBrowser.open(
              providerUrl, 
              '_blank', 
              'location=no,clearsessioncache=yes,clearcache=yes'
          );

          browserRef.addEventListener("loadstart", function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              browserRef.removeEventListener("exit",function(event){});
              browserRef.close();

              var callbackResponse = (event.url).split("#")[1];
              var responseParameters = (callbackResponse).split("&");
              var parameterMap = {};
              for(var i = 0; i < responseParameters.length; i++) {
                parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
              }

              if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                deferred.resolve({ 
                  access_token: parameterMap.access_token, 
                  token_type: parameterMap.token_type, 
                  expires_in: parameterMap.expires_in, 
                  id_token: parameterMap.id_token 
                });
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
    }
  }

  yahoo.$inject = ['$q', '$cordovaOauthUtility'];
})();

(function() {
  'use strict';

  angular.module('oauth.yammer', ['oauth.utils'])
    .factory('$ngCordovaYammer', yammer);

  function yammer($q, $http, $cordovaOauthUtility) {
    return { signin: oauthYammer };

    /*
     * Sign into the Yammer service
     *
     * @param    string clientId
     * @param    object options
     * @return   promise
     */
    function oauthYammer(clientId, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://www.yammer.com/dialog/oauth?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
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
    }
  }

  yammer.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();

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
 *    Apache Cordova Whitelist Plugin
 *
 *
 * SUPPORTS:
 *
 *    500px
 *    Dropbox
 *    Digital Ocean
 *    Google
 *    GitHub
 *    Facebook
 *    LinkedIn
 *    Instagram
 *    Box
 *    Reddit
 *    Twitter
 *    Meetup
 *    Salesforce
 *    Strava
 *    Withings
 *    Foursquare
 *    Magento
 *    vkontakte
 *    Odnoklassniki
 *    ADFS
 *    Imgur
 *    Spotify
 *    Uber
 *    Windows Live Connect
 *    Yammer
 *    Venmo
 *    Stripe
 *    Rally
 *    Family Search
 *    Envato
 *    Slack
 *    Jawbone
 *    Untappd
 *    Xing
 *    Trakt.tv
 */

angular.module("ngCordovaOauth", [
    "oauth.providers",
    "oauth.utils"
]);

(function() {
  angular.module("oauth.utils", [])
    .factory("$cordovaOauthUtility", cordovaOauthUtility);

  function cordovaOauthUtility($q) {
    return {
      isInAppBrowserInstalled: isInAppBrowserInstalled,
      createSignature: createSignature,
      createNonce: createNonce,
      generateUrlParameters: generateUrlParameters,
      parseResponseParameters: parseResponseParameters,
      generateOauthParametersInstance: generateOauthParametersInstance
    };

    /*
     * Check to see if the mandatory InAppBrowser plugin is installed
     *
     * @param
     * @return   boolean
     */
    function isInAppBrowserInstalled() {
      var cordovaPluginList = cordova.require("cordova/plugin_list");
      var inAppBrowserNames = ["cordova-plugin-inappbrowser", "cordova-plugin-inappbrowser.inappbrowser", "org.apache.cordova.inappbrowser"];

      if (Object.keys(cordovaPluginList.metadata).length === 0) {
        var formatedPluginList = cordovaPluginList.map(
          function(plugin) {
            return plugin.id || plugin.pluginId;
          });

        return inAppBrowserNames.some(function(name) {
          return formatedPluginList.indexOf(name) != -1 ? true : false;
        });
      } else {
        return inAppBrowserNames.some(function(name) {
          return cordovaPluginList.metadata.hasOwnProperty(name);
        });
      }
    }

    /*
     * Sign an Oauth 1.0 request
     *
     * @param    string method
     * @param    string endPoint
     * @param    object headerParameters
     * @param    object bodyParameters
     * @param    string secretKey
     * @param    string tokenSecret (optional)
     * @return   object
     */
    function createSignature(method, endPoint, headerParameters, bodyParameters, secretKey, tokenSecret) {
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

        var encodedTokenSecret = '';
        if (tokenSecret) {
          encodedTokenSecret = encodeURIComponent(tokenSecret);
        }

        headerParameters.oauth_signature = encodeURIComponent(oauthSignatureObject.getHMAC(encodeURIComponent(secretKey) + "&" + encodedTokenSecret, "TEXT", "SHA-1", "B64"));
        var headerParameterKeys = Object.keys(headerParameters);
        var authorizationHeader = 'OAuth ';

        for(i = 0; i < headerParameterKeys.length; i++) {
          if(i == headerParameterKeys.length - 1) {
            authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '"';
          } else {
            authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '",';
          }
        }

        return { signature_base_string: signatureBaseString, authorization_header: authorizationHeader, signature: headerParameters.oauth_signature };
      } else {
        return "Missing jsSHA JavaScript library";
      }
    }

    /*
    * Create Random String Nonce
    *
    * @param    integer length
    * @return   string
    */
    function createNonce(length) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text;
    }

    function generateUrlParameters(parameters) {
      var sortedKeys = Object.keys(parameters);
      sortedKeys.sort();

      var params = "";
      var amp = "";

      for (var i = 0 ; i < sortedKeys.length; i++) {
        params += amp + sortedKeys[i] + "=" + parameters[sortedKeys[i]];
        amp = "&";
      }

      return params;
    }

    function parseResponseParameters(response) {
      if (response.split) {
        var parameters = response.split("&");
        var parameterMap = {};

        for(var i = 0; i < parameters.length; i++) {
            parameterMap[parameters[i].split("=")[0]] = parameters[i].split("=")[1];
        }

        return parameterMap;
      }
      else {
        return {};
      }
    }

    function generateOauthParametersInstance(consumerKey) {
      var nonceObj = new jsSHA(Math.round((new Date()).getTime() / 1000.0), "TEXT");
      var oauthObject = {
          oauth_consumer_key: consumerKey,
          oauth_nonce: nonceObj.getHash("SHA-1", "HEX"),
          oauth_signature_method: "HMAC-SHA1",
          oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
          oauth_version: "1.0"
      };
      return oauthObject;
    }
  }

  cordovaOauthUtility.$inject = ['$q'];
})();
