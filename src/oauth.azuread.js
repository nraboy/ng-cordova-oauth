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
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

            $http({method: "post", url: "https://login.microsoftonline.com/" + tenantId + "/oauth2/token", data:
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
