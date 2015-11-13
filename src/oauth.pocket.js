angular.module('oauth.pocket', ['oauth.utils'])
  .factory('$pocket', pocket);

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
