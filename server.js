let express = require("express");
let moment = require("moment");
const bcrypt = require("bcrypt");
let app = express();
const MongoClient = require('mongodb').MongoClient;
const env = require('./env.json');

const saltRounds = 10;
const uri = `mongodb+srv://${env.db.user}:${env.db.pass}@cluster0.opm2s.mongodb.net/pythia?retryWrites=true&w=majority`;


let port = 80;
let hostname = "localhost"

app.use(express.static('public_html'));
app.use(express.json());

// Public Resources
app.get('/', function(req,res) {
	res.status(200).sendFile(__dirname + "\\public_html\\index.html\\");
});

app.post("/signup", function (req, res) {
	let userExists = false;
	let body = req.body;
	if (
		(
		!body.hasOwnProperty("first") ||
		!body.hasOwnProperty("last")  ||
		!body.hasOwnProperty("user")  ||
		!body.hasOwnProperty("email") ||
		!body.hasOwnProperty("pass1") ||
		!body.hasOwnProperty("pass2")
		) || ( // The second round only if the properties are defined
		(body.first.length < 1) ||
		(body.last.length < 1)  ||
		(body.user.length < 4)  ||
		(body.user.length > 15) ||
		(body.pass1.length < 6) ||
		(body.pass1.length > 24)
		) || (
		!(body.pass1===body.pass2)
		)
	)
	{
		return res.sendStatus(400);
	} else {
		let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
		client.connect()
		.then(client => {
			let usersC = client.db('pythia').collection('users');
			usersC.findOne({user_name:body.user})
			.then(result => {
				client.close();
				if(result !== null){
					userExists = true;
					console.log("user exists");
					return res.status(300).send("User Already Exists.");
				}
				if(!userExists){
					let user;
					bcrypt.hash(req.body.pass1, saltRounds)
					.then(function (hashedPassword){
						user = {
							first_name: body.first,
							last_name: body.last,
							user_name: body.user,
							email: body.email,
							password: hashedPassword,
							birthday: ((isValidDate(body.birthday)) ? body.birthday : "-1"),
							location: (((body.location !== null)||(body.location == ""))? body.location : "na"),
							sick: false,
							friends : []
						};
						let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
						client.connect()
						.then(client => {
						let usersC = client.db('pythia').collection('users');
						usersC.insertOne(user)
							.then(result => {
								client.close();
								return res.status(200).redirect(302, '/members');
							}).catch(error => {
								console.error(error);
								return status(500).send();
							});
						});
					})
					.catch(error => console.error(error));
				}
			}).catch(function (error) {
				return res.status(500).send("The server had an issue, please try again.");
			});
		}).catch(error => {
			console.error(error);
			client.close();
			return status(500).send();
		});
//____________________________________________________________________________________________________________

	}
});

app.get('/searchAll', (req, res) => {
	let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect()
	.then(client => {
		let usersC = client.db('pythia').collection('users');
		usersC.find().toArray()
			.then(result => {
				client.close();
				result.forEach(function(v){ delete v._id; delete v.password; delete v.birthday; delete v.email; delete v.location; delete v.friends});
				if(result == null)
					return res.status(404).send("No users found.");
				else
					return res.status(200).json(result);
			}).catch(function (error) {
					console.log(error);
					res.status(500).send("The server had an issue, please try again.");
			});
	}).catch(error => {
		console.error(error);
		client.close();
		return status(500).send();
	});
});

app.get('/loadProfile', (req, res) => {
	let username = req.query.user;
	let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect()
	.then(client => {
		let usersC = client.db('pythia').collection('users');
		usersC.findOne({user_name:username})
			.then(result => {
				client.close();
				delete result._id; delete result.password; delete result.birthday; delete result.friends;
				if(result == null)
					return res.status(404).send("No users found.");
				else
					return res.status(200).json(result);
			}).catch(function (error) {
					console.log(error);
					res.status(500).send("The server had an issue, please try again.");
			});
	}).catch(error => {
		console.error(error);
		client.close();
		return status(500).send();
	});
});

app.get('/loadFriends', (req, res) => {
	let username = req.query.user;
	let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect()
	.then(client => {
		let usersC = client.db('pythia').collection('users');
		usersC.findOne({user_name:username})
			.then(result => {
				client.close();
				delete result._id; delete result.password; delete result.birthday;
				if(result == null)
					return res.status(404).send("No users found.");
				else
					return res.status(200).json({"friends":result.friends});
			}).catch(function (error) {
					console.log(error);
					res.status(500).send("The server had an issue, please try again.");
			});
	}).catch(error => {
		console.error(error);
		client.close();
		return status(500).send();
	});
});

// Should be locked down, using session cookies
app.get('/members', function(req, res) {
	res.sendFile(__dirname + "\\public_html\\members.html\\");
});

app.post('/login', function(req, res){
	
	let dbquery;
	if(req.body.hasOwnProperty("username")&&(req.body.username!==""))
		dbquery = {user_name : req.body.username};
	else if(req.body.hasOwnProperty("email")&&(req.body.email!==""))
		dbquery = {email : req.body.email};
	else
		return status(401).send("UNAUTHORIZED");

	if(!req.body.hasOwnProperty("password"))
		return status(401).send("UNAUTHORIZED");

	let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect()
	.then(client => {
		let usersC = client.db('pythia').collection('users');
		usersC.findOne(dbquery)
		.then(result => {
			if(result == null)
				return res.status(401).send("Incorrect account info.");
			bcrypt
			.compare(req.body.password, result.password)
			.then(function(isSame){
				if(isSame)
					return res.status(200).redirect(302, '/members');
				else
					return res.status(401).send("Incorrect account info.");
			}) 
			.catch(function (error) {
				console.log(error);
				res.status(500).send("The server had an issue, please try again.");
			});
		}).catch(error => {
			console.error(error);
			client.close();
			return status(500).send();
		});
	});
});

app.put('/changePassword', function(req,res){
	if((!req.body.hasOwnProperty("pass1"))||
	   (!req.body.hasOwnProperty("pass2"))||
	   (!req.body.hasOwnProperty("username"))){
		return res.status(401).send();
	} else {
		let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
		client.connect().then(client => {
			let usersC = client.db('pythia').collection('users');
			bcrypt.hash(req.body.pass1, saltRounds)
			.then(function (hashedPassword){
				usersC.findOneAndUpdate(
					{ user_name: req.body.username },
					{
						$set: {
							password: hashedPassword
						}
					}
				)
				.then(result => {client.close();})
				.catch(error => console.error(error))
			}).catch((err)=>{console.log(err);});
		}).catch(error => {
			console.error(error);
			client.close();
			return res.status(500).send();
		});
	}
});

app.put('/changeHealth', function(req,res){
	if((!req.body.hasOwnProperty("sick"))||
	   (!req.body.hasOwnProperty("username"))){
		return res.status(404).send();
	} else {
		let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
		client.connect().then(client => {
			let usersC = client.db('pythia').collection('users');
			usersC.findOneAndUpdate(
				{ user_name: req.body.username },
				{
					$set: {
					sick: req.body.sick
					}
				}
			)
			.then(result => {client.close();})
			.catch(error => console.error(error))
		}).catch(error => {
			console.error(error);
			client.close();
			return res.status(500).send();
		});
	}
});

app.put('/addFriend', function(req,res){
	if((!req.body.hasOwnProperty("friend"))||
	   (!req.body.hasOwnProperty("username"))){
		return res.status(401).send();
	} else {
		let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
		client.connect().then(client => {
			let usersC = client.db('pythia').collection('users');
			usersC.findOneAndUpdate(
				{ user_name: req.body.username },
				{ $push : { friends: req.body.friend } }
			)
			.then(result => {client.close();})
			.catch(error => console.error(error))
		}).catch(error => {
			console.error(error);
			client.close();
			return res.status(500).send();
		});
	}
});

app.listen(port,() => {
	console.log(`Listening at: http://${hostname}:${port}`);
});

function isValidDate(dateString)
{
	return moment(dateString, 'YYYY-MM-DD',true).isValid();
}