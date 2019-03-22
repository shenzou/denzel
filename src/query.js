const { GraphQLObjectType,
    GraphQLString,
    GraphQLInt
} = require('graphql');
const _ = require('lodash');
const request = require('request');

const { movieType } = require('./types.js');
//let movies = require('./data.js');


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
            resolve: function (source, args) {
                var movies;
                request('http://localhost:9292/movies', { json: true }, (err, res, body) => {
                    if (err) { return console.log(err); }
                    console.log(body.url);
                    movies = body.explanation;
                });
                console.log(movies);
                return _.find(movies, { id: args.id });
            }
        }
    }
});

exports.queryType = queryType;