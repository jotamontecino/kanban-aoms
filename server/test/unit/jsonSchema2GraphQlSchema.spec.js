"use strict";

const graphQlFactory = require("../../helpers/jsonSchema2GraphQlSchema");
const jsonSchema = require("../../helpers/jsonSchema2GraphQlSchema/card.schema.json");

describe("Test 'jsonSchema to GraphQl' helper", () => {
  describe("Test GraphQL Type creation from Json Schema", () => {
    it("Sould return the good type", () => {
      const factory = new graphQlFactory(jsonSchema);
      const type = factory.build();
      console.log("**Type**");
      console.log(type);
      console.log("****");
      expect(false).toBe(true);
    })
  })
})
