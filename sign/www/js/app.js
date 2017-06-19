angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
	  
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
    var AccessTokenState = {
		name: 'accessToken',
		url: '/:accessToken',
		templateUrl: 'templates/accessToken.html',
        controller: 'accessTokenCtrl'
	}
	$stateProvider.state(AccessTokenState);
    
    var eventsState = {
		name: 'events',
		url: '/events',
		templateUrl: 'templates/events.html',
		controller: 'eventsCtrl',
        cache: false,
	}
	$stateProvider.state(eventsState);
	
	var eventState = {
		name: 'event',
		url: '/event/:eventID',
		templateUrl: 'templates/event.html',
		controller: 'eventCtrl'
	}
	$stateProvider.state(eventState);
	
    var appSignState = {
		name: 'appSignIn',
		url: '/appSignIn/:eventID/:CODE',
		templateUrl: 'templates/appSignIn.html',
		controller: 'appSignInCtrl'
	}
	$stateProvider.state(appSignState);
    
	var checkState = {
		name: 'check',
		url: '/check/:eventID',
		templateUrl: 'templates/check.html',
		controller: 'checkCtrl',
        cache: false,
	}
	$stateProvider.state(checkState);
	
	var addState = {
		name: 'add',
		url: '/add',
		templateUrl: 'templates/add.html',
        controller: 'addEventCtrl'
	}
	$stateProvider.state(addState);
	
	$urlRouterProvider.otherwise("/");
})




