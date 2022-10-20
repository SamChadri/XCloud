
let whiteNoise = new p5.Noise();
let playButton;
let stopButton;
let track1;
let volumeSlider;
let fft;
let se_history = [] ;
let secondBeat = false;
let bpms = [];
let waveform;
//Do Something with the bpm later when I really start working with transport.
let bpm = 120

function preload(){
    track1 = loadSound('assets/DrakeOverdrive.wav');

}


function setup(){
    createCanvas(800, 1000);
    whiteNoise.amp(0.1);

    fft = new p5.FFT();

    playButton = createButton("play");
    playButton.position(10,30);
    playButton.mousePressed(onPlayClicked);


    stopButton = createButton("stop");
    stopButton.position(100,30);
    stopButton.mousePressed(onStopClicked);

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
    //point(10,spectrum[0]);
}

function drawPlayHead(){
    stroke("red")
    rect(map(track1.currentTime(), 0, track1.duration(), 0, width), 0, 5, 300);
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