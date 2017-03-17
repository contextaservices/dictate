import angular from 'angular';
import Home from './home';
import Login from './login';
import Overstappen from './overstappen';
import Nuon from './nuon';

let module = angular.module('app.components', [
  // Shared
  Home,
  Login,
  // Overstappen
  Overstappen,
  // NUon
  Nuon,
])

.name;

export default module;
