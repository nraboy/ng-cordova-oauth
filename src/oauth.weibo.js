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
  }
}

weibo.$inject = ['$q', '$http', '$cordovaOauthUtility'];
