angular.module('oauth.digitalOcean', ['oauth.utils'])
  .factory('$digitalOcean', digitalOcean);

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
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            $http({method: "post", url: "https://cloud.digitalocean.com/v1/oauth/token", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code" + "&code=" + requestToken })
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
