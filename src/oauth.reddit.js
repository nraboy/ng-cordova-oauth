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
            requestToken = (event.url).split("code=")[1];
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
