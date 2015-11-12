window = typeof window === 'undefined' ? {} : window;
document = typeof document === 'undefined' ? window.document || {} : document;
window.cordova = typeof window.cordova === 'undefined' ? {} : window.cordova;

window.cordova.require = function(stringParam) {
  return []
}
