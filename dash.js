
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

    constructor()
    {
        
    }

    createTrack(width, height)
    {
        var newTrack = new Track(0,width, height,transportLoopLength);
        this.trackList.push(newTrack);
        numTracks += 1;

    }

    drawPlayHead()
    {
        stroke("green");
        transportLoopLength = 240;
        rect(map(Tone.Transport.seconds, 0, transportLoopLength, 0, width), 600, 2, 200);
    }
}


class Track 
{
    overTrack = 0;

    trackX = 0;
    trackY = 0;


    trackWidth = width;
    trackHeight = 100;

    trackNum = 1;
    p5Clips = [];
    toneClips = [];
    
    lockClip = false;
    currLockedClip = null;

    clips = [];
    numClips = 0;
    
    constructor(trackNum, trackWidth, trackHeight, transportLoopLength)
    {
        this.trackNum = trackNum;
        this.trackWidth = trackWidth;
        this.trackHeight = trackHeight;
        this.transportLoopLength = transportLoopLength;
    }

    loadClip(url)
    {
        var p5Clip = loadSound(url);
        var toneClip = new Tone.Player({
            'url': url,
            'loop':true,
        }).toMaster().sync().start(0);
        //toneTrackId1 = Tone.Transport.schedule((time) =>{
        //    toneTrack.start();
        //}, 0);
        //PLAYER DOES NOT LOAD URL AT ALL
        var clipIndex = this.numClips;
        //this.toneClips.push(toneClip);
        var newClip = new Clip(clipIndex, p5Clip, toneClip);
        newClip.clipX = 0;
        newClip.clipY = 650;
        this.clips.push(new Clip(clipIndex, p5Clip))
        this.numClips += 1;
        console.log(`Player: ${toneTrack}, Start`);
        //console.log(`Player loaded: ${toneTrack.loaded}`);
        //toneTrack.autostart = true;
        
        return [p5Track, toneTrack];
    }
    draw()
    {
        drawTrack();
        drawSoundWave();

        
    }


    drawTrack()
    {
        stroke("red");
        fill("grey");
        rect(trackX, trackY, trackWidth, trackHeight);
        
    }

    clipHover(clipX, clipY, clipWidth, clipHeight)
    {
        var endX = clipX + clipWidth;
        var endY = clipY + clipHeight;
        if(mouseX > x &&
           mouseX < endX &&
           mouseY > y &&
           mouseY < endY)
        {
            stroke("white");
            fill("black");
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

    drawSoundWave()
    {
        for(let i = 0; i < this.clips.length; i++)
        {
            //Check to see the Type of clip later
            var overClip = clipHover(currClip.clipX, currClip.clipY, currClip.clipLength, currClip.clipHeight);

            clips[i].hover = overClip;


            var currClip = clips[i];
        
            rect(currClip.clipX, currClip.clipY, currClip.clipLength, currClip.clipHeight);
            var waveform = currClip.p5Player.getPeaks(500);
            stroke("pink");
            for (var i = 0; i< waveform.length; i++)
            {
                var x = map(i, 0, waveform.length, currClip.clipX, (currClip.clipX + currClip.clipLength));
                var w = 1;
                var h = map(waveform[i], -1, 1, (currClip.clipY + currClip.clipHeight), currClip.clipY);
                var y = (currClip.clipY + (currClip.clipY + currClip.clipHeigjt)) / 2;
                line(x , y, x + 0, h);
            }
        }

    }

    mousePressed()
    {
        for(let i = 0; i < this.clips.length; i++)
        {
            if(clip[i].hover)
            {
                this.currLockedClip = clip[i];
                this.currLockedClip.lockClip = true;
                fill("pink");
                console.log("Clicked Track");
                this.currLockedClip.xLock = mouseX;
                this.currLockedClip.oldX = this.currLockedClip.clipX
            }
        }

    }

    mouseDragged()
    {
        if(this.currLockedClip != null && this.currLockedClip.lockClip)
        {
            var offsetX = mouseX - this.currLockedClip.xLock;
            console.log(`OffsetX: ${offsetX}, MouseX: ${mouseX}, xLock: ${xLock}`);
            var newSoundWaveX = oldX + offsetX;
            this.currLockedClip.clipX = newSoundWaveX
            startTime = map(soundWaveX, 0, width, 0, this.transportLoopLength);
            this.currLockedClip.clipStartTime = startTime;
            this.clips[this.currLockedClip.index].clipX = this.currLockedClip.clipStartTime
    
        }
        
    }

    mouseReleased()
    {
        if(this.currLockedClip != null && this.currLockedClip.lockClip){
            this.currLockedClip.lockClip = false;
            this.currLockedClip.tonePlayer.unsync();
            this.currLockedClip.tonePlayer.toMaster().sync().startTime(this.currLockedClip.clipStartTime);
            //Tone.Transport.clear(toneTrackId1);
            //toneTrackId1 = Tone.Transport.schedule((time) =>{
            //    toneTrack1.start();
            //}, startTime);
            console.log(`New StartTime : ${this.currLockedClip.clipStartTime} `);
        }
    
    }






}


class Clip 
{

    clipStartTime = 0;

    clipX = 0;
    clipY = 650;

    clipLength = 0;
    clipHeight = 100;
    p5Player = null;
    tonePlayer
    index = 0;
    transportLoopLength = 240;

    hover = false;
    lockClip = false;

    xLock = mouseX;
    oldX = clipX;


    constructor(index, p5Player, tonePlayer)
    {
        this.index = index;
        this.p5Player = p5Player;
        this.tonePlayer = tonePlayer;
    }

    set clipLength(transportLoopLength)
    {
        this.transportLoopLength = transportLoopLength;
        this.clipLength = map(this.p5Player.duration(), 0, this.transportLoopLength, 0, width);
    }
    get clipLength()
    {
        //Implement Later
        return this.clipLength;
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
const blackNotes = document.querySelectorAll('.key.black')

function preload(){
    track1 = loadSound('assets/hardBall.mp3');
    var tracks = loadTrack('assets/DrakeOverdrive.wav');

    p5Track1 = tracks[0],
    toneTrack1 = tracks[1];


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
    Tone.Transport.start();
    console.log("Starting transport...");

}

function onStopTransportClicked(){
    Tone.Transport.stop();
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

    drawPlayHead();
    drawTrack();
    //point(10,spectrum[0]);

    drawSoundWave(p5Track1);
    drawTransportPlayHead();

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
{  
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
