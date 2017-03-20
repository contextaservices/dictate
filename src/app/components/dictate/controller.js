//
//
//
//
//
//
//add 45 minutes of work!!!!!!!!!!!!! migration to angular
//
//
//
//
//
//
//
//

import $ from 'jquery/dist/jquery';
import './dictate';
import './recorder';

class Controller {

  constructor ($rootScope, $element) {
    'ngInject';

    // this._$rootScope = $rootScope;
    this.__container = $element[0];

    this.servers = [{
      name: 'Nederlands',
      speech: 'wss://kalditest.westeurope.cloudapp.azure.com:8888/client/ws/speech',
      status: 'wss://kalditest.westeurope.cloudapp.azure.com:8888/client/ws/status'
    }, {
      name: 'English',
      speech: 'wss://bark.phon.ioc.ee:8443/dev/duplex-speech-api/ws/speech',
      status: 'wss://bark.phon.ioc.ee:8443/dev/duplex-speech-api/ws/status'
    }, {
      name: 'Eesti keel',
      speech: 'wss://bark.phon.ioc.ee:8443/english/duplex-speech-api/ws/speech',
      status: 'wss://bark.phon.ioc.ee:8443/english/duplex-speech-api/ws/status'
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
      recorderWorkerPath: '../lib/recorderWorker.js', // @@todo
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
}

export default Controller;
