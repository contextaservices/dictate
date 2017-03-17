import template from './app.html';
import controller from './app.controller';
import './app.scss';

let appComponent = {
  restrict: 'E',
  bindings: {
    // navCurrent: '@',
    isAuthenticated: '=?'
  },
  template,
  controller
};

export default appComponent;
