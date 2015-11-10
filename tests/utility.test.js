describe('oauth.utils tests', function() {
  beforeEach(module('ngCordovaOauth'));

  var oauthUtils;

  beforeEach(inject(function($cordovaOauthUtility) {
    oauthUtils = $cordovaOauthUtility;
  }));

  describe('Testing function isInAppBrowserInstalled: ', function() {
    it('Should return false if plugin not installed', function() {
      spyOn(window.cordova, 'require').and.returnValue({metadata: {}});
      expect(oauthUtils.isInAppBrowserInstalled()).toBeFalsy();
      expect(window.cordova.require).toHaveBeenCalledWith('cordova/plugin_list');
    });

    it('Should return true when the old version of plugin is installed', function() {
      spyOn(window.cordova, 'require').and.returnValue({ metadata: {"org.apache.cordova.inappbrowser": "1.0.0" }});
      expect(oauthUtils.isInAppBrowserInstalled()).toBeTruthy();
      expect(window.cordova.require).toHaveBeenCalledWith('cordova/plugin_list');
    });

    it('Should return true when the new version of plugin is installed', function() {
      spyOn(window.cordova, 'require').and.returnValue({ metadata: {"cordova-plugin-inappbrowser": "2.0.0"}});
      expect(oauthUtils.isInAppBrowserInstalled()).toBeTruthy();
      expect(window.cordova.require).toHaveBeenCalledWith('cordova/plugin_list');
    });
  });

  describe('Testing function createSignature: ', function() {
    var originalJsSHA, result, oauthObject;
    beforeEach(function() {
      originalJsSHA = jsSHA;
      oauthObject = {
        oauth_callback: "http://localhost/callback",
        oauth_consumer_key: '123123',
        oauth_nonce: oauthUtils.createNonce(5),
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
        oauth_version: "1.0"
      };
    });

    afterEach(function() {
      jsSHA = originalJsSHA;
    });

    it('Should return error message when jsSHA is undefined', function() {
      jsSHA = undefined;
      var result = oauthUtils.createSignature();
      expect(result).toBe('Missing jsSHA JavaScript library');
    });

    it('Should return a JSON with 3 keys', function() {
      var result = oauthUtils.createSignature("POST", "http://base.url/oauth/initiate", oauthObject,  { oauth_callback: "http://localhost/callback" }, 'clientSecret');
      var keys = ['signature_base_string', 'authorization_header', 'signature'];
      expect(Object.keys(result)).toEqual(keys);
    });

    it('Should encode tokenSecrete when it is passed', function() {
      spyOn(window, 'encodeURIComponent');
      var tokenSecret = 'clientSecret';
      var result = oauthUtils.createSignature("POST", "http://base.url/oauth/initiate", oauthObject,  { oauth_callback: "http://localhost/callback" }, tokenSecret);
      expect(window.encodeURIComponent).toHaveBeenCalledWith(tokenSecret);
    })
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

  describe('Testing function generateUrlParameters', function() {
    it('Should return empty string if and empty JSON is passed', function() {
      expect(oauthUtils.generateUrlParameters({})).toBe("");
    });

    it('Should return a string with one param without the `&`', function() {
      var params = {
        client_id: 'someString'
      }

      var result = oauthUtils.generateUrlParameters(params);

      expect(result).toBe('client_id=someString');
      expect(result).not.toMatch('&');
    });

    it('Should return a string with parameters separated by `&`', function() {
      var params = {
        client_id: 'smallToken',
        'appId': 'appToken'
      }
      var result = oauthUtils.generateUrlParameters(params);
      expect(result).toBe('appId=appToken&client_id=smallToken');
      expect(result).toMatch('&');
    });
  });

  describe('Testing function generateOauthParametersInstance', function() {
    it('Should call getHash with params', function() {
      var consumerKey = 'stringSample';
      var keys = [
        'oauth_consumer_key',
        'oauth_nonce',
        'oauth_signature_method',
        'oauth_timestamp',
        'oauth_version'
      ];
      var result = oauthUtils.generateOauthParametersInstance(consumerKey);
      expect(result['oauth_consumer_key']).toBe(consumerKey);
      expect(result['oauth_signature_method']).toBe('HMAC-SHA1');
      expect(result['oauth_version']).toBe('1.0');
      expect(Object.keys(result)).toEqual(keys);
    })
  });
});

//"http://localhost/callback#access_token=2074426136.3057c76.51491af8fc794ae9beaf2753e972c8fd"
