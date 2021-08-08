

var spawn = require('child_process').spawn;
var installer = __dirname + "\\scripts\\installer.py"
var progress = document.querySelector("#pyprogress"); 
progress.classList.add("is-active");
function selfcheck() {
    
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







