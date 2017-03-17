/**
 * @fileoverview An externs file for Contexta dashboard app.
 * @externs
 */

/**
 * @typedef {{
 *            name:string,
 *            path:string
 *          }}
 */
export var AudioDoc;
// xml:
// ```
// <AudioDoc name="68118_227168_1480060159" path="68118_227168_1480060159.wav">
// ```

/**
 * @typedef {{
 *            __procs:Array<Proc>
 *          }}
 */
export var ProcList;
// xml:
// ```
// <ProcList></ProcList>
// ```

/**
 * @typedef {{
 *            name:string,
 *            version:number,
 *            editor:?string
 *          }}
 */
export var Proc;
// xml:
// ```
// <Proc name="vrbs_part" version="2.5"/>
// <Proc name="vrbs_trans.dut" version="2.0" editor="Vocapia Research"/>
// ```

/**
 * @typedef {{
 *            __channels:Array<Channel>
 *          }}
 */
export var ChannelList;
// xml:
// ```
// <ChannelList></ChannelList>
// ```

/**
 * @typedef {{
 *            num:number,
 *            sigdur:number,
 *            spdur:number,
 *            nw:number,
 *            tconf:number
 *          }}
 */
export var Channel;
// xml:
// ```
// <Channel num="1" sigdur="257.07" spdur="218.23" nw="675" tconf="0.79"/>
// ```


/**
 * @typedef {{
 *            channel:number,
 *            sconf:number,
 *            lconf:number,
 *            speakerId:string,
 *            startTime:number,
 *            endTime:number,
 *            language:string,
 *            trs:number,
 *            __words:Array<Word>
 *          }}
 */
export var SpeechSegment;
// xml:
// ```
// <SpeechSegment ch="1" sconf="1.00" stime="3.03" etime="14.11" spkid="MT1" lang="dut" lconf="1.00" trs="1"></SpeechSegment>
// ```
// js:
// ```
// const SpeechSegment = {
//   /** @type {number} The channel of ... ? e.g. `1` */
//   channel: ch,
//   /** @type {number} Float number for ... ? e.g. `1.00` */
//   sconf: sconf,
//   /** @type {number} Float number for ... ? e.g. `1.00` */
//   lconf: lconf,
//   /** @type {string} The speaker unique identifier e.g. `MT1` */
//   speakerId: spkid,
//   /** @type {number} Float number indicating the begininng of the speech segment, e.g. `3.03` */
//   startTime: stime,
//   /** @type {number} Float number indicating the end of the speech segment, e.g. `14.11` */
//   endTime: etime,
//   /** @type {string} Language code of the speaker, e.g. `dut` for `dutch` */
//   language: lang,
//   /** @type {number} ... ? e.g. `1` */
//   trs: trs
// };
// ```


/**
 * @typedef {{
 *            startTime:number,
 *            duration:number,
 *            conf:string,
 *            __content:string
 *          }}
 */
export var Word;
// xml:
// ```
// <Word stime="15.03" dur="0.27" conf="0.932"> En </Word>
// ```
// js:
// ```
// /** @type {Word} It represents a word in a speech segment */
// const Word = {
//   /** @type {number} Float number indicating the begininng of the word, e.g. `15.03` */
//   startTime: stime,
//   /** @type {number} Float number indicating the duration of the spoken word, e.g. `0.27` */
//   duration: dur,
//   /** @type {number} Float number for ... ? e.g. `0.932` */
//   conf: conf
//   /** @type {string} The actual spoken word, extracted from the content of the xml tag `Word`, e.g. `Hello` */
//   content: __content
// };
// ```


/**
 * @typedef {{
 *            __speakers:Array<Speaker>
 *          }}
 */
export var SpeakerList;
// xml:
// ```
// <SpeakerList></SpeakerList>
// ```


/**
 * @typedef {{
 *            id:string,
 *            channel:string,
 *            gender:string,
 *            language:string,
 *            duration:string,
 *            lconf:string,
 *            tconf:string,
 *            nw:string
 *          }}
 */
export var Speaker;
// xml:
// ```
// <Speaker ch="1" dur="131.07" gender="2" spkid="FT3" lang="dut" lconf="1.00" nw="438" tconf="0.81"/>
// ```
// js:
// ```
// /** @type {Speaker} It represents a speaker in a call */
// const Speaker = {
//   /** @type {string} The speaker unique identifier, e.g. `FT3` */
//   id: spkid,
//   /** @type {number} The channel identifier, e.g. `1` */
//   channel: ch,
//   /** @type {number} The gender code of the speaker, e.g. `2` */
//   gender: gender,
//   /** @type {string} Language code of the speaker, e.g. `dut` for `dutch` */
//   language: lang,
//   /** @type {number} Float number for the duration of the speaker conversation, e.g. `131.07` */
//   duration: dur,
//   /** @type {number} Float for ... ?, e.g. `1.00` */
//   lconf: lconf,
//   /** @type {number} Float for ... ?, e.g. `0.81` */
//   tconf: tconf,
//   /** @type {number} ... ?, e.g. `438` */
//   nw: nw,
// };
// ```
