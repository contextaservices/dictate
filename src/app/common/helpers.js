// some are from https://github.com/tastejs/todomvc/blob/gh-pages/examples/vanilla-es6/src/helpers.js

export function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}

/**
 * Get seconds for this moment
 * @return {number}
 */
export function getNowSeconds () {
  return Math.floor(Date.now() / 1000);
}

/**
 * Seconds to hours, minutes and seconds
 * @link(http://stackoverflow.com/a/6313008/1938970, source)
 * @param  {number}
 * @return {string}
 */
export function toHHMMSS (givenSeconds) {
  const secondsNumber = parseInt(givenSeconds, 10);
  let hours = Math.floor(secondsNumber / 3600);
  let minutes = Math.floor((secondsNumber - (hours * 3600)) / 60);
  let seconds = secondsNumber - (hours * 3600) - (minutes * 60);

  if (hours   < 10) { hours   = '0' + hours; }
  if (minutes < 10) { minutes = '0' + minutes; }
  if (seconds < 10) { seconds = '0' + seconds; }

  return hours + ':' + minutes + ':' + seconds;
}

/**
 * Seconds to minutes and seconds
 * @link(http://stackoverflow.com/a/6313008/1938970, source)
 * @param  {number}
 * @return {string}
 */
export function toMMSS (givenSeconds) {
  const secondsNumber = parseInt(givenSeconds, 10);
  let hours = Math.floor(secondsNumber / 3600);
  let minutes = Math.floor((secondsNumber - (hours * 3600)) / 60);
  let seconds = secondsNumber - (hours * 3600) - (minutes * 60);

  if (hours   < 10) { hours   = '0' + hours; }
  if (minutes < 10) { minutes = '0' + minutes; }
  if (seconds < 10) { seconds = '0' + seconds; }

  return minutes + ':' + seconds;
}

/**
 * Unslashit
 * @param  {string} str A string, usually a url
 * @return {string}     A string without any slash at the beginning and at the and
 */
export function unslashit (str) {
  return untrailingslashit(unpreslashit(str));
}

/**
 * Untrailingslashit
 * @param  {string} str A string, usually a url
 * @return {string}     A string without any slash at the end
 */
export function untrailingslashit (str) {
  return str.replace(/\/*$/, '');
}

/**
 * Trailingslashit
 * @param  {string} str A string, usually a url
 * @return {string}     A string with a slash at the end
 */
export function trailingslashit (str) {
  return untrailingslashit(str) + '/';
}

/**
 * Unpreslashit
 * @param  {string} str A string, usually a url
 * @return {string}     A string without any slash at the beginning
 */
export function unpreslashit (str) {
  return str.replace(/^\/+/, '');
}

/**
 * Preslashit, it ensure a url starting with a single slash
 * @param  {string} str A string, usually a url
 * @return {string}     A string preceded by a single slash
 */
export function preslashit (str) {
  const str1 = unpreslashit(str);
  return '/' + str1;
}

/**
 * querySelector wrapper
 *
 * @param {string} selector Selector to query
 * @param {Element} [scope] Optional scope element for the selector
 */
export function qs(selector, scope) {
  return (scope || document).querySelector(selector);
}

/**
 * addEventListener wrapper
 *
 * @param {Element|Window} target Target Element
 * @param {string} type Event name to bind to
 * @param {Function} callback Event callback
 * @param {boolean} [capture] Capture the event
 */
export function $on(target, type, callback, capture) {
  target.addEventListener(type, callback, !!capture);
}

/**
 * Encode less-than and ampersand characters with entity codes to make user-
 * provided text safe to parse as HTML.
 *
 * @param {string} s String to escape
 *
 * @returns {string} String with unsafe characters escaped with entity codes
 */
export const escapeForHTML = s => s.replace(/[&<]/g, c => c === '&' ? '&amp;' : '&lt;');

/**
 * Ajax POST
 *
 * @link(https://plainjs.com/javascript/ajax/send-ajax-get-and-post-requests-47/, source)
 *
 * @param  {string}    url
 * @param  {Object}    data
 * @param  {Function}  success
 * @param  {?Function} error
 * @return {Object}
 */
export function ajaxPost (url, data, success, error) {
  var params = typeof data === 'string' ? data : Object.keys(data).map(
    function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    }
  ).join('&');

  // var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new window.ActiveXObject('Microsoft.XMLHTTP');
  var xhr = new window.XMLHttpRequest();
  xhr.open('POST', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState < 4) {
      return;
    }
    if (xhr.status === 200) {
      success(xhr.responseText);
    } else {
      if (error) {
        error(xhr);
      }
    }
  };
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(params);
  return xhr;
}

// The following is the npm module `delegate` slightly changed, because the
// `Element.matches` polyfill used in the original npm module breaks inside
// iframes

/**
 * A polyfill for Element.matches()
 *
 * @param {Element} element
 * @param {String} selector
 */
function matches (element, selector) {
  var fn = element.matches ||
           element.matchesSelector ||
           element.mozMatchesSelector ||
           element.msMatchesSelector ||
           element.oMatchesSelector ||
           element.webkitMatchesSelector;

  return fn ? fn.call(element, selector) : false;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
  while (element && element !== document) {
    if (matches(element, selector)) {
      return element;
    }
    element = element.parentNode;
  }
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
  return function(e) {
    e.delegateTarget = closest(e.target, selector);

    if (e.delegateTarget) {
      callback.call(element, e);
    }
  };
}

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
export function $delegate(element, selector, type, callback, useCapture) {
  var listenerFn = listener.apply(this, arguments);

  element.addEventListener(type, listenerFn, useCapture);

  return {
    destroy: function() {
      element.removeEventListener(type, listenerFn, useCapture);
    }
  };
}

/**
 * Map object to array (one level deep)
 *
 * @param  {Object} map
 * @return {Array}
 */
export function mapToArray (map) {
  var array = [];
  for (var object in map) {
    if ({}.hasOwnProperty.call(map, object)) {
      array.push(map[object]);
    }
  }
  return array;
}

/**
 * Map array (of object) to object by given key
 * @param  {Array}  list
 * @param  {String} key  A key necessarily present in all the objects
 *                       of the given array
 * @return {Object}
 */
export function mapToObject (list, key) {
  var object = {};
  for (var i = 0; i < list.length; i++) {
    object[ list[i][key] ] = list[i];
  }
  return object;
}
