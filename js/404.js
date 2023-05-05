'use strict';
if(location.protocol != 'https:'){
	location.replace('https:${location.href.substring(location.protocol.length)}');
} else {

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
