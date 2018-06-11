var playing = false;
var myaudio;
var dur;
var time;
var _time;
var perc;
var soundFilePath = "";
var fftSize;
var colorOffset;

// A $( document ).ready() block.
$(document).ready(function() {

  var el = document.getElementById("audio-player");
  var nodes=[], values=[];
  for (var att, i = 0, atts = el.attributes, n = atts.length; i < n; i++){
    att = atts[i];
    // console.log(att.nodeName);
    if (att.nodeName == "sound") {
      console.log("Loading sound = " + att.nodeValue + "...");
      soundFilePath = att.nodeValue;
    }
    if (att.nodeName == "fftsize") {
      fftSize = Number(att.nodeValue);
      console.log("Changing fftSize to: " + att.nodeValue);
    }
    if (att.nodeName == "coloroffset") {
      colorOffset = Number(att.nodeValue);
      console.log("Changing colorOffset to: " + att.nodeValue);
    }

  }
  myaudio = new Audio(soundFilePath);
  dur = myaudio.duration;
  time = 0;
  // myaudio.play();

  var playButton = document.getElementById("play-button");
  playButton.addEventListener('click', playButtonClicked, false);

  var progressBar = document.getElementById("progress-bar");
  progressBar.addEventListener('click', progressBarClicked, false);

  $('#progress-bar').click(function(e) {
    var posX = parseInt(e.pageX) - parseInt($(this).position().left);

    posX = posX - $(this).offset().left; // fixing offset issues
    progressBarClicked(posX);
  });

  $('#audio-player').keypress(function(e) {
    if (e.keyCode == 0 || e.keyCode == 32) {
      console.log('Space pressed');
    }
  });

  setInterval(checkPlayhead,10); //updating function to put playhead in its place
  console.log( "Audio player ready!" );
});


function checkPlayhead() {
  time = myaudio.currentTime;
  dur = myaudio.duration;
  perc = time / dur;

  var totalWidth = $(document.getElementsByClassName("audio-player")).width();
  var playheadLeftDistance = perc * totalWidth;
  // console.log("Now at perc " + perc + " current time = " + time + " duration = " + dur);
  $(document.getElementById("playhead")).css("left", playheadLeftDistance); //move the playhead to the right position

  if (time >= dur) {
    console.log("end of audio");
    reset();
  }

  _time = time;
}

function progressBarClicked(x) {
  var totalWidth = $(document.getElementsByClassName("audio-player")).width();

  var newPerc = x / totalWidth;
  var newTime = newPerc * myaudio.duration;
  // console.log("progressbar has been clicked at pos" + x + " new perc = " + newPerc + " new time = " + newTime);
  if (newTime > 0) {
    myaudio.currentTime = newTime;
  }
}

function reset() {
  $(document.getElementById("playhead")).css("left", "0vw"); //move the playhead to the right position

  playing = false;
  time = 0;
  myaudio.currentTime = time;
  myaudio.pause();
  $(document.getElementById("play-button")).css("background-color", "hsl(200, 40%, 40%)");
} //change playbutton color


function playButtonClicked() {
  playing = !playing;
  console.log("Playing is now: " + playing);
  if (playing) {
    myaudio.play(); //playign the sound
    $(document.getElementById("play-button")).css("background-color", "hsl(200, 90%, 60%)"); //change color

  } else {
    myaudio.pause();
    $(document.getElementById("play-button")).css("background-color", "hsl(200, 40%, 40%)");
  } //change playbutton color
}
