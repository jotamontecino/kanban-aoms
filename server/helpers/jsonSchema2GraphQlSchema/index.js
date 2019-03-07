"use strict";

class graphQlFactory {
  createScalarTypeValue(type) {
    const scalarsDico = {
      'string': 'String',
      'boolean': 'Boolean',
      'integer': 'Int'
    }
    const mergedTypes = Object.assign({}, scalarsDico, this.customScalars);
    if (mergedTypes[type]) {
      return mergedTypes[type];
    }
    return false;
  }
  getType(type) {
    let fn = null
    switch(type) {
      case 'array':
        return fn = (name, property, required=false) => {
          const itemsDefinition = property.items;
          const type = this.createScalarTypeValue(itemsDefinition.type)
          return `${name}: [${type}${(required)?'!':''}]`;
        }; break;
      default:
        fn = (name, property, required=false) => {
          const type = this.createScalarTypeValue(property.type)
          return `${name}: ${type}${(required)?'!':''}`;
        }
    }
    return fn;
  }

  constructor(jsonSchema) {
    this.jsonSchema = jsonSchema;
    this.key = jsonSchema.type;
    this.properties = jsonSchema.properties;
    this.definitions = jsonSchema.definitions;
    this.required = jsonSchema.required;

    this.customScalars = {};
  }
  isPropertyRequired(key) {
    return (this.required.includes(key))?true:false;
  }
  get(key) {
    return this.properties[key];
  }

  generateTypeFromFile() {
    // On gere les propriété au premier niveau
    const propertiesTypes = Object.keys(this.properties).reduce(
      (acc, propertyKey)=>{
        const property = this.get(propertyKey);
        const propertyType = property.type;
        const fn = this.getType(propertyType)
        if (fn) {
          return acc.concat(
            fn(propertyKey, property, this.isPropertyRequired(propertyKey))
          )
        }
        return acc;
      },
      []
    );
    const mainObjectType = this.formatObjectType(this.key, propertiesTypes);

    //On gere les définitions pour créer de nouveaux types
    const customTypes = Object.keys(this.definitions).map((newTypeKey) => {
      const definition = this.definitions[newTypeKey];
      const fn = this.getType(definition.type)
      if (fn) {
        const definitionTypes = [fn(newTypeKey, definition)]
        this.customScalars[newTypeKey] = this.ucfirst(newTypeKey);
        return this.formatObjectType(newTypeKey, definitionTypes);
      }
      return '';
    }).filter((item) => item.length > 0);

    const output = `${customTypes.join("\n")}\n${mainObjectType}`
    console.log(output);
    return output;
  }

  ucfirst(string)
  {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

  formatObjectType(key, propertiesTypesArray) {
    return `type ${this.ucfirst(key)} {
      ${propertiesTypesArray.join(',')}
    }`
  }

}

module.exports = graphQlFactory;
