const app = require('electron')
const spotdl = require("./getSongs");

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
  if(query.includes("open.spotify.com")){
      //https://open.spotify.com/playlist/0KsB10rOY5rm3XvEychrHi
      let id = query.split("playlist/")[1];
      console.log(id);
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


    document.getElementById("moreoptions").style.left = "59.5%"
    document.getElementById("downbtn").style.left = "72%"
    document.getElementById("moreoptions").style.top = "55%"
    document.getElementById("downbtn").style.top = "55%"
    document.getElementById("moreoptions").disabled = true;

    
    document.getElementById("dirbtn").style.top = "55%";
    document.getElementById("dirbtn").style.left = "30%";

    document.getElementById("downbtn").disabled = true;

  } else if(query.includes("youtube.com")){
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
  } else {
    document.getElementById("searchloader").classList.add("is-active");
    youtube.search(query).then((results) => {
      // Unless you specify a type, it will only return 'video' results
      let videos = results.videos;
      console.log(videos[0].title) 
      return videos[0].id;
    }).then((firstvid) => {
      ytdl.getBasicInfo('http://www.youtube.com/watch?v=' + firstvid).then((info) =>{
        console.log(info);
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
}

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
function moreoptionsHanlder(btn) {
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
  // TODO
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

// {
//   //DOMContentLoaded - it fires when initial HTML document has been completely loaded
//   document.addEventListener('DOMContentLoaded', function () {
//     // querySelector - it returns the element within the document that matches the specified selector
//     var dropdown = document.querySelector('.dropdown');

//     //addEventListener - attaches an event handler to the specified element.
//     dropdown.addEventListener('click', function (event) {

//       //event.stopPropagation() - it stops the bubbling of an event to parent elements, by preventing parent event handlers from being executed
//       event.stopPropagation();

//       //classList.toggle - it toggles between adding and removing a class name from an element
//       dropdown.classList.toggle('is-active');
//     });
//   });

//   function dropdownsel(format, src) {
//     console.log("Selection: " + format);
//     document.getElementById(src).textContent = format;
//     let dir = document.querySelector('#convertdir');
//     let formatselect = document.querySelector('#convertsel');
//     let convertBtn = document.querySelector('#convertBtn');
//     if (dir.value === "" || !formatselect.textContent.localeCompare("Format")) {
//       convertBtn.disabled = true; //button remains disabled
//     } else {
//       convertBtn.disabled = false; //button is enabled
//     }
//   }

//   function convert() {
//     let format = document.getElementById("convertsel").textContent;
//     let dir = document.getElementById("convertdir").value;
//     let installer = __dirname + "\\scripts\\convert.py";
//     let convbtn = document.getElementById("convertBtn");
//     //ffmpeg -i "Imagine Dragons - It's Time.mp3" "Imagine Dragons - It's Time.ogg"

//     convbtn.classList.add("is-loading");
   
//   }

// }




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

// (function () {
//   // Retrieve remote BrowserWindow
//   const {BrowserWindow} = require('electron').remote

//   function init() {
//       // Minimize task
//       document.getElementById("min-btn").addEventListener("click", (e) => {
//           var window = BrowserWindow.getFocusedWindow();
//           window.minimize();
//       });

//       // Close app
//       document.getElementById("close-btn").addEventListener("click", (e) => {
//           var window = BrowserWindow.getFocusedWindow();
//           window.close();
//       });
//   };

//   document.onreadystatechange =  () => {
//       if (document.readyState == "complete") {
//           init();
//       }
//   };
// })();


