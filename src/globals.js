
module.exports = {
  generateMessage,
  deleteMessage,
  readSettings,
  writeSettings,
  ColorExtract,
  hexToRgbA
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


async function ColorExtract(){
    let img = new Image();
    img.src = document.getElementById("cover").src
    // img.style.filter = "blur(50px)"
    let canvas = document.createElement("canvas");
    let c = canvas.getContext('2d');
    c.width = canvas.width = img.width;
    c.height = canvas.height = img.height;
    c.clearRect(0, 0, c.width, c.height);
    c.drawImage(img, 0, 0, img.width , img.height);


    let col, colors = {};
    let pixels, r, g, b, a;
    r = g = b = a = 0;
    pixels = c.getImageData(0, 0, c.width, c.height);
    for (var i = 0, data = pixels.data; i < data.length; i += 4) {
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
        a = data[i + 3]; // alpha
        // skip pixels >50% transparent
        if (a < (255 / 2))
            continue; 
        col = rgbToHex(r, g, b);
        if (!colors[col])
            colors[col] = 0;
        colors[col]++;
    }


    let main_colors = new Map();
    for(var hex in colors){
      if(colors[hex] > 5 && parseInt(pad(hex).charAt(0)) >= 3){
        main_colors.set(pad(hex),colors[hex])
      }

    }
    let mapSort = new Map([...main_colors.entries()].sort((x, y) => y[1] - x[1]));
    let main_color =  "#" + mapSort.keys().next().value
    console.log("Most common color: " + hexToRgbA(main_color));
    document.getElementById("musicbox").style.background = `linear-gradient(40deg, ${hexToRgbA(main_color)} 0%, rgba(255,255,255,1) 60%)`;

  }


function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255)
      throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
}

function pad(hex) {
  return ("000000" + hex).slice(-6);
}


function hexToRgbA(hex){
  var c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){
          c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
  }
  throw new Error('Bad Hex');
}