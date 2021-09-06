const fs = require('fs')
var path = require('path');
const readline = require('readline');


//Spotify API stuff
const SpotifyWebApi = require('spotify-web-api-node');
const token = readSettings("access_token");
const refreshToken = readSettings("refresh_token");
const spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(token);
spotifyApi.setRefreshToken(refreshToken);

//Youtube Search stuff
const ytdl = require('ytdl-core');
const youtube = require('scrape-youtube').default;

//ffmpeg
var ffmpeg = require('fluent-ffmpeg');
var ffmpegstatic = require('ffmpeg-static-electron');
ffmpeg.setFfmpegPath(ffmpegstatic.path);

//html and other elements
var currentsongui = document.getElementById("currentdownloadedsong")
var loadingbar = document.getElementById("loadingbar")
let timeestimate = document.getElementById("timeestimate");
var downpath = ""
var starttime = ""
var cancel = false

module.exports = {
  downloadSongs
}

document.getElementById("moreoptions").addEventListener("click",() => {
  if(document.getElementById("moreoptions").classList.contains("is-cancel")){
    cancel = true;
    console.log(cancel);
  }
})

function downloadSongs(playlist, dir){
  // //get Playlist ID
  document.getElementById("downbtn").classList.add("is-loading")
  if (playlist.includes("open.spotify")) {
    let playlistID = playlist.split("playlist/")[1].split("?si=")[0];
    getPlaylistTracks(playlistID, dir)
  } else {
    downloadYoutube(playlist, dir)
  }
}


//download songs from spotify playlist
async function getPlaylistTracks(playlistId, dir) {
  const data = await spotifyApi.getPlaylistTracks(playlistId, {
    offset: 0,
    fields: 'items'
  })
  let tracks = [];
  let stream = "";
  cancelButton(true);

  for (let track_obj of data.body.items) {
    const track = track_obj.track
    tracks.push(track.artists[0].name + " - " + track.name)
  }
  let conv = readSettings("convetToMp3");
  loadingbar.style.display = "block"
  currentsongui.style.display = "block";
  timeestimate.style.display = "block"
  loadingbar.value = 0;

    for (const song of tracks) {
      if(!cancel){
        console.log("I am at start of loop")
        let firstvid = await youtube.search(song).then((results) => {
          // Unless you specify a type, it will only return 'video' results
          let videos = results.videos;
          // console.log(videos[0].title) 
          return videos[0].id;
        })
        let title = song
        .replaceAll("(","")
        .replaceAll(")", "")
        .replaceAll("Official", "")
        .replaceAll("Video", "")
        .replaceAll("Remastered","")
        .replaceAll("[","")
        .replaceAll("]","")
        .replaceAll("lyrics","")
        .replaceAll("with","")
        .replaceAll("//", "")
        .replaceAll("/","")
        .trim()
        if(conv){
          downpath = path.join(dir, `/${title}.mp3`)
          stream = ytdl(firstvid, {
            quality: 'highestaudio',
          });
        } else {
          downpath = path.join(dir, `/${title}.mp4`)
          stream = ytdl(firstvid, {
          });
        }
        currentsongui.innerHTML =  "(" + (tracks.indexOf(song) + 1) + "/" + tracks.length + ") " + song;
        loadingbar.max = tracks.length;
    
        stream.once("response", () => {
          starttime = Date.now();
        })
        stream.on('progress', (chunkLength, downloaded, total) => {
          const percent = downloaded / total;
          const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
          const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
          timeestimate.innerHTML = (`${(downloaded / 1024 / 1024).toFixed(2)}MB / ${(total / 1024 / 1024).toFixed(2)}MB | Time left: ${estimatedDownloadTime.toFixed(2)} Minutes `).toString();
          loadingbar.value = tracks.indexOf(song) + percent
        });
        try {
          await downloadSong(stream, title.split("-")[1], title.split("-")[0])
        } catch (error) {
          //TODO something
        }
        // loadingbar.value += 1
      } else {
        break;
      }
  }

document.getElementById("downbtn").classList.remove("is-loading");
loadingbar.style.display = "none"
currentsongui.style.display = "none";
currentsongui.innerHTML = "Loading...";
timeestimate.innerHTML = "(0MB/0MB) | Time left: 0.00 Minutes"
timeestimate.style.display = "none"
cancelButton(false);
}


//download songs from youtube video
async function downloadYoutube(url, dir){
  let stream = "";
  let title = document.getElementById("title").innerHTML
    .replaceAll("(","")
    .replaceAll(")", "")
    .replaceAll("Official", "")
    .replaceAll("Video", "")
    .replaceAll("Remastered","")
    .replaceAll("[","")
    .replaceAll("]","")
    .replaceAll("lyrics","")
    .replaceAll("with","")
    .replaceAll("//", "")
    .replaceAll("/","")
    .trim()
    cancelButton(true)
    loadingbar.style.display = "block"
    currentsongui.style.display = "block";
    timeestimate.style.display = "block"
    loadingbar.value = 0;
   //download it
   if(readSettings("convetToMp3")){
     downpath = path.join(dir, `${title}.mp3`)
     stream = ytdl(url, {
       quality: 'highestaudio',
     });
   } else {
     downpath = path.join(dir, `${title}.mp4`)
     stream = ytdl(url, {
     });
   }

   currentsongui.innerHTML =  title;

   stream.once("response", () => {
     starttime = Date.now();
     loadingbar.max = 100
   })
   stream.on('progress', (chunkLength, downloaded, total) => {
     const percent = downloaded / total;
     const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
     const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
     readline.cursorTo(process.stdout, 0);
     timeestimate.innerHTML = (`${(downloaded / 1024 / 1024).toFixed(2)}MB / ${(total / 1024 / 1024).toFixed(2)}MB | Time left: ${estimatedDownloadTime.toFixed(2)} Minutes `).toString();
     readline.moveCursor(process.stdout, 0, -1);
     loadingbar.value = ((percent * 100).toFixed(2));
   });

   try {
    await downloadSong(stream, title.split("-")[1], title.split("-")[0])
   } catch (error) {
     
   }

   document.getElementById("downbtn").classList.remove("is-loading");
   loadingbar.style.display = "none"
   currentsongui.style.display = "none";
   currentsongui.innerHTML = "Loading...";
   timeestimate.innerHTML = "(0MB/0MB) | Time left: 0.00 Minutes"
   timeestimate.style.display = "none"
   cancelButton(false)
   cancel = false;
}


function downloadSong(stream, title, author) {
  return new Promise((resolve, reject) => {
      let process = ffmpeg(stream)
      .audioBitrate(128)
      .outputOptions('-metadata', `title=${title}`)
      .outputOptions('-metadata', `artist=${author}`)
      .save(`${downpath}`)
      .on("progress", () => {
        if(cancel){
          console.log("stopping ffmpeg")
          process.kill('SIGINT')
        }
      })
      .on("end", () => {
        resolve();
      }).on('error',(err)=>{
        return reject(new Error(err))
     })
    
  })
}

function cancelButton(activated){
  let btn = document.getElementById("moreoptions")
  let icon = document.getElementById("moreopticon")
  if (activated) {
    cancel = false
    btn.classList.remove("is-primary")
    btn.classList.add("is-danger")
    btn.classList.add("is-outlined")
    icon.classList.remove("fa-cog")
    icon.classList.add("fa-times-circle")
    btn.classList.add("is-cancel")
  } else {
    btn.classList.add("is-primary")
    btn.classList.remove("is-danger")
    btn.classList.remove("is-outlined")
    icon.classList.add("fa-cog")
    icon.classList.remove("fa-times-circle")
    btn.classList.remove("is-cancel")
  }
}


function readSettings(setting) {
  let rawdata = fs.readFileSync(path.join(__dirname, "settings.json"));
  let settings = JSON.parse(rawdata);
  return settings[setting];
}
