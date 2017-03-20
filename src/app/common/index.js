import angular from 'angular';

import SvgCache from './svg-cache';
// import Utils from './utils';;

let commonModule = angular.module('app.common', [
  SvgCache
])

.name;

export default commonModule;
