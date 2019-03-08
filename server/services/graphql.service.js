"use strict";

const ApiGateway 	= require("moleculer-web");
const { ApolloService } = require("moleculer-apollo-server");

module.exports = {
	name: "graphql",

	mixins: [
		// Gateway
		ApiGateway,
    // GraphQL Apollo Server
		ApolloService({

			// Global GraphQL typeDefs
			typeDefs: `
				scalar Date
				scalar Timestamp
        scalar ObjectId
			`,

			// Global resolvers
			resolvers: {
				ObjectId: {
					__parseValue(value) {
						return value; // value from the client
					},
					__serialize(value) {
						return value.toISOString(); // value sent to the client
					},
					__parseLiteral(ast) {
						if (ast.kind === Kind.INT)
							return parseInt(ast.value, 10); // ast value is always in string format

						return null;
					}
				},
				Date: {
					__parseValue(value) {
						return new Date(value); // value from the client
					},
					__serialize(value) {
						return value.toISOString().split("T")[0]; // value sent to the client
					},
					__parseLiteral(ast) {
						if (ast.kind === Kind.INT)
							return parseInt(ast.value, 10); // ast value is always in string format

						return null;
					}
				},
				Timestamp: {
					__parseValue(value) {
						return new Date(value); // value from the client
					},
					__serialize(value) {
						return value.toISOString(); // value sent to the client
					},
					__parseLiteral(ast) {
						if (ast.kind === Kind.INT)
							return parseInt(ast.value, 10); // ast value is always in string format

						return null;
					}
				}
			},

			// API Gateway route options
			routeOptions: {
				path: "/graphql",
				cors: true,
				mappingPolicy: "restrict"
			},

			// https://www.apollographql.com/docs/apollo-server/v2/api/apollo-server.html
			serverOptions: {
				tracing: false,

				engine: {
					apiKey: process.env.APOLLO_ENGINE_KEY
				}
			}

		})
	],
  settings: {
		port: process.env.PORT || 3000,

		routes: [{
			path: "/",
			aliases: {
				"REST cards": "cards"
			}
		}],
  }
};
