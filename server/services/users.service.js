module.exports = {
    name: "users",
    settings: {
        graphql: {
            type: `
                """
                This type describes a user entity.
                """
                type User {
                    id: Int!
                    name: String!
                    birthday: Date
                    posts(limit: Int): [Post]
                    postCount: Int
                }
            `,
            resolvers: {
                User: {
                    posts: {
                        // Call the `posts.findByUser` action with `userID` param.
                        action: "posts.findByUser",
                        rootParams: {
                            "id": "userID"
                        }
                    },
                    postCount: {
                        // Call the "posts.count" action
                        action: "posts.count",
                        // Get `id` value from `root` and put it into `ctx.params.query.author`
                        rootParams: {
                            "id": "query.author"
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
                query: "users(limit: Int): [User]"
            },
            handler(ctx) {
                let result = _.cloneDeep(users);
                if (ctx.params.limit)
                    result = users.slice(0, ctx.params.limit);
                else
                    result = users;

                return _.cloneDeep(result);
            }
        },

        resolve: {
            params: {
                id: [
                    { type: "number" },
                    { type: "array", items: "number" }
                ]
            },
            handler(ctx) {
                if (Array.isArray(ctx.params.id)) {
                    return _.cloneDeep(ctx.params.id.map(id => this.findByID(id)));
                } else {
                    return _.cloneDeep(this.findByID(ctx.params.id));
                }
            }
        }
    }
};
