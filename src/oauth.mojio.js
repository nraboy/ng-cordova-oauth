angular.module('oauth.mojio', ['oauth.utils'])
  .factory('$ngCordovaMojio', mojio);

  function mojio($q, $http, $cordovaOauthUtility) {
    return { signin: oauthMojio };

  /*
  * Sign into the Mojio service
  *
  * @param    string clientId
  * @param    object options
  * @return   promise
  */
  function oauthMojio(clientId, options) {
    var deferred = $q.defer();
    if(window.cordova) {
      if($cordovaOauthUtility.isInAppBrowserInstalled()) {
        var redirect_uri = "http://localhost/callback";
        if(options !== undefined) {
          if(options.hasOwnProperty("redirect_uri")) {
            redirect_uri = options.redirect_uri;
          }
        }
        var browserRef = window.cordova.InAppBrowser.open('https://api.moj.io/OAuth2/authorize?client_id=' + clientID + '&redirect_uri=http://localhost/callback&response_type=token', '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
        browserRef.addEventListener('loadstart', function(event) {
          if((event.url).indexOf(redirect_uri) === 0) {
            browserRef.removeEventListener("exit",function(event){});
              browserRef.close();
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

mojio.$inject = ['$q', '$http', '$cordovaOauthUtility'];
<<<<<<< HEAD


=======
>>>>>>> 211fad0... Added Mojio oAuth
