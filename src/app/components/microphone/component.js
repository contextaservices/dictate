import template from './tpl.html';
import controller from './controller';
import './style.scss';

let component = {
  restrict: 'E',
  bindings: {
    url: '<'
  },
  template,
  controller
};

export default component;
