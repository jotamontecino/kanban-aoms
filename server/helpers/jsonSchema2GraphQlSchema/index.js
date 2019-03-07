"use strict";

class graphQlFactory {
  createScalarTypeValue(type) {
    const scalarsTypes = {
      'string': 'String',
      'boolean': 'Boolean',
      'integer': 'Int',
      'date': 'Date',
      'timestamp': 'Timestamp',
      'objectId': 'ObjectId'
    }
    const mergedTypes = Object.assign({}, scalarsTypes, this.customObjectTypes);
    if (mergedTypes[type]) {
      return mergedTypes[type];
    }
    return false;
  }
  generateGraphQlType(type) {
    let fn = null
    switch(type) {
      case 'refobjectid':
        fn = (name, property, required=false) => {
          const type = property.entity;
          return `${name}: ${type}${(required)?'!':''}`;
        };
        break;
      case 'array':
        fn = (name, property, required=false) => {
          const itemsDefinition = property.items;
          const type = this.createScalarTypeValue(itemsDefinition.type)
          return `${name}: [${type}${(required)?'!':''}]`;
        }; break;
      default:
        fn = (name, property, required=false) => {
          const propertyType = (property.type)?
            property.type :
            property["$ref"].replace('#/definitions/', '');
          const type = this.createScalarTypeValue(propertyType)
          return `${name}: ${type}${(required)?'!':''}`;
        }
    }
    return fn;
  }

  constructor(jsonSchema) {
    this.jsonSchema = jsonSchema;
    this.key = jsonSchema.type;
    this.service = jsonSchema.service;
    this.properties = jsonSchema.properties;
    this.definitions = jsonSchema.definitions;
    this.required = jsonSchema.required;
    this.customObjectTypes = {};

    this.types = ``;
    this.resolvers = {};
    this.resolvers[this.key] = {
      error: {
        action: `${this.service}.error`,
        nullIfError: true
      }
    };
  }
  build() {
    this.generateTypeFromFile();
    this.generateResolversFromFile();
    return {
      type: `${this.types}`,
      resolvers: this.resolvers,
    }
  }

  isPropertyRequired(key) {
    return (this.required.includes(key))?true:false;
  }
  get(key) {
    return this.properties[key];
  }

  generateTypeFromFile() {
    //On gere les définitions pour créer de nouveaux types
    const customTypes = Object.keys(this.definitions).map((newTypeKey) => {
      const definition = this.definitions[newTypeKey];
      const fn = this.generateGraphQlType(definition.type)
      if (fn && !definition.scalar) {
        const definitionTypes = [fn(newTypeKey, definition)]
        this.customObjectTypes[newTypeKey] = this.ucfirst(newTypeKey);
        return this.formatObjectType(newTypeKey, definitionTypes);
      }
      return '';
    }).filter((item) => item.length > 0);

    // On gere les propriété au premier niveau
    const propertiesTypes = Object.keys(this.properties).reduce(
      (acc, propertyKey)=>{
        const property = this.get(propertyKey);
        const propertyType = (property.type)?
          property.type :
          property["$ref"].replace('#/definitions/', '');
        const fn = this.generateGraphQlType(propertyType)
        if (fn) {
          return acc.concat(
            fn(propertyKey, property, this.isPropertyRequired(propertyKey))
          )
        }
        return acc;
      },
      []
    );
    const mainObjectType = this.formatObjectType(this.key, propertiesTypes.concat("error: String"));

    const graphQlTypes = `${customTypes.join("\n")}\n${mainObjectType}`
    this.types = graphQlTypes;
    return graphQlTypes;
  }
  generateResolversFromFile() {
    const resolvers = this.resolvers;
    const tmpResolvers = Object.keys(this.properties)
    .filter((item) => {
      const property = this.get(item)
      return (property["$ref"] && property["$ref"] === "#/definitions/refobjectid")
    })
    .map((item) => {
      const property = this.get(item);
      const rootParams = {};
      rootParams[item] = property.rel;
      this.resolvers[this.key][item] = {
        action: `${property.service}.resolve`,
        dataLoader: process.env.DATALOADER === "true",
        rootParams: rootParams
      }
      return item;
    })
  }
  ucfirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

  formatObjectType(key, propertiesTypesArray) {
    return `type ${this.ucfirst(key)} {
      ${propertiesTypesArray.join(',')}
    }`
  }

}

module.exports = graphQlFactory;
