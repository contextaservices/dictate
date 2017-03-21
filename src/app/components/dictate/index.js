import angular from 'angular';
import component from './component';
import ngFileUpload from 'ng-file-upload';

let module = angular.module('dictate', [
  ngFileUpload
])

.component('dictate', component)

.name;

export default module;
