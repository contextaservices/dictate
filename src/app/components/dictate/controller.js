//
//
//
//
//
//
// add 45 minutes of work!!!!!!!!!!!!! migration to angular
// add 20 minutes setup ng-file-upload
// add 85 minutes understanding dictate codebase and trying upload audio as blob url
// add 13:53
//
//
//
//
//

import $ from 'jquery/dist/jquery';
import './dictate';
import './recorder';

// FileAPI = {
//   debug: true,
//   //forceLoad: true, html5: false //to debug flash in HTML5 browsers
//   //wrapInsideDiv: true, //experimental for fixing css issues
//   //only one of jsPath or jsUrl.
//   //jsPath: '/js/FileAPI.min.js/folder/',
//   //jsUrl: 'yourcdn.com/js/FileAPI.min.js',

//   //only one of staticPath or flashUrl.
//   //staticPath: '/flash/FileAPI.flash.swf/folder/'
//   //flashUrl: 'yourcdn.com/js/FileAPI.flash.swf'
// };

class Controller {

  constructor (Upload) {
    'ngInject';

    this._$upload = Upload;

    // this._$rootScope = $rootScope;
    this.file = {};
    this.files = [];
    this.invalidFiles = [];
    this.bile = {};
    this.biles = [];

    this.conf = {
      accept: 'audio/*',
      pattern: 'audio/*',
      multiple: false,
      disabled: false,
      // capture: 'recorder??'
      keepDistinct: true,
      maxFiles: 1,
      // ignoreInvalid: false,
      runAllValidations: true,
      allowDir: true,
      duration: ($file, $duration) => {
        return $duration < 10000; // @@todo
      },
      modelOptions: {
        debounce: 100 // @@todo
      },
      validate: {}, // @@todo
      isResumeSupported: true,
      usingFlash: FileAPI && FileAPI.upload !== null,
    }

    this.servers = [{
      name: 'Nederlands',
      speech: 'wss://kalditest.westeurope.cloudapp.azure.com:8888/client/ws/speech',
      status: 'wss://kalditest.westeurope.cloudapp.azure.com:8888/client/ws/status'
    }, {
      name: 'English',
      speech: 'ws://bark.phon.ioc.ee:8443/english/duplex-speech-api/ws/speech',
      status: 'ws://bark.phon.ioc.ee:8443/english/duplex-speech-api/ws/status'
    }, {
      name: 'Eesti keel',
      speech: 'wss://bark.phon.ioc.ee:8443/dev/duplex-speech-api/ws/speech',
      status: 'wss://bark.phon.ioc.ee:8443/dev/duplex-speech-api/ws/status'
    }];

    this.server = this.servers[0];
  }

  /**
   * $onInit (check also the component bindings)
   */
  $onInit () {
    // this.url = 'data/sample.xml'; // override the value from the API // @@todo remove \\
    this.isLoading = true;
    this.isError = false;
    // this._currentTime = 0;

    this._posStart = 0;
    this._posEnd = 0;
    this._doUpper = false;
    this._doPrependSpace = true;
    this.isConnected = false;
  }

  /**
   * $postLink
   *
   * Set dom elements
   */
  $postLink() {
    this.__transcription = document.getElementById('transcription');

    this._dictate = new Dictate({
      server: this.server.speech,
      serverStatus: this.server.status,
      recorderWorkerPath: '../recorder-worker.js', // @@todo
      onReadyForSpeech: () => {
        this.isConnected = true;
        this.status = 'speech-ready';

        this._message('READY FOR SPEECH');

        this._posStart = this.__transcription.getAttribute('selectionStart'); // @@todo
        this._posEnd = this._posStart;

        let textBeforeCaret = this.__transcription.value.slice(0, this._posStart);

        if ((textBeforeCaret.length == 0) || /\. *$/.test(textBeforeCaret) ||  /\n *$/.test(textBeforeCaret)) {
          this._doUpper = true;
        } else {
          this._doUpper = false;
        }
        this._doPrependSpace = (textBeforeCaret.length > 0) && !(/\n *$/.test(textBeforeCaret));
      },
      onEndOfSpeech: () => {
        this._message('END OF SPEECH');
        this.status = 'speech-end';
      },
      onEndOfSession: () => {
        this.isConnected = false;

        this._message('END OF SESSION');
        this.status = 'end';
      },
      onServerStatus: (json) => {
        this.workersAvailableNumber = json['num_workers_available'];
      },
      onPartialResults: (hypo) => {
        let hypoText = this._prettifyHyp(hypo[0].transcript, this._doUpper);
        let current = this.__transcription.value;
        this.__transcription.value = current.slice(0, this._posStart) + hypoText + current.slice(this._posEnd);
        this._posEnd = this._posStart + hypoText.length;

        this.__transcription.setAttribute('selectionStart', this._posEnd); // @@todo
      },
      onResults: (hypo) => {
        let hypoText = this._prettifyHyp(hypo[0].transcript, this._doUpper);
        let current = this.__transcription.value;
        this.__transcription.value = current.slice(0, this._posStart) + hypoText + current.slice(this._posEnd);
        this._posStart = this._posStart + hypoText.length;
        this._posEnd = this._posStart;
        this.__transcription.setAttribute('selectionStart', this._posEnd); // @@todo

        if (/\. *$/.test(hypoText) ||  /\n *$/.test(hypoText)) {
          this._doUpper = true;
        } else {
          this._doUpper = false;
        }
        this._doPrependSpace = (hypoText.length > 0) && !(/\n *$/.test(hypoText));
      },
      onError: (code, data) => {
        this._dictate.cancel();
        this._error(code, data);
        // @@TODO: show error in the GUI
      },
      onEvent: (code, data) => {
        this._message(code, data);
      },
      getAudioBlob: () => {
        return this.file.src;
      }
    });

    this._dictate.init();
  }

  changeServer (server) {
    this._dictate.setServer(server.speech);
    this._dictate.setServerStatus(server.status);
  }

  toggleListening () {
    if (this.isConnected) {
      this._dictate.stopListening();
    } else {
      this._dictate.startListening();
    }
  }

  cancel () {
    this._dictate.cancel();
  }

  clearTranscription () {
    this.message = '';
  }

  _message(code, data) {
    this.message = `msg: ${code}: ${data||''}\n${this.message||''}`;
  }

  _error(code, data) {
    this.message = `ERR: ${code}: ${data||''}\n${this.message||''}`;
  }

  _capitaliseFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  _prettifyHyp (text, doCapFirst) {
    if (doCapFirst) {
      text = this._capitaliseFirstLetter(text);
    }
    tokens = text.split(' ');
    text = '';
    if (this._doPrependSpace) {
      text = ' ';
    }
    this._doCapitalizeNext = false;
    tokens.map(function(token) {
      if (text.trim().length > 0) {
        text = text + ' ';
      }
      if (this._doCapitalizeNext) {
        text = text + this._capitaliseFirstLetter(token);
      } else {
        text = text + token;
      }
      if (token == '.' ||  /\n$/.test(token)) {
        this._doCapitalizeNext = true;
      } else {
        this._doCapitalizeNext = false;
      }
    });

    text = text.replace(/ ([,.!?:;])/g,  "\$1");
    text = text.replace(/ ?\n ?/g,  "\n");
    return text;
  }

  /**
   * Upload file
   *
   * @param {Object} File
   */
  upload (file) {
  }

  /**
   * Restart file upload
   *
   * @param {Object} File
   */
  uploadRestart (file) {

  }


  onFileSelect () {
    // debugger;
    this.file.src = URL.createObjectURL(this.files[0]);
    // not really needed in this exact case, but since it is really important in other cases,
    // don't forget to revoke the blobURI when you don't need it
    // sound.onend = function(e) {
    //   URL.revokeObjectURL(this.src);
    // }
  }
}

export default Controller;
