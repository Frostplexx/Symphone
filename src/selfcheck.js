

var spawn = require('child_process').spawn;
var installer = __dirname + "\\installer.py"
var progress = document.querySelector("#pyprogress"); 
function selfcheck() {
    let py = spawn("python", ["-h"]);
    progress.classList.add("is-active");
    py.stdout.on('data', function () {
      console.log("python ok!");
      document.getElementById("pythoncheck").textContent = "Installed"
      let spt = spawn("spotify_dl", ["-h"]);
      spt.stdout.on('data', function () {
        console.log("spotify_dl ok!");
        document.getElementById("spotifycheck").textContent = "Installed"
        document.getElementById("delSpotifyBtn").disabled = false; 
        document.getElementById("downSpotifyBtn").disabled = true;
      });
      spt.on('error', function () {
        console.log("spotify_dl not installed!");
        // outtext.textContent += "\n spotify_dl not found! Installing...";
        document.getElementById("downSpotifyBtn").disabled = false; 
        document.getElementById("delSpotifyBtn").disabled = true; 
      });

      let yt = spawn("youtube-dl", ["-h"]);
      yt.stdout.on('data', function () {
        console.log("youtube-dl ok!");
        document.getElementById("youtubecheck").textContent = "Installed"
        document.getElementById("delYoutubeBtn").disabled = false; 
        document.getElementById("downYoutubeBtn").disabled = true; 
      });
      yt.on('error', function () {
        console.log("spotify_dl not installed!");
        // outtext.textContent += "\n spotify_dl not found! Installing...";
        document.getElementById("downYoutubeBtn").disabled = false;
        document.getElementById("delYoutubeBtn").disabled = true; 
      });


      let pip = spawn("pip", ["help"]);
      pip.stdout.on('data', function () {
        document.getElementById("pipcheck").textContent = "Installed"
        console.log("pip ok!");
      });
  
      pip.on('error', function () {
        console.log("pip not installed!");
        outtext.textContent += "\npip could not be found!";
        button.classList.remove("is-loading");
      });
  
    });
    py.on('error', function () {
      console.log('python is not installed!');
      outtext.textContent += "\nPython is not installed!";
      button.classList.remove("is-loading");
    });
  
    py.stderr.on('data', function (data) {
      console.log('stderr: ' + data.toString());
      console.log("\nPython is not installed!")
      outtext.textContent += "\n" + data.toString() + "\n";
      outtext.textContent += "Don't download it from the Microsoft store, but from the official Website. Othewise it wont work!"
    });

    progress.classList.remove("is-active")
  }




function deletespotify(){
    progress.classList.add("is-active");
    console.log(installer);
    let sp = spawn("python", [installer, "uninstall", "spotify_dl"]);

    sp.stdout.on('data', function () {
      console.log(sp);
      console.log("uninstalled");
    });

    sp.on('error', function () {
      console.log("could not uninstall");
    });
    sp.on("exit", function(){
        selfcheck()
    });

}

function downloadspotify(){
    progress.classList.add("is-active");
    let pip = spawn("python", [installer, "install", "spotify_dl"]);
    pip.stdout.on('data', function () {
      console.log("downloaded");
    });

    pip.on('error', function () {
      console.log("could not download");
    });
    pip.on("exit", function(){
        selfcheck()
    });

}

function deleteyoutube(){
    progress.classList.add("is-active");
    let pip = spawn("python", [installer, "uninstall", "youtube-dl"]);
    pip.stdout.on('data', function () {
      console.log("uninstalled");
    });

    pip.on('error', function () {
      console.log("could not uninstall");
    });
    pip.on("exit", function(){
        selfcheck()
    });
}

function downloadyoutube(){
    progress.classList.add("is-active");
    let pip = spawn("python", [installer, "install", "youtube-dl"]);
    pip.stdout.on('data', function () {
      console.log("downloaded");
    });

    pip.on('error', function () {
      console.log("could not download");
    });
    pip.on("exit", function(){
        selfcheck()
    });

}







