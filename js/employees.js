'use strict';
if (location.protocol !== 'https:') {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
} else {
var data = {
	UserPoolId : _config.cognito.userPoolId,
	ClientId : _config.cognito.clientId
};
function signOut(){
	if(cognitoUser != null) {
		var username = cognitoUser.username;
		var key = "KamyarPhoto." + username + ".preferredProject";
		var value = localStorage.getItem(key);
		cognitoUser.signOut();
		localStorage.clear();
		localStorage.setItem(key, value);
		window.location = _config.download.url;
	}
}

const signOutBtn = document.getElementById("signOut");
signOutBtn.addEventListener("click", signOut, false);

const mobileBtn = document.getElementById("topnav");
mobileBtn.addEventListener("click", mobileBar, false);

function mobileBar(){
	var x = document.getElementById("topnav");
	if(x.classList.contains('topnav-open')) {
		x.classList.remove('topnav-open');
	} else {
		x.classList.add('topnav-open');
	}
}

if(!AWS.config.region) {
	AWS.config.update({
		region: 'us-east-2'
	});
}
var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
var cognitoUser = userPool.getCurrentUser();

if(cognitoUser != null) {
	cognitoUser.getSession(function(err, result){
		if(result){
			AWS.config.credentials = new AWS.CognitoIdentityCredentials({
				IdentityPoolId: _config.cognito.identityPoolId,
				Logins: {
					'cognito-idp.us-east-2.amazonaws.com/us-east-2_YHqhKSMsN': result.getIdToken().getJwtToken()
				}
			});

try {
	var group = result.idToken.payload['cognito:groups'][0];

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

	var projectDiv = document.getElementById("projectDiv");
	var projecth3 = document.createElement("h3");
	var projectText = document.createTextNode(result.idToken.payload['cognito:groups'][0]);
	projecth3.appendChild(projectText);
	projectDiv.appendChild(projecth3);

} catch(err){

}


if(result.idToken.payload['cognito:groups'][0] == 'Employees'){
	async function access(){
		var p = new Promise(function(resolve, reject){
		AWS.config.credentials.get(function(err){
			if(err){
				console.log(err, err.stack);
				reject();
			} else {
				resolve();
			}
		});
		})
		return p;
	}
var s3 = new AWS.S3({
	apiVersion: '2006-03-01',
	params: {Bucket: _config.s3.bucket}
});
var iam = new AWS.IAM({
	apiVersion: '2010-05-08'
});
var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
	apiVersion: '2016-04-18'
});

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

async function checkForUser(email){
	var p = new Promise(function(resolve, reject){
	var params = {
		UserPoolId:_config.cognito.userPoolId,
		AttributesToGet: [
			'email'
		]
	};
	cognitoidentityserviceprovider.listUsers(params, function(err, data){
		if(err) {
			alert(err + 'check console.');
			console.log(err, err.stack);
			reject();
		} else {
			var users = data;
			var presence;
			var info;
			users.Users.forEach(function(value, i){
			if(users.Users[i].Attributes[0].Value == email){
				info = users.Users[i];
				presence = 1;
			}
			});
			if(presence == 1) {
				var resolution = {
					boolCheck: false,
					userAtt: info
				};
				console.log(resolution);
				resolve(resolution);
			} else {
				resolve(true);
			}
		}
	});
	});
	return p;
}

async function getUsername(email){
	var p = new Promise(function(resolve, reject){
		var listUserParams = {
			UserPoolId: _config.cognito.userPoolId,
			AttributesToGet: [
				'email'
			]
		};
		var username;
		cognitoidentityserviceprovider.listUsers(listUserParams, function(err, data){
			if(err){
				console.log(err, err.stack);
				reject();
			} else {
				data.Users.forEach(function(value, a){
					if(email == data.Users[a].Attributes[0].Value){
						username = data.Users[a].Username;
					}
				});
				resolve(username);
			}
		});
	});
	return p;
}

async function checkMembership(group, email){
	var username = await getUsername(email);
	var p = new Promise(function(resolve, reject){
		var present;
		var userGroupParams = {
			UserPoolId: _config.cognito.userPoolId,
			Username: username
		};
		cognitoidentityserviceprovider.adminListGroupsForUser(userGroupParams, function(err, data){
			if(err){
				console.log(err, err.stack);
				reject();
			} else {
				data.Groups.forEach(function(value, a){
					if(group == data.Groups[a].GroupName){
						present = true;
					}
				});
				if(present != true){
					present = false;
				}
				var info = {
					present: present,
					username: username
				};
				resolve(info);
			}
		});
	});
	return p;
}

async function addUserToProject(){
	var project = document.getElementById('addSelect').value;
	var user = document.getElementById('userSelect').value;
	var member = await checkMembership(project, user);
	if(project != "Employees"){
	var p = new Promise(function(resolve, reject){
	if(member.present == false){
		var addParams = {
			GroupName: project,
			UserPoolId: _config.cognito.userPoolId,
			Username: member.username
		};
		cognitoidentityserviceprovider.adminAddUserToGroup(addParams, function(err, data){
			if(err){
				console.log(err, err.stack);
				reject();
			} else {
				alert("Adding User Successful");
				resolve();
				window.location = _config.download.url + 'employees';
			}
		});
	} else {
		alert("The Entered User Cannot Be Added to That Project");
	}
	});
	return p;
	} else {
		alert("You cannot add people to the Employees Project");
	}
}

async function checkS3Upload(project){
	var params = {
		Bucket: _config.s3.bucket,
		Prefix: 'cognito/' + _config.cognito.clientId + '/' + project + '/'
	};
	var check = await getS3Info(params, 'uploader');
	var p = new Promise(function(resolve, reject){
		var date = new Date();
		date = date.formatMMDDYYYY();
		if(check.fileDate == date){
			resolve(check);
		} else {
			resolve(false);
		}
	});
	return p;
}

async function getIamInfo(params){
	var p = new Promise(function(resolve, reject){
		iam.listRoles(params, function(err, data){
			if(err){
				alert(err + ' check console.');
				console.log(err, err.stack);
				reject();
			} else {
				resolve(data);
			}
		});
	});
	return p;
}

async function checkIamPolicy(params){
	var p = new Promise(function(resolve, reject){
		iam.listRolePolicies(params, function(err, data){
		try{
			if(err){
				console.log(err, err.stack);
				reject();
			} else {
				resolve(data);
			}
		} catch(err) {
			resolve(undefined);
		}
		});
	});
	return p;
}

async function projectChecker(project){
	var groupParams = {
		UserPoolId: _config.cognito.userPoolId
	};
	var s3Params = {
		Bucket: _config.s3.bucket,
		Prefix: 'cognito/' + _config.cognito.clientId + '/'
	};
	var iamParams = {};
	var roleParams = {
		RoleName: project
	};
	var groups = await getGroups(groupParams);
	var s3Folders = await getS3Info(s3Params,'data');
	var iamRoles = await getIamInfo(iamParams);
	try {
	var rolePolicy = await checkIamPolicy(roleParams);
	} catch(err) {
	var rolePolicy;
	}
	var p = new Promise(function(resolve, reject){
	var projectArray = {};
	var groupPresent = false;
	groups.Groups.forEach(function(value, i){
		if(groups.Groups[i].GroupName == project){
			groupPresent = true;
		}
		i++
	});
	if(groupPresent == false){
		projectArray.group = false;
	} else {
		projectArray.group = true;
	}
	var s3Present = false;
	var keyName = 'cognito/' + _config.cognito.clientId + '/' + project + '/';
	s3Folders.Contents.forEach(function(value, i){
		if(s3Folders.Contents[i].Key == keyName){
			s3Present = true;
		}
		i++;
	});
	if(s3Present == false){
		projectArray.s3 = false;
	} else {
		projectArray.s3 = true;
	}

	var iamPresent = false;
	iamRoles.Roles.forEach(function(value, i){
		if(iamRoles.Roles[i].RoleName == project){
			iamPresent = true;
		}
		i++;
	});
	if(iamPresent == false){
		projectArray.iam = false;
	} else {
		projectArray.iam = true;
	}

	var presentPolicy = {};
	if(rolePolicy != undefined){
		rolePolicy.PolicyNames.forEach(function(value, i){
			presentPolicy[i] = rolePolicy.PolicyNames[i];
			i++;
		});
		projectArray.rolePolicies = presentPolicy;
	}
	resolve(projectArray);
	});
	return p;
}

async function s3Folder(project){
	var p = new Promise(function(resolve, reject){
	if(typeof(project) !== 'undefined'){
	var params = {
		Key: 'cognito/' + _config.cognito.clientId + '/' + project + '/',
		ServerSideEncryption: 'AES256'
	};
	s3.putObject(params, function(err, data){
		if(err){
			alert(err + 'check console.');
			console.log(err,err.stack);
			reject();
		} else{
			resolve();
		}
	});
	}
	});
	return p;
}
async function iamRole(project){
	await s3Folder(project);
	var fullPolicy = await getPolicy();
	var trust = fullPolicy.trust;
	var p = new Promise(function(resolve, reject){
	var params = {
		Path: '/Customers/',
		RoleName: project,
		AssumeRolePolicyDocument: JSON.stringify(trust),
		Description: 'The Access Policy for ' + project
	};
	iam.createRole(params, function(err, data){
		if(err){
			alert(err + 'check console.');
			console.log(err, err.stack);
			reject();
		} else{
			resolve(data.Role.Arn);
		}
	});
	});
	return p;
}
async function getPolicy(){
var jsonParams = {
	Bucket: _config.s3.bucket,
	Key: 'JSON/policy.json',
};
var p = new Promise(function(resolve, reject){
s3.getObject(jsonParams, function(err,data){
	if(err){
		alert(err + 'check console.');
		console.log(err,err.stack);
		reject();
	} else {
		var policy = data.Body.toString('ascii');
		var policyJson = JSON.parse(policy);
		resolve(policyJson);
	}
});
});
return p;
}
async function iamPolicy(project){
	var role = await iamRole(project);
	var fullPolicy = await getPolicy();
	var policy = fullPolicy.access;
	policy.Statement[0].Condition.StringLike['s3:prefix'][0] = "cognito/" + _config.cognito.clientId + "/" + project + "/";
	policy.Statement[1].Resource[0] = "arn:aws:s3:::" + _config.s3.bucket + "/cognito/" + _config.cognito.clientId + "/" + project + "/*";
	var p = new Promise(function(resolve, reject){
	var iamParams = {
		PolicyDocument: JSON.stringify(policy),
		PolicyName: project + "-S3AccessPolicy",
		RoleName: project
	};
	iam.putRolePolicy(iamParams, function(err, data){
		if(err){
			alert(err + 'check console.');
			console.log(err, err.stack);
			reject();
		} else {
			resolve(role);
		}
	});
	});
	return p;
}
async function cognitoGroup(project){
	var role = await iamPolicy(project);
	var p = new Promise(function(resolve, reject){
	var groupParams = {
		GroupName: project,
		UserPoolId: _config.cognito.userPoolId,
		Description: project + " group",
		Precedence: 1,
		RoleArn: role,
	};
	cognitoidentityserviceprovider.createGroup(groupParams, function(err, data){
		if(err){
			alert(err + 'check console.');
			console.log(err, err.stack);
			reject();
		} else {
			resolve();
		}
	});
	});
	return p;
}
async function cognitoUser(name, email, phone, tempPass){
	var p = new Promise(function(resolve, reject){
	var userParams = {
		UserPoolId: _config.cognito.userPoolId,
		Username: email,
		DesiredDeliveryMediums: [
			'EMAIL'
		],
		TemporaryPassword: tempPass,
		UserAttributes: [
			{
				Name: 'name',
				Value: name
			},
			{
				Name: 'email',
				Value: email
			},
			{
				Name: 'phone_number',
				Value: phone
			},
			{
				Name: "email_verified",
				Value:"True"
			},
			{
				Name:"phone_number_verified",
				Value:"True"
			}
		]
	};
	cognitoidentityserviceprovider.adminCreateUser(userParams, function(err, data){
		if(err){
			alert(err + 'check console.');
			console.log(err, err.stack);
			reject();
		} else {
			resolve(data.User.Username);
		}
	});
	});
	return p;
}
async function addToGroup(project, name, email, phone, tempPass){
	var user = await cognitoUser(name, email, phone, tempPass);
	var p = new Promise(function(resolve, reject){
	var addParams = {
		GroupName: project,
		UserPoolId: _config.cognito.userPoolId,
		Username: user
	};
	cognitoidentityserviceprovider.adminAddUserToGroup(addParams, function(err, data){
		if(err){
			alert(err + 'check console.');
			console.log(err, err.stack);
			reject();
		} else {
			resolve();
		}
	});
	});
	return p;
}

function getRandomInt(min, max){
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
}

async function projectNumberGenerator(){
	var p = new Promise(function(resolve, reject){
	var params = {
		UserPoolId: _config.cognito.userPoolId
	};
	cognitoidentityserviceprovider.listGroups(params, function(err, data){
		if(err){
			alert(err + ' check console.');
			console.log(err, err.stack);
			reject();
		} else {
			var numId = data.Groups.length + 1;
			var numRandom = getRandomInt(1, 100000);
			var checksum = numId.toString().length + numRandom.toString().length;
			var cxNum = 'PX1-' + numId + '-' + numRandom + '-' + checksum;
			resolve(cxNum);
		}
	});
	});
	return p;
}

async function createProject(){
	var project = document.getElementById('projectName').value;
	var projectNumber = await projectNumberGenerator();
	var projectFullName = project + '_' + projectNumber;

	var projectRegex = new RegExp("/[^a-zA-Z0-9+=,.@_-]/");
	if (projectRegex.test(projectFullName) || projectFullName.indexOf(' ') >= 0){
		alert('Project Names must be Alphanumeric and can only contain the following symbols: +=,.@_-');
		return;
	} else {

	var check = await projectChecker(projectFullName);
	var canCreate;
	if(Object.values(check).indexOf(true) > -1){
		canCreate = false;
		alert(JSON.stringify(check));
		document.getElementById("projectForm").reset();
	} else {
		canCreate = true;
	}
	if(canCreate == true){
	await cognitoGroup(projectFullName);
	document.getElementById("projectForm").reset();
	location.reload();
	}
	}
}

function phoneFormatter(phone){
	var phoneReform = phone.replace(/[^0-9]/g, '');
	if(phoneReform.length !== 10){
		return false;
	} else {
		var correctPhone = '+1' + phoneReform;
		return correctPhone;
	}
}

async function createUser(){
	var project = document.getElementById('userProject').value;
	var name = document.getElementById('name').value;
	var email = document.getElementById('userEmail').value;
	var phone = document.getElementById('phone').value;
	var canPhone = phoneFormatter(phone);

	var UPPERCASE_CHAR_CODES = arrayFromLowToHigh(65, 90);
	var LOWERCASE_CHAR_CODES = arrayFromLowToHigh(97, 122);
	var NUMBER_CHAR_CODES = arrayFromLowToHigh(48, 57);
	var SYMBOL_CHAR_CODES = arrayFromLowToHigh(35, 38).concat(arrayFromLowToHigh(63, 64)).concat(arrayFromLowToHigh(94, 95)).concat(arrayFromLowToHigh(123, 126)).concat(arrayFromLowToHigh(33, 33)).concat(arrayFromLowToHigh(61, 61));
	var ALL_CHAR_CODES = UPPERCASE_CHAR_CODES.concat(LOWERCASE_CHAR_CODES).concat(NUMBER_CHAR_CODES).concat(SYMBOL_CHAR_CODES);
	function generatePassword(){
		var charCodes = ALL_CHAR_CODES;
		var passChars = [];
		for (let i = 0; i < 10; i++){
			var characterCode = charCodes[Math.floor(Math.random() * charCodes.length)];
			passChars.push(String.fromCharCode(characterCode));
		}
		return passChars.join('');
	}
	function arrayFromLowToHigh(low, high){
		var array = [];
		for (let i = low; i <= high; i++){
			array.push(i);
		}
		return array;
	}
	var tempPass = generatePassword();
	var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
	while (!strongRegex.test(tempPass)){
		tempPass = generatePassword();
	}
	var canUser = await checkForUser(email);
	if(canPhone == false){
		alert('Please Enter a Valid Phone Number with 10 Digits.');
		return;
	}
	if(canUser == true){
		await addToGroup(project, name, email, canPhone, tempPass);
		document.getElementById("userForm").reset();
		location.reload();
	} else {
		alert('User Already Exists, Please Refer to Clients List');
		document.getElementById("userForm").reset();
		return;
	}
}
const projectBtn = document.getElementById("projectBtn");
const userBtn = document.getElementById("userBtn");
const uploadBtn = document.getElementById("uploadBtn");
const uploadSelect = document.getElementById("uploadFile");
const addUserBtn = document.getElementById("projectAddBtn");

projectBtn.addEventListener("click", createProject, false);
userBtn.addEventListener("click", createUser, false);
uploadBtn.addEventListener("click", uploadFile, false);
uploadSelect.addEventListener('change', uploadDisplay, false);
addUserBtn.addEventListener('click', addUserToProject, false);

AWS.config.httpOptions.timeout = 0;

function uploadDisplay(){
	var progressDiv = document.getElementById('progressDiv');
	while(progressDiv.firstChild){
		progressDiv.removeChild(progressDiv.firstChild);
	}
	var fileInput = document.getElementById('uploadFile');
	var files = fileInput.files;
	var file = files[0];
	if(!files.length){
		var para = document.createElement('p');
		para.textContent = 'No File Selected';
		progressDiv.appendChild(para);
	} else {
		var para = document.createElement('p');
		var fileType = file.name.substring(file.name.length, file.name.length - 4);
		if(fileType != '.zip'){
			var sure = confirm('Are you sure you want to upload a Non-Zipped File?');
			if(sure == true){
				para.textContent = file.name + ' ' + bytesToSize(file.size);
				progressDiv.appendChild(para);
			} else {
				fileInput.value = '';
				para.textContent = 'No File Selected';
				progressDiv.appendChild(para);
			}
		} else {
			para.textContent = file.name + ' ' + bytesToSize(file.size);
			progressDiv.appendChild(para);
		}
	}
}

async function uploadFile(){
	var project = document.getElementById('uploadProject').value;
	var files = document.getElementById('uploadFile').files;
	var flightDate = document.getElementById('flightDate').value;
	if(!files.length || flightDate == '') {
		return alert('You Must Select a File and Flight Date First.');
	} else {
	var canUpload = await checkS3Upload(project);
	var confirmation;
	if (canUpload != false){
		confirmation = confirm('A file has already been uploaded today. File Name: ' + canUpload.recentFile + ' Are you sure you want to upload?');
	} else {
		confirmation = true;
	}
	if(confirmation == true){
	var file = files[0];
	flightDate = flightDate.replace(/-/g, '');
	var fileName = flightDate + ' ' + file.name;
	var pathKey = 'cognito/' + _config.cognito.clientId + '/' + project + '/';
	var fileKey = pathKey + fileName;
	var progressDiv = document.getElementById('progressDiv');
	var upload = new AWS.S3.ManagedUpload({
		params: {
			Bucket: _config.s3.bucket,
			Key: fileKey,
			Body: file
		}
	}).on('httpUploadProgress', function(evt){
		var uploaded = Math.round(evt.loaded / evt.total * 100);
		while(progressDiv.children.length == 2){
			progressDiv.removeChild(progressDiv.lastChild);
		}
		var para = document.createElement('p');
		para.textContent = 'Upload Progress: ' + uploaded + '%';
		progressDiv.appendChild(para);
	});

	var promise = upload.promise();

	promise.then(
		function(data) {
			alert('Successfully uploaded file.');
			document.getElementById('uploadForm').reset();
			location.reload();
		},
		function(err){
			console.log(err, err.stack);
			document.getElementById('uploadForm').reset();
			return alert('There was an error uploading your file: ', err.message);
		}
	);
	}
	}
}
function findWithAttr(array, attr, value){
	for(var i = 0; i < array.length; i+=1){
		if(array[i][attr] === value){
			return i;
		}
	}
	return -1;
}

async function getGroups(params){
	var p = new Promise(function(resolve, reject){
	cognitoidentityserviceprovider.listGroups(params, function(err, data){
		if(err){
			alert(err + 'check console.');
			console.log(err, err.stack);
			reject(err);
		} else {
			var groupSelectUser = document.getElementById('userProject');
			var uploadSelectUser = document.getElementById('uploadProject');
			var addProject = document.getElementById('addSelect');
			data.Groups.forEach(function(value, i){
				var groupName = data.Groups[i].GroupName;
				var elGroup = document.createElement('option');
				elGroup.textContent = groupName;
				elGroup.value = groupName;
				var elUpload = document.createElement('option');
				elUpload.textContent = groupName;
				elUpload.value = groupName;
				var elAddProject = document.createElement('option');
				elAddProject.textContent = groupName;
				elAddProject.value = groupName;
				groupSelectUser.appendChild(elGroup);
				uploadSelectUser.appendChild(elUpload);
				addProject.appendChild(elAddProject);
				i++
			});
			resolve(data);
		}
	});
	});
	return p;
}

async function getUsersInGroup(params){
	var p = new Promise(function(resolve, reject){
	cognitoidentityserviceprovider.listUsersInGroup(params, function(err, data){
		if(err){
			alert(err + 'check console.');
			console.log(err, err.stack);
			reject(err);
		} else {
			resolve(data);
		}
	});
	});
	return p;
}

function bytesToSize(bytes){
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if(bytes == 0) return 'n/a';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	if (i == 0) return bytes + ' ' + sizes[i];
	return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

async function getS3Info(params, use){
	var p = new Promise(function(resolve, reject){
	s3.listObjectsV2(params, function(err, data){
		if(err){
			alert(err + 'check console.');
			console.log(err, err.stack);
			reject();
		} else {
			var s3Data = data;
			if(use == 'data'){
				resolve(data);
			}
			var s3FileDate;
			var recentFile;
			var totalSize = 0;
			var prefix = params.Prefix;
			s3Data.Contents.forEach(function (value, i){
				var dateChecker = new Date(s3Data.Contents[i].LastModified);
				if(s3FileDate == undefined){
					s3FileDate = dateChecker;
				} else if (dateChecker > s3FileDate){
					s3FileDate = dateChecker;
					recentFile = s3Data.Contents[i].Key.replace(prefix, '');
				}
				totalSize = totalSize + s3Data.Contents[i].Size;
				i++;
			});
			s3FileDate = s3FileDate.formatMMDDYYYY();
			if(recentFile == undefined){
				recentFile = 'Created';
			}
			var uploadArray = {
				fileDate: s3FileDate,
				recentFile: recentFile
			};
			if(use == 'uploader'){
				resolve(uploadArray);
			}
			var totalSizeFormat = bytesToSize(totalSize);
			var totalS3 = {
				'fileDate': s3FileDate,
				'fileName': recentFile,
				'size': totalSizeFormat
			};
			resolve(totalS3);
		}
	});
	});
	return p;
}


Date.prototype.formatMMDDYYYY = function(){
	var day = this.getDate();
	if(day < 10){
		return (this.getMonth() + 1) + '/0' + this.getDate() + '/' + this.getFullYear();
	} else {
		return (this.getMonth() + 1) + '/' + this.getDate() + '/' + this.getFullYear();
	}
}

Date.prototype.formatYYYYMMDD = function(){
	var day = this.getDate();
	var month = this.getMonth() + 1;
	var year = this.getFullYear();
	if (day < 10 && month < 10){
		return year + '0' + month + '0' + day;
	} else if(day < 10){
		return year + month + '0' + day;
	} else if(month < 10){
		return year + '0' + month + day;
	} else {
		return year + month + day;
	}
}
async function getTableInfo(){
	var groupParams = {
		UserPoolId: _config.cognito.userPoolId,
	};
	var groupList = await getGroups(groupParams);
	$('#tbody-clients').empty();
	var groupsProcessed = 0;
	var userSelect = document.getElementById('userSelect');
	var userEmails = [];
	groupList.Groups.forEach(async function(value, i){
		var listUserParams = {
			GroupName: groupList.Groups[i].GroupName,
			UserPoolId: _config.cognito.userPoolId
		};
		var userInfo = await getUsersInGroup(listUserParams);
			userInfo.Users.forEach(async function(value, a){
				var userAttr = userInfo.Users[a].Attributes;
				var clientNameInd = findWithAttr(userAttr, 'Name', 'name');
				var clientName = userAttr[clientNameInd].Value;
				var clientEmailInd = findWithAttr(userAttr, 'Name', 'email');
				var clientEmail = userAttr[clientEmailInd].Value;
				var clientProject = groupList.Groups[i].GroupName;
				var clientDate = new Date(userInfo.Users[a].UserCreateDate).formatMMDDYYYY();
				var clientEnabled;
				if(!userEmails.includes(clientEmail)){
					userEmails.push(clientEmail);
					var elUserSelect = document.createElement('option');
					elUserSelect.textContent = clientEmail;
					elUserSelect.value = clientEmail;
					userSelect.appendChild(elUserSelect);
				}
				if(userInfo.Users[a].Enabled == true){
					clientEnabled = 'Enabled';
				} else {
					clientEnabled = 'Disabled';
				}
				$('#tbody-clients').append('<tr><td>' + clientName + '</td><td>' + clientEmail + '</td><td>' + clientProject + '</td><td>' + clientDate + '</td><td>' + clientEnabled + '</td></tr>');
				a++;
			});
		var groupName = groupList.Groups[i].GroupName;
		var s3ProjectParams = {
			Bucket: _config.s3.bucket,
			Prefix: 'cognito/' + _config.cognito.clientId + '/' + groupName + '/'
		};
		var s3Data = await getS3Info(s3ProjectParams, 'files');
		var mostRecentFile = s3Data.fileDate;
		var mostRecentName = s3Data.fileName;
		var numLogins = userInfo.Users.length;
		var storageSize = s3Data.size;
		$('#tbody-projects').append('<tr><td>' + groupName + '</td><td>' + mostRecentFile + '</td><td>' + mostRecentName + '</td><td>' + numLogins + '</td><td>' + storageSize + '</td></tr>');
		groupsProcessed++;
		i++;
		if(groupsProcessed === Object.keys(groupList.Groups).length){
			tableInitiate();
		}
	});
}

async function tableInitiate(){
$(document).ready(function(){
	$('#tb-projects').DataTable({
		"pagingType": "simple_numbers",
		"order": [[0, "desc"]],
		"aaSorting": [],
		columnDefs: [{
			orderable: false,
			targets: 4
		}]
	});
	$('#tb-clients').DataTable({
		"pagingType": "simple_numbers",
		"order": [[0, "desc"]],
		"aaSorting": [],
	});
	$('.dataTables_length').addClass('bs-select');
});
}
getTableInfo();

} else {
	window.location.href = _config.download.url + 'dashboard';
}
		}
	});
} else {
	window.location.href = _config.download.login;
}
}
