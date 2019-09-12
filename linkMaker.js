	function makeApiCall() {
      var params = {
        // The spreadsheet to request.
        spreadsheetId: '10pUk3trlJApXoVZuwnkJKAQS3f36UU0Y43SBTRB1IUI',



        // True if grid data should be returned.
        // This parameter is ignored if a field mask was set in the request.
        includeGridData: true,
      };

      var request = gapi.client.sheets.spreadsheets.get(params);
      request.then(function(response) {
        // TODO: Change code below to process the `response` object:
        processTheResponse(response.result);
      }, function(reason) {
        console.error('error: ' + reason.result.error.message);
      });
    }

    function processTheResponse(input){
    	var sheets = input.sheets;
    	for(var i = 0; i < sheets.length; i++){
    		try{
    			processTheSheet(sheets[i]);
    		} catch (e) {
    			console.log("Sheet " + i + " is empty");
    		}
    	}
    	document.getElementById('loading').classList.add('hidden');
    }

    function processTheSheet(sheet){
    	var rows = sheet.data[0].rowData;
    	var firstRow = rows[0];
    	var title = firstRow.values[0].formattedValue;
    	if(!title) {
    		throw 1;
    	}
    	var dict = {};
    	var name = title + "Links"
    	var txt = '';
    	var target;
    	var prepend = {};

    	for(var k = 1; k < firstRow.values.length; k++){

    		if(firstRow.values[k].formattedValue.includes('=')){
    			if(firstRow.values[k].formattedValue.toLowerCase().includes('target')){
    				try{
    					target = getTarget(firstRow.values[k].formattedValue);
    				} catch(e) {
    					console.log("Sheet " + title + " has an invalid target property.")
    				}
    			} else {
    				try {
    					getPrepend(firstRow.values[k].formattedValue, prepend);
    				} catch(e){
    					console.log("Sheet " + title + " has an invalid prepend property at column " + k);
    				}
    			}
    		}
    	}

    	for(var j = 1; j < rows.length; j++){
    		try{
    			txt += processTheRow(rows[j], dict, name, txt);
    		} catch(e) {
    			console.log("Row: " + j + " is invalid formatting. It will be skipped");
    		}
    	}
		var btn = document.createElement("BUTTON");
		btn.innerHTML = title;
		btn.name = "topButton";
		btn.onclick = function() {displayCheckboxes(txt, dict, name, this, target, prepend);};
		document.getElementById("buttons").appendChild(btn);

	}

    function processTheRow(row, dict, name, txt){
    	var text, url, additional;
		text = row.values[0].formattedValue;
		if(!text){
			throw 1;
		}
		url = row.values[1].formattedValue;
		if(!url){
			throw 1;
		}
    	if(row.values[2]) {
    		additional = row.values[2].formattedValue;
    	} else {
    		additional = '';
    	}
    	dict[text] = {url, additional};
		return "<label oncontextmenu='copyLink(this, \"" + name + "\", \"" + dict[text]["url"] +"\");return false;'><input type=\"checkbox\" name=\"" + name + "\" onclick='highlight(this)' '>" + text + "</label>";
		
		
    }

    function copyLink(label, name, value){
    	var textArea = document.getElementById('hidden-text-area');
		var radioButtons = document.getElementsByName(name + "-radio");
		var i;
		var preface = "";
		for(i = 0; i < radioButtons.length; i++){
			if(radioButtons[i].checked){
				preface = radioButtons[i].value;
			}
		}
		textArea.value = preface + value;
    	textArea.select();
    	document.execCommand('copy');

    	label.classList.remove("animation");
    	void label.offsetWidth;
    	label.classList.add("animation");

    	return false;
    }

    function getTarget(str){
    	var splitStr = str.split("=");
    	return splitStr[splitStr.length - 1];
    }
    function getPrepend(str, prepend){
    	var splitStr = str.split("=");
    	prepend[splitStr[0]] = splitStr[1];
    }


    function initClient() {
      var API_KEY = 'AIzaSyCFTUcy8eaV_TZRpBgGf-BOwcifdRNVbz0';  

      var CLIENT_ID = '278405626851-klte5l935n60e8p7tjihorh9601oemr2.apps.googleusercontent.com';  

      // TODO: Authorize using one of the following scopes:
      //   'https://www.googleapis.com/auth/drive'
      //   'https://www.googleapis.com/auth/drive.file'
      //   'https://www.googleapis.com/auth/drive.readonly'
      //   'https://www.googleapis.com/auth/spreadsheets'
      //   'https://www.googleapis.com/auth/spreadsheets.readonly'
      var SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

      gapi.client.init({
        'apiKey': API_KEY,
        'clientId': CLIENT_ID,
        'scope': SCOPE,
        'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      }).then(function() {
      	makeApiCall();
      });
    }

    function handleClientLoad() {
      gapi.load('client:auth2', initClient);
    }







    function generateLinks(name, dict, target) {
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
			if(target){
				output.innerHTML = output.innerHTML + makeTargetLink(checkboxName, url, additional, target);
			} else {
				output.innerHTML = output.innerHTML + makeLink(checkboxName, url, additional);
			}
			
		}
	}
	output.innerHTML = output.innerHTML + "&lt;/ul>"
	document.getElementById("copyButton").classList.add("display");
	var top = document.getElementById("copyButton").offsetTop; 
    window.scrollTo(0, top);
}

function makeLink(name, link, extra){
  return "&lt;li>&lt;a href=\"" + link + "\">" + name + "&lt;/a>" + extra + "&lt;/li><br>"
}
function makeTargetLink(name, link, extra, target){
	return "&lt;li>&lt;a target='" + target + "' href=\"" + link + "\">" + name + "&lt;/a>" + extra + "&lt;/li><br>"
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


function displayCheckboxes(text, dict, name, thisButton, target, prepend) {
	selectButton(thisButton);
	var generateBtn = document.createElement("BUTTON");
	var selectAllBtn = document.createElement("BUTTON");
	var selectNoneBtn = document.createElement("BUTTON");

	generateBtn.onclick = function(){generateLinks(name, dict, target);};
	selectAllBtn.onclick = function(){selectAll(name);};
	selectNoneBtn.onclick = function(){selectNone(name);};

	generateBtn.innerHTML = "Generate";
	selectAllBtn.innerHTML = "Select All";
	selectNoneBtn.innerHTML = "Select None";

	var checkboxesElement = document.getElementById('checkboxes');
	


	checkboxesElement.innerHTML = "<input type='text' placeholder='Type to search...' class='search' id='" + name +"-search' oninput='searchCheckboxes(\"" + name + "-search\", \"" + name + "\")'>" + checkboxesElement.innerHTML;

	var first = true;

	for(var p in prepend){
		if(prepend.hasOwnProperty(p)){
			if(first){
				checkboxesElement.innerHTML = "<label class='portal'><input type='radio' id='radio' name='" + name + "-radio' value='" + prepend[p] + "' checked>'" + p + "'</label>" + checkboxesElement.innerHTML;
				first = false;
			}else{
				checkboxesElement.innerHTML = "<label class='portal'><input type='radio' id='radio' name='" + name + "-radio' value='" + prepend[p] + "'>'" + p + "'</label>" + checkboxesElement.innerHTML;	
			}
		}
	}

	
	checkboxesElement.innerHTML = "<div class='special_buttons' id='special_buttons'>" + checkboxesElement.innerHTML + "</div>";
	checkboxesElement.innerHTML = checkboxesElement.innerHTML + text;
	var specialButtons = document.getElementById("special_buttons");
	specialButtons.prepend(selectNoneBtn);
	specialButtons.prepend(selectAllBtn);
	specialButtons.prepend(generateBtn);

	

	


	document.getElementById("output").innerHTML = "";
	document.getElementById("copyButton").classList.remove("display");
}

function searchCheckboxes(inputID, name) {
		var checkboxes = document.getElementsByName(name);
		var text = document.getElementById(inputID).value;

		text = text.replace(" ", "");
		text = text.toLowerCase();

		for(var i = 0; i < checkboxes.length; i++){
			if(cleanText(checkboxes[i].parentElement.innerHTML).toLowerCase().replace(" ", "").includes(text)){
				checkboxes[i].parentElement.style.display = "";
			} else {
				checkboxes[i].parentElement.style.display = "none";
			}
		}
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

