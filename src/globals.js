
module.exports = {
  generateMessage,
  deleteMessage,
  readSettings,
  writeSettings
}

//file stuff

// let fs = require('fs');
var path = require('path');
var settingsPath = path.join(__dirname, "settings.json").toString();

function generateMessage(title, content, type){
    let msgbox = document.getElementById("message")
    if(!msgbox.classList.contains("is-active")){
    document.getElementById("messageTitle").innerHTML = title;
    document.getElementById("messageContent").innerHTML = content;
    document.getElementById("loadingbar").style.top = "78%"
    document.getElementById("currentdownloadedsong").style.top = "75%"
    document.getElementById("timeestimate").style.top = "75%"
    msgbox.classList.add(types[type])
    msgbox.classList.add("is-active")
    } else {
      msgqueue["items"].push(
        {
          "title": title,
          "content": content,
          "type": type,
         }
      ) 
    console.log(msgqueue)
    }
  } 
  
  function deleteMessage(){
    let msgbox = document.getElementById("message")
    if(msgqueue.items.length == 0){
      document.getElementById("loadingbar").style.top = "84%"
      document.getElementById("currentdownloadedsong").style.top = "81%"
      document.getElementById("timeestimate").style.top = "81%"
      document.getElementById('message').classList.remove('is-active')
    } else {
      console.log(msgqueue)
      document.getElementById("messageTitle").innerHTML = msgqueue.items[0].title;
      document.getElementById("messageContent").innerHTML = msgqueue.items[0].content;
      for (const items of types) {
        msgbox.classList.remove(items)
      }
      msgbox.classList.add(types[msgqueue.items[0].type])
      msgqueue.items.splice(0,1)
    }
  }
  


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