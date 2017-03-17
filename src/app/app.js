import './common/helpers.security';
import './common/helpers.externs';
import angular from 'angular';
import ngMaterial from 'angular-material';
import ngAnimate from 'angular-animate';
import ngAria from 'angular-aria';
import ngSanitize from 'angular-sanitize';
import uiRouter from 'angular-ui-router';
import ngLocalStorage from 'angular-local-storage';

import Common from './common';
import Components from './components';
import AppComponent from './app.component';

angular.module('app', [
  ngMaterial,
  ngAnimate,
  ngAria,
  ngSanitize,
  uiRouter,
  ngLocalStorage,
  Common,
  Components
])
.config(function (
    $transitionsProvider,

    $locationProvider,
    $urlRouterProvider,
    $compileProvider,
    $mdThemingProvider,
    $mdDateLocaleProvider,
    $qProvider,
    $httpProvider,
    localStorageServiceProvider
  ) {
  'ngInject';

  // @see http://stackoverflow.com/a/41318654/1938970
  $compileProvider.preAssignBindingsEnabled(true);

  // @see https://github.com/angular-ui/ui-router/issues/2889
  // $qProvider.errorOnUnhandledRejections(false);

  $urlRouterProvider.otherwise('/');

  localStorageServiceProvider.setPrefix('contexta');

  $mdThemingProvider.setNonce();
  $mdThemingProvider.theme('default')
    .primaryPalette('light-blue', {
      'default': '600'
    })
    .accentPalette('pink', {
      'default': '400'
    });

  // $mdThemingProvider.alwaysWatchTheme(true);
  // $mdThemingProvider.generateThemesOnDemand(true);
  // $mdTheming.generateTheme('default');
  // // change theme according t the current app, not for now...
  // $transitionsProvider.onBefore({}, (trans) => {
  //   const name = trans.to().name;
  //   const appName = name.split('.')[0];

  //   if (appName === 'nuon') {
  //     $mdThemingProvider.theme('default')
  //     .primaryPalette('pink', {
  //       'default': '600'
  //     })
  //     .accentPalette('pink', {
  //       'default': '400'
  //     });
  //   }
  // });

  $mdDateLocaleProvider.formatDate = (date) => {
    if (!date) {
      return null;
    }
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    return `${day}-${monthIndex + 1}-${year}`;
  };
})

.component('app', AppComponent);
