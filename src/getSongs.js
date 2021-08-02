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
const usetube = require('usetube')
const ytdl = require('ytdl-core');

//get Playlist ID
var playlist = "https://open.spotify.com/playlist/2HNyg8hThHjgvlzDah7sHD?si=883761e844cf4da7";
var playlistID = playlist.split("playlist/")[1].split("?si=")[0];

//ffmpeg
var ffmpeg = require('fluent-ffmpeg');
const { resolve } = require('path');

//GET SONGS FROM PLAYLIST
async function getPlaylistTracks(playlistId) {
  const data = await spotifyApi.getPlaylistTracks(playlistId, {
    offset: 0,
    limit: 100,
    fields: 'items'
  })
  let tracks = [];
  for (let track_obj of data.body.items) {
    const track = track_obj.track
    let dir = path.join(__dirname + `/music/${track.name.replace("//", "")}.mp4`);
    tracks.push(track);
    let video = track.artists[0].name + " - " + track.name
    console.log(video)

    //search video
    let videos = await usetube.searchVideo(video);
    //download it
    var y = ytdl('http://www.youtube.com/watch?v=' + videos.videos[0].id).pipe(fs.createWriteStream(dir));

    //when the download finishes convert the file and delete the old one
    y.on("close", function(){
      ffmpeg(dir)
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
          fs.unlinkSync(dir);
      })
      .save(__dirname + `/music/${track.name}.mp3`);//path where you want to save your file
    });
  }
  return tracks;
  }
  getPlaylistTracks(playlistID);



  function readSettings(setting) {
    let rawdata = fs.readFileSync(path.join(__dirname, "settings.json"));
    let settings = JSON.parse(rawdata);
    return settings[setting];
  }