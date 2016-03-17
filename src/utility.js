(function() {
  angular.module("oauth.utils", [])
    .factory("$cordovaOauthUtility", cordovaOauthUtility);

  function cordovaOauthUtility($q) {
    return {
      isInAppBrowserInstalled: isInAppBrowserInstalled,
      createSignature: createSignature,
      createNonce: createNonce,
      generateUrlParameters: generateUrlParameters,
      parseResponseParameters: parseResponseParameters,
      generateOauthParametersInstance: generateOauthParametersInstance
    };

    /*
     * Check to see if the mandatory InAppBrowser plugin is installed
     *
     * @param
     * @return   boolean
     */
    function isInAppBrowserInstalled() {
      var cordovaPluginList = cordova.require("cordova/plugin_list");
      var inAppBrowserNames = ["cordova-plugin-inappbrowser", "cordova-plugin-inappbrowser.inappbrowser", "org.apache.cordova.inappbrowser"];

      if (Object.keys(cordovaPluginList.metadata).length === 0) {
        var formatedPluginList = cordovaPluginList.map(
          function(plugin) {
            return plugin.id || plugin.pluginId;
          });

        return inAppBrowserNames.some(function(name) {
          return formatedPluginList.indexOf(name) != -1 ? true : false;
        });
      } else {
        return inAppBrowserNames.some(function(name) {
          return cordovaPluginList.metadata.hasOwnProperty(name);
        });
      }
    }

    /*
     * Sign an Oauth 1.0 request
     *
     * @param    string method
     * @param    string endPoint
     * @param    object headerParameters
     * @param    object bodyParameters
     * @param    string secretKey
     * @param    string tokenSecret (optional)
     * @return   object
     */
    function createSignature(method, endPoint, headerParameters, bodyParameters, secretKey, tokenSecret) {
      if(typeof jsSHA !== "undefined") {
        var headerAndBodyParameters = angular.copy(headerParameters);
        var bodyParameterKeys = Object.keys(bodyParameters);

        for(var i = 0; i < bodyParameterKeys.length; i++) {
          headerAndBodyParameters[bodyParameterKeys[i]] = encodeURIComponent(bodyParameters[bodyParameterKeys[i]]);
        }

        var signatureBaseString = method + "&" + encodeURIComponent(endPoint) + "&";
        var headerAndBodyParameterKeys = (Object.keys(headerAndBodyParameters)).sort();

        for(i = 0; i < headerAndBodyParameterKeys.length; i++) {
          if(i == headerAndBodyParameterKeys.length - 1) {
            signatureBaseString += encodeURIComponent(headerAndBodyParameterKeys[i] + "=" + headerAndBodyParameters[headerAndBodyParameterKeys[i]]);
          } else {
            signatureBaseString += encodeURIComponent(headerAndBodyParameterKeys[i] + "=" + headerAndBodyParameters[headerAndBodyParameterKeys[i]] + "&");
          }
        }

        var oauthSignatureObject = new jsSHA(signatureBaseString, "TEXT");

        var encodedTokenSecret = '';
        if (tokenSecret) {
          encodedTokenSecret = encodeURIComponent(tokenSecret);
        }

        headerParameters.oauth_signature = encodeURIComponent(oauthSignatureObject.getHMAC(encodeURIComponent(secretKey) + "&" + encodedTokenSecret, "TEXT", "SHA-1", "B64"));
        var headerParameterKeys = Object.keys(headerParameters);
        var authorizationHeader = 'OAuth ';

        for(i = 0; i < headerParameterKeys.length; i++) {
          if(i == headerParameterKeys.length - 1) {
            authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '"';
          } else {
            authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '",';
          }
        }

        return { signature_base_string: signatureBaseString, authorization_header: authorizationHeader, signature: headerParameters.oauth_signature };
      } else {
        return "Missing jsSHA JavaScript library";
      }
    }

    /*
    * Create Random String Nonce
    *
    * @param    integer length
    * @return   string
    */
    function createNonce(length) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text;
    }

    function generateUrlParameters(parameters) {
      var sortedKeys = Object.keys(parameters);
      sortedKeys.sort();

      var params = "";
      var amp = "";

      for (var i = 0 ; i < sortedKeys.length; i++) {
        params += amp + sortedKeys[i] + "=" + parameters[sortedKeys[i]];
        amp = "&";
      }

      return params;
    }

    function parseResponseParameters(response) {
      if (response.split) {
        var parameters = response.split("&");
        var parameterMap = {};

        for(var i = 0; i < parameters.length; i++) {
            parameterMap[parameters[i].split("=")[0]] = parameters[i].split("=")[1];
        }

        return parameterMap;
      }
      else {
        return {};
      }
    }

    function generateOauthParametersInstance(consumerKey) {
      var nonceObj = new jsSHA(Math.round((new Date()).getTime() / 1000.0), "TEXT");
      var oauthObject = {
          oauth_consumer_key: consumerKey,
          oauth_nonce: nonceObj.getHash("SHA-1", "HEX"),
          oauth_signature_method: "HMAC-SHA1",
          oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
          oauth_version: "1.0"
      };
      return oauthObject;
    }
  }

  cordovaOauthUtility.$inject = ['$q'];
})();
