// var average = [];
var compressed = [];
var spectra;
var yAxisArray = [];
var fft;
var fftDrawn = false;

var currentWindow = 0;
var currentFreq = 0;
var xWidth, yWidth = 0;
var xPos = 0;
var yPos = 0;
var amp, maxAmps = 0;
var maxArray = [];
var gain = 0;

var percRendered = 0;

function preload() {
  sound = loadSound(soundFilePath);
}

function setup() {
  var height = document.getElementById("progress-bar").offsetHeight;
  var width = document.getElementById("progress-bar").offsetWidth;
  var myCanvas = createCanvas(width, height);
  myCanvas.parent("progress-bar");

  fft = new FFT(fftSize, 44100);

  background(20);
  // console.log("sound length = " + sound.duration());
  getRawData();
  compressAudio();
  // drawWaveform();
  // drawFFT();

  xWidth = width / spectra.length;
  yWidth = height / spectra[0].length;
  maxArray = [];
  for (var i = 0; i < spectra.length; i ++) {
    maxArray[i] = Math.max.apply(null, spectra[i]);
  }
  maxAmp = Math.max.apply(null, maxArray);
  console.log("Starting FFT spectrogram draw");
}

function getRawData() {
  //get raw channel data! Fukking did it
  var buffer = sound.buffer; //get all channels
  var bufferlength = buffer.length;
  // console.log("bufferlength = " + bufferlength);
  average = [];
  // average = Array.apply(null, Array(bufferlength)).map(Number.prototype.valueOf,0);; //zeros array for averaging out all channels of this audio file
  for (var c = 0; c < buffer.numberOfChannels; c ++) {
    // console.log("getting data for channel " + c);
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
  // var numberOfWindows = width * 4;
  // var windowSize = Math.round(originalLength / numberOfWindows) -1;

  var windowSize = fftSize; // this is how many audio samples should exist per window MUST BE MULTIPLE OF 2
  var numberOfWindows = Math.round(originalLength / windowSize) - 1; //we do not analyse the last window cause that will result in analysing non-existing data
  compressed = []
  spectra = new Array(numberOfWindows);
  var total = 0; // total
  var sampleInFile = 0;
  console.log("Orignal length of audio file: " + originalLength + " windowSize: " + windowSize + " so we create " + numberOfWindows + " windows" );

  for (var w = 0; w < numberOfWindows; w ++ ) {
    total = 0;
    sampleInFile = w * windowSize; // this is where the current window stars in the file
    var endSampleInFile = sampleInFile + windowSize; // this is were the current window should end

    //this is where I would do some RMS normalization but I have no clue how to do that
    var buffer = [];
    var bufferIndex = 0;
    for (var sample = sampleInFile; sample < endSampleInFile; sample ++) { //scrolling through the window
      buffer[bufferIndex] = average[sample]; //make a buffer for fft to analyse
      total += average[sample];
      bufferIndex ++;
    }

    fft.forward(buffer);
    var spectrum = fft.spectrum;
    // console.log(spectrum);
    spectra[w] = []; //this is an initializer for a 2d array because javascript is weird, doesnt work without this
    for (var f = 0; f < spectrum.length; f++) {

      // console.log("amp of freq " + f + " in window " + w + " = " +  spectrum[f]);
      spectra[w][f] = parseFloat(spectrum[f]);


    }
    total = total / windowSize;
    // console.log("Total for window " + w + " is " + total);
    compressed[w] = total; // add this window to the array of compressed audio
  }
  console.log("Compressed and fft'ed audio!" );
}

function calcYPos(i) {
  return(height - ((sqrt(i *(1 * height))) * 1.1) );
}

function drawFFT() {
  background(20);
  console.log("drawing fft");
  var xWidth = width / spectra.length;
  var yWidth = height / spectra[0].length;
  var xPos = 0;
  var yPos = height;
  var amp = 0.;
  var maxArray = [];
  for (var i = 0; i < spectra.length; i ++) {
    maxArray[i] = Math.max.apply(null, spectra[i]);
  }
  var maxAmp = Math.max.apply(null, maxArray);
  var gain = 1 / maxAmp;
  console.log("maxAmp = " + maxAmp + " gain = " + gain);
  noStroke();
  colorMode(HSB);
  for (var i = 0; i < spectra.length; i ++) { //iterate through all windows
    xPos += xWidth; //width per window
    yPos = height; //y increment per new frequency
    // console.log(spectra[i].length);
    for (var f = 0; f < spectra[i].length; f ++) { //iterate through all frequencies in window
      amp = (spectra[i][f] * (gain * 3.7)); ///get amp
      if (amp > 0.) {
        var color = amp* 255; //fukked up scaling

        // console.log("drawing at " + xPos + ", " + yPos + "color " + color);
        yPos = calcYPos(f);
        // yPos -=
        // console.log(yPos);
        fill(255- color, 180, 200, color);
        rect(xPos, yPos, xWidth, yPos - calcYPos(f-1));
      }
    }
  }
}



function drawWaveform() {
  //draws a nice full window waveform of the loaded file
  background(20);
  var xWidth = width / compressed.length;
  var maxes = [abs(Math.min.apply(null, compressed)),     abs(Math.max.apply(null, compressed))];
  var max = Math.max.apply(null, maxes);
  var gain = 1 / max;

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
  gain = 10.1;
  noStroke();
  colorMode(HSB);
  if (!fftDrawn) {
    // console.log("Drawing window num " + currentWindow + "drawing at " + xPos + " window = " + currentWindow );
    for (var i = 0; i < spectra[0].length; i ++ ) {
      amp = (spectra[currentWindow][i]) * (gain); ///get amp
      if (amp > 0.001) {
        var color = amp * 45;
        yPos = calcYPos(i);
        fill(color + colorOffset, 180, 200, amp);
        rect(xPos, yPos, xWidth, yPos - calcYPos(i - 1));
      }
    }
    xPos += xWidth;
    currentWindow ++;
    var percRendered = int((currentWindow / spectra.length) * 100);
    document.getElementById("render-perc").innerHTML=(percRendered + "% rendered");
  }

  if (currentWindow > spectra.length - 1)  {
    fftDrawn = true;
    console.log("Done drawing the fft spectrogram");
    document.getElementById("render-perc").innerHTML=(" ");
    noLoop();
  }
}
