describe('oauth.utils tests', function() {
  beforeEach(module('ngCordovaOauth'));

  var oauthUtils;

  beforeEach(inject(function($cordovaOauthUtility) {
    oauthUtils = $cordovaOauthUtility;
  }));

  describe('isInAppBrowserInstalled', function() {
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

  describe('createNonce', function() {
    it('Should return a string with length equal passed', function() {
      expect(oauthUtils.createNonce(10).length).toBe(10);
    });
  });
});
