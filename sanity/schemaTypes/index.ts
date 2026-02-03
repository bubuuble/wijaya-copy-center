import { type SchemaTypeDefinition } from 'sanity'
import productSchema from './product';
import categorySchema from './category';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [productSchema, categorySchema],
}

export default schema;