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
const yt = require('youtube-search-without-api-key');
const ytdl = require('ytdl-core');



//get Playlist ID
var playlist = "https://open.spotify.com/playlist/2HNyg8hThHjgvlzDah7sHD?si=cf47996a64124e4a";
var playlistID = playlist.split("playlist/")[1].split("?si=")[0];


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
    tracks.push(track);
    let video = track.name + "  " + track.artists[0].name
    console.log(video)

    /**
     * Given a search query, searching on youtube
     * @param {string} search value.
     */
    const videos = await yt.search(video);
    console.log(videos[0]);
    if(videos[0] != undefined)
      ytdl(videos[0].url).pipe(fs.createWriteStream(__dirname + `/music/${track.name.replace("//","")}.mp4`));
  }
  return tracks;
  }
  getPlaylistTracks(playlistID);

  function readSettings(setting) {
    let rawdata = fs.readFileSync(path.join(__dirname, "settings.json"));
    let settings = JSON.parse(rawdata);
    return settings[setting];
  }