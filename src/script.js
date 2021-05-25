const fs = require('fs');
const app = require('electron')


var path = require('path');
var settingsPath = path.join(__dirname, "settings.json").toString();

//spotify_dl -l https://open.spotify.com/playlist/67JwlxPSFU2Qhx48xUFPLY -o C:\Users\danie\Music
//"spotify_dl -l " + val +" -o C:\\Users\\danie\\Music"
var outtext = document.getElementById("outtext");
var button = document.getElementById('downloadBtn');


process.env.SPOTIPY_CLIENT_SECRET = readSettings("clientsecret");
process.env.SPOTIPY_CLIENT_ID = readSettings("clientid");


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
    console.log(darkswitch.checked);
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



//tab handling
let tabsWithContent = (function () {
  let tabs = document.querySelectorAll('.tabs li');
  let tabsContent = document.querySelectorAll('.tabcontent');

  let deactvateAllTabs = function () {
    tabs.forEach(function (tab) {
      tab.classList.remove('is-active');
    });
  };

  let hideTabsContent = function () {
    tabsContent.forEach(function (tabContent) {
      tabContent.classList.remove('is-active');
    });
  };

  let activateTabsContent = function (tab) {
    tabsContent[getIndex(tab)].classList.add('is-active');
  };

  let getIndex = function (el) {
    return [...el.parentElement.children].indexOf(el);
  };

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      deactvateAllTabs();
      hideTabsContent();
      tab.classList.add('is-active');
      activateTabsContent(tab);
    });
  })

  tabs[0].click();
})();


//settings menu handling
function menuswitch(id, parent) {
  let settings = document.querySelectorAll(".settingsContent");
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





//download button 
function download() {
  const url = document.querySelector('#urlfield').value;
  const dir = document.querySelector('#dirfield').value;
  
  let source = url.split(".")[1];
  console.log(source);
  // outtext.textContent = " "; 
  console.log(url);
  button.classList.add("is-loading")


  if(source.localeCompare("youtube")){
    console.log("Source Youtube");
    let spawn = require('child_process').spawn,
    sp = spawn("spotify_dl", ["-l", url, "-o", dir]);
    console.log(sp)

    sp.stdout.on('data', function (data) {
      console.log('stdout: ' + data.toString());
      outtext.textContent += data.toString() + "\n";
    });

    sp.stderr.on('data', function (data) {
      console.log('stderr: ' + data.toString());
      outtext.textContent += data.toString() + "\n";
    });

    sp.on('exit', function (code) {
      var excode = code.toString();
      console.log('child process exited with code ' + excode);
      button.classList.remove("is-loading");
      switch (parseInt(excode)) {
        case 1:
          console.log("Finished with error!");
          outtext.textContent += "Finished with errorcode: " + excode
          break;

        case 0:
          console.log("No Errors");
          outtext.textContent += "Finished!"
          break;
        default:
          console.log(excode);
          break;
      }
    });

    sp.on('error', function (err) {
      console.log('Oh nyo?!?! You caused an ewwow!!11 pwease stop *looks at you* ' + err);
      outtext.textContent += err;
      button.classList.remove("is-loading");
    });
  } else if(source.localeCompare("spotify")){
    console.log("Source Youtube");

    let spawn = require('child_process').spawn,
    yt = spawn("youtube-dl",[ "--extract-audio", "--audio-format", "mp3", "-o", dir + '\\%(title)s.%(ext)s', url]);
    console.log(yt)

    yt.stdout.on('data', function (data) {
      console.log('stdout: ' + data.toString());
      outtext.textContent += data.toString() + "\n";
    });

    yt.stderr.on('data', function (data) {
      console.log('stderr: ' + data.toString());
      outtext.textContent += data.toString() + "\n";
    });

    yt.on('exit', function (code) {
      var excode = code.toString();
      console.log('child process exited with code ' + excode);
      button.classList.remove("is-loading");
      switch (parseInt(excode)) {
        case 1:
          console.log("Finished with error!");
          outtext.textContent += "Finished with errorcode: " + excode
          break;

        case 0:
          console.log("No Errors");
          outtext.textContent += "Finished!"
          break;
        default:
          console.log(excode);
          break;
      }
    });

    yt.on('error', function (err) {
      console.log('Oh nyo?!?! You caused an ewwow!!11 pwease stop *looks at you* ' + err);
      outtext.textContent += err;
      button.classList.remove("is-loading");
    });
  }
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
  stateconvertHandle();
  statedownloadHandle(); 
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


//Spotify API key checks and stuff
{
  if (process.env.SPOTIPY_CLIENT_ID == "" || process.env.SPOTIPY_CLIENT_SECRET == "") {
    const msg = document.querySelector('#msg');
    console.log("no ID and Secret")
    msg.classList.add('is-active');
  } else {
    console.log("id and scecret found!")
  }

  let clientid = document.getElementById("clientid");
  let clientsecret = document.getElementById("clientsecret");

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
    writeSettings("clientid", clientid.value.replace(/\s/g, ''));
    writeSettings("clientsecret", clientsecret.value.replace(/\s/g, ''))

    process.env.SPOTIPY_CLIENT_SECRET = clientsecret.value.replace(/\s/g, '');
    process.env.SPOTIPY_CLIENT_ID = clientid.value.replace(/\s/g, '');

    if (process.env.SPOTIPY_CLIENT_ID == undefined || process.env.SPOTIPY_CLIENT_SECRET == undefined) {
      const msg = document.querySelector('#msg');
      console.log("no ID and Secret")
      msg.classList.add('is-active');
    } else {
      console.log("id and scecret found!")
      msg.classList.remove('is-active');
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

  }

  function convert() {
    let format = document.getElementById("convertsel").textContent;
    //ffmpeg -i "Imagine Dragons - It's Time.mp3" "Imagine Dragons - It's Time.ogg"

    outsong = songname.split(".")
    outsong[0] + format;
    let spawn = require('child_process').spawn,
      conv = spawn("ffmpeg", ["-i", songname, outsong,]);
    console.log(sp)

    conv.stdout.on('data', function (data) {
      console.log('stdout: ' + data.toString());
      outtext.textContent += data.toString() + "\n";
    });

    conv.stderr.on('data', function (data) {
      console.log('stderr: ' + data.toString());
      outtext.textContent += data.toString() + "\n";
    });

    conv.on('exit', function (code) {
      var excode = code.toString();
      console.log('child process exited with code ' + excode);
      button.classList.remove("is-loading");
      switch (parseInt(excode)) {
        case 1:
          console.log("Finished with error!");
          outtext.textContent += "Finished with errorcode: " + excode
          break;

        case 0:
          console.log("No Errors");
          outtext.textContent += "Finished!"
          break;
        default:
          console.log(excode);
          break;
      }
    });

    conv.on('error', function (err) {
      console.log('Oh nyo?!?! You caused an ewwow!!11 pwease stop *looks at you* ' + err);
      outtext.textContent += err;
      button.classList.remove("is-loading");
  
    });

  }

}

//helperfunctions



console.log(settingsPath);

function readSettings(setting) {
  let rawdata = fs.readFileSync(__dirname + "\\settings.json");
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

      // // Maximize window
      // document.getElementById("max-btn").addEventListener("click", (e) => {
      //     var window = BrowserWindow.getFocusedWindow();
      //     if(window.isMaximized()){
      //         window.unmaximize();
      //     }else{
      //         window.maximize();
      //     }
      // });

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