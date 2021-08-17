var SpotifyWebApi = require('spotify-web-api-node');
const express = require('express')

const fs = require('fs');
var path = require('path');
var settingsPath = path.join(__dirname, "settings.json").toString();

module.exports = {
  spotifyApi,
  auothorizeSpotify
}

// This file is copied from: https://github.com/thelinmichael/spotify-web-api-node/blob/master/examples/tutorial/00-get-access-token.js

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
  ];
  
// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: '179baf2322124fa3ad9cf70cc82ed8b2',
    clientSecret: '0073bded3bae40a882cf5065c6091f08',
    redirectUri: 'http://localhost:8888/callback'
  });
  

function auothorizeSpotify(){
    const app = express();
    var loggedIn = false;
  app.get('/login', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
  });

  loggedIn = app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;

    if (error) {
      console.error('Callback Error:', error);
      res.send(`Callback Error: ${error}`);
      return;
    }

    spotifyApi
      .authorizationCodeGrant(code)
      .then(data => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];

        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        console.log('access_token:', access_token);
        console.log('refresh_token:', refresh_token);
        writeSettings("access_token", access_token);
        writeSettings("refresh_token", refresh_token);

        console.log(
          `Sucessfully retreived access token. Expires in ${expires_in} s.`
        );
        res.send('Symphone was successfully authorized! You can now close this window');
        setInterval(async () => {
          let data1 = await spotifyApi.refreshAccessToken();
          let access_token1 = data1.body['access_token'];
          console.log('The access token has been refreshed!');
          console.log('access_token:', access_token1);
          spotifyApi.setAccessToken(access_token1);
        }, expires_in / 2 * 1000);
      })
      .catch(error => {
        console.error('Error getting Tokens:', error);
        res.send(`Error getting Tokens: ${error}`);
      });
      return true
  });

  app.listen(8888, () =>
  console.log(
    'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
  )
);

  return loggedIn;
}


setTimeout(() => { 
  spotifyApi.getMe().then(res => {
    console.log(res);
  });

}, 3000);



function readSettings(setting) {
  let rawdata = fs.readFileSync(path.join(__dirname, "settings.json"));
  let settings = JSON.parse(rawdata);
  return settings[setting];
}

function writeSettings(name, value) {
  const fileName = settingsPath;
  const file = require(fileName);
  file[name] = value;
  fs.writeFileSync(fileName, JSON.stringify(file, null, 2));
}





