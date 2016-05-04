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
