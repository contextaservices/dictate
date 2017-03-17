// prevent iframing
if (window !== window.top) {
  console.log('is in frame');
  window.top.location = window.location;
}

// got from google plus+
if (window.top == window && window.console && window.console.log) {
  window.console.log('%c%s','background: yellow; font-size: 23px;','WARNING!');
  window.console.log('%c%s','color: black; font-size: 17px;','Using this console may allow attackers to impersonate you and steal your information using an attack called Self-XSS.\nDo not enter or paste code that you do not understand.');
}
