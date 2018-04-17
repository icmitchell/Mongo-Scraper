var express = require("express"); //used
var bodyParser = require("body-parser"); //used
var logger = require("morgan");
var mongoose = require("mongoose"); //used
var cheerio = require("cheerio"); //used
var request = require("request"); //used
var exphbs = require("express-handlebars"); //used

var db = require("./models");
var PORT = 8080;
var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/NYTPoliticsScraper";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
	useMongoClient: true
});

app.get("/", function(req, res){
	res.redirect("/articles")
})

app.get("/scrape", function(req, res) {
	db.Article.deleteMany({}) 
	.then(function() {
		console.log("deleted")
		request("https://www.nytimes.com/section/politics", function(error, response, html) {
			var $ = cheerio.load(html);

			$("div.story-body").each(function(i, element) {
				var article = {}
				article.headline = $(element).find("h2.headline").text().trim()
				article.summary = $(element).find("p.summary").text().trim();
				article.link = $(element).find("a.story-link").attr("href");

				db.Article.create(article)
				.then(function() {
					res.send("scraped")
				})
				.catch(function(err) {
					res.json(err);
				});
			});
		});
	})
	.catch(function(err) {
		res.json(err);
	});
});


app.get("/articles", function(req, res) {
	db.Article.find()
	.populate("note")
	.then(function(result) {
		var articleArray = []
		for (var i = 0; i < result.length; i++) {
			var articleHolder = {
				headline: result[i].headline,
				summary: result[i].summary,
				link: result[i].link,
				note: result[i].note,
				id: result[i]._id
			}
			if (result[i].note) {
				console.log(result[i].note)
				articleHolder.note = result[i].note.noteBody
			}
			articleArray.push(articleHolder)
		}

		var hbsObject = {
			articles: articleArray
		}
		res.render("articles", hbsObject);
	})
	.catch(function(err) {
		res.json(err);
	});
})

app.post("/note/:id", function(req, res) {
	db.Note.create(req.body)
	.then(function(result) {
		return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: result._id }, { new: true });
	})
	.then(function(dbResult) {
		res.json(dbResult);
	})
	.catch(function(err) {
		res.json(err);
	});
});


app.listen(PORT, function() {
	console.log("App running on port " + PORT + "!");
});
