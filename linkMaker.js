var links = [
"dental-general.xml",
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
	var x, i, txt, xmlDoc, title, name, xmlFormated, officite, dentrix, baystone, firstItem;

	var dict = {};

	var text, url, additional

	var parser = new DOMParser();
    xmlDoc = parser.parseFromString(xml.responseText, "text/xml");
	txt = "";
	firstItem = xmlDoc.getElementsByTagName("linkList")[0]
	title = firstItem.getAttribute("title");
	officite = firstItem.getAttribute("officite");
	dentrix = firstItem.getAttribute("dentrix");
	baystone = firstItem.getAttribute("baystone");

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
		txt += "<label><input type=\"checkbox\" name=\"" + name + "\" onclick='highlight(this)'>" + text + "</label><br>";
		dict[text] = {url, additional};
	}

	var btn = document.createElement("BUTTON");
	btn.innerHTML = title;
	btn.name = "topButton";
	btn.onclick = function() {displayCheckboxes(txt, dict, name, this, officite, dentrix, baystone);};
	document.getElementById("buttons").appendChild(btn);

}





function generateLinks(name, dict) {
	var checkboxes = document.getElementsByName(name);
	var output = document.getElementById("output");
	var preface = "";
	var radioButtons = document.getElementsByName(name + "-radio");
	var i;
	for(i = 0; i < radioButtons.length; i++){
		if(radioButtons[i].checked){
			preface = radioButtons[i].value;
		}
	}
	var checkboxName;

	output.innerHTML = "&lt;ul><br/>"
	for(var i = 0; i < checkboxes.length; i++){
		if(checkboxes[i].checked){
			checkboxName = cleanText(checkboxes[i].parentElement.innerHTML);
			var url = preface + dict[checkboxName]["url"];
			var additional = dict[checkboxName]["additional"];
			output.innerHTML = output.innerHTML + makeLink(checkboxName, url, additional);
		}
	}
	output.innerHTML = output.innerHTML + "&lt;/ul>"
	document.getElementById("copyButton").classList.add("display");
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
		addHighlight(checkboxes[i]);
	}
}

function selectNone(name){
	var checkboxes = document.getElementsByName(name);
	for(var i = 0; i < checkboxes.length; i++){
		checkboxes[i].checked = false;
		removeHighlight(checkboxes[i]);
	}
}

function copyText(){
	var el = document.getElementById("output");
	el.select();
	document.execCommand('copy');
}


function displayCheckboxes(text, dict, name, thisButton, officite, dentrix, baystone) {
	selectButton(thisButton);
	var generateBtn = document.createElement("BUTTON");
	var selectAllBtn = document.createElement("BUTTON");
	var selectNoneBtn = document.createElement("BUTTON");

	generateBtn.onclick = function(){generateLinks(name, dict);};
	selectAllBtn.onclick = function(){selectAll(name);};
	selectNoneBtn.onclick = function(){selectNone(name);};

	generateBtn.innerHTML = "Generate";
	selectAllBtn.innerHTML = "Select All";
	selectNoneBtn.innerHTML = "Select None";

	var checkboxesElement = document.getElementById('checkboxes');
	checkboxesElement.innerHTML = text;

	if(officite){
		checkboxesElement.innerHTML = "<label><input type='radio' id='radio' name='" + name + "-radio' value='" + officite + "'> officite </label>" + checkboxesElement.innerHTML;
	}
	if(dentrix){
		checkboxesElement.innerHTML = "<label><input type='radio' id='radio' name='" + name + "-radio' value='" + dentrix + "'> dentrix </label>" + checkboxesElement.innerHTML;
	}
	if(baystone){
		checkboxesElement.innerHTML = "<label><input type='radio' id='radio' name='" + name + "-radio' value='" + baystone + "'> baystone </label>" + checkboxesElement.innerHTML;
	}

	checkboxesElement.prepend(selectNoneBtn);
	checkboxesElement.prepend(selectAllBtn);
	checkboxesElement.prepend(generateBtn);

	document.getElementById("output").innerHTML = "";
	document.getElementById("copyButton").classList.remove("display");
}

function highlight(element){
	var parent = element.parentElement.classList;
	if(parent.contains("active")){
		parent.remove("active");
	} else {
		parent.add("active");
	}
}

function addHighlight(element){
	var parent = element.parentElement.classList;
	parent.add("active");
}

function removeHighlight(element){
	var parent = element.parentElement.classList;
	parent.remove("active");
}

function selectButton(thisButton){
	var buttons = document.getElementsByName("topButton");

	for(var i = 0; i < buttons.length; i++){
		try{
			buttons[i].classList.remove("activeButton");
		}catch{

		}
	}

	thisButton.classList.add("activeButton");
}

function copyText(){
    var range = document.createRange();
    range.selectNodeContents(document.getElementById("output"));
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
}