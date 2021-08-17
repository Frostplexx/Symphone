const app = require('electron')
const spotdl = require("./getSongs");
const fs = require('fs');
var path = require('path');
var settingsPath = path.join(__dirname, "settings.json").toString();

//spotify_dl -l https://open.spotify.com/playlist/67JwlxPSFU2Qhx48xUFPLY -o C:\Users\danie\Music
//"spotify_dl -l " + val +" -o C:\\Users\\danie\\Music"
var outtext = document.getElementById("outtext");
var convouttext = document.getElementById("convouttext");

const getToken = require("./getToken");

process.env.SPOTIPY_CLIENT_SECRET = readSettings("clientsecret");
process.env.SPOTIPY_CLIENT_ID = readSettings("clientid");

process.env.Path += ";"+ __dirname;


// Coloring

{
  let accentpicker = document.getElementById("accentcolor");
  accentpicker.value = readSettings("accentcolor");
  document.documentElement.style.setProperty('--accent-color', readSettings("accentcolor"));
  accentpicker.addEventListener("change", updateColor);
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
  darkswitch.addEventListener("change", darkmode);
  darkswitch.checked = readSettings("darkmode");

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


//Spotify API key checks and stuff
{
  let clientid = document.getElementById("clientid");
  let clientsecret = document.getElementById("clientsecret");
  setTimeout(() => { update(); }, 500);

  if (clientid.value === "" && clientsecret.value === "") {
    clientid.value = readSettings("clientid");
    clientsecret.value = readSettings("clientsecret");
  } else {
    writeSettings("clientid", clientid.value);
    writeSettings("clientsecret", clientsecret.value)
  }

  clientid.addEventListener("change", update);
  clientsecret.addEventListener("change", update);

  function update() {
    if(clientid.value != "" && clientsecret.value != ""){
      writeSettings("clientid", clientid.value.replace(/\s/g, ''));
      writeSettings("clientsecret", clientsecret.value.replace(/\s/g, ''))
    }

    process.env.SPOTIPY_CLIENT_SECRET = clientsecret.value.replace(/\s/g, '');
    process.env.SPOTIPY_CLIENT_ID = clientid.value.replace(/\s/g, '');
    const msg = document.querySelector('#msg');
    if (process.env.SPOTIPY_CLIENT_ID == "" || process.env.SPOTIPY_CLIENT_SECRET == ""){
      console.log("no ID and Secret")
      msg.classList.add('is-active');
      console.log(process.env.SPOTIPY_CLIENT_ID)
      console.log(process.env.SPOTIPY_CLIENT_SECRET)
    } else {
      console.log("id and scecret found!")
      msg.classList.remove('is-active');
    }

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
  const dir = document.querySelector('#dirfield').value;
  spotdl.downloadSongs(url, dir);
  // console.log(source);
  outtext.textContent = " "; 
  // console.log(url);


  
}



//convert to mp3 button
{
  let btn = document.querySelector("#convettomp3");
  btn.checked = readSettings("convetToMp3");
  btn.addEventListener("click", () => {
    writeSettings("convetToMp3", btn.checked)
  })
}


//clear output button
function clsmsg() {
  outtext.textContent = " ";
}



//browse button functionality
async function browse(fieldid) {
  const dialog = require('electron').remote.dialog;
  let filepath = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  let dir = document.getElementById(fieldid);
  if (filepath.filePaths[0] !== undefined) {
    dir.value = filepath.filePaths[0];
  }
  // TODO
  // stateconvertHandle();
  // statedownloadHandle(); 

  let downbtn = document.querySelector("#downloadBtn");
  downbtn.disabled = false
}

//enable/disable download button
{
  let url = document.querySelector('#urlfield');
  let dir = document.querySelector('#dirfield');
  let downbtn = document.querySelector("#downloadBtn");
  url.addEventListener("change", statedownloadHandle);
  dir.addEventListener("change", statedownloadHandle);

  downbtn.disabled = true; //setting button state to disabled
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
  dir.addEventListener("change", stateconvertHandle);
  formatselect.addEventListener("change", stateconvertHandle);

  convertBtn.disabled = true; //setting button state to disabled
  
  function stateconvertHandle() {
    if (dir.value === "" || !formatselect.textContent.localeCompare("Format")) {
      convertBtn.disabled = true; //button remains disabled
    } else {
      convertBtn.disabled = false; //button is enabled
    }
  }

}



//dorpdown and converter

{
  //DOMContentLoaded - it fires when initial HTML document has been completely loaded
  document.addEventListener('DOMContentLoaded', function () {
    // querySelector - it returns the element within the document that matches the specified selector
    var dropdown = document.querySelector('.dropdown');

    //addEventListener - attaches an event handler to the specified element.
    dropdown.addEventListener('click', function (event) {

      //event.stopPropagation() - it stops the bubbling of an event to parent elements, by preventing parent event handlers from being executed
      event.stopPropagation();

      //classList.toggle - it toggles between adding and removing a class name from an element
      dropdown.classList.toggle('is-active');
    });
  });

  function dropdownsel(format, src) {
    console.log("Selection: " + format);
    document.getElementById(src).textContent = format;
    let dir = document.querySelector('#convertdir');
    let formatselect = document.querySelector('#convertsel');
    let convertBtn = document.querySelector('#convertBtn');
    if (dir.value === "" || !formatselect.textContent.localeCompare("Format")) {
      convertBtn.disabled = true; //button remains disabled
    } else {
      convertBtn.disabled = false; //button is enabled
    }
  }

  function convert() {
    let format = document.getElementById("convertsel").textContent;
    let dir = document.getElementById("convertdir").value;
    let installer = __dirname + "\\scripts\\convert.py";
    let convbtn = document.getElementById("convertBtn");
    //ffmpeg -i "Imagine Dragons - It's Time.mp3" "Imagine Dragons - It's Time.ogg"

    convbtn.classList.add("is-loading");
   
  }

}




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


(function () {
  // Retrieve remote BrowserWindow
  const {BrowserWindow} = require('electron').remote

  function init() {
      // Minimize task
      document.getElementById("min-btn").addEventListener("click", (e) => {
          var window = BrowserWindow.getFocusedWindow();
          window.minimize();
      });

      // Close app
      document.getElementById("close-btn").addEventListener("click", (e) => {
          var window = BrowserWindow.getFocusedWindow();
          window.close();
      });
  };

  document.onreadystatechange =  () => {
      if (document.readyState == "complete") {
          init();
      }
  };
})();


document.getElementById("splash").classList.remove("is-active");