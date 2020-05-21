const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();

const port = process.env.PORT || 3000;
const logFile = __dirname + "/logs.json";

// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());

// Setup logFile if does not exists
if (!fs.existsSync(logFile)) {
	fs.writeFileSync(logFile, JSON.stringify([]));
}

// Functions
const log = async (toLog) => {
	const data = fs.readFileSync(logFile);
	const json = JSON.parse(data);
	toLog.id = new Date().getTime();
	json.push(toLog);
	// KePeterZ helped me
	fs.writeFileSync(logFile, JSON.stringify(json));
};

// Routes
app.get("/", (req, res) => {
	res.render("index.ejs");
});

app.get("/github", (req, res) => {
	res.redirect("https://github.com/KePeterZ/ouriat");
});

app.get("/results", (req, res) => {
	// KePeterZ's
	const data = fs.readFileSync(logFile) + "";
	res.setHeader("Content-Disposition", "attachment; filename=logs.json");
	res.end(data);
});

app.post("/results", (req, res) => {
	log(req.body);
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
