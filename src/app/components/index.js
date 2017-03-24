import angular from 'angular';
import Dictate from './dictate';
import Microphone from './microphone';


let module = angular.module('app.components', [
  Dictate,
  // Microphone
])

.name;

export default module;
