var links = [
"dental.xml",
"derm.xml"
];

var requests = new Array(links.length);



for (var i = 0; i < links.length; i++){
	requests[i] = new XMLHttpRequest();

	requests[i].onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	        populateWebpage(this);
	    }
	};

	requests[i].open("GET", "https://raw.githubusercontent.com/brentchiaramonti/linkMaker/master/xml_files/" + links[i], true);
	requests[i].send();

}



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

	var btn = document.createElement("BUTTON");
	btn.innerHTML = title;
	btn.onclick = function() {displayCheckboxes(txt, dict, name);};
	document.getElementById("buttons").appendChild(btn);

}





function generateLinks(name, dict) {
	var checkboxes = document.getElementsByName(name);
	var output = document.getElementById("output");
	var checkboxName;

	output.innerHTML = output.innerHTML = "&lt;ul><br/>"
	for(var i = 0; i < checkboxes.length; i++){
		if(checkboxes[i].checked){
			checkboxName = cleanText(checkboxes[i].parentElement.innerHTML);
			var url = dict[checkboxName]["url"];
			var additional = dict[checkboxName]["additional"];
			output.innerHTML = output.innerHTML + makeLink(checkboxName, url, additional);
		}
	}
	output.innerHTML = output.innerHTML + "&lt;/ul>"
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


function displayCheckboxes(text, dict, name) {
	var generateBtn = document.createElement("BUTTON");
	var selectAllBtn = document.createElement("BUTTON");
	var selectNoneBtn = document.createElement("BUTTON");

	generateBtn.onclick = function(){generateLinks(name, dict);};
	selectAllBtn.onclick = function(){selectAll(name);};
	selectNoneBtn.onclick = function(){selectNone(name);};

	generateBtn.innerHTML = "Generate";
	selectAllBtn.innerHTML = "Select All";
	selectNoneBtn.innerHTML = "Select None";

	document.getElementById('checkboxes').innerHTML = text;
	document.getElementById('checkboxes').prepend(selectNoneBtn);
	document.getElementById('checkboxes').prepend(selectAllBtn);
	document.getElementById('checkboxes').prepend(generateBtn);
}