//import {React} from 'react';
//import {ReactDOM} from 'react-dom'
import Vue from 'vue'
//import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.esm.browser.js'



let whiteNoise = new p5.Noise();
let playButton;
let stopButton;

let startTransportButton;
let stopTransportButton;

let track1;
let volumeSlider;
let fft;
let se_history = [];
let secondBeat = false;
let bpms = [];
let waveform;

let trackHeight;
let trackWidth;

let soundWaveX = 0;
let soundWaveY;


let overTrack;
let lockTrack;
let canvasWidth;

let transportLoopLength = 240;
//Tone.context.resume();
//I GET A CONNECT NOT DEFINED ERROR, DONT KNOW WHY
//const synth = new Tone.Synth().toMaster();
				// play a note from that synth
//synth.triggerAttackRelease("C4", "8n");

//const player = new Tone.Player("https://tonejs.github.io/audio/berklee/femalevoice_oo_A4.mp3",function(){}).toMaster();

//console.log(`TEST PLAYER: ${player} `);
//player.autostart= true;

let keyboardMapping = {
    65: 'C',
    83: 'D',
    68: 'E',
    70: 'F',
    71: 'G',
    72: 'A',
    74: 'B',
    87: 'C#',
    69: 'D#',
    84: 'F#',
    89: 'G#',
    85: 'A#'
}

let noteFreqMapping = {
    'C': 261.63,
    'D': 293.66,
    'E': 329.63,
    'F': 349.23,
    'G': 392.00,
    'A': 440.00,
    'B': 493.88,
    'C#': 277.18,
    'D#': 311.13,
    'F#': 369.99,
    'G#': 415.30,
    'A#': 466.16
}




class MidiTypes
{
    static midiList = {
        "OnScreenKeyboard" : 1

    };

    static noteFreqMapping = {
        'C': 261.63,
        'D': 293.66,
        'E': 329.63,
        'F': 349.23,
        'G': 392.00,
        'A': 440.00,
        'B': 493.88,
        'C#': 277.18,
        'D#': 311.13,
        'F#': 369.99,
        'G#': 415.30,
        'A#': 466.16
    };

}

class Timer {
    totalTime = 0.0;
    timerId = null;
    constructor()
    {

    }

    startTimer()
    {
        var currTimer = this;
        this.timerId = setInterval(function(){ currTimer.timerInterval(currTimer)}, 100);
    }

    stopTimer()
    {
        clearInterval(this.timerId);
        console.log(`Seconds Passed: ${this.totalTime}`);
        return this.totalTime;
    }

    resetTimer()
    {
        this.totalTime = 0;
    }

    timerInterval(timer)
    {
        timer.totalTime += 0.1;
        //console.log(`Increasing time interval ${this.totalTime}`);


    }
}

class SSModal 
{
    init = false;
    ssId = "";
    p5Id = "";

    ssModal = null;
    p5Instance = null;

    constructor(ssId)
    {
        this.ssId = ssId;
        this.ssModal = new bootstrap.Modal(document.getElementById(ssId),{
            keyboard: false,
        });
        
    }

    createP5Instance(p5Id, p5Function)
    {
        if(this.init == false)
        {
            this.p5Id = p5Id;
            this.p5Instance = new p5(p5Function, p5Id);
            this.init = true;
        }


    }


    showModal()
    {
        this.ssModal.show();
    }

    hideModal()
    {
        this.ssModal.hide();
    }


}

class StepSequencer
{
    static playbackState = {
        "READY" : 0,
        "PLAYING" : 1,
        "STOPPED" : 2,
        "RECORDING" : 3,
    }
    channelMatrix = new Array(4);
    numChannels = 4;
    
    numBars = 4;
    numBeats = 16

    sequence = null;

    cellWidth = 0;
    cellHeight = 0;

    initButtons = 0;

    ssPart = null;

    currState = StepSequencer.playbackState.READY;
    

    channels = {};
    p5 = null;
    sounds = [
                'assets/Bass-Drum.mp3',
                'assets/Snare-Drum.mp3',
                'assets/HH-Closed.mp3',
                'assets/Acoustic-Shaker.mp3',


    ];

    constructor(bars)
    {
        this.numBars = bars;
        this.numBeats = bars * 4;
        
        //MIGHT MAKE THIS INTO AN OBJECT
        for(let i = 0; i < this.numChannels; i++)
        {
            this.channels[i] = {};
            
            this.channels[i]['matrix'] = new Array(this.numBeats);
            for(let k = 0; k < this.channels[i]['matrix'].length; k++)
            {
                this.channels[i]['matrix'][k] = Math.round(Math.random());
            }
        }
    }

    setP5(p5Object)
    {
        this.p5 = p5Object;
        this.ssPart = new p5.Part();
        for(let i = 0; i < this.numChannels; i++)
        {
            var stepSequencer = this;
            this.channels[i]['sound'] = this.p5.loadSound(this.sounds[i], () => {
                stepSequencer.channels[i]['phrase'] = new p5.Phrase(`channel-${i}`,(time) =>{
                    stepSequencer.channels[i]['sound'].play(time);
                }, stepSequencer.channels[i]['matrix']);
                console.log(`Loaded sound: ${stepSequencer.sounds[i]}`);

                stepSequencer.ssPart.addPhrase(this.channels[i]['phrase']);

            });

        } 

    }


    playLoop()
    {

        this.p5.userStartAudio();
        this.ssPart.loop();
        this.currState = StepSequencer.playbackState.PLAYING;
        console.log("Playing Step Sequencer Loop");

    }

    stop()
    {
        this.ssPart.stop();
        this.currState = StepSequencer.playbackState.READY;
        console.log("Stopping Step Sequencer");
    }




    draw()
    {
        this.drawGrid();
    }

    detectCell()
    {
        for(let i = 0; i < this.numBeats; i++)
        {
            var currX = i * this.cellWidth;
            var nextX = (i+1) * this.cellWidth;
            if(this.p5.mouseX >= currX && this.p5.mouseX < nextX)
            {
                for(let k = 0; k < this.numChannels; k++)
                {
                    var currY = k * this.cellHeight;
                    var nextY = (k+1) * this.cellHeight;
                    if(this.p5.mouseY >= currY && this.p5.mouseY < nextY)
                    {
                        this.channels[k]['matrix'][i] ^= 1;
                        console.log(this.channels[k]['matrix'][i]);
                    }
                }
            } 
        }

    }


    drawGrid()
    {
        this.cellWidth = this.p5.width / this.numBeats;
        this.cellHeight = this.p5.height / this.numChannels;
        this.p5.stroke("pink");
        for(let i = 0; i < this.numBeats + 1; i++)
        {

            this.p5.line(i*this.cellWidth, 0, i*this.cellWidth, this.p5.height);
        }

        for(let i = 0; i < this.numChannels + 1; i++)
        {
            this.p5.line(0, i*this.cellHeight, this.p5.width, i*this.cellHeight);
        }  

        for(let i = 0; i < this.numBeats; i++)
        {
            for(let k = 0; k < this.numChannels; k++)
            {
                
                if(this.channels[k]['matrix'][i] == 1)
                {
                    this.p5.fill("white")
                    //this.p5.ellipse(xPos, yPos, 10,10 );
                }else{
                    this.p5.fill('black');
                }

                var xPos = (i*this.cellWidth) + (this.cellWidth /2);
                var yPos = (k*this.cellHeight) + (this.cellHeight/2);
                this.p5.rect(i*this.cellWidth,k*this.cellHeight, this.cellWidth, this.cellHeight);

            }
            
        }



    }



    drawPlayHead()
    {

    }


}


class OnScreenKeyboard 
{
    static events = {
        "MOUSEDOWN" : 1,
        "MOUSEUP" : 2
    }

    static recordingStatus = {
        enabled: false,
        osc: null,
        envelope: null
    }

    keyboardMapping = {
        65: 'C',
        83: 'D',
        68: 'E',
        70: 'F',
        71: 'G',
        72: 'A',
        74: 'B',
        87: 'C#',
        69: 'D#',
        84: 'F#',
        89: 'G#',
        85: 'A#'
    };

    noteFreqMapping = {
        'C': 261.63,
        'D': 293.66,
        'E': 329.63,
        'F': 349.23,
        'G': 392.00,
        'A': 440.00,
        'B': 493.88,
        'C#': 277.18,
        'D#': 311.13,
        'F#': 369.99,
        'G#': 415.30,
        'A#': 466.16
    };

    static midiMapping = {
        'C': 72,
        'C#': 73,
        'D': 74,
        'D#': 75,
        'E': 76,
        'F': 77,
        'F#': 78,
        'G': 79,
        'G#': 80,
        'A': 81,
        'A#': 82,
        'B': 83,
    };

    static midiNote

    static noteCount = 12;

    clickNoteCallback = () => {};
    keyNoteCallback = () => {};

    mouseDownCallback = () => {};
    mouseUpCallback = () => {};

    midiNoteCallback = () => {};

    osc = null;
    envelope = null;

    timer = null;


    keys = document.querySelectorAll('.key');

    whiteNotes = document.querySelectorAll('.key.white');
    blackNotes = document.querySelectorAll('.key.black');


    constructor()
    {
        keys.forEach((key) => {
            key.addEventListener("transitionend", (e)=>{
                if(e.propertyName !== "transform") return;
                console.log(e);
                //e.target.classList.remove("playing");
            });
        });

        keys.forEach((key) =>{
            //key.addEventListener('click', () => this.clickNote(key));
        });

        keys.forEach((key) => {
            key.addEventListener('mousedown', () => this.mouseDownNote(key));
        });

        keys.forEach((key) => {
            key.addEventListener('mouseup', () => this.mouseUpNote(key));
        });
    
        document.addEventListener('keydown', (e) => this.keyNote(e));

        this.timer = new Timer();
    }


    setKeyNoteCallback(callback)
    {
        this.keyNoteCallback = callback;
    }

    setClickNoteCallback(callback)
    {
        this.clickNoteCallback = callback;
    }

    setMouseDownCallback(callback)
    {
        this.mouseDownCallback = callback;
    }

    setMouseUpCallback(callback)
    {
        this.mouseUpCallback = callback;
    }

    setMidiNoteCallback(callback)
    {
        this.midiNoteCallback = callback;
    }

    mouseDownNote(key)
    {
        const note = key.dataset.note;
        let freq = noteFreqMapping[note];
        this.mouseDownCallback(freq);
        this.midiNoteCallback(note,0,OnScreenKeyboard.events.MOUSEDOWN);
        this.timer.startTimer();
        
        console.log('MouseDown event');
        key.classList.add('playing');
    }

    mouseUpNote(key)
    {
        const note = key.dataset.note;
        let freq = noteFreqMapping[note];
        this.mouseUpCallback();
        var timeElapsed = this.timer.stopTimer();
        this.timer.resetTimer();

        this.midiNoteCallback(note, timeElapsed, OnScreenKeyboard.events.MOUSEUP);

        key.classList.remove('playing');

    }

    clickNote(key)
    {
        console.log(key);
        const note = key.dataset.note;//We're gonna have to do these dynamically soon.
        let freq = noteFreqMapping[note];
        this.clickNoteCallback(freq);
        this.midiNoteCallback(note);
        key.classList.add('playing');
    }

    keyNote(event)
    {
        /*
        const note = keyboardMapping[event.keyCode];
        let freq = noteFreqMapping[note];

        this.keyNoteCallback(freq);
        
        let key = document.querySelector(`.key[data-note="${note}"]`);
        key.classList.add('playing');
        */
    }


    
}

class MidiMessage{
    note = '';

    midiNum = 0;

    duration = 0;

    message= '';

    startTime = 0;

    constructor(note, midiNum)
    {
        this.note = note;
        this.midiNum = midiNum;
    }
}


class Edit {
    

    numTracks = 0;
    trackList = [];
    transportLoopLength = 240;
    p5 = null;
    init_track = false;
    recording_track = null;
    midi_recording_track = null;

    static midiMessageCallback = () => {};

    constructor(width, height)
    {
        this.width = width;
        this.height = height;
        this.createTrack();
        //Seperate the edit width and height from the tracks width and height. 
        //this.createTrack(width, height);
        //Might create default track here
    }

    setP5(p5Object)
    {
        this.p5 = p5Object;
        for(let i = 0; i < this.trackList.length; i++)
        {
            this.trackList[i].setP5(p5Object);
        }
    }

    playTransport()
    {
        Tone.Transport.start();
        console.log("Starting transport...");
    }

    stopTransport()
    {
        Tone.Transport.stop();
        console.log("Stopping transport...");
    }

    enableRecording(trackNum)
    {
        console.log(`TrackNum: ${trackNum}`)
        this.recording_track = this.trackList[trackNum];
        this.recording_track.enableRecording();
        for(let i = 0; i < this.trackList.length; i++)
        {
            if(i != trackNum){
                this.trackList[i].disableRecording(); 
            }
        }
        console.log("Recording Enabled...");
        
    }

    enableMidiRecording(trackNum, midiType, options=null)
    {

        this.midi_recording_track = this.trackList[trackNum];
        this.midi_recording_track.enableMidiRecording(midiType, options);
        for(let i = 0; i < this.trackList.length; i++)
        {
            if(i != trackNum)
            {
                this.trackList[i].disableMidiRecording();
            }
        }
    }

    record()
    {
        if(this.recording_track != null && this.recording_track.state == Track.recordingState.READY)
        {
            this.recording_track.startRecording();
            this.playTransport();
            console.log("Transport Started Recording....");

        }
        else if(this.recording_track != null && this.recording_track.state == Track.recordingState.RECORDING)
        {
            this.recording_track.stopRecording();
            this.stopTransport();
            console.log("Transport Stopped Recording....");
        }
        else if(this.midi_recording_track != null && this.midi_recording_track.state == Track.midiRecordingState.READY)
        {
            this.midi_recording_track.startRecordingMidi();
            this.playTransport();
            console.log("Transport Started Recording Midi...");

        }
        else if(this.midi_recording_track != null && this.midi_recording_track.state == Track.midiRecordingState.RECORDING)
        {
            this.midi_recording_track.stopRecordingMidi(Tone.Transport.seconds);
            this.stopTransport();
            console.log("Transport Stopped Recording Midi...");
        }
        
    }

    recordMidi()
    {
        //Create the rect and add notes that correspond using the map function.
    }

    createTrack(width, height)
    {
        var newTrack = new Track(this.numTracks,600, 100,transportLoopLength);

        newTrack.setP5(this.p5);

        if(this.numTracks != 0 ){
            this.height += 100;
            newTrack.trackY = this.height - 100;
            this.p5.resizeCanvas(edit.width, edit.height);
        }
        this.trackList.push(newTrack);
        this.numTracks += 1;

        
    }

    draw()
    {
        for(let i = 0; i < this.trackList.length; i++)
        {
            this.trackList[i].draw();
        }
        this.drawPlayHead();

    }

    mousePressed()
    {
        for(let i = 0; i < this.trackList.length; i++)
        {
            this.trackList[i].mousePressed();
        }
    }
    mouseDragged()
    {
        for(let i = 0; i < this.trackList.length; i++)
        {
            this.trackList[i].mouseDragged();
        }

    }

    mouseReleased()
    {
        for(let i = 0; i < this.trackList.length; i++)
        {
            this.trackList[i].mouseReleased();
        }
    }

    drawPlayHead()
    {
        this.p5.stroke("green");
        transportLoopLength = 240;
        this.p5.rect(this.p5.map(Tone.Transport.seconds, 0, transportLoopLength, 0, this.p5.width), 0, 2, 200);
    }
}


class Track 
{
    static recordingState = {
        DISABLED: 0,
        READY: 1,
        RECORDING: 2,
        STOPPED: 3,
    };
    //Play around with these numbers.
    static midiRecordingState = {
        DISABLED: 4,
        READY: 5,
        RECORDING: 6,
        STOPPED: 7,
    };


    overTrack = 0;

    trackX = 0;
    trackY = 0;

    transportLoopLength = 240;


    trackWidth = 600;
    trackHeight = 100;

    trackNum = 1;
    enId = "";
    menId = "";
    p5Clips = [];
    toneClips = [];
    
    lockClip = false;
    currLockedClip = null;

    clips = [];
    numClips = 0;

    midiClips = [];
    numClips = 0;
    numMidiClips = 0;

    name = ``;
    volume = 50;

    p5 = null;

    recordings = [];
    recorder = null;
    mic = null;

    fft = null;

    init_rec_time = 0;
    init_recording = false;
    init_midi_recording = false;

    currNoteStart = 0;
    curr_midi_notes = [];
    rec_midi_type = 0;

    currSoundFile = null;

    state = 0;
    
    
    constructor(trackNumber, trackWidth, trackHeight, transportLoopLength)
    {
        this.trackNum = trackNumber;
        console.log(`Track Num: ${trackNumber}`);
        this.trackWidth = trackWidth;
        this.trackHeight = trackHeight;
        this.transportLoopLength = transportLoopLength;
        this.enId = `rec-enable-${this.trackNum}`;
        this.menId = `midi-enable-${this.trackNum}`;
        this.name = `Track ${this.trackNum + 1}`;
    }

    enableRecording()
    {
        this.mic = new p5.AudioIn();
        this.mic.start();

        this.fft = new p5.FFT(); // Might change the default later.
        this.fft.setInput(this.mic);


        this.recorder = new p5.SoundRecorder();
        this.recorder.setInput(this.mic);
        this.currSoundFile = new p5.SoundFile();
        this.state = Track.recordingState.READY;
    }

    enableMidiRecording(midiType, options=null)
    {
        Edit.midiMessageCallback = (note, duration, event) => {
            if(event == OnScreenKeyboard.events.MOUSEDOWN)
            {
                this.currNoteStart = Tone.Transport.seconds;

            }else
            {
                var message = new MidiMessage(note, OnScreenKeyboard.midiMapping[note]);
                message.startTime = this.currNoteStart;
                message.duration = duration;
                console.log(message);
                this.curr_midi_notes.push(message);
                console.log(this.curr_midi_notes);
                this.currNoteStart = 0;
            }

            
        }
        if(midiType == MidiTypes.midiList.OnScreenKeyboard && options != null)
        {
            OnScreenKeyboard.recordingStatus.enabled = options.enabled;
            OnScreenKeyboard.recordingStatus.osc = options.osc;
            OnScreenKeyboard.recordingStatus.envelope = options.envelope;
            //Add more option parameters later.
            this.rec_midi_type = midiType;
        }



        this.state = Track.midiRecordingState.READY;
        console.log(`Enable Midi Recording for track: ${this.trackNum}`);

    }

    startRecording()
    {
        if(this.state == Track.recordingState.READY && this.mic.enabled)
        {
            this.p5.getAudioContext().resume();
            this.recorder.record(this.currSoundFile, null ,() =>{
                this.init_recording = false;
                console.log(this.currSoundFile);
                console.log("Timed Recording Finished");
                console.log(this.currSoundFile.isLoaded());
                this.p5.saveSound(this.currSoundFile, `testRecording.wav`); //Add Timestamp
                this.recordings.push(this.currSoundFile);
                console.log(`Loading file from path: ${this.currSoundFile.url}`);
                this.loadRecordingClip(this.currSoundFile);
                this.currSoundFile = new p5.SoundFile();
                console.log(`Stopped Recording Track ${this.trackNum}`);

            });
            this.state = Track.recordingState.RECORDING;
            this.createRecordingClip();
            console.log(`Started Recording Track ${this.trackNum}`);
            
        }

    }


    stopRecording()
    {
        if(this.state == Track.recordingState.RECORDING)
        {
            this.recorder.stop();
            this.state = Track.recordingState.STOPPED;
            /*
            console.log(this.recorder);
            this.currSoundFile.play();
            console.log(this.currSoundFile);
            //this.currSoundFile.save();
            this.p5.saveSound(this.currSoundFile, `testRecording.wav`); //Add Timestamp
            this.recordings.push(this.currSoundFile);
            this.currSoundFile = new p5.SoundFile();
            */
        }
    }

    startRecordingMidi()
    {
        if(this.state == Track.midiRecordingState.READY)
        {
            this.state = Track.midiRecordingState.RECORDING;
            this.createMidiRecordingClip();
            console.log(`Started Midi Recording on Track ${this.trackNum}`);

        }
    }


    stopRecordingMidi(seconds)
    {
        if(this.state == Track.midiRecordingState.RECORDING)
        {
            this.state = Track.midiRecordingState.STOPPED;
            this.init_midi_recording = false;
            this.loadMidiClip(seconds);

        }

    }

    createMidiRecordingClip()
    {
        if(this.init_midi_recording == false)
        {
            this._init_rec_time = this.p5.map(Tone.Transport.seconds, 0, transportLoopLength, 0, this.p5.width);
            this.init_midi_recording = true;
            console.log("Started Creating Midi Recording Clip");

        }
        var rec_dif = Tone.Transport.seconds - this.init_rec_time;
        this.p5.stroke("pink");
        this.p5.fill("pink");
        var rec_dif_pos = this.p5.map(rec_dif, 0, transportLoopLength, 0, this.p5.width);
        this.p5.rect(this.init_rec_time, 100, rec_dif_pos, 100);
        this.analyzeMidiRecording(this.init_rec_time, this.trackY, rec_dif_pos, 100);
    }

    createRecordingClip()
    {  
        if(this.init_recording == false)
        {
            this.init_rec_time = this.p5.map(Tone.Transport.seconds, 0, transportLoopLength, 0, this.p5.width);
            this.init_recording = true;
            console.log("Started Creating Recording Clip");
            console.log(`Start Position: ${this.init_rec_time}`);
        }
        console.log("Creatting recording clip");
        var rec_dif = Tone.Transport.seconds - this.init_rec_time;
        console.log(`Rec Diff: ${rec_dif}`);
        this.p5.stroke("red");
        this.p5.fill("red");
        var rec_dif_pos = this.p5.map(rec_dif, 0, transportLoopLength, 0, this.p5.width);
        this.p5.rect(this.init_rec_time, 100, rec_dif_pos, 100);
        this.analyzeRecording(this.init_rec_time, 100, rec_dif_pos, 100);

        
    }


    analyzeRecording(clipX, clipY, clipWidth, clipHeight)
    {
        this.p5.stroke("black");
        let waveform = this.fft.waveform();
        for(let i = 0; i < waveform.length; i++)
        {
            var x = this.p5.map(i, 0, waveform.length, clipX, (clipX + clipWidth));
            var w = 1;
            var h = this.p5.map(waveform[i], -1, 1, (clipY + clipHeight), clipY);
            var y = (clipY + (clipY + clipHeight)) / 2;
            this.p5.line(x , y, x + 0, h);
               
        }
    }

    analyzeMidiRecording(clipX, clipY, clipWidth, clipHeight)
    {
        this.p5.stroke("black");
        this.p5.fill("black");
        for(let i = 0; i < this.curr_midi_notes.length; i++)
        {
            console.log("Drawing Notes");
            var midiNote = this.curr_midi_notes[i];
            var rect_height = clipHeight/79;
            var rect_y = this.p5.map(midiNote.midiNum, 21, 100,(clipY+clipHeight), clipY);
            var rect_width = this.p5.map(midiNote.duration,0, Tone.Transport.seconds, 0, clipWidth);
            var rect_x = this.p5.map(midiNote.startTime, 0, Tone.Transport.seconds, clipX, (clipX + clipWidth));
            //console.log(rect_x);
            //console.log(rect_y);
            console.log(rect_width);
            //console.log(rect_height);
            this.p5.rect(rect_x, rect_y, rect_width, rect_height);

        }
        
    }

    disableRecording()
    {
        this.state = Track.recordingState.DISABLED;
    }

    disableMidiRecording()
    {
        this.state = Track.midiRecordingState.DISABLED;
    }

    setP5(p5Object)
    {
        this.p5 = p5Object;
    }

    loadMidiClip(duration)
    {
        var newClip = new MidiClip(this.numMidiClips, this.trackWidth,this.curr_midi_notes);
        var lastLength = this.getLastClip();
        console.log(`Last Length : ${lastLength}`);
        if(lastLength != 0)
        {
            newClip.clipX = lastLength;
        }else{
            newClip.clipX = 0;
        }
        newClip.clipY = this.trackNum * 100;
        newClip.p5 = this.p5;
        newClip.duration = duration;
        newClip.calcClipLength(this.transportLoopLength);
        newClip.setMidiType(this.rec_midi_type);
        newClip.scheduleNotes();

        console.log(newClip);
        this.midiClips.push(newClip);
        this.numMidiClips += 1;
        this.curr_midi_notes = [];

        

    }

    getLastClip()
    {
        var lastLength = 0;
        let max = 0;
        for(let i = 0; i < this.clips.length; i++)
        {
            if(this.clips[i].clipLength > lastLength)
            {
                lastLength = this.clips[i].clipLength;
            }

        }

        for(let i = 0; i< this.midiClips.length; i++)
        {
            if(this.midiClips[i].clipLength > lastLength)
            {
                lastLength = this.midiClips[i].clipLength;
            }
        }

        return lastLength;
    }

    loadRecordingClip(soundFile)
    {
        var toneClip = new Tone.Player(soundFile.buffer, () => {
            console.log(toneClip);

            var clipIndex = this.numClips;
            var newClip = new Clip(this.numClips, soundFile, toneClip, this.trackWidth);
            if(this.clips.length != 0)
            {
                newClip.clipX = this.clips[clipIndex].clipLength;
            }else{
                newClip.clipX = 0;
            }
            newClip.clipY = this.trackNum * 100;
            newClip.p5 = this.p5;
            newClip.calcClipLength(transportLoopLength);
            console.log(newClip);
            this.clips.push(newClip);
            this.numClips += 1;


        }).toMaster().sync().start(0);
    }

    loadClip(url)
    {
        var p5Clip = this.p5.loadSound(url, () => {
            
            var toneClip = new Tone.Player(url,() =>{
                console.log(p5Clip);
                console.log(toneClip);
                //toneClip.start(0);
                //Tone.Transport.start();
                var clipIndex = this.numClips;
                //this.toneClips.push(toneClip);
                var newClip = new Clip(clipIndex, p5Clip, toneClip, this.trackWidth);
                if(this.clips.length != 0)
                {
                    newClip.clipX = this.clips[this.clips.length - 1].clipLength;

                }else{
                    newClip.clipX = 0;

                }
                newClip.clipY = this.trackNum * 100;
                newClip.p5 = this.p5;
                newClip.calcClipLength(transportLoopLength);
                console.log(newClip);
                this.clips.push(newClip)
                this.numClips += 1;
                
            }).toMaster().sync().start(0);
            //toneTrackId1 = Tone.Transport.schedule((time) =>{
            //    toneTrack.start();
            //}, 0);
            //PLAYER DOES NOT LOAD URL AT ALL
        });

        //console.log(`Player: ${toneTrack}, Start`);
        //console.log(`Player loaded: ${toneTrack.loaded}`);
        //toneTrack.autostart = true;   
        //return [p5Track, toneTrack];
    }

    draw()
    {
        this.drawTrack();
        this.drawSoundWave();
        this.drawMidiClip();
        if(this.init_recording == true)
        {
            this.createRecordingClip();
        }
        if(this.init_midi_recording == true)
        {
            this.createMidiRecordingClip();
        }

        
    }


    drawTrack()
    {
        this.p5.stroke("red");
        this.p5.fill("grey");
        this.p5.rect(this.trackX, this.trackY, this.trackWidth, this.trackHeight);
        
    }

    clipHover(clipX, clipY, clipWidth, clipHeight)
    {
        var endX = clipX + clipWidth;
        var endY = clipY + clipHeight;
        if(this.p5.mouseX > clipX &&
            this.p5.mouseX < endX &&
            this.p5.mouseY > clipY &&
            this.p5.mouseY < endY)
        {
            this.p5.stroke("white");
            this.p5.fill("black");
            console.log("Inside Track 1");
            return true;
        }
        else
        {   
            this.p5.stroke("#fae");
            this.p5.fill("black");
            return false
        }
    }

    drawSoundWave()
    {
        for(let k = 0; k < this.clips.length; k++)
        {
            //console.log(`Drawing Sound Wave for clip ${k}`);
            //Check to see the Type of clip later

            var currClip = this.clips[k];


            var overClip = this.clipHover(currClip.clipX, currClip.clipY, currClip.clipLength, currClip.clipHeight);

            this.clips[k].hover = overClip;


            //console.log(currClip)
            this.p5.rect(currClip.clipX, currClip.clipY, currClip.clipLength, currClip.clipHeight);
            var waveform = currClip.p5Player.getPeaks(500);
            this.p5.stroke("pink");
            //fill("black");
            for (var i = 0; i< waveform.length; i++)
            {
                var x = this.p5.map(i, 0, waveform.length, currClip.clipX, (currClip.clipX + currClip.clipLength));
                var w = 1;
                var h = this.p5.map(waveform[i], -1, 1, (currClip.clipY + currClip.clipHeight), currClip.clipY);
                var y = (currClip.clipY + (currClip.clipY + currClip.clipHeight)) / 2;
                this.p5.line(x , y, x + 0, h);
            }
            //console.log(`Peaks Length: ${waveform.length}`);
            //console.log(`Drawing Sound Wave for clip ${k}`);

        }

    }

    drawMidiClip()
    {
        for(let k = 0; k < this.midiClips.length; k++ )
        {
            var currClip = this.midiClips[k];
            var overClip = this.clipHover(currClip.clipX, currClip.clipY, currClip.clipLength, currClip.clipHeight);
            this.midiClips[k].hover = overClip;

            this.p5.rect(currClip.clipX, currClip.clipY, currClip.clipLength, currClip.clipHeight);
            this.p5.stroke("pink");

            for(let i = 0; i < currClip.midiNotes.length; i++)
            {
                console.log("Drawing Notess");
                var midiNote = currClip.midiNotes[i];
                var rect_height = currClip.clipHeight/79;
                var rect_y = this.p5.map(midiNote.midiNum, 21, 100,(currClip.clipY+currClip.clipHeight), currClip.clipY);
                var rect_width = this.p5.map(midiNote.duration,0, currClip.duration, 0, currClip.clipLength);
                var rect_x = this.p5.map(midiNote.startTime, 0, currClip.duration, currClip.clipX, (currClip.clipX + currClip.clipLength));

                this.p5.rect(rect_x, rect_y, rect_width, rect_height);
    
            
            }

            

        }
    }

    mousePressed()
    {
        for(let i = 0; i < this.clips.length; i++)
        {
            if(this.clips[i].hover)
            {
                this.currLockedClip = this.clips[i];

                this.currLockedClip.lockClip = true;
                this.p5.fill("pink");
                console.log("Clicked Track");
                this.currLockedClip.xLock = this.p5.mouseX;
                this.currLockedClip.oldX = this.currLockedClip.clipX
            }
        }

    }

    mouseDragged()
    {
        if(this.currLockedClip != null && this.currLockedClip.lockClip)
        {
            var offsetX = this.p5.mouseX - this.currLockedClip.xLock;
            var newSoundWaveX = this.currLockedClip.oldX + offsetX;
            this.currLockedClip.clipX = newSoundWaveX
            var startTime = this.p5.map(newSoundWaveX, 0, this.trackWidth, 0, this.transportLoopLength);
            this.currLockedClip.clipStartTime = startTime;
            console.log(`OffsetX: ${offsetX}, MouseX: ${this.p5.mouseX}, xLock: ${this.currLockedClip.xLock} startTime: ${startTime}`);
            this.clips[this.currLockedClip.index] = this.currLockedClip;
        }
        
    }

    mouseReleased()
    {
        if(this.currLockedClip != null && this.currLockedClip.lockClip){
            this.currLockedClip.lockClip = false;
            this.currLockedClip.tonePlayer.unsync();
            this.currLockedClip.tonePlayer.toMaster().sync().start(this.currLockedClip.clipStartTime);
            //Tone.Transport.clear(toneTrackId1);
            //toneTrackId1 = Tone.Transport.schedule((time) =>{
            //    toneTrack1.start();
            //}, startTime);
            console.log(`New StartTime : ${this.currLockedClip.clipStartTime} `);
            console.log(this.currLockedClip.tonePlayer.loaded);
        }
    
    }






}

class Clip 
{

    clipStartTime = 0;

    clipX = 0;
    clipY = 0;

    clipLength = 0;
    clipHeight = 100;
    p5Player = null;
    tonePlayer = null;
    index = 0;
    transportLoopLength = 240;

    hover = false;
    lockClip = false;

    xLock = 0;
    oldX = this.clipX;

    p5 = null;


    constructor(index, p5Player, tonePlayer, trackWidth)
    {
        this.index = index;
        this.p5Player = p5Player;
        this.tonePlayer = tonePlayer;
        this.trackWidth = trackWidth;
    }

    calcClipLength(transportLoopLength)
    {
        this.transportLoopLength = transportLoopLength;
        console.log(this.p5.map(this.p5Player.duration(), 0, this.transportLoopLength, 0, this.trackWidth));
        this.clipLength = this.p5.map(this.p5Player.duration(), 0, this.transportLoopLength, 0, this.trackWidth);
    }
    
}


class MidiClip
{
    clipStartTime = 0;

    clipX = 0;
    clipY = 0;

    clipLength = 0;
    clipHeight = 100;

    index = 0;
    transportLoopLength = 240;

    hover = false;
    lockClip = false;

    xLock = 0;
    oldX = this.clipX;


    midiNotes = [];
    synth = '';
    duration = 0;

    midiType = 0;

    //Find alternative 
    osc = null;
    envelope = null;

    sampler = null;

    p5 = null;
    


    constructor(index, trackWidth, midiNotes)
    {
        this.index = index;
        this.trackWidth = trackWidth;
        this.midiNotes = midiNotes;
        
    }

    calcClipLength(transportLoopLength)
    {
        this.transportLoopLength = transportLoopLength;
        this.clipLength = this.p5.map(this.duration, 0, this.transportLoopLength, 0, this.trackWidth);
        console.log(`Midi Clip Length: ${this.clipLength}`);

    }

    setMidiType(midiType)
    {
        if(midiType == MidiTypes.midiList.OnScreenKeyboard && OnScreenKeyboard.recordingStatus.enabled)
        {
            
            this.osc = OnScreenKeyboard.recordingStatus.osc;
            this.envelope = OnScreenKeyboard.recordingStatus.envelope;    

            console.log(`Set Clip Midi Type`);
        }

    }

    scheduleNotes()
    {
        for(let i = 0; i < this.midiNotes.length; i++)
        {
            let midiNote = this.midiNotes[i];
            let osc = this.osc;
            let envelope = this.envelope
            Tone.Transport.schedule(function(time){
                envelope.setADSR(0.001, 0.5, 0.3, 0.5);
                osc.start();
                let freq = MidiTypes.noteFreqMapping[midiNote.note];
                osc.freq(freq);
                envelope.triggerAttack(osc);
                envelope.triggerRelease(osc,midiNote.duration)
                //envelope.play(osc, 0, midiNote.duration);
                console.log(`Playing scheduled note: ${midiNote.note}`)
            }, midiNote.startTime);
            
        }
    }
}

//wavesurfer.load('assets/DrakeOverdrive.wav');

//Do Something with the bpm later when I really start working with transport.
let bpm = 120;

let clickNote;
let keyNote;
const keys = document.querySelectorAll('.key');

var p5Track1;
var toneTrack1;
let trackNum = 1;

const whiteNotes = document.querySelectorAll('.key.white');
const blackNotes = document.querySelectorAll('.key.black');


let edit  = new Edit(600, 100);
let keyboard = new OnScreenKeyboard();
let stepSequencer = new StepSequencer(4);
let ssModal = new SSModal('stepModal');




const app = new Vue({
    el: '#tracks',
    data(){
        return {
            count: "Hello World",
            length: 1,
            items: edit.trackList,
            items_update: false,
        }

    },
    watch:{
        items: function()
        {
            
            /*
            enRecButtons[this.items.length - 1].addEventListener('click', (e)=>{
                var id = e.target.id;
                var idNum = parseInt(id.charArt(id.length - 1));
                edit.enableRecording(idNum);
            });
            */
            if(this.items.length > this.length)
            {
                this.items_update = true;
                this.length += 1;
                console.log(`Item count changed to`)

            }else{
                this.length -= 1;
                console.log(`Delete occured. Item count: `)
            }
            this.items_update = true;
            console.log(`Item count changed to ${this.items.length}`);
        }
    },
    updated:function(){

        if(this.items_update == true)
        {
            var enRecButton = document.getElementById(`rec-enable-${this.items.length-1}`);
            var enMidiButton = document.getElementById(`midi-enable-${this.items.length-1}`);
            //EDGE CASE MAYBE ADD MORE THAN ONE ELEMENT AT A TIME....
            console.log(enRecButton);

            enMidiButton.addEventListener('click', (e)=>{
                let options = {
                    "enabled": true,
                    "osc": keyboard.osc,
                    "envelope": keyboard.envelope,
                };
                var id = e.currentTarget.id;
                console.log(e.target);
                var idNum = parseInt(id.charAt(id.length - 1));
                edit.enableMidiRecording(idNum,MidiTypes.midiList.OnScreenKeyboard ,options);

                keyboard.midiNoteCallback = Edit.midiMessageCallback;
            });
            
            enRecButton.addEventListener('click', (e)=>{
                var id = e.currentTarget.id;
                e.stopPropagation();
                console.log(e.target);
                console.log(e.currentTarget.id.charAt(id.length-1));
                var idNum = parseInt(id.charAt(id.length - 1));
                edit.enableRecording(idNum);
            });
            console.log("Vue Updated...");
            this.items_update = false;
        }

    },
    methods: {
        setItems: function (items) {
            this.items = items;
        }
    }
});

var trackP5 = function(track) {
    
    let playButton = document.getElementById("playButton");
    let newButton = document.getElementById("newTrackButton");
    let stopButton = document.getElementById("stopButton");
    let recordButton = document.getElementById("recordButton");
    let enRecButtons = document.getElementsByClassName("en-rec");
    //ADD MIDI ENABLED HERE LATER ON

    console.log(enRecButtons);
    for(let i = 0; i < enRecButtons.length; i++)
    {
        //enRecButtons[i].onclick = enRecClicked;
        enRecButtons[i].addEventListener('click', (e)=>{ enRecClicked(e)});
    }
    playButton.onclick = playButtonClicked;
    stopButton.onclick = () => {
        edit.stopTransport();
    }
    newButton.onclick = addTrackClicked;
    recordButton.onclick = recordButtonClicked;
    track.preload = function(){
        edit.setP5(track);
        edit.trackList[0].loadClip('assets/DrakeOverdrive.wav');
        
    }

    track.setup = function(){

        track.createCanvas(edit.width,edit.height);  
        
        keyboard.osc = new p5.Oscillator('triangle'); // set frequency and type
        keyboard.envelope = new p5.Env();

        keyboard.osc.amp(0.5);

        // set attackTime, decayTime, sustainRatio, releaseTime
        keyboard.envelope.setADSR(0.001, 0.5, 0.3, 0.5);
  
        // set attackLevel, releaseLevel
        keyboard.envelope.setRange(1, 0);
        var playNote = (freq) => {
            keyboard.osc.start();
            keyboard.osc.freq(freq);
            keyboard.triggerAttack(keyboard.osc);
            //keyboard.envelope.play(keyboard.osc, 0, 0.1);
            //osc.stop();
        };

        var mouseDownCallback = (freq) => {
            keyboard.osc.start();
            keyboard.osc.freq(freq);
            keyboard.envelope.triggerAttack(keyboard.osc);
        };

        var mouseUpCallback = () => {
            keyboard.envelope.triggerRelease(keyboard.osc);
        }

        keyboard.setMouseDownCallback(mouseDownCallback);
        keyboard.setMouseUpCallback(mouseUpCallback);

        var clickNoteCallback = (freq) => {
            keyboard.osc.start();
            keyboard.osc.freq(freq);
            keyboard.envelope.play(keyboard.osc, 0, 0.1);
            //osc.stop();
    
    
    
        };

        //keyboard.clickNoteCallback = clickNoteCallback;

    
        var keyNoteCallback = (freq) => {
            osc.start();
            osc.freq(freq);
            envelope.play(keyboard.osc, 0, 0.1);
            console.log(note);
    
        };

        keyboard.keyNoteCallback = keyNoteCallback;

        keyboard.midiNoteCallback = Edit.midiMessageCallback;
    };

    track.draw = function(){
        edit.draw();
    };

    function enRecClicked(e){
        var id = e.currentTarget.id;
        var idNum = parseInt(id.charAt(id.length - 1));
        edit.enableRecording(idNum)
    }

    function recordButtonClicked(){
        edit.record();
    }

    function addTrackClicked(){
        console.log("Adding new Track..");
        edit.createTrack(600,100);
        //app.$forceUpdate();
        //enRecButtons = document.getElementsByClassName("en-rec");
        //console.log(enRecButtons);
        //console.log(edit.numTracks);
        //console.log(enRecButtons.length);
        //enRecButtons[edit.numTracks - 1].addEventListener('click', (e)=>{ enRecClicked(e)});

        //window.app.setItems(edit.trackList);
        console.log(app.$items);
        //app.forceUpdate();
    }


    function playButtonClicked()
    {
        edit.playTransport();
    }

    track.mousePressed = function(){
        edit.mousePressed();
    };

    track.mouseDragged = function(){
        edit.mouseDragged();
    };

    track.mouseReleased = function(){
        edit.mouseReleased();
    };
};

var stepSequenceP5 = function(ss5){
    


    ss5.preload = function(){
        stepSequencer.setP5(ss5);
    }

    ss5.setup = function(){
        ss5.createCanvas(300, 200);
        ss5.background("black");
    }

    ss5.draw = function(){
        stepSequencer.draw();
    }

    

    ss5.keyPressed = function(){
        if(ss5.key == " ")
        {
            if(stepSequencer.currState == StepSequencer.playbackState.READY )
            {
                console.log("Looping step sequencer");
                stepSequencer.playLoop();

            }
            else if(stepSequencer.currState == StepSequencer.playbackState.PLAYING)
            {
                stepSequencer.stop();
            }

        }
    }

    

    ss5.mousePressed = function(){
        stepSequencer.detectCell();
    }


}


var ssButton = document.getElementById('ssButton');

ssButton.onclick = () =>  {
    console.log('SS Button Clicked');
    ssModal.showModal();
    ssModal.createP5Instance("stepSequencer", stepSequenceP5);
}






//var ssP5 = new p5(stepSequenceP5, "stepSeqencer");


var editP = new p5(trackP5, 'track1');
var tempTracks = edit.trackList;

$(function() {
    $(".dial").knob({
        'height': 30,
        'width': 30,
        'displayInput': false
    });
});

//app.mount('#tracks');


/*
function preload(){
    track1 = loadSound('assets/hardBall.mp3');
    //var tracks = loadTrack('assets/DrakeOverdrive.wav');


    edit = new Edit(600, 100);
    edit.trackList[0].loadClip('assets/DrakeOverdrive.wav');

    //p5Track1 = tracks[0],
    //toneTrack1 = tracks[1];


}


function setup(){
    createCanvas(600, 800);
    canvasWidth = width;
    whiteNoise.amp(0.1);


    fft = new p5.FFT();

    osc = new p5.TriOsc(); // set frequency and type
    
    osc.amp(0.5);
    envelope = new p5.Env();


    // set attackTime, decayTime, sustainRatio, releaseTime
    envelope.setADSR(0.001, 0.5, 0.1, 0.5);
  
    // set attackLevel, releaseLevel
    envelope.setRange(1, 0);

   // const osc1 = new Tone.Oscillator().toDestination();

    console.log("Calling p5-Setup");



  
    fft = new p5.FFT();

    clickNote = (key) => {
        osc.start();
        const note = key.dataset.note;
        let freq = noteFreqMapping[note];
        osc.freq(freq);
        envelope.play(osc, 0, 0.1);
        //osc.stop();
        console.log(note);

        key.classList.add('playing');


    };

    keyNote = (e) => {
        osc.start();
        const note = keyboardMapping[e.keyCode];
        let freq = noteFreqMapping[note];
        osc.freq(freq);
        envelope.play(osc, 0, 0.1);
        console.log(note);
        let key = document.querySelector(`.key[data-note="${note}"]`);
        console.log(`.key[data-note="${note}"]`);
        key.classList.add('playing');


    };
    console.log(whiteNotes);
    keys.forEach((key) =>{
        key.addEventListener('click', ()=>clickNote(key));
    });

    document.addEventListener('keydown', (e)=>keyNote(e));

    keys.forEach((key) => {
        key.addEventListener("transitionend", (e)=>{
            if(e.propertyName !== "transform") return;
            console.log(e);
            e.target.classList.remove("playing");
        });
    });

    playButton = createButton("play");
    playButton.position(10,30);
    playButton.mousePressed(onPlayClicked);
    //wavesurfer.play();


    stopButton = createButton("stop");
    stopButton.position(100,30);
    stopButton.mousePressed(onStopClicked);


    startTransportButton = createButton("Start");
    startTransportButton.position(10, height);
    startTransportButton.mousePressed(onStartTransportClicked);

    stopTransportButton = createButton("Cease");
    stopTransportButton.position(100, height);
    stopTransportButton.mousePressed(onStopTransportClicked);




    //var songSamplesPerBeat = 60/bpm * songSampleRate;

    volumeSlider = createSlider(-60, 0, 0 ,1);
    volumeSlider.position(10,70);

    volumeSlider.input(function(){
        if(volumeSlider.value() > -56){
            //amplitude = 10 ^ (decibals/20)
            track1.setVolume(pow(10, volumeSlider.value()/20))
        }
        else{
            track1.setVolume(map(volumeSlider.value(), -60, -56, 0, 0.0016))
        }
    });
    //bpmSlider = createSlider(0,1,0.1);
    //bpmSlider.position(10, 70);
    fill("white");
    noStroke();


}
let toneTrackId1;
function loadTrack(url)
{
    var p5Track = loadSound(url);
    var toneTrack = new Tone.Player({
        'url': "./assets/DrakeOverdrive.wav",
        'loop':true,
    }).toMaster().sync().start(0);
    //toneTrackId1 = Tone.Transport.schedule((time) =>{
    //    toneTrack.start();
    //}, 0);
    //PLAYER DOES NOT LOAD URL AT ALL
    console.log(`Player: ${toneTrack}, Start`);
    //console.log(`Player loaded: ${toneTrack.loaded}`);
    //toneTrack.autostart = true;
    return [p5Track, toneTrack];
}

function onPlayClicked(){
    if(!track1.isPlaying()){
        track1.play();
        var songSampleRate = track1.sampleRate();
        console.log(songSampleRate);

    }
}

function onStopClicked(){
    //whiteNoise.stop();
    if(track1.isPlaying()){
        track1.pause();
    }
}

function onStartTransportClicked(){
    //Tone.Transport.start();
    edit.playTransport();
    console.log("Starting transport...");

}

function onStopTransportClicked(){
    //Tone.Transport.stop();
    edit.stopTransport();
    console.log("Stopping transport...");
}



function draw(){
    background(220);
    let spectrum = fft.analyze();
    //---------------------------------------------------------------console.log(spectrum);
    
    var waveform = track1.getPeaks(500);
    stroke(0)
    for (var i = 0; i< waveform.length; i++){
      var x = map(i, 0, waveform.length, 0, width);
      var y = height/2;
      var w = 1;
      var h = map(waveform[i], -1, 1, 300, 0);
      line(x , 150, x + 0, h);
    }


    fill("white");
    beginShape();
    vertex(0, 400);
    let sum = 0 ;
    //-----------------------------------------------------------------
    for(let i =0; i< spectrum.length; i++)
    {
        sum += spectrum[i];
        
        vertex(map(log(i), 0, log(spectrum.length), 0, width), map(spectrum[i], 0, 255, 600, 400));
    }

    var avg = Math.floor( sum / spectrum.length);

    vertex(width, 400)
    endShape();

    //console.log(`Edit: ${edit} `);
    edit.draw();
    drawPlayHead();
    //drawTrack();
    //point(10,spectrum[0]);

    //drawSoundWave(p5Track1);
    //drawTransportPlayHead();

}


function drawTrack()
{
    stroke("red");
    fill("grey");
    rect(0,650, width, 100);
}
//Change this to be in class later on 
function trackHover(x, y, width, height)
{
    var endX = x + width;
    var endY = y + height;
    if(mouseX > x &&
       mouseX < endX &&
       mouseY > y &&
       mouseY < endY)
    {
        stroke("white");
        //fill("pink");
        console.log("Inside Track 1");
        return true;
    }
    else
    {   
        stroke("#fae");
        fill("black");
        return false
    }
    
    

}
let xLock;
let oldX;
let startTime;
function mousePressed()
{
    edit.mousePressed();
    /*
    if(overTrack){
        lockTrack = true;
        fill("pink");
        console.log("Clicked Track");
        xLock = mouseX;
        oldX = soundWaveX;
    }
    else{
        lockTrack = false;
    }
    
}

function mouseDragged()
{
    edit.mouseDragged();
    /*
    if(lockTrack)
    {
        var offsetX = mouseX - xLock;
        console.log(`OffsetX: ${offsetX}, MouseX: ${mouseX}, xLock: ${xLock}`);
        soundWaveX = oldX + offsetX;
        startTime = map(soundWaveX, 0, width, 0, transportLoopLength);

    }
    
}

function mouseReleased()
{
    edit.mouseReleased();
    /*
    if(lockTrack){
        lockTrack = false;
        toneTrack1.unsync();
        toneTrack1.toMaster().sync().start(startTime);
        //Tone.Transport.clear(toneTrackId1);
        //toneTrackId1 = Tone.Transport.schedule((time) =>{
        //    toneTrack1.start();
        //}, startTime);
        console.log(`New StartTime : ${startTime} `);
    }
    


}

function drawSoundWave(track)
{
    
    let soundWaveWidth = map(track.duration(), 0, transportLoopLength, 0, width);
    let soundWaveHeight = 100;
    soundWaveY = 650;

    overTrack = trackHover(soundWaveX, soundWaveY, soundWaveWidth, soundWaveHeight);

    rect(soundWaveX, soundWaveY, soundWaveWidth, soundWaveHeight);
    var waveform = track.getPeaks(500);
    stroke("pink");
    for (var i = 0; i< waveform.length; i++){
        var x = map(i, 0, waveform.length, soundWaveX, (soundWaveX + soundWaveWidth));
        var w = 1;
        var h = map(waveform[i], -1, 1, (soundWaveY + soundWaveHeight), soundWaveY);
        var y = (soundWaveY + (soundWaveHeight+ soundWaveY)) / 2;
        line(x , y, x + 0, h);
    }

    
}

function drawTransportPlayHead()
{  /*
    stroke("green");
    transportLoopLength = 240;
    rect(map(Tone.Transport.seconds, 0, transportLoopLength, 0, width), 600, 2, 200);
    
}



function drawPlayHead(){
    
    stroke("black")
    rect(map(track1.currentTime(), 0, track1.duration(), 0, width), 0, 2, 300);
    
}


function detectBpm(avg){
    if( avg > 50 && track1.isPlaying()){
        //We found a beat!
        var time = track1.currentTime();
        console.log(`We found a beat. Frequency: ${avg}, Time: ${time}`);
        var item = [
            time, avg
        ]
        for(let i = se_history.length - 1 ; i> 0 && se_history.length > 1 ; i--)
        {
            //console.log(se_history);
            var[se_time, se_avg] = se_history[i];

            if(se_avg == avg)
            {
                console.log(`Found Previous Beat. Frequency: ${se_avg}, Time: ${se_time} `);
                var bpm = 60/(time - se_time);
                if(bpm > 200 && bpm < 350){
                    bpm = bpm/2;
                    bpms.push(bpm);
                }
                if(bpm < 80)
                {
                    bpm = bpm * 2;
                    bpms.push(bpm);

                }
                if(bpm>= 80 && bpm <= 200){
                    bpms.push(bpm);
                }
                var bpm_average = 0
                if(bpms.length != 0)
                    bpm_average = bpms.reduce((a,b) => (a+b))/bpms.length;
                console.log(`BPM : ${bpm}`);
                console.log(`BPM_AVG : ${bpm_average}`);
            }

        }
        se_history.push(item);
        if(se_history.length > 20)
        {
            se_history.shift();
        }


    }
}
*/