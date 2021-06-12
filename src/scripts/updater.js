var request = require('request');
var update = __dirname + "\\scripts\\update.py"
const msg1 = document.getElementById('updatemsg');
const msg2 = document.getElementById('updatemsgscnd');
const upbtn = document.getElementById("upswitch");
upbtn.addEventListener("change", checkUpdate);


    if(Boolean(readSettings("autocheck") === "true") ){
        checkUpdate();
        upbtn.checked = true;
    } else {
        msg1.classList.remove("is-active")
        msg2.classList.remove("is-active")
        upbtn.checked = false;
    }

    async function checkUpdate() {
        writeSettings("autocheck", upbtn.checked)
        let rawdata = fs.readFileSync(__dirname.replace("src", "package.json"));
        let curver = JSON.parse(rawdata)["version"].replaceAll(".", "").replace("v", "");
        getNewVer("tag_name", function(retinfo){

            var newver = retinfo.replaceAll(".", "").replace("v", "");
            console.log("new version: " + newver); 
            console.log("current version: " + curver);
            if(newver > curver){
                //update 
                console.log("new Version Aviable")
                msg1.classList.add('is-active');
                msg2.classList.add("is-active")
            }
        
            else if(newver < curver){
                //?????
                console.log("you mamanged to install a newer version than is aviable")
            }
        
            else{
                //literally do nothing
                console.log("newest version installed")
            }
            });
      }

    
    function getNewVer(info,callback){
        let url = "https://api.github.com/repos/Frostplexx/Symphone/releases/latest"
        let xhr = new XMLHttpRequest();
        var retinfo = "";
        xhr.open('GET', url, true);
        xhr.send();
        xhr.onreadystatechange = processRequest;
        function processRequest(e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);
                retinfo = response[info];
                if(callback) callback(retinfo);
            }
        }


    }
    
    function getFilenameFromUrl(url){
        return url.substring(url.lastIndexOf('/') + 1);
    }


    function downloadnewVer(){
        getNewVer("assets",function(retinfo){
            let downurl = retinfo[0][["browser_download_url"]];
            console.log(downurl);

            var filename = getFilenameFromUrl(downurl);
            var downloadsFolder = __dirname;
            var finalPath = downloadsFolder + "\\" + filename;


            var progress = document.getElementById("updateprogress");

            downloadFile({
                remoteFile: downurl,
                localFile: finalPath,
                onProgress: function (received,total){
                    var percentage = (received * 100) / total;

                    progress.classList.add("is-active"); 
                    progress.value = percentage;
                    // console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
                }
            }).then(function(){
                let sp = spawn("python", [update, finalPath]);
                sp.stdout.on('data', function () {
                  console.log(sp);
                  console.log("updated");
                });
            
                sp.on('error', function () {
                  console.log("could not update");
                });
            });

        });
    }


    /**
     * Promise based download file method
     */
    function downloadFile(configuration){
        return new Promise(function(resolve, reject){
            // Save variable to know progress
            var received_bytes = 0;
            var total_bytes = 0;

            var req = request({
                method: 'GET',
                uri: configuration.remoteFile
            });

            var out = fs.createWriteStream(configuration.localFile);
            req.pipe(out);

            req.on('response', function ( data ) {
                // Change the total bytes value to get progress later.
                total_bytes = parseInt(data.headers['content-length' ]);
            });

            // Get progress if callback exists
            if(configuration.hasOwnProperty("onProgress")){
                req.on('data', function(chunk) {
                    // Update the received bytes
                    received_bytes += chunk.length;

                    configuration.onProgress(received_bytes, total_bytes);
                });
            }else{
                req.on('data', function(chunk) {
                    // Update the received bytes
                    received_bytes += chunk.length;
                });
            }

            req.on('end', function() {
                resolve();
            });
        });
    }

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




