const jwt = require('jsonwebtoken');

require('dotenv').config();

module.exports.createAccessToken = (user) => {
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	};
	return jwt.sign(data, process.env.JWT_SECRET_KEY, {})

}

module.exports.verify = (req, res, next) => {
	console.log(req.headers.authorization);

	let token = req.headers.authorization;

	if(typeof token === "undefined"){
		return res.send({ auth: "Failed. No Token" })
	}else{
		console.log(token);
		token = token.slice(7, token.length);
		console.log(token);

		jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken){
			if(err){

				return res.status(403).send({
					auth: "Failed",
					message: err.message
				});

			}else{

				console.log("result from verify method:")
				console.log(decodedToken);

				req.user = decodedToken;

				// next() is an expressJS function which allows us to move to the next function in the route. It also passes details of the request and response to next function/middleware
				next();
			}
		})
	}
}

module.exports.verifyAdmin = (req, res, next) => {

	// console.log('result from verifyAdmin method');
	// console.log(req.user);
	if(req.user.isAdmin){
		next();
	}else{
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}

}

module.exports.errorHandler = (err, req, res, next) => {
	// Logs the error
	console.error(err);

	const statusCode = err.status || 500;
	const errorMessage = err.message || 'Internal Server Error'; 
	res.status(statusCode).json({
		
		error: {
			message: errorMessage,
			errorCode: err.code || 'SERVER_ERROR',
			details: err.details || null
		}

	})

}