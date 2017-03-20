import angular from 'angular';
import component from './component';

let module = angular.module('dictate', [])

.component('dictate', component)

.name;

export default module;
