import angular from 'angular';
import component from './component';
import { toMMSS } from '../../common/helpers';

let module = angular.module('microphone', [])

.component('microphone', component)
.filter('hms', () => { return toMMSS; })

.name;

export default module;
