const http = require('http');
const url = require('url');
const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const imdb = require('./imdb');
const DENZEL_IMDB_ID = 'nm0000243';

var fs = require('fs');
var CONNECTION_URL = fs.readFileSync('url.txt', 'utf8'); //MongoDB Atlas connection

//console.log(CONNECTION_URL);
const DATABASE_NAME = "movies";

var movies;
async function sandbox(actor) {
    try {
        movies = await imdb(actor);

    } catch (e) {
        console.error(e);

    }
}

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(9292, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        sandbox(DENZEL_IMDB_ID);
        if (error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("movies");
        console.log("Connected to `" + DATABASE_NAME + "`!");

    });
});



app.get("/movies/populate", (request, response) => {

    collection.insertMany(movies, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
        console.log("Added movies.");
    });
});



app.get("/movies/search", (request, response) => {
    var limit = request.query.limit;
    if (limit == null) limit = 5;
    var metascore = request.query.metascore;
    if (metascore == null) metascore = 0;
    var query = { metascore: { $gte: parseInt(metascore) } };
    collection.find(query).limit(parseInt(limit)).toArray((error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});



app.get("/movies", (request, response) => {
    collection.find({}).toArray((error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});


app.get("/movies/:id", (request, response) => {
    collection.findOne({ "id": request.params.id }, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.post("/movies/:id", (request, response) => {
    var date = request.body.date;
    var review = request.body.review;
    var query = { "id": request.params.id };
    collection.updateOne(query, { $set: { date: date, review: review } }, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
        console.log("Added new review");
    });
});

//HTTP server
app.use(Express.static('static'));

http.createServer(function (req, res) {
    var path = url.parse(req.url).pathname;
    switch (path) {
      case '/index.html':
        fs.readFile(__dirname + path, function (err, data) {
          if (err) {
            response.writeHead(404);
            response.write(error);
            response.end();
          }
          else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            res.end();
          }
        });
        break;
      default:
        fs.readFile(__dirname + "/dontexist.html", function (err, data) {
          if (err) {
            response.writeHead(404);
            response.write(err);
            response.end();
          }
          else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            res.end();
          }
        });
        break;
    }
  
  }).listen(8080);

