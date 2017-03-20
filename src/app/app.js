import './common/helpers.security';
import './common/helpers.externs';
import angular from 'angular';
import ngMaterial from 'angular-material';
import ngAnimate from 'angular-animate';
import ngAria from 'angular-aria';
import uiRouter from 'angular-ui-router';

import Common from './common';
import Components from './components';
import AppComponent from './app.component';

angular.module('app', [
  ngMaterial,
  ngAnimate,
  ngAria,
  uiRouter,
  Common,
  Components
])
.config(function (
    $urlRouterProvider,
    $compileProvider,
    $mdThemingProvider,
  ) {
  'ngInject';

  // @see http://stackoverflow.com/a/41318654/1938970
  $compileProvider.preAssignBindingsEnabled(true);

  $urlRouterProvider.otherwise('/');

  $mdThemingProvider.setNonce();
  $mdThemingProvider.theme('default')
    .primaryPalette('light-blue', {
      'default': '600'
    })
    .accentPalette('pink', {
      'default': '400'
    });
})

.component('app', AppComponent);
