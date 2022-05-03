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
  
  }