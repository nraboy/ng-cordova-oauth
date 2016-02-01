angular.module('oauth.pinterest', ['oauth.utils'])
  .factory('$ngCordovaPinterest', pinterest);

function pinterest($q, $http, $cordovaOauthUtility) {
  return { signin: oauthPinterest };

  /*
   * Sign into the Pinterest service
   *
   * @param    string clientId
   * @param    string clientSecret
   * @param    array appScope (for example: "VALUABLE_ACCESS ,GROUP_CONTENT,VIDEO_CONTENT")
   * @param    object options
   * @return   promise
   */
  function oauthPinterest(clientId, clientSecret, appScope, options) {
    var deferred = $q.defer();
    if(window.cordova) {
      if($cordovaOauthUtility.isInAppBrowserInstalled()) {
        var redirect_uri = "http://localhost/callback";
        if(options !== undefined) {
          if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
          }
        }
        var browserRef = window.cordova.InAppBrowser.open('https://api.pinterest.com/oauth/?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&state=ngcordovaoauth&scope=' + appScope.join(",") + '&response_type=code', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
        browserRef.addEventListener('loadstart', function(event) {
          if((event.url).indexOf(redirect_uri) === 0) {
            requestToken = (event.url).split("code=")[1];
            $http({method: "post", url: "https://api.pinterest.com/v1/oauth/token", data: "grant_type=authorization_code&client_id=" + clientId + "&client_secret=" + clientSecret + "&code=" + requestToken })
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

pinterest.$inject = ['$q', '$http', '$cordovaOauthUtility'];
