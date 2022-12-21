//import {React} from 'react';
//import {ReactDOM} from 'react-dom'
import Vue from 'vue'
//import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.esm.browser.js'

import { getCurrentInstance } from 'vue';


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



let wavesurfer = WaveSurfer.create({
    container: '#waveform'
});


class Edit {
    

    numTracks = 0;
    trackList = [];
    transportLoopLength = 240;
    p5 = null
    init_track = false;

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
    overTrack = 0;

    trackX = 0;
    trackY = 0;


    trackWidth = 600;
    trackHeight = 100;

    trackNum = 1;
    p5Clips = [];
    toneClips = [];
    
    lockClip = false;
    currLockedClip = null;

    clips = [];
    numClips = 0;

    name = ``;
    volume = 50;

    p5 = null
    
    constructor(trackNumber, trackWidth, trackHeight, transportLoopLength)
    {
        this.trackNum = trackNumber;
        console.log(`Track Num: ${trackNumber}`);
        this.trackWidth = trackWidth;
        this.trackHeight = trackHeight;
        this.transportLoopLength = transportLoopLength;
        this.name = `Track ${this.trackNum + 1}`
    }

    setP5(p5Object){
        this.p5 = p5Object;
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
                newClip.clipX = 0;
                newClip.clipY = 0;
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

const app = new Vue({
    el: '#tracks',
    data(){
        return {
            count: "Hello World",
            items: edit.trackList
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
    playButton.onclick = playButtonClicked;
    newButton.onclick = addTrackClicked;
    track.preload = function(){
        edit.setP5(track);
        edit.trackList[0].loadClip('assets/DrakeOverdrive.wav');
    }

    track.setup = function(){
        track.createCanvas(edit.width,edit.height);   
    };

    track.draw = function(){
        edit.draw();
    };

    function addTrackClicked(){
        console.log("Adding new Track..")
        edit.createTrack(600,100);
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

var editP = new p5(trackP5, 'track1');
var tempTracks = edit.trackList;



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