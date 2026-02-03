// sanity/schemaTypes/product.ts
import type { Rule } from 'sanity';

const productSchema = {
  name: 'product',
  type: 'document',
  title: 'Produk',
  fields: [
    { name: 'name', type: 'string', title: 'Nama Produk' },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'name' } },
    { name: 'image', type: 'image', title: 'Foto Produk' },
    { name: 'price', type: 'number', title: 'Harga (Rp)' },
    { 
      name: 'category', 
      type: 'reference', 
      title: 'Kategori',
      to: [{ type: 'category' }],
      validation: (Rule: Rule) => Rule.required()
    },
    { name: 'description', type: 'text', title: 'Deskripsi' },
  ]
}

export default productSchema; // Berikan variabel ke default export