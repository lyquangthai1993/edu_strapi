// Helper function to generate unique slug
async function generateUniqueSlug(title: string, excludeId: number | null = null): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')

  let slug = baseSlug
  let counter = 1

  while (true) {
    const existingPost = await strapi.db.query('api::post.post').findOne({
      where: { 
        slug,
        ...(excludeId && { id: { $ne: excludeId } })
      }
    })

    if (!existingPost) {
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
    
    if (data.title && !data.slug) {
      data.slug = await generateUniqueSlug(data.title)
    }

    // Initialize view count for new posts
    if (data.viewCount === undefined) {
      data.viewCount = 0
    }
  },

  // Ensure slug is updated when title changes
  async beforeUpdate(event: any) {
    const { data, where } = event.params
    
    if (data.title) {
      const existingPost = await strapi.db.query('api::post.post').findOne({
        where
      })
      
      // Only update slug if title changed
      if (existingPost && existingPost.title !== data.title) {
        data.slug = await generateUniqueSlug(data.title, existingPost.id)
      }
    }
  }
}