"use strict";

module.exports = {
    name: "posts",
    settings: {
        graphql: {
            type: `
                """
                This type describes a post entity.
                """
                type Post {
                    id: Int!
                    title: String!
                    author: User!
                    votes: Int!
                    voters: [User]
                    createdAt: Timestamp
                }
            `,
            resolvers: {
                Post: {
                    author: {
                        // Call the `users.resolve` action with `id` params
                        action: "users.resolve",
                        rootParams: {
                            "author": "id"
                        }
                    },
                    voters: {
                        // Call the `users.resolve` action with `id` params
                        action: "users.resolve",
                        rootParams: {
                            "voters": "id"
                        }
                    }
                }
            }
        }
    },
    actions: {
        find: {
            //cache: true,
            params: {
                limit: { type: "number", optional: true }
            },
            graphql: {
                query: `posts(limit: Int): [Post]`
            },
            handler(ctx) {
                let result = _.cloneDeep(posts);
                if (ctx.params.limit)
                    result = posts.slice(0, ctx.params.limit);
                else
                    result = posts;

                return _.cloneDeep(result);
            }
        },

        findByUser: {
            params: {
                userID: "number"
            },
            handler(ctx) {
                return _.cloneDeep(posts.filter(post => post.author == ctx.params.userID));
            }
        },
    }
};
