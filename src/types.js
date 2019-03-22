const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLFloat
} = require('graphql');

// Define Movie Type
movieType = new GraphQLObjectType({
    name: 'Movie',
    fields: {
        link: {type: GraphQLString},
        id: { type: GraphQLString },
        metascore: {type: GraphQLInt},
        poster: {type: GraphQLString},
        rating: {type: GraphQLFloat},
        synopsis: {type: GraphQLString},
        title: {type: GraphQLString},
        votes: {type: GraphQLFloat},
        year: {type: GraphQLInt},
        watchDate: {type: GraphQLString},
        review: {type: GraphQLString}
    }
});

mongoAnswer = new GraphQLObjectType({
    name: "Mongo",
    fields: {
        errmsg: {type: GraphQLString},
        ok: {type: GraphQLInt},
        n: {type: GraphQLInt}
    }
});

exports.movieType = movieType;
exports.mongoAnswer = mongoAnswer;