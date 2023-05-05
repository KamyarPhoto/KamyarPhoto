window._config = {
	cognito: {
		userPoolId: 'us-east-2_YHqhKSMsN',
		region: 'us-east-2',
		clientId: '1kq3ba43gbqnfckojvs3lq4amf',
		identityPoolId: 'us-east-2:60a79119-e4f9-4ae0-b73e-9ee168ef24af',
		idProvName: 'cognito-idp.us-east-2.amazonaws.com/us-east-2_YHqhKSMsN'
	},
	s3: {
		bucket: 'kamyar-photo-download'
	},
	download: {
		url: 'https://kamyarphotodownload.com/',
		login: 'https://kamyarphoto.auth.us-east-2.amazoncognito.com/login?client_id=1kq3ba43gbqnfckojvs3lq4amf&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://kamyarphotodownload.com/'
	}
};
