const MongoClient = require("mongodb").MongoClient;
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const port = process.env.PORT || 3000;
const dbUrl = "mongodb://iat:abc123@ds029798.mlab.com:29798/heroku_5c8pg0cp";

// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());

// Functions
const addResultToDB = (result) => {
	MongoClient.connect(dbUrl, (err, db) => {
		if (err) throw err;
		db.db("heroku_5c8pg0cp")
			.collection("iat")
			.insertOne(result, (err, res) => {
				if (err) throw err;
				db.close();
			});
	});
};

// Routes
app.get("/", (req, res) => {
	res.render("index.ejs");
});

app.get("/github", (req, res) => {
	res.redirect("https://github.com/KePeterZ/ouriat");
});

app.post("/results", (req, res) => {
	baseJson = req.body;
	baseJson.time = new Date().getTime();
	addResultToDB(baseJson);
	res.send({ status: "SUCCESS" });
});

app.post("/resultsdb", (req, res) => {
	addResult(req.body)
	res.send({ status: "SUCCESS" });
});

app.delete("/results", (req, res) => {

		// Send the results in response just in case
		const data = fs.readFileSync(logFile) + "";

		// Reset file
		fs.writeFileSync(logFile, JSON.stringify([]));
		res.setHeader("Content-Disposition", "attachment; filename=logs.json");
		res.end(data);

});

app.use("*", (req, res) => {
	res.redirect("/");
});

app.listen(port, (err) => {
	if (err) {
		console.log(err);
	} else {
		console.log("Listening on " + port);
	}
});
