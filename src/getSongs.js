const fs = require('fs')
var path = require('path');


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

module.exports = {
  downloadSongs
}


function downloadSongs(playlist, dir){
  // //get Playlist ID
  let playlistID = playlist.split("playlist/")[1].split("?si=")[0];
  getPlaylistTracks(playlistID, dir);
}



//GET SONGS FROM PLAYLIST
async function getPlaylistTracks(playlistId, dir) {
  const data = await spotifyApi.getPlaylistTracks(playlistId, {
    offset: 0,
    limit: 100,
    fields: 'items'
  })
  let tracks = [];
  for (let track_obj of data.body.items) {
    const track = track_obj.track
    tracks.push(track);
    let video = track.artists[0].name + " - " + track.name
    console.log(video)

    youtube.search(video).then((results) => {
      // Unless you specify a type, it will only return 'video' results
      let videos = results.videos;
      console.log(videos[0].title) 
      return videos[0].id;
    }).then((firstvid) => {
       //download it
       var downpath = path.join(dir, `/${track.name.replace("//", "")}.mp4`)
    try {
      var y = ytdl('http://www.youtube.com/watch?v=' + firstvid).pipe(fs.createWriteStream(downpath));
    } catch (error) {
      console.log(error);
    }
    //when the download finishes convert the file and delete the old one
    y.on("finish", function(){
      ffmpeg(downpath)
      .toFormat('mp3')
      .on('error', (err) => {
          console.log('An error occurred: ' + err.message);
      })
      .on('progress', (progress) => {
          console.log('Processing: ' + progress.targetSize + ' KB converted');
      })
      .on('end', () => {
          console.log('Processing finished !');
          //delete old file
          fs.unlinkSync(downpath);
      })
      .save(path.join(dir, `/r${track.name.replace("//", "")}.mp3`));//path where you want to save your file
    });
    });
   
  }
  return tracks;
  }

  function readSettings(setting) {
    let rawdata = fs.readFileSync(path.join(__dirname, "settings.json"));
    let settings = JSON.parse(rawdata);
    return settings[setting];
  }



  