import WaveSurfer from 'wavesurfer.js/dist/wavesurfer';
import WaveSurferMic from './wavesurfer.microphone';
// const window.WaveSurfer = WaveSurfer;

class PlayerController {

  constructor ($scope, $q, $element, $document, $rootScope) {
    'ngInject';

    this._wavesurfer = WaveSurfer;
    this._$scope = $scope;
    this._$rootScope = $rootScope;
    this._deferred = $q.defer();
    this.__container = $element.children().children()[1];
    this.__body = $document[0].body;
  }

  /**
   * $onInit (check also the component bindings)
   */
  $onInit () {
    // this.url = 'data/sample_call.mp3'; // override the value from the API // @@todo remove \\
    this._reset();
  }

  _reset () {
    this.isPlaying = false;
    this.isMute = false;
    this.isError = false;
    this.isLoading = true;
    this.duration = 0;
    this.time = 0;
  }

  $onChanges (changes) {
    if (changes && changes.url) {
      this._reset();

      this._wavesurfer.init({
        container: '#waveform_mic',
        waveColor: 'black',
        interact: false,
        cursorWidth: 0
      });

      this._mic = Object.create(WaveSurferMic);

      // this._mic.init({
      //   wavesurfer: this._wavesurfer
      // });

      // this._mic.on('deviceReady', function(stream) {
      //   console.log('Device ready!', stream);
      // });
      // this._mic.on('deviceError', function(code) {
      //   console.warn('Device error: ' + code);
      // });

      // // start the microphone
      // this._mic.start();

      // // pause rendering
      // //this._mic.pause();

      // // resume rendering
      // //this._mic.play();

      // // stop visualization and disconnect microphone
      // //this._mic.stopDevice();

      // // same as stopDevice() but also clears the wavesurfer canvas
      // //this._mic.stop();

      // // destroy the plugin
      // //this._mic.destroy();
    }
  }

  /**
   * Initialise
   */
  _loadWaveSurfer () {
    /**
     * On ready
     */
    this._mic.on('deviceReady', () => {
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
    this._wavesurfer.on('deviceError', () => {
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
      this._mic.start();
    });
    this._wavesurfer.on('pause', () => {
      this.isPlaying = !this.isPlaying;
      this.__body.classList.remove('is-playing');
      this._mic.pause();
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
      this._emitTime(exactTime, 'playing');
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
   * Emit time
   * @param  {number} exactTime
   * @param  {string} type
   */
  _emitTime (exactTime, type='playing') {
    this._$rootScope.$emit('Player.time', { time: exactTime, type: type });
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
}

export default PlayerController;
