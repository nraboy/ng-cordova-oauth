var oauthApp = angular.module("oauthapp", ["ui.router"]);

oauthApp.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state("overview", {
            url: "/overview",
            templateUrl: "templates/overview.html"
        })
        .state('docs', {
            url: '/docs',
            templateUrl: 'templates/docs.html'
        })
        .state('docs.providers', {
            url: '/providers',
            templateUrl: 'templates/providers.html',
            controller: 'ProvidersController'
        })
        .state('docs.provider', {
            url: '/provider/:providerName',
            templateUrl: 'templates/provider.html',
            controller: 'ProviderController'
        });
    $urlRouterProvider.otherwise('/overview');
});


oauthApp.controller("ProvidersController", function($scope) {

});

oauthApp.controller("ProviderController", function($scope, $stateParams) {

    $scope.provider = $stateParams.providerName;

});
