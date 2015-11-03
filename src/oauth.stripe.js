angular.module('oauth.stripe', ['oauth.utils'])
  .factory('$stripe', stripe);

function stripe($q, $http, $cordovaOauthUtility) {
  return { signin: oauthStripe };

  /*
   * Sign into the Stripe service
   *
   * @param    string clientId
   * @param    string clientSecret
   * @param    string appScope
   * @param    object options
   * @param  string windowOpenOptions (additional options to pass to window.open such as allowInlineMediaPlayback=yes,enableViewportScale=no)
   * @return   promise
   */
  function oauthStripe(clientId, clientSecret, appScope, options, windowOpenOptions) {
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
        var browserRef = $cordovaOauthUtility.windowOpenProxy('https://connect.stripe.com/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&scope=' + appScope + '&response_type=code', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes', windowOpenOptions);
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
  }
}

stripe.$inject = ['$q', '$http', '$cordovaOauthUtility'];
