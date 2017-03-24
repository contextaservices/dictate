import angular from 'angular';
import component from './component';
import ngFileUpload from 'ng-file-upload';

let module = angular.module('dictate', [
  ngFileUpload
])

.component('dictate', component)
.directive('ngUploadChange',function(){
  return {
    scope: {
      ngUploadChange: '&'
    },
    link: function ($scope, $element, $attrs) {
      $element.on('change', function(event) {
        $scope.ngUploadChange({ $event: event })
      })
      $scope.$on('$destroy', function(){
        $element.off();
      });
    }
  }
})
.name;

export default module;
