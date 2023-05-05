'use strict';
if(location.protocol != 'https:'){
	location.replace('https:${location.href.substring(location.protocol.length)}');
} else {

var signNavCheck = document.getElementById('sign-in-navCheck');
signNavCheck.addEventListener('change', changeHeight, false);

var navigationCheck = document.getElementById('navigationCheck');
navigationCheck.addEventListener('change', changeHeight, false);

var measurementsCheck = document.getElementById('measurementsCheck');
measurementsCheck.addEventListener('change', changeHeight, false);

var measurementTemplatesCheck = document.getElementById('measurement-templatesCheck');
measurementTemplatesCheck.addEventListener('change', changeHeight, false);

var reportsCheck = document.getElementById('reportsCheck');
reportsCheck.addEventListener('change', changeHeight, false);

var permissionsCheck = document.getElementById('permissionsCheck');
permissionsCheck.addEventListener('change', changeHeight, false);

var sharingCheck = document.getElementById('sharingCheck');
sharingCheck.addEventListener('change', changeHeight, false);

var terrainCheck = document.getElementById('terrain-editingCheck');
terrainCheck.addEventListener('change', changeHeight, false);

var compatibilityCheck = document.getElementById('compatibilityCheck');
compatibilityCheck.addEventListener('change', changeHeight, false);

var supportCheck = document.getElementById('supportCheck');
supportCheck.addEventListener('change', changeHeight, false);

function changeHeight(){
	if(this.checked){
		this.parentElement.style.maxHeight = "5000px";
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
