import $ from 'jquery/dist/jquery';
import WaveSurfer from 'wavesurfer.js/dist/wavesurfer';
import blobUtil from 'blob-util';
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

  constructor ($scope, $rootScope, $q, $document) {
    'ngInject';

    this.modes = [{
      label: 'Microphone',
      slug: 'mic'
    }, {
      label: 'Upload file',
      slug: 'file'
    }];
    this.modeIdx = 0;
    // set initial mode
    this.switchMode();

    this._$scope = $scope;
    this._$rootScope = $rootScope;
    this._deferred = $q.defer();
    this._wavesurfer = WaveSurfer;
    this.__wavesurferContainer = document.getElementById('waveform__file');
    this.__body = $document[0].body;

    // this._$rootScope = $rootScope;
    this.file = {};
    this.files = [];
    this.invalidFiles = [];

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
      speech: 'wss://bark.phon.ioc.ee:8443/english/duplex-speech-api/ws/speech',
      status: 'wss://bark.phon.ioc.ee:8443/english/duplex-speech-api/ws/status'
    }, {
      name: 'Eesti keel',
      speech: 'wss://bark.phon.ioc.ee:8443/dev/duplex-speech-api/ws/speech',
      status: 'wss://bark.phon.ioc.ee:8443/dev/duplex-speech-api/ws/status'
    }];

    // set default server
    this.changeServer(this.servers[1]);

    this._initDictate();
    this._initWaveSurfer();

    // set default server
    this.changeServer(this.servers[1]);
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

  switchMode (idx) {
    this.mode = this.modes[idx];
    // console.log('this.mode', this.mode)
  }

  /**
   * $postLink
   *
   * Set dom elements
   */
  _initDictate () {
    this.__transcription = document.getElementById('transcription');

    let dictateSharedOptions = {
      transcriptionContainer: document.getElementById('transcription'),
      server: this.server.speech,
      serverStatus: this.server.status,
      recorderWorkerPath: 'app/components/dictate/recorder-worker.js', // @@todo
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
    }

    this._dictateAudio = new Dictate(angular.extend({
      audioUploaded: true,
      getAudioBlob: () => {
        return this.fileBlob;
      },
      getAudioStream: () => {
        return this.fileStream;
      },
      onInterval: (blob) => {
        console.log('onInterval', blob)
        // this.file.src = URL.createObjectURL(blob);
      }
    }, dictateSharedOptions));

    this._dictate = new Dictate(angular.extend({}, dictateSharedOptions));

    // init this immediately
    this._dictate.init();
    // initalize the audio one when the audio has loaded
  }

  /**
   * Change server
   * @param  {Object} server
   * @return {Object}
   */
  changeServer (server) {
    this.server = server;

    if (this._dictate) {
      this._dictate.setServer(server.speech);
      this._dictate.setServerStatus(server.status);
    }

    return server;
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
    let tokens = text.split(' ');
    text = '';
    if (this._doPrependSpace) {
      text = ' ';
    }
    this._doCapitalizeNext = false;
    tokens.map((token) => {
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


  onFileSelect ($event) {
    this.isDecoding = true;
    let files = $event ? $event.target.files : this.files;
    let file = files[0];
    // let isBlob = file instanceof Blob;
    let fileBlob = new Blob([file]);

    this.fileSrc = URL.createObjectURL(file); // this.file['$ngfBlobUrl']
    this.fileBlob = fileBlob;

    blobUtil.blobToArrayBuffer(fileBlob).then((result) => {
      let fileArrayBuffer = result;

      let ctx = new window.AudioContext();
      let source = ctx.createBufferSource();
      // debugger;
      ctx.decodeAudioData(fileArrayBuffer, (buffer) => {
        source.buffer = buffer;
        this.fileStream = source;
        // debugger;

        this._dictateAudio.init();
        this._wavesurfer.load(this.fileSrc);
        this.isDecoding = false;
        // this._dictate.startListening();
        // console.log('ctx.decodeAudioData() success, buffer: ', buffer);
      }, function () {
        console.error('ctx.decodeAudioData() called onerror');
        this.isDecoding = false;
      })

    }).catch(function (err) {
      // failed to load
      this.isDecoding = false;
    });;

    // not really needed in this exact case, but since it is really important in other cases,
    // don't forget to revoke the blobURI when you don't need it
    // sound.onend = function(e) {
    //   URL.revokeObjectURL(this.src);
    // }

  }

  /**
   * Reset player
   * @return {[type]} [description]
   */
  _resetPlayer () {
    this.isPlaying = false;
    this.isMute = false;
    this.isError = false;
    this.isLoading = true;
    this.duration = 0;
    this.time = 0;
  }

  /**
   * Load wavesurfer
   * @param  {Object} options
   * @param  {string} url
   */
  _initWaveSurfer () {
    this._wavesurfer.init({
      container: this.__wavesurferContainer,
      waveColor: '#C1D2E5',
      progressColor: '#fff', // '#2191D0',
      cursorWidth: 0,
      height: 40 // @see scss: $CO--player__height \\
    });

    /**
     * On ready
     */
    this._wavesurfer.on('ready', () => {
      this._deferred.resolve('ready');
      this.isLoading = false;
      this.duration = this.duration = Math.floor(this._wavesurfer.getDuration()).toString();
      this._exactTime = this._wavesurfer.getCurrentTime();
      this.time = Math.floor(this._exactTime).toString();
      this._safeApply();
    });

    /**
     * On error
     */
    this._wavesurfer.on('error', () => {
      // this._deferred.reject('ready');
      this.isLoading = false;
      this.isError = true;
      this._safeApply();
    });

    /**
     * On play/pause
     */
    this._wavesurfer.on('play', () => {
      this.isPlaying = !this.isPlaying;
      this.__body.classList.add('is-playing');
    });
    this._wavesurfer.on('pause', () => {
      this.isPlaying = !this.isPlaying;
      this.__body.classList.remove('is-playing');
    });

    /**
     * On audioprocess
     * @param  {number} exactTime
     */
    this._wavesurfer.on('audioprocess', (exactTime) => {
      if (this.time !== Math.floor(exactTime)) {
        this.time = Math.floor(exactTime);
        this._safeApply();
      }
    });

    /**
     * On seek
     * @param  {number} time
     */
    this._wavesurfer.on('seek', () => {
      this._exactTime = this._wavesurfer.getCurrentTime();
      this.time = Math.floor(this._exactTime);
      this._safeApply();
    });

    /**
     * On finish
     */
    this._wavesurfer.on('finish', () => {
      this.isPlaying = false;
    });
  }

  /**
   * Safe apply
   * @param  {Function} fn [description]
   */
  _safeApply (fn) {
    const phase = this._$rootScope.$$phase;
    if (phase === '$apply' || phase === '$digest') {
      if (fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this._$scope.$apply(fn);
    }
  }

  /**
   * Play pause
   */
  playPause () {
    this._deferred.promise.then(() => {
      this._wavesurfer.playPause();
    });
  }

  /**
   * Stop
   */
  stop () {
    this._deferred.promise.then(() => {
      // it gives a useless error
      try {
        this._wavesurfer.seekTo(0);
        this._wavesurfer.stop();
      } catch(e) {}
      this.isPlaying = false;
    });
  }

  /**
   * Toggle mute
   */
  toggleMute () {
    this._deferred.promise.then(() => {
      this._wavesurfer.toggleMute();
    });
    this.isMute = !this.isMute;
  }

  /**
   * Seek to
   * @param  {number} exactTime
   */
  seekTo (exactTime) {
    this._wavesurfer.seekTo(exactTime / this.duration);
  }
}

export default Controller;
