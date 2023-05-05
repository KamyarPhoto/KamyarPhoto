<?php
header('Content-Type: application/json; charset=utf-8');
if(!empty($_POST)){
$code = $_POST['code'];
$url = "https://kamyarphoto.auth.us-east-2.amazoncognito.com/oauth2/token";
$data = [
	'grant_type' => 'authorization_code',
	'code' => $code,
	'client_id' => '1kq3ba43gbqnfckojvs3lq4amf',
	'redirect_uri' => 'https://kamyarphotodownload.com/'
];
$options = [
	'http' => [
		'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
		'method' => "POST",
		'content' => http_build_query($data)
	]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);
if($result === false) {
	$badResult = [
		"token" => "false"
	];
	echo json_encode($badResult);
} else {
	echo $result;
}
}

