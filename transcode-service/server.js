/*
 * Iona Realtime Transcoding Service
 * Part of the Iona System Software
 * (c) 2017 DolphinBox
 */  
var http = require("http");
var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
const getDuration = require('get-video-duration');

//Express
const express = require('express');
const app = express();

app.use(express.static(__dirname + '/ionaPlayer'));

app.get('/', function(req, res) {
  res.send('index.html');
});

app.get('/video/:filename/:time', function(request, response) {
    
   var stat = fs.statSync(request.params.filename);
   console.log('Content size:' +  stat.size);
   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   response.writeHead(200, {
        'Content-Type': 'video/webm',
        'Content-Length': stat.size
   });
   console.log(request.params.filename);
   console.log(request.params.time);
   // Send the response body as "Hello World"
   //response.end('Hello World\n');
     var proc = ffmpeg(request.params.filename)
    .format('webm')
    .size('1920x?')
    .videoBitrate('0')
    .videoCodec('libvpx-vp9')
    .fps(30)
    .audioCodec('libopus')
    .audioQuality(0)
    .audioBitrate('64k')
    .seekInput(request.params.time)
    .addOptions(['-threads 8', '-tile-columns 6', '-frame-parallel 1', '-crf 33', '-speed 5', '-quality realtime'])
    // setup event handlers6666
    .on('end', function() {
      console.log('file has been converted succesfully');
    })
    .on('error', function(err) {
      console.log('an error happened: ' + err.message);
    })
    // save to stream
    .pipe(response, { end: true });
})
app.get('/videometa/:filename', function(request, response) {
  //return video metadata (duration, type, etc). Probably should generate actual JSON, not hardcode it xD 


  getDuration(request.params.filename).then((duration) => {
    console.log(duration);
    response.send('{"duration":' + duration + '}')
  });
});
/*
app.get('/', function (req, res) {
  res.send('Iona Realtime Transcoding Service. Invalid Request.')
})
*/
app.listen(8081, function () {
  console.log('Iona Realtime Transcoding Service listening on port 8081.')
})