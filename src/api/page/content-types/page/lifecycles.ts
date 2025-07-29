
// Helper function to generate unique slug
async function generateUniqueSlug(title: string, excludeId: number | null = null): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '')

  let slug = baseSlug
  let counter = 1

  while (true) {
    const existingPage = await strapi.db.query('api::page.page').findOne({
      where: { 
        slug,
        ...(excludeId && { id: { $ne: excludeId } })
      }
    })

    if (!existingPage) {
      break
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

export default {
  async beforeCreate(event) {
    const { data } = event.params
    
    // Ensure only one homepage exists
    if (data.isHomepage) {
      await strapi.db.query('api::page.page').updateMany({
        where: { isHomepage: true },
        data: { isHomepage: false }
      })
    }

    // Generate slug only if not provided (same as posts)
    if (data.title && !data.slug) {
      data.slug = await generateUniqueSlug(data.title)
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params
    
    // Ensure only one homepage exists
    if (data.isHomepage) {
      await strapi.db.query('api::page.page').updateMany({
        where: { 
          isHomepage: true,
          $not: where
        },
        data: { isHomepage: false }
      })
    }

    // Auto-update slug when title changes (same as posts)
    if (data.title) {
      const existingPage = await strapi.db.query('api::page.page').findOne({
        where
      })
      
      // Only update slug if title changed
      if (existingPage && existingPage.title !== data.title) {
        data.slug = await generateUniqueSlug(data.title, existingPage.id)
      }
    }

    // Prevent parent-child circular references
    if (data.parentPage) {
      const page = await strapi.db.query('api::page.page').findOne({
        where: where,
        populate: ['childPages']
      })
      
      if (page && page.childPages?.some(child => 
        child.id === data.parentPage || child.documentId === data.parentPage
      )) {
        throw new Error('Cannot set child page as parent (circular reference)')
      }
    }
  }
}