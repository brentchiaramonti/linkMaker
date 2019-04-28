var xhttp;
xhttp = new XMLHttpRequest();

xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        populateWebpage(this);
    }
};
xhttp.open("GET", "https://raw.githubusercontent.com/brentchiaramonti/LaunchKitHelper/master/dental.xml", true);
xhttp.send();

function populateWebpage(xml){
	var x, i, txt, xmlDoc, title, name, xmlFormated;

	var dict = {};

	var text, url, additional

	var parser = new DOMParser();
    xmlDoc = parser.parseFromString(xml.responseText, "text/xml");
	txt = "";
	title = xmlDoc.getElementsByTagName("linkList")[0].getAttribute("title");
	name = title + "Links"
	items = xmlDoc.getElementsByTagName("item");
	for(i = 0; i < items.length; i++){
		text = items[i].childNodes[1].firstChild.nodeValue;
		url = items[i].childNodes[3].firstChild.nodeValue;
		try{
			additional = items[i].childNodes[5].firstChild.nodeValue;
		}
		catch(err) {
			additional = "";
		}
		txt += "<label><input type=\"checkbox\" name=\"" + name + "\">" + text + "</label><br>";
		dict[text] = {url, additional};
	}
	document.getElementById("checkboxes").innerHTML = txt;

	document.getElementById("generate").onclick = function(){generateLinks(name, dict);};
	document.getElementById("selectAll").onclick = function(){selectAll(name);};
	document.getElementById("selectNone").onclick = function(){selectNone(name);};
}


function generateLinks(name, dict) {
	var checkboxes = document.getElementsByName(name);
	var output = document.getElementById("output");
	var checkboxName;
	console.log(dict);
	for(var i = 0; i < checkboxes.length; i++){
		if(checkboxes[i].checked){
			checkboxName = cleanText(checkboxes[i].parentElement.innerHTML);
			var url = dict[checkboxName]["url"];
			var additional = dict[checkboxName]["additional"];
			output.innerHTML = output.innerHTML + makeLink(checkboxName, url, additional);
		}
	}
}

function makeLink(name, link, extra){
  return "&lt;li>&lt;a href=\"" + link + "\">" + name + "&lt;/a>" + extra + "&lt;/li><br>"
}
function cleanText(string){
  var start_pos = string.indexOf('>') + 1;
  return string.substring(start_pos);
}

function selectAll(name){
	var checkboxes = document.getElementsByName(name);
	for(var i = 0; i < checkboxes.length; i++){
		checkboxes[i].checked = true;
	}
}

function selectNone(name){
	var checkboxes = document.getElementsByName(name);
	for(var i = 0; i < checkboxes.length; i++){
		checkboxes[i].checked = false;
	}
}

function copyText(){
	var el = document.getElementById("output");
	el.select();
	document.execCommand('copy');
}