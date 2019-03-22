const http = require('http');
const url = require('url');
const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const imdb = require('./imdb');
const DENZEL_IMDB_ID = 'nm0000243';
const graphqlHTTP = require('express-graphql');
const { GraphQLSchema } = require('graphql');

const { GraphQLObjectType,
    GraphQLString
} = require('graphql');
const _ = require('lodash');
const request = require('request');

const { movieType } = require('./types.js');

var fs = require('fs');
var CONNECTION_URL = fs.readFileSync('url.txt', 'utf8'); //MongoDB Atlas connection

//console.log(CONNECTION_URL);
const DATABASE_NAME = "movies";

var movies;
async function sandbox(actor) {
    try {
        movies = await imdb(actor);
        console.log("IMDB operation finished");
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


//Define the Query
const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        hello: {
            type: GraphQLString,

            resolve: function () {
                return "Hello World";
            }
        },

        movie: {
            type: movieType,
            args: {
                id: { type: GraphQLString }
            },
            resolve: async function (source, args) {
                try{
                    var response = await collection.find({}).toArray();
                }
                catch(error)
                {

                }
                return _.find(response, { id: args.id });
            }
        },

        random: {
            type: movieType,
            args: {
            },
            resolve: async function(source, args){
                try{
                    var size = await collection.countDocuments();
                    var random = Math.floor(Math.random() * Math.floor(size));
                    var response = await collection.find({}).limit(1).skip(random).toArray();
                    var randomId = response[0].id;
                }
                catch(error){

                }
                return _.find(response, {id: randomId});
            }
        },

        addReview: {
            type: movieType,
            args: {
                watchDate: {type: GraphQLString},
                review: {type: GraphQLString},
                id: {type: GraphQLString}
            },
            resolve: async function(source, args){
                var query = { "id": args.id };
                var newValues = { $set: { date: args.watchDate, review: args.review } };
                try{
                    var result = await collection.updateOne(query, newValues);
                }
                catch(error)
                {

                }
                return _.find(result, {id: args.id});
            }
        },

        populate: {
            type: mongoAnswer,
            resolve: async function(){
                try{
                    var result = await collection.insertMany(movies);
                }
                catch(error){
                    return _.find(error, {errmsg: error.errmsg});
                }
                return _.find(result, {});
            }
        }

    }
});

app.listen(5000, () => {
    const schema = new GraphQLSchema({ query: queryType });

    //Setup the nodejs GraphQL server
    app.use('/graphql', graphqlHTTP({
        schema: schema,
        graphiql: true,
    }));
    console.log(`GraphQL Server Running at localhost:5000`);
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



exports.queryType = queryType;

