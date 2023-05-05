'use strict';
if (location.protocol !== 'https:') {
    location.replace("https:${location.href.substring(location.protocol.length)}");
} else {
function parseJwt(token){
	var base64Url = token.split('.')[1];
	var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c){
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));
	return JSON.parse(jsonPayload);
}

var data = {
	UserPoolId : _config.cognito.userPoolId,
	ClientId : _config.cognito.clientId
};

if(!AWS.config.region) {
	AWS.config.update({
		region: _config.cognito.region
	});
}
var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
var cognitoUser = userPool.getCurrentUser();

var codeSearch = new URLSearchParams(location.search);
var code = codeSearch.get("code");

if(cognitoUser != null) {

	cognitoUser.getSession(function(err, result){
		if(result){
			AWS.config.credentials = new AWS.CognitoIdentityCredentials({
				IdentityPoolId: _config.cognito.userPoolId,
				Logins: {
					'cognito-idp.us-east-2.amazonaws.com/us-east-2_zt93CArsE': result.getIdToken().getJwtToken()
				}
			});
		try{
		if(result.idToken.payload['cognito:groups'][0] == 'Employees'){
			window.location.href = '/employees';
		} else {
			window.location.href = '/dashboard';
		}
	} catch(n) {
	window.location.href = '/dashboard';
	}
		}
	});
} else if(code != undefined){
	var url = _config.download.url + 'code';
	var xhr = new XMLHttpRequest();
	xhr.overrideMimeType('application/json');
	xhr.open("POST", url, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.responseType = 'json';
	xhr.json = true;
	var params = 'code=' + code;
	xhr.send(params);
	xhr.onreadystatechange = function() {
	if(xhr.readyState == 4) {
		if(xhr.status == 200){
	var parsedResponse = xhr.response;
	if(typeof(parsedResponse) == 'string'){
		parsedResponse = JSON.parse(xhr.response);
	}
	if(parsedResponse.token == "false"){
		window.location.href = _config.download.login;
	}
	var encodedId = parsedResponse.id_token;
	var encodedAccess = parsedResponse.access_token;
	var encodedRefresh = parsedResponse.refresh_token;
	var user = parseJwt(encodedId)['cognito:username'];
	var prefProjectKey = "KamyarPhoto." + user + ".preferredProject";
	if(localStorage.getItem(prefProjectKey) == null){
		localStorage.setItem(prefProjectKey, parseJwt(encodedId)["cognito:groups"][0]);
	}
	localStorage.setItem("CognitoIdentityServiceProvider." + _config.cognito.clientId + "." + user + ".idToken", encodedId);
	localStorage.setItem("CognitoIdentityServiceProvider." + _config.cognito.clientId + ".LastAuthUser", user);
	localStorage.setItem("CognitoIdentityServiceProvider." + _config.cognito.clientId + "." + user + ".accessToken", encodedAccess);
	localStorage.setItem("CognitoIdentityServiceProvider." + _config.cognito.clientId + "." + user + ".refreshToken", encodedRefresh);

	window.location.href = '/';
		}
	}
	}
	} else {
		window.location.href = _config.download.login;
	}
}
