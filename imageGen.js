// var average = [];
var compressed = [];

function preload() {
  sound = loadSound(soundFilePath);
}

function setup() {
  var height = document.getElementById("progress-bar").offsetHeight;
  var width = document.getElementById("progress-bar").offsetWidth;
  var myCanvas = createCanvas(width, height);
  myCanvas.parent("progress-bar");
  background(0,0,0);
  fft = new p5.FFT();
  fft.setInput(sound);
  console.log("sound length = " + sound.duration());
  getRawData();
  compressAudio();
  drawWaveform();
}

function getRawData() {
  //get raw channel data! Fukking did it
  var buffer = sound.buffer; //get all channels
  var bufferlength = buffer.length;
  console.log("bufferlength = " + bufferlength);
  average = [];
  // average = Array.apply(null, Array(bufferlength)).map(Number.prototype.valueOf,0);; //zeros array for averaging out all channels of this audio file
  for (var c = 0; c < buffer.numberOfChannels; c ++) {
    console.log("getting data for channel " + c);
    var chan = buffer.getChannelData(0); //get one get one channel
    for (let i = 0; i < chan.length; i ++) {
      if (c == 0) { // if this is the first channel we analyse fill everything with zeros
        average[i] = 0;
      }
      average[i] += chan[i]; //adding samples at same time together
    }
  }
  for (let i = 0; i < average.length; i++) {
    average[i] /= 2.; //averaging everything out
  }
  // console.log(average);
}


function compressAudio() {
  //iterate through audio file in windows and average those windows out to create a smaller version of the rawData
  var originalLength = average.length;
  var windowSize  = 512; // this is how many audio samples should exist per window
  var numberOfWindows = Math.round(originalLength / windowSize) - 1; //we do not analyse the last window cause that will result in analysing non-existing data
  compressed = []
  var total = 0; // total
  var sampleInFile = 0;
  console.log("Orignal length of audio file: " + originalLength + " windowSize: " + windowSize + " so we create " + numberOfWindows + " windows" );

  for (var w = 0; w < numberOfWindows; w ++ ) {
    total = 0;
    sampleInFile = w * windowSize; // this is where the current window stars in the file
    var endSampleInFile = sampleInFile + windowSize; // this is were the current window should end

    //this is where I would do some RMS normalization but I have no clue how to do that

    for (var sample = sampleInFile; sample < endSampleInFile; sample ++) { //scrolling through the window
      total += average[sample];
    }
    total = total / windowSize;
    // console.log("Total for window " + w + " is " + total);
    compressed[w] = total; // add this window to the array of compressed audio
  }
  console.log("Compressed audio!" );
  // console.log(compressed);
}


function drawWaveform() {
  //draws a nice full window waveform of the loaded file
  background(0);
  var xWidth = width / compressed.length;
  var maxes = [abs(Math.min.apply(null, compressed)), abs(Math.max.apply(null, compressed))];
  var max = Math.max.apply(null, maxes);
  var gain = 1 / max;

  console.log("max " + max );
  console.log(xWidth);
  var xPos = 0;
  for (let i = 0 ; i < compressed.length; i ++) {
    xPos += xWidth;


    var offset = compressed[i] * gain; //this is the actual value of the sample at a given time
    offset *= height /2;
    // console.log("xPos " + xPos + "color " + color);
    fill(255,255,255,constrain(abs(offset * 4), 100, 255));
    // fill(255);
    noStroke();
    rect(xPos, height / 2, 1, offset);
  }
}

function draw() {
  // background(0,0,0);
  // drawWaveform();

}
