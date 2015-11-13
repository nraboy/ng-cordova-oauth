angular.module('oauth.familySearch', ['oauth.utils'])
  .factory('$familySearch', familySearch);

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
  }
}

familySearch.$inject = ['$q', '$http', '$cordovaOauthUtility'];
