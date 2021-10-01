const app = require('electron')
const spotdl = require("./getSongs");
const globals = require('./globals')

//file stuff
const fs = require('fs');
var path = require('path');
var settingsPath = path.join(__dirname, "settings.json").toString();


var SpotifyWebApi = require('spotify-web-api-node');
const ytdl = require('ytdl-core');
const youtube = require('scrape-youtube').default;


const spotifyApi = new SpotifyWebApi({
  clientId: '179baf2322124fa3ad9cf70cc82ed8b2',
  clientSecret: '0073bded3bae40a882cf5065c6091f08',
  redirectUri: 'http://localhost:8888/callback'
});

spotifyApi.setAccessToken(readSettings("access_token"));
spotifyApi.setRefreshToken(readSettings("refresh_token"));


//profile stuff
document.getElementById("username").innerHTML = readSettings("username");
document.getElementById("userprofilepic").src = readSettings("profilepic")

//other vars
var youtubelink = "";

// Coloring

{
  let accentpicker = document.getElementById("accentcolor");
  // accentpicker.value = readSettings("accentcolor");
  document.documentElement.style.setProperty('--accent-color', readSettings("accentcolor"));
  // accentpicker.addEventListener("change", updateColor);
  function updateColor() {
    let accentcolor = accentpicker.value;
    console.log(accentcolor);
    document.documentElement.style.setProperty('--accent-color', accentcolor);
    writeSettings("accentcolor", accentcolor);
    console.log(brightnessByColor(accentcolor));

    if (brightnessByColor(accentcolor) >= 215) {
      document.documentElement.style.setProperty('--text-color', "#000000");
    } else {
      document.documentElement.style.setProperty('--text-color', "#ffffff");
    }
  }

  let darkswitch = document.getElementById("darkswitch");
  // darkswitch.addEventListener("change", darkmode);
  // darkswitch.checked = readSettings("darkmode");

  // if (darkswitch.checked) {
  //   document.documentElement.style.setProperty('--background-color', "#1F2428");
  //   document.documentElement.style.setProperty('--darkmode-secondcolor', "#424242");
  //   document.documentElement.style.setProperty('--darkmode-text-color', "#ebebeb");
  //   document.documentElement.style.setProperty('--hover-color', "#363636");
  //   document.documentElement.style.setProperty('--tab-hover-color', "#ababab");
  // } else {
  //   document.documentElement.style.setProperty('--background-color', "#FFFFFF");
  //   document.documentElement.style.setProperty('--darkmode-secondcolor',"#FFFFFF");
  //   document.documentElement.style.setProperty('--darkmode-text-color', "#4a4a4a");
  //   document.documentElement.style.setProperty('--hover-color', "#f2f2f2");
  //   document.documentElement.style.setProperty('--tab-hover-color', "#919191");
  // }

  function darkmode() {
    // console.log(darkswitch.checked);
    writeSettings("darkmode", darkswitch.checked);
    if (darkswitch.checked) {
      document.documentElement.style.setProperty('--background-color', "#1F2428");
      document.documentElement.style.setProperty('--darkmode-secondcolor', "#424242");
      document.documentElement.style.setProperty('--darkmode-text-color', "#ebebeb");
      document.documentElement.style.setProperty('--hover-color', "#363636");
      document.documentElement.style.setProperty('--tab-hover-color', "#ababab");
    } else {
      document.documentElement.style.setProperty('--background-color', "#FFFFFF");
      document.documentElement.style.setProperty('--darkmode-secondcolor',"#FFFFFF");
      document.documentElement.style.setProperty('--darkmode-text-color', "#4a4a4a");
      document.documentElement.style.setProperty('--hover-color', "#f2f2f2");
      document.documentElement.style.setProperty('--tab-hover-color', "#919191");
    }
  }

  function accentReset() {
    accentpicker.value = "#058eee"
    updateColor();
  }


  /**
 * Calculate brightness value by RGB or HEX color.
 * @param color (String) The color value in RGB or HEX (for example: #000000 || #000 || rgb(0,0,0) || rgba(0,0,0,0))
 * @returns (Number) The brightness value (dark) 0 ... 255 (light)
 */
  function brightnessByColor(color) {
    var color = "" + color, isHEX = color.indexOf("#") == 0, isRGB = color.indexOf("rgb") == 0;
    if (isHEX) {
      const hasFullSpec = color.length == 7;
      var m = color.substr(1).match(hasFullSpec ? /(\S{2})/g : /(\S{1})/g);
      if (m) var r = parseInt(m[0] + (hasFullSpec ? '' : m[0]), 16), g = parseInt(m[1] + (hasFullSpec ? '' : m[1]), 16), b = parseInt(m[2] + (hasFullSpec ? '' : m[2]), 16);
    }
    if (isRGB) {
      var m = color.match(/(\d+){3}/g);
      if (m) var r = m[0], g = m[1], b = m[2];
    }
    if (typeof r != "undefined") return ((r * 299) + (g * 587) + (b * 114)) / 1000;
  }

}


//settings menu handling
function menuswitch(id, parent) {
  let settings = document.querySelectorAll(".maincont");
  settings.forEach(function (setting) {
    setting.classList.remove("is-active");
  });
  let menuitems = document.querySelectorAll(".menu-list a");
  menuitems.forEach(function (menuitem) {
    menuitem.classList.remove("is-active");
  });
  parent.classList.add("is-active");
  document.getElementById(id).classList.add("is-active");
}



//notification delete button
document.addEventListener('DOMContentLoaded', () => {
  (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
    const $notification = $delete.parentNode;
    document.querySelector('#msg').classList.add("is-active");
    $delete.addEventListener('click', () => {
      $notification.parentNode.removeChild($notification);
    });
  });
});


//download button 
function download() {
  const url = document.querySelector('#urlfield').value;
  const dir = document.querySelector('#directory').innerHTML;
  spotdl.downloadSongs(url, dir);
}


document.getElementById("urlfield").addEventListener("change", urlHandler)
function urlHandler(event){
  event.preventDefault();
  let query = document.getElementById("urlfield").value;
  if(query.includes("open.spotify.com/playlist")){
      //https://open.spotify.com/playlist/0KsB10rOY5rm3XvEychrHi
      let id = query.split("playlist/")[1];
      document.getElementById("searchloader").classList.add("is-active");
      spotifyApi.getPlaylist(id).then(res => {
         let json = res.body
         document.getElementById("placeholder").style.display = "none"
         document.getElementById("cover").src = json["images"][0]["url"]
         document.getElementById("title").innerHTML = json["name"]
         document.getElementById("author").innerHTML = "By " + json["owner"]["display_name"] + " • " + json["tracks"]["total"] + " Songs"
         document.getElementById("musicbox").classList.add("is-active");

         document.getElementById("spoticn").classList.remove("fa-youtube");
         document.getElementById("spoticn").classList.add("fa-spotify");
         document.getElementById("spoticn").style.color = "rgb(39,201,77)"
         playAnimation();
        });
  } else if(query === ""){
    document.getElementById("searchloader").classList.remove("is-active");
    document.getElementById("musicbox").classList.remove("is-active")
    document.getElementById("urlfield").style.width = "65%"
    document.getElementById("dirbtn").disabled = true;
    document.getElementById("placeholder").style.display = "block";
    document.getElementById("directory").style.display = "none";
    document.getElementById("searchloader").style.left = "77%";
    globals.deleteMessage();

    document.getElementById("moreoptions").style.left = "59.5%"
    document.getElementById("downbtn").style.left = "72%"
    document.getElementById("moreoptions").style.top = "55%"
    document.getElementById("downbtn").style.top = "55%"
    document.getElementById("moreoptions").disabled = true;

    
    document.getElementById("dirbtn").style.top = "55%";
    document.getElementById("dirbtn").style.left = "30%";

    document.getElementById("downbtn").disabled = true;

  } else if(query.includes("youtube.com") && !query.includes("&list=")){
    document.getElementById("searchloader").classList.add("is-active");
    ytdl.getBasicInfo(query).then((info) =>{
      console.log(info.player_response.videoDetails.thumbnail.thumbnails);
      youtubelink = info.player_response.videoDetails.url;
      document.getElementById("placeholder").style.display = "none"
      document.getElementById("title").innerHTML = info["player_response"]["videoDetails"]["title"]
      document.getElementById("author").innerHTML = "By " + info["player_response"]["videoDetails"]["author"]
      document.getElementById("cover").src = info.player_response.videoDetails.thumbnail.thumbnails[4].url
      document.getElementById("musicbox").classList.add("is-active");
      document.getElementById("spoticn").classList.remove("fa-spotify");
      document.getElementById("spoticn").classList.add("fa-youtube");
      document.getElementById("spoticn").style.color = "rgb(255,0,0)";
      playAnimation()
    });
  } else if (query.includes("open.spotify.com/track")){
    let id = query.split("track/")[1].split("?si=")[0]
    document.getElementById("searchloader").classList.add("is-active");
    spotifyApi.getTrack(id).then(res => {
       let json = res.body
       document.getElementById("placeholder").style.display = "none"
       document.getElementById("cover").src = json["album"]["images"][0]["url"]
       document.getElementById("title").innerHTML = json["name"]
       document.getElementById("author").innerHTML = "By " + json["artists"][0]["name"] + " • " + json["album"]["name"] 
       document.getElementById("musicbox").classList.add("is-active");

       document.getElementById("spoticn").classList.remove("fa-youtube");
       document.getElementById("spoticn").classList.add("fa-spotify");
       document.getElementById("spoticn").style.color = "rgb(39,201,77)"
       playAnimation();
      });

  } else if (query.includes("youtube.com") && query.includes("&list=")){
    document.getElementById("placeholder").style.display = "none"
    document.getElementById("title").innerHTML = "Youtube Playlists"
    document.getElementById("author").innerHTML = "Are currently not Supported"
    document.getElementById("cover").src = "https://i.imgur.com/ibg5c3E.png"
    document.getElementById("musicbox").classList.add("is-active");
    document.getElementById("spoticn").classList.remove("fa-spotify");
    document.getElementById("spoticn").classList.add("fa-youtube");
    document.getElementById("spoticn").style.color = "rgb(255,0,0)";
    playAnimation()
  }else if(!query.includes("https://")){
    document.getElementById("searchloader").classList.add("is-active");
    youtube.search(query).then((results) => {
      // Unless you specify a type, it will only return 'video' results
      let videos = results.videos;
      console.log(videos[0].title) 
      return videos[0].id;
    }).then((firstvid) => {
      ytdl.getBasicInfo('http://www.youtube.com/watch?v=' + firstvid).then((info) =>{
        document.querySelector('#urlfield').value = info.videoDetails.video_url;
        document.getElementById("placeholder").style.display = "none"
        document.getElementById("title").innerHTML = info["player_response"]["videoDetails"]["title"]
        document.getElementById("author").innerHTML = "By " + info["player_response"]["videoDetails"]["author"]
        document.getElementById("cover").src = info.player_response.videoDetails.thumbnail.thumbnails[
          info.player_response.videoDetails.thumbnail.thumbnails.length - 1
        ].url
        document.getElementById("musicbox").classList.add("is-active");
  
        document.getElementById("spoticn").classList.remove("fa-spotify");
        document.getElementById("spoticn").classList.add("fa-youtube");
        document.getElementById("spoticn").style.color = "rgb(255,0,0)";
        playAnimation()
      });

    });
  } else {
    globals.generateMessage("Error", "This URL couldn't be recognized. Please enter a Youtube or Spotify URL", 0)
  }

  setTimeout(function() {
    globals.ColorExtract();
  }, 700);

}

function playAnimation() {
  document.getElementById("urlfield").style.width = "100%";
  document.getElementById("dirbtn").disabled = false;
  document.getElementById("directory").style.display = "block";
  document.getElementById("searchloader").style.left = "94%";
  //downloads an moreoptions buttons animation
  document.getElementById("moreoptions").style.left = " 75.5%";
  document.getElementById("downbtn").style.left = "88%";
  document.getElementById("moreoptions").style.top = "63%";
  document.getElementById("downbtn").style.top = "63%";
  document.getElementById("moreoptions").disabled = false;

  //directory button animation
  document.getElementById("dirbtn").style.top = "63%";
  document.getElementById("dirbtn").style.left = "14%";

  document.getElementById("searchloader").classList.remove("is-active");
}


document.getElementById("moreoptions").addEventListener("click",moreoptionsHanlder)
function moreoptionsHanlder() {
  let optbtn = document.getElementById("moreoptions")
  let box = document.getElementById("moreoptionsbox")
  if(!optbtn.classList.contains("is-cancel")){
    if (box.classList.contains("is-active")){
      box.classList.remove("is-active");
    } else {
      box.classList.add("is-active");
      //convert to mp3 button
      let btn = document.getElementById("converttomp3");
      btn.checked = readSettings("convetToMp3");
      btn.addEventListener("click", () => {
        writeSettings("convetToMp3", btn.checked);
      })
  
      //new folder button
      let btn2 = document.getElementById("saveinnewfolder");
      btn2.checked = readSettings("saveInNewFolder");
      btn2.addEventListener("click", () => {
        writeSettings("saveInNewFolder", btn2.checked);
      })
    }
  }
}

//browse button functionality
async function browse(fieldid) {
  const {dialog} = require('electron').remote;
  let filepath = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  let dir = document.getElementById(fieldid);
  if (filepath.filePaths[0] !== undefined) {
    dir.innerHTML = filepath.filePaths[0];
  }
  document.getElementById("downbtn").disabled = false;
}

//enable/disable download button
{
  let url = document.querySelector('#urlfield');
  let dir = document.querySelector('#dirfield');
  let downbtn = document.querySelector("#downloadBtn");
  // url.addEventListener("change", statedownloadHandle);
  // dir.addEventListener("change", statedownloadHandle);

  // downbtn.disabled = true; //setting button state to disabled
  function statedownloadHandle() {
    if (dir.value === "" || url.value === "") {
      downbtn.disabled = true; //button remains disabled
    } else {
      downbtn.disabled = false; //button is enabled
    }
  }


}

{
  let dir = document.querySelector('#convertdir');
  let formatselect = document.querySelector('#convertsel');
  let convertBtn = document.querySelector('#convertBtn');
  // dir.addEventListener("change", stateconvertHandle);
  // formatselect.addEventListener("change", stateconvertHandle);

  // convertBtn.disabled = true; //setting button state to disabled
  
  function stateconvertHandle() {
    if (dir.value === "" || !formatselect.textContent.localeCompare("Format")) {
      convertBtn.disabled = true; //button remains disabled
    } else {
      convertBtn.disabled = false; //button is enabled
    }
  }

}



//dorpdown and converter

//ffmpeg
var ffmpeg = require('fluent-ffmpeg');
var ffmpegstatic = require('ffmpeg-static-electron');
ffmpeg.setFfmpegPath(ffmpegstatic.path);

var files = ""
document.getElementById('convdirectory').addEventListener("DOMSubtreeModified", () => {
  let directory = document.getElementById('convdirectory').innerHTML
  console.log(directory)
  files = fs.readdirSync(directory)
  files = files.filter(file => {
    return path.extname(file).toLowerCase() === ".mp3"
  })
  if(files.length > 0){
    document.getElementById("buttongroup").style.top = "6.5rem";
    document.getElementById("filescontainer").style.height = "70%"
    document.getElementById("filescontainer").style.opacity = "100%";
    document.getElementById("filescontainer").style.top = "10.5rem";
    for(let file in files) {
      createSong(files[file])
    }
  } else {
    let elem = document.querySelector(".songitem");
    if(elem != null) elem.remove();
    
  }
})

document.getElementById("convbtn").addEventListener("click", () => {
  for(let file of files) {
    var proc = new ffmpeg({ source: path.join( document.getElementById('convdirectory').innerHTML, file) })
    .saveToFile(path.join(document.getElementById('convdirectory').innerHTML, file.split(".")[0] + ".mp4"), function(stdout, stderr) {
      console.log('file has been converted succesfully');
    });
  }
  
})

function createSong(songname){
  //song item settings
  let itemcont = document.createElement("div")
  let title = document.createElement("h1"); 
  let icon = document.createElement("img")

  icon.src = "https://i.imgur.com/tbHeHBR.png";
  icon.style.height = "32px"
  icon.style.width = "32px"
  icon.style.filter = "invert(24%) sepia(88%) saturate(3818%) hue-rotate(211deg) brightness(103%) contrast(107%) opacity(60%)"
  icon.style.position = "absolute"


  title.style.fontWeight = "500"
  title.style.marginLeft = "50px"
  title.style.maxWidth = "400px";
  title.style.whiteSpace = "nowrap";
  title.style.overflow = "hidden";
  title.style.textOverflow = "ellipsis";
  title.style.position = "absolute"
  title.style.textAlign = "center"
  title.innerHTML = songname

  itemcont.classList.add("block")
  itemcont.classList.add("songitem")
  itemcont.style.backgroundColor = "rgba(0,0,0,0.05)"
  itemcont.style.borderRadius = "5px"
  itemcont.style.width = "100%"
  itemcont.style.height = "65px"
  itemcont.style.marginBottom = "0.5rem" 
  itemcont.style.paddingTop = "1rem"
  itemcont.style.paddingLeft = "1rem"
  itemcont.appendChild(icon)
  itemcont.appendChild(title);

  document.getElementById("filescontainer").appendChild(itemcont)

}

function fetchProfile(){
  let profilepic = document.getElementById("profilepic");
  let profilename = document.getElementById("profilename");

  profilepic.src = readSettings("profilepic");
  profilename.innerHTML = readSettings("username");
}


var msgqueue = {
  items: [

  ]
}

var types = [
  "is-danger",
  "is-warning", 
  "is-success", 
  "is-info", 
  "is-primary",
  "is-link"
]

//helperfunctions


// console.log(settingsPath);

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


//minimise and close when running on Windows
if(process.platform === "win32") {
  document.getElementById("window-controls").style.display = "grid";
}
(function () {
  // Retrieve remote BrowserWindow
  const {BrowserWindow} = require('electron').remote

  function init() {
      // Minimize task
      document.getElementById("min-button").addEventListener("click", (e) => {
          var window = BrowserWindow.getFocusedWindow();
          window.minimize();
      });

      // Close app
      document.getElementById("close-button").addEventListener("click", (e) => {
          var window = BrowserWindow.getFocusedWindow();
          window.close();
      });
  }

  document.onreadystatechange =  () => {
      if (document.readyState == "complete") {
          init();
      }
  };
})();


