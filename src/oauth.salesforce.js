(function() {
  'use strict';

  angular.module('oauth.salesforce', ['oauth.utils'])
    .factory('$ngCordovaSalesforce', salesforce);

  function salesforce($q, $http, $cordovaOauthUtility) {
    return { signin: oauthSalesforce };

    /*
     * Sign into the Salesforce service
     *
     * Suggestion: use salesforce oauth with forcetk.js(as SDK)
     *
     * @param    string loginUrl (such as: https://login.salesforce.com ; please notice community login)
     * @param    string clientId (copy from connection app info)
     * @param    string redirectUri (callback url in connection app info)
     * @return   promise
     */
    function oauthSalesforce(loginUrl, clientId) {
      var redirectUri = 'http://localhost/callback';
      var getAuthorizeUrl = function (loginUrl, clientId, redirectUri) {
        return loginUrl+'services/oauth2/authorize?display=touch'+
          '&response_type=token&client_id='+escape(clientId)+
          '&redirect_uri='+escape(redirectUri);
      };
      var startWith = function(string, str) {
        return (string.substr(0, str.length) === str);
      };

      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var browserRef = window.cordova.InAppBrowser.open(getAuthorizeUrl(loginUrl, clientId, redirectUri), "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
          browserRef.addEventListener("loadstart", function(event) {
            if(startWith(event.url, redirectUri)) {
                var oauthResponse = {};

                var fragment = (event.url).split('#')[1];

                if (fragment) {
                  var nvps = fragment.split('&');
                  for (var nvp in nvps) {
                    var parts = nvps[nvp].split('=');
                    oauthResponse[parts[0]] = unescape(parts[1]);
                  }
                }

                if (typeof oauthResponse === 'undefined' ||
                  typeof oauthResponse.access_token === 'undefined') {
                  deferred.reject("Problem authenticating");
                } else {
                  deferred.resolve(oauthResponse);
                }
                setTimeout(function() {
                  browserRef.close();
                }, 10);
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

  salesforce.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
