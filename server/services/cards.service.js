"use strict";

const _ = require("lodash");
const { MoleculerClientError } 	= require("moleculer").Errors;

const DbService = require("moleculer-db");
const MongoAdapter = require("moleculer-db-adapter-mongo");
const ApiGateway = require("moleculer-web");

const graphQlFactory = require("../helpers/jsonSchema2GraphQlSchema");
const jsonSchema = require("../helpers/jsonSchema2GraphQlSchema/card.schema.json");
const factory = new graphQlFactory(jsonSchema);
const graphQlDefinition = factory.build();

module.exports = {
	name: "cards",
	mixins: [DbService],
	adapter: new MongoAdapter("mongodb://mongodb/cards"),
	collection: "cards",
	settings: {
		graphql: graphQlDefinition,
	},
	actions: {
		error: {
			handler() {
				throw new Error("Oh look an error !");
			}
		},
	},

	methods: {
		findByID(id) {
			return posts.find(post => post.id == id);
		}
	}
};
