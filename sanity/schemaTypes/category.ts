// sanity/schemaTypes/category.ts
import type { Rule } from 'sanity';

const categorySchema = {
  name: 'category',
  type: 'document',
  title: 'Kategori',
  fields: [
    { 
      name: 'name', 
      type: 'string', 
      title: 'Nama Kategori',
      validation: (Rule: Rule) => Rule.required()
    },
    { 
      name: 'slug', 
      type: 'slug', 
      title: 'Slug', 
      options: { source: 'name' },
      validation: (Rule: Rule) => Rule.required()
    },
    { 
      name: 'description', 
      type: 'text', 
      title: 'Deskripsi Kategori' 
    },
  ]
}

export default categorySchema;
