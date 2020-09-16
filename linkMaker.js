	


/*
Google provided code. Appears to set up auth2.
First part of the code that is ran and is called from the HTML
*/
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}




/*
Google provided code. Intializes the api request call then runs makeApiCall
*/
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



/*
Function to get the spreadsheet. Then makes a call to process the spreadsheet.
No inputs
No returns
*/
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


/*
Function to process the resulting spreadsheets
input: An array of sheets arrays
No return
*/
function processTheResponse(input){

	//Loops through each sheet individually
	var sheets = input.sheets;
	for(var i = 0; i < sheets.length; i++){

		//Tries to process each individual sheet
		try{
			processTheSheet(sheets[i]);
		} catch (e) {
			console.log("Sheet " + i + " is empty");
		}
	}

	//Once all sheets have been processed, removes the "Loading" text
	document.getElementById('loading').classList.add('hidden');
    }


/*
Function to provess and individual sheet.
Takes in a sheet and then adds a button and link array to the html
sheet: An array of the sheets data
*/
function processTheSheet(sheet){

	var rows = sheet.data[0].rowData; //gets all the data in the sheet in an array of rows
	var firstRow = rows[0]; //gets the first row
	var title = firstRow.values[0].formattedValue; //gets the first cell of the first row and stores it as the title
	
	//If there isn't a title, throws an exception
	if(!title) {
		throw 1;
	}


	var dict = {}; //Dictionary that will be holding the link name and link url
	var name = title + "Links" //Sets up a name for the button
	var txt = ''; //Text variable that will hold the html to add to the website
	var target; //Variable that holds what target the link will be set as (Example target='_blank')
	var prepend = {}; //Holds any text that will be prepended to the link

	//Loops through each cell in the first row
	for(var k = 1; k < firstRow.values.length; k++){

		//Checks if this cell is using an equals sign, otherwise it just skips the cell
		if(firstRow.values[k].formattedValue.includes('=')){

			//Checks if the text 'target' is in this cell
			if(firstRow.values[k].formattedValue.toLowerCase().includes('target')){

			//If it is anything else, sets it as a prepend
			} else {
				try {
					getPrepend(firstRow.values[k].formattedValue, prepend);
				} catch(e){
					console.log("Sheet " + title + " has an invalid prepend property at column " + k);
				}
			}
		}
	}

	//Loops through every row after the first
	for(var j = 1; j < rows.length; j++){

		//Tries to process the current row
		try{
			txt += processTheRow(rows[j], dict, name);
		} catch(e) {
			console.log(e)
			console.log("Row: " + j + " has invalid formatting. It will be skipped");
		}
	}

	//After all rows are processed

	var btn = document.createElement("BUTTON"); //creates a new button
	btn.innerHTML = title; //Text to be the title
	btn.name = "topButton"; //sets a name for later targeting
	btn.onclick = function() {displayCheckboxes(txt, dict, name, this, target, prepend);}; //sets an onclick function with the information processed
	document.getElementById("buttons").appendChild(btn); //Adds the button to the html

}

/*
Function to process an individual row
row: Array of row data
dict: Dictionary object that holds the text and url of the button
name: String, the name of this group of links
Return: String, formated html to be added to the page
*/
function processTheRow(row, dict, name){
	var text, url;
	var description = ''

	//Graps the first cell, which will have the text of the link that will be displayed
	text = row.values[0].formattedValue;
	if(!text){
		throw 1;
	}

	//Grabs the second cell, which will have the url of the link
	url = row.values[1].formattedValue;
	if(!url){
		throw 1;
	}

	if(typeof row.values[2] !== 'undefined') {
		description = escapeQuotes(row.values[2].formattedValue);
	}

	//Stores the link text and url into the link dictionary
	dict[text] = {"url": url, "description": description};

	//returns the html for the link button
	return "<label oncontextmenu='copyDescription(this, \"" + dict[text]["description"] +"\");return false;'  onclick='copyLink(this, \"" + name + "\", \"" + dict[text]["url"] +"\");return false;'><input type=\"checkbox\" name=\"" + name + "\" '>" + text + "</label>";
	
	
}

/*
Function to be added to an individual link button. Takes the link on the button and copies it to the user's clipboard
Label: The label object that was clicked. Used to set animations
Name: The name set to this group of link buttons. Used to determine if any prepends are necessary
Value: The url as text to be copied. The prepend will be added if necessary
No return
*/
function copyLink(label, name, value){
	var textArea = document.getElementById('hidden-text-area'); //Gets the hidden textarea on the html to store the text to copy
	var radioButtons = document.getElementsByName(name + "-radio"); //Gets the radio buttons that are used to store which prepend is put on the link
	var i;

	var prepend = ""; //Variable that will hold the prepend

	//loops through each radio button
	for(i = 0; i < radioButtons.length; i++){

		//if this radio button is checked, gets the value of the radio button and stores it as the prepend
		if(radioButtons[i].checked){
			prepend = radioButtons[i].value;
		}
	}

	
	textArea.value = prepend + value; //sets the text area's text to be the link
	textArea.select(); //Selects the text in the text area
	document.execCommand('copy'); //Runs the copy command, copying the text in the text area


	label.classList.remove("animation"); //Removes the animation class if there is any
	void label.offsetWidth; //A trick to allow an animation to be removed and readded to an object and let the animation still play
	label.classList.add("animation"); //Adds the animation class to the label
	

	return false;
}

/*
Function to be added to an individual link button. Takes the link on the button and copies it to the user's clipboard
Label: The label object that was clicked. Used to set animations
Value: The description as text to be copied
No return
*/
function copyDescription(label, value){
	var textArea = document.getElementById('hidden-text-area'); //Gets the hidden textarea on the html to store the text to copy

	
	textArea.value = value; //sets the text area's text to be the link
	textArea.select(); //Selects the text in the text area
	document.execCommand('copy'); //Runs the copy command, copying the text in the text area


	label.classList.remove("animation"); //Removes the animation class if there is any
	void label.offsetWidth; //A trick to allow an animation to be removed and readded to an object and let the animation still play
	label.classList.add("animation"); //Adds the animation class to the label
	

	return false;
}


function escapeQuotes(value) {
	return value.replaceAll('"', '\\\"');
}


/*
Function to process a prepend cell.
str: A string object that is the contents of the target cell
prepend: A Dictionary object that stores each prepend
Return: No return, stores the text to the left as the name in the dictionary, and stores the text to the right as the value in the dictionary
*/
function getPrepend(str, prepend){
	var splitStr = str.split("=");
	prepend[splitStr[0]] = splitStr[1];
}





/*
Helper function that gets the text after a tag. Used to get the text after a checkbox
Return: String, The text after the end of the first tag in the text
*/
function cleanText(string){
  var start_pos = string.indexOf('>') + 1;
  return string.substring(start_pos);
}



/*
Displays the checkbox list for a button
text: String, The html of the checkboxes to be displayed
dict: The dictionary of names and urls of all the link. It is added to the generate button function for later use
name: The name of the group of checkboxes
thisButton: Button object that was clicked. Used to updated its appearance to show it is selected
target: String, the target text if there is any
prepend: The prepend dictionary if there is one
No Return
*/
function displayCheckboxes(text, dict, name, thisButton, target, prepend) {
	selectButton(thisButton); //Sets the given button to be shown as selected on the html


	//Gets the div that holds the checkboxes
	var checkboxesElement = document.getElementById('checkboxes');

	//Sets the html to be empty, refreshing whatever was there before
	checkboxes.innerHTML = "";
	
	//Sets up a search box into the html
	checkboxesElement.innerHTML = "<input type='text' placeholder='Type to search...' class='search' id='" + name +"-search' oninput='searchCheckboxes(\"" + name + "-search\", \"" + name + "\")'>" + checkboxesElement.innerHTML;

	//A variable to make the first radio button be added differently from the rest
	var first = true;

	//Loops through each prepend if there are any
	for(var p in prepend){

		//Makes sure the prepend exists
		if(prepend.hasOwnProperty(p)){

			//if it is the first prepend
			if(first){
				//Adds the radio button and sets it to be checked
				checkboxesElement.innerHTML = "<label class='portal'><input type='radio' id='radio' name='" + name + "-radio' value='" + prepend[p] + "' checked>'" + p + "'</label>" + checkboxesElement.innerHTML;
				first = false; //sets first to be false for future radio buttons
			
			//if it is not the first prepend
			}else{
				//Adds the radio button and it is not set to be checked
				checkboxesElement.innerHTML = "<label class='portal'><input type='radio' id='radio' name='" + name + "-radio' value='" + prepend[p] + "'>'" + p + "'</label>" + checkboxesElement.innerHTML;	
			}
		}
	}


	//Adds the checkboxes to the div
	checkboxesElement.innerHTML = checkboxesElement.innerHTML + text;



	//Sets the output html to be empty
	document.getElementById("output").innerHTML = "";

	//Sets the copy button to be hidden
	document.getElementById("copyButton").classList.remove("display");
}

/*
Searches the checkbox text for a given value. Is not case sensitive and ignores blank spaces
inputID: The id of the search box to pull the input from
name: The name of the checkboxes to search
No Return
*/
function searchCheckboxes(inputID, name) {
		var checkboxes = document.getElementsByName(name); //Gets the checkboxes by name
		var text = document.getElementById(inputID).value; //Gets the text input from the search bar

		text = text.replace(" ", ""); //Removes all spaces
		text = text.toLowerCase(); //Sets the text to all lowercase to make it not case sensitive

		//Loops through every checkbox
		for(var i = 0; i < checkboxes.length; i++){

			//Removes the animation class from the checkbox so it doesn't play the highlight animation if made to display
			checkboxes[i].classList.remove("animation");

			//Checkes if the checkbox text includes the given text after being cleaned, removed spaces, and made lowercase
			if(cleanText(checkboxes[i].parentElement.innerHTML).toLowerCase().replace(" ", "").includes(text)){

				//if it does, sets it to display
				checkboxes[i].parentElement.style.display = "";
			} else {

				//if it doesn't, sets it to not display
				checkboxes[i].parentElement.style.display = "none";
			}
		}
}



/*
Function to set a library button as active and set every other library button as not active
thisButton: button object that will be set to be active
No Return
*/
function selectButton(thisButton){
	var buttons = document.getElementsByName("topButton"); //Gets every library button

	//Loops through every button and removes the active button
	for(var i = 0; i < buttons.length; i++){
		try{
			buttons[i].classList.remove("activeButton");
		}catch{

		}
	}

	//Adds the active class to the given library button
	thisButton.classList.add("activeButton");
}

/*
Function to copy text in output div to clipboard
No Return
*/
function copyText(){
    var range = document.createRange(); //makes a range object
    range.selectNodeContents(document.getElementById("output")); //sets it to have the range just be the output div
    var sel = window.getSelection(); //Gets the current selection of the window
    sel.removeAllRanges(); //Unselects everything
    sel.addRange(range); //Sets it to select the output div's range
    document.execCommand('copy'); //Runs the copy command
}

