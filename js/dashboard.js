'use strict';
if (location.protocol != 'https:') {
    location.replace('https:${location.href.substring(location.protocol.length)}');
} else {
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
var poolId = _config.cognito.identityPoolId;
var idProvName = _config.cognito.idProvName;

function signOut(){
	if(cognitoUser != null) {
		var localProjectKey = "KamyarPhoto." + cognitoUser.username + ".preferredProject";
		var localPreferredProject = localStorage.getItem(localProjectKey);
		cognitoUser.signOut();
		localStorage.clear();
		localStorage.setItem(localProjectKey, localPreferredProject);
		window.location = _config.download.url;
	}
}

const signOutBtn = document.getElementById("signOut");

signOutBtn.addEventListener("click", signOut, false);

function setPreferredProject(){
	var newProject = document.getElementById("projectSelect").value;
	if(newProject !== ''){
	var localProjectKey = "KamyarPhoto." + cognitoUser.username + ".preferredProject";
	localStorage.setItem(localProjectKey, newProject);
	window.location = "/dashboard";
	} else {
	alert('Please Select a Project to Switch View');
	}
}

const setProjectBtn = document.getElementById("switchProjectBtn");
setProjectBtn.addEventListener("click", setPreferredProject, false);

function flightDates(date){
	var year = date.substring(0,4);
	var month = date.substring(4,6);
	var day = date.substring(6,8);
	var reformattedDate = new Date(year, month-1, day);
	return reformattedDate;
}

Date.prototype.formatMMDDYYYY = function(){
	var day = this.getDate();
	if (day < 10) {
	return (this.getMonth() + 1) + '/0' + this.getDate() + '/' + this.getFullYear();
	} else {
	return (this.getMonth() + 1) + '/' + this.getDate() + '/' + this.getFullYear();
	}
}

function bytesToSize(bytes){
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes == 0) return 'n/a';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	if (i == 0) return bytes + ' ' + sizes[i];
	return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

var inactivityTime = function(){
	var time;
	window.onload = resetTimer;
	document.onmousemove = resetTimer;
	document.onkeypress = resetTimer;

	function resetTimer(){
		clearTimeout(time);
		time = setTimeout(urlExpired, 900000);
	}
}

window.onload = function() {
	inactivityTime();
}

function urlExpired(){
	alert("Your session has expired due to inactivity, please log back in");
	signOut();
	window.location = _config.download.login;
}

if(cognitoUser != null) {

	cognitoUser.getSession(async function(err, result){
		if(result){
			console.log(result.idToken.payload);
			var preferredProject;
			var tokenPayload = result.idToken.payload;
			var storedPreference = localStorage.getItem("KamyarPhoto." + tokenPayload.sub + ".preferredProject");
			var rolesCount = tokenPayload["cognito:roles"].length;
			for (var i = 0; i < rolesCount; i++){
				if(tokenPayload["cognito:roles"][i].includes(storedPreference)){
					preferredProject = tokenPayload["cognito:roles"][i];
				}
			}
			console.log(preferredProject);
			if(typeof(preferredProject) == 'undefined'){
				preferredProject = tokenPayload["cognito:roles"][0];
			}
			console.log(preferredProject);
			var rolesList = tokenPayload["cognito:roles"];
			if(rolesList.length != 1){
				rolesList.forEach(function(role){
					var roleLength = role.length;
					var roleWithoutAcc = role.substring(41, role.length);
					var option = document.createElement("option");
					option.text = roleWithoutAcc;
					option.value = roleWithoutAcc;
					var select = document.getElementById("projectSelect");
					select.appendChild(option);
				});
			}
			var cognitoIdentity = new AWS.CognitoIdentity({apiVersion: '2014-06-30'});
			var cognitoIdentityIdParams = {
				IdentityPoolId: poolId,
				Logins: {
					'cognito-idp.us-east-2.amazonaws.com/us-east-2_YHqhKSMsN': result.getIdToken().getJwtToken()
				}
			};
		async function idGetter(){
			var idPromise = new Promise(async function(resolve, reject){
			cognitoIdentity.getId(cognitoIdentityIdParams, function(err, idData){
				if(err){
					console.log(err, err.stack);
					reject();
				} else {
					resolve(idData.IdentityId);
				}
			});
			});
			return idPromise;
		}
		async function access(){
			var idPromise = await idGetter();
			var cognitoIdentityCredsParams = {
				IdentityId: idPromise,
				CustomRoleArn: preferredProject,
				Logins: {
					'cognito-idp.us-east-2.amazonaws.com/us-east-2_zt93CArsE': result.getIdToken().getJwtToken()
				}
			};
			var credsPromise = new Promise(function(resolve, reject){
			cognitoIdentity.getCredentialsForIdentity(cognitoIdentityCredsParams, function(err, credsData){
				if(err){
					console.log(err, err.stack);
				} else {
					console.log(credsData);
					resolve(credsData);
				}
			});
			});
			return credsPromise;
		}
			var credsPromise = await access();
			AWS.config.credentials = new AWS.Credentials(credsPromise.Credentials.AccessKeyId, credsPromise.Credentials.SecretKey, credsPromise.Credentials.SessionToken);
try {
var group = localStorage.getItem("KamyarPhoto." + cognitoUser.username + ".preferredProject");

var currentlyViewingH3 = document.getElementById('currentlyViewingH3');
var viewingText = currentlyViewingH3.innerHTML;
var viewingProject = viewingText + group;
currentlyViewingH3.innerHTML = viewingProject;

var nameDiv = document.getElementById("nameDiv");
var nameh3 = document.createElement("h3");
var nameText = document.createTextNode(result.idToken.payload.name);
nameh3.appendChild(nameText);
nameDiv.appendChild(nameh3);

var emailDiv = document.getElementById("emailDiv");
var emailh3 = document.createElement("h3");
var emailText = document.createTextNode(result.idToken.payload.email);
emailh3.appendChild(emailText);
emailDiv.appendChild(emailh3);

var phoneNumber = result.idToken.payload.phone_number;
var reformattedPhone = phoneNumber.substring(0, 2) + '-' + phoneNumber.substring(2, 5) + '-' + phoneNumber.substring(5, 8) + '-' + phoneNumber.substring(8,12);
var phoneDiv = document.getElementById("phoneDiv");
var phoneh3 = document.createElement("h3");
var phoneText = document.createTextNode(reformattedPhone);
phoneh3.appendChild(phoneText);
phoneDiv.appendChild(phoneh3);

if(rolesList.length !== 1){
	var projectDiv = document.getElementById('projectDiv');
	rolesList.forEach(function(role){
		var projecth3 = document.createElement('h3');
		var roleNameLength = role.length;
		var alteredRole = role.substring(41, roleNameLength);
		var projectText = document.createTextNode(alteredRole);
		projecth3.appendChild(projectText);
		projectDiv.appendChild(projecth3);
		console.log(alteredRole);
	});
} else {
var projectDiv = document.getElementById("projectDiv");
var projecth3 = document.createElement("h3");
var projectText = document.createTextNode(result.idToken.payload['cognito:groups'][0]);
projecth3.appendChild(projectText);
projectDiv.appendChild(projecth3);
}
} catch(err) {
	console.log("no result");
}

var filesBucketName = _config.s3.bucket;
var s3 = new AWS.S3({
	apiVersion: '2006-03-01',
	params: {Bucket: filesBucketName}
});
if(typeof(group) !== 'undefined'){
async function listFiles() {
	var appId = _config.cognito.clientId;
	var folderFilesKey = 'cognito/' + appId + "/" + group + "/";
	var p = new Promise(function(resolve, reject){
	s3.listObjectsV2({Prefix: folderFilesKey}, function(err, data){
		if(err){
			alert('There was an error listing your files: ' + err.message);
			reject(err.stack);
		}else{
			resolve(data);
		}
	});
	});
	return p;
}
async function signedUrl(fileName){
	var params = {
		Bucket: _config.s3.bucket,
		Key: 'cognito/' + _config.cognito.clientId + '/' + group + '/' + fileName,
		Expires: 60
	};
	var p = new Promise(function(resolve, reject){
		s3.getSignedUrl('getObject', params, function(err, url){
			if(err){
				console.log(err,err.stack);
				reject();
			} else {
				resolve(url);
			}
		});
	});
	return p;
}

async function hrefUpdate(evt){
	var element = evt.target;
	if (element.id == 'bootstrap-a'){
	element.href = await signedUrl(element.textContent);
	window.location.href = element.href;
	setTimeout(function(){element.href = '#'}, 60000);
	}
}

async function downloader(){
	var files = await listFiles();
	var folderFilesKey = 'cognito/' + _config.cognito.clientId + "/" + group + "/";
	var ordered = files.Contents;
		$('#tbody-s3objects').empty();
		ordered.forEach(async function(value, i){
			if(ordered[i].Key != folderFilesKey){
				var size = bytesToSize(ordered[i].Size);
				var flightName = ordered[i].Key.replace(folderFilesKey, '').substring(0, 8);
				var flightDate = flightDates(flightName).formatMMDDYYYY();
				var uploadDate = new Date(files.Contents[i].LastModified).formatMMDDYYYY();
				var fileName = ordered[i].Key.replace(folderFilesKey, '');
				$('#tbody-s3objects').append('<tr><td><a id="bootstrap-a" href="#" name="' + fileName + '">' + fileName + '</a></td>' + '<td>' + flightDate + '</td>' + '<td>' + uploadDate + '</td>' + '<td>' + size + '</td>' + '</tr>');
				i++;
		}
	});
	$(document).ready(function () {
		$('#tb-s3objects').DataTable({
			"pagingType": "simple_numbers",
			"order": [[0, "desc"]],
			"aaSorting": [],
			columnDefs: [{
			orderable: false,
			targets: 3
			}]
		});
		$('.dataTables_length').addClass('bs-select');
	});
	var table = document.getElementById('tb-s3objects');
	table.addEventListener('click', hrefUpdate, false);
}
downloader();
}

		}

	});

} else {
	window.location.href = _config.download.login;
}
}
