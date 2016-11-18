(function() {
  'use strict';

  angular.module('oauth.google', ['oauth.utils'])
    .factory('$ngCordovaGoogle', google);

  function google($q, $http, $cordovaOauthUtility) {
    return { signin: oauthGoogle };

    /*
     * Sign into the Google service
     *
     * @param    string clientId
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthGoogle(clientId, appScope, options) {
      var deferred = $q.defer();
      deferred.reject("Google no longer supports authentication requests from the web view.  More information can be found at https://developers.googleblog.com/2016/08/modernizing-oauth-interactions-in-native-apps.html");
      return deferred.promise;
    }
  }

  google.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
