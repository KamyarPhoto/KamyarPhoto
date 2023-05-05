'use strict';
if(location.protocol != 'https:'){
	location.replace('https:${location.href.substring(location.protocol.length)}');
} else {
	
var navCheck = document.getElementById('navCheck');
navCheck.addEventListener('change', changeHeight, false);

var tableCheck = document.getElementById('tableCheck');
tableCheck.addEventListener('change', changeHeight, false);

var webCheck = document.getElementById('webCheck');
webCheck.addEventListener('change', changeHeight, false);

var supportCheck = document.getElementById('supportCheck');
supportCheck.addEventListener('change', changeHeight, false);

function changeHeight(){
	if(this.checked){
		this.parentElement.style.maxHeight = "2000px";
	} else {
		this.parentElement.style.maxHeight = "100px";
	}
}

var data = {
	UserPoolId: _config.cognito.userPoolId,
	ClientId: _config.cognito.clientId
};

if(!AWS.config.region){
	AWS.config.update({
		region: _config.cognito.region
	});
}

var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
var cognitoUser = userPool.getCurrentUser();

function signOut(){
	if(cognitoUser != null){
		var username = cognitoUser.username;
		cognitoUser.signOut();
		var preferredProject = localStorage.getItem("KamyarPhoto." + username + ".preferredProject");
		localStorage.clear();
		localStorage.setItem("KamyarPhoto." + username + ".preferredProject", preferredProject);
		window.location = _config.download.url;
	} else {
		alert("Logout Failed: You need to be logged in to log out. Please Log In to Log Out.");
	}
}

const signOutBtn = document.getElementById("signOut");
signOutBtn.addEventListener("click", signOut, false);

}
