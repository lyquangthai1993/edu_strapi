// Helper function to generate unique slug for categories
async function generateUniqueSlug(name: string, excludeId: number | null = null): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')

  let slug = baseSlug
  let counter = 1

  while (true) {
    const existingCategory = await strapi.db.query('api::category.category').findOne({
      where: { 
        slug,
        ...(excludeId && { id: { $ne: excludeId } })
      }
    })

    if (!existingCategory) {
      break
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

export default {
  // Ensure slug is generated before creation
  async beforeCreate(event: any) {
    const { data } = event.params
    
    if (data.name && !data.slug) {
      data.slug = await generateUniqueSlug(data.name)
    }
  },

  // Ensure slug is updated when name changes
  async beforeUpdate(event: any) {
    const { data, where } = event.params
    
    if (data.name) {
      const existingCategory = await strapi.db.query('api::category.category').findOne({
        where
      })
      
      // Only update slug if name changed
      if (existingCategory && existingCategory.name !== data.name) {
        data.slug = await generateUniqueSlug(data.name, existingCategory.id)
      }
    }
  }
}