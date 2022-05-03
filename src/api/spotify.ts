//spotify stuff
const { session } = require('electron');



//spoitfy login handling and stuff
var scopes = [
  "user-read-private",
  "user-read-email"
],
  redirectUri = 'http://localhost:8888/callback',
  clientId = '77431d7e304f4659adf1db5d1f676035',
  showDialog = false,
  state = 'axz_djt8rja-rau4HTE',
  responseType = 'token',
  response = {};

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId
});

// Create the authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(
  scopes,
  state,
  showDialog,
  responseType
);

authorizeSpotify();

function authorizeSpotify(){

  // Prepare to filter only the callbacks for my redirectUri
  const filter = {
    urls: [redirectUri + '*']
  };

  var authWindow = new BrowserWindow({
    width: 800, 
    height: 600, 
    show: false, 
    'node-integration': false,
    'web-security': false
  });
  authWindow.show()
  // intercept all the requests for that includes my redirect uri -> parses token etc into response variable
  session.defaultSession.webRequest.onBeforeRequest(filter, function (details, callback) {
    authWindow.hide()
    let url = details.url;
    // process the callback url and get any param you need
    url = url.replace(redirectUri + "#", "")
    url = url.split("&");
    response = {
      "access_token": url[0].split("=")[1],
      "token_type": url[1].split("=")[1],
      "expires_in": url[2].split("=")[1],
      "state": url[3].split("=")[1],
    }

    //set access token
    spotifyApi.setAccessToken(response["access_token"]);

    //profile
    spotifyApi.getMe().then(me => {
      document.getElementById("userprofilepic").src = me.body["images"][0]["url"]
      document.getElementById("username").innerHTML = me.body["display_name"]
    }); 

    setInterval(async () => {
      authorizeSpotify();
    }, response["expires_in"] / 2 * 1000);

    // don't forget to let the request proceed
    callback({
      cancel: false
    });
  });

  authWindow.loadURL(authorizeURL);

}