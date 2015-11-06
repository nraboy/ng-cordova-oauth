describe('oauth.utils tests', function() {
  beforeEach(module('ngCordovaOauth'));

  var oauthUtils;

  beforeEach(inject(function($cordovaOauthUtility) {
    oauthUtils = $cordovaOauthUtility;
  }));

  describe('Testing function isInAppBrowserInstalled: ', function() {
    // Mocks
    var oldPluginMetadata, newPluginMetadata, nonePluginMetadata;
    beforeEach(function() {
      oldPluginMetadata = {
        "org.apache.cordova.inappbrowser": "1.0.0"
      }
      newPluginMetadata = {
        "cordova-plugin-inappbrowser": "2.0.0"
      }
      nonePluginMetadata = {}
    });


    it('Should return false if plugin not installed', function() {
      expect(oauthUtils.isInAppBrowserInstalled(nonePluginMetadata)).toBe(false);
    });

    it('Should return true when the old version of plugin is installed', function() {
      expect(oauthUtils.isInAppBrowserInstalled(oldPluginMetadata)).toBe(true);
    });

    it('Should return true when the new version of plugin is installed', function() {
      expect(oauthUtils.isInAppBrowserInstalled(newPluginMetadata)).toBe(true);
    });
  });

  describe('Testing function createNonce: ', function() {
    it('Should return a string with length equal passed', function() {
      expect(oauthUtils.createNonce(10).length).toBe(10);
    });
  });

  describe('Testing function parseResponseParameters: ', function() {
    it('Should return empty JSON if the response don\'t have split function', function() {
      expect(oauthUtils.parseResponseParameters(12)).toEqual({});
    });

    it('Should return an object with `access_token` as key and token as value', function() {
      var serverResponse = 'access_token=ThisIsASimpleToken123';
      var result = {
        access_token: 'ThisIsASimpleToken123'
      }
      expect(oauthUtils.parseResponseParameters(serverResponse)).toEqual(result);
    });
  });
});

//"http://localhost/callback#access_token=2074426136.3057c76.51491af8fc794ae9beaf2753e972c8fd"
