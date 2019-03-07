"use strict";

const _ = require("lodash");
const { MoleculerClientError } 	= require("moleculer").Errors;

const graphQlFactory = require("../helpers/jsonSchema2GraphQlSchema");
const jsonSchema = require("../helpers/jsonSchema2GraphQlSchema/card.schema.json");

const cards = [
	{ id: 1, title: "First post", author: 3, votes: 2, voters: [2,5], createdAt: new Date("2018-08-23T08:10:25") },
	{ id: 2, title: "Second post", author: 1, votes: 0, voters: [], createdAt:new Date("2018-11-23T12:59:30")  },
	{ id: 3, title: "Third post", author: 2, votes: 1, voters: [5], createdAt:new Date("2018-02-23T22:24:28")  },
	{ id: 4, title: "4th post", author: 3, votes: 3, voters: [4,1,2], createdAt: new Date("2018-10-23T10:33:00") },
	{ id: 5, title: "5th post", author: 5, votes: 1, voters: [4], createdAt: new Date("2018-11-24T21:15:30") },
];
const factory = new graphQlFactory(jsonSchema);
const graphQlDefinition = factory.build();
console.log("----");
console.log(graphQlDefinition);
console.log("----");

module.exports = {
	name: "cards",
	settings: {
		graphql: graphQlDefinition,
	},
	actions: {
		find: {
			//cache: true,
			params: {
				limit: { type: "number", optional: true }
			},
			graphql: {
				query: "cards(limit: Int): [Card]"
			},
			handler(ctx) {
				let result = _.cloneDeep(cards);
				if (ctx.params.limit)
					result = cards.slice(0, ctx.params.limit);
				else
					result = cards;

				return _.cloneDeep(result);
			}
		},
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
