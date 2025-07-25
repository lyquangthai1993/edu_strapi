

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

    // Auto-generate slug if not provided
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }

    // Validate slug uniqueness
    if (data.slug) {
      const existing = await strapi.db.query('api::page.page').findOne({
        where: { slug: data.slug }
      })
      
      if (existing) {
        throw new Error(`Page with slug "${data.slug}" already exists`)
      }
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params
    
    // Ensure only one homepage exists
    if (data.isHomepage) {
      await strapi.db.query('api::page.page').updateMany({
        where: { 
          isHomepage: true,
          id: { $ne: where.id }
        },
        data: { isHomepage: false }
      })
    }

    // Validate slug uniqueness on update
    if (data.slug) {
      const existing = await strapi.db.query('api::page.page').findOne({
        where: { 
          slug: data.slug,
          id: { $ne: where.id }
        }
      })
      
      if (existing) {
        throw new Error(`Page with slug "${data.slug}" already exists`)
      }
    }

    // Prevent parent-child circular references
    if (data.parentPage) {
      const page = await strapi.db.query('api::page.page').findOne({
        where: where,
        populate: ['childPages']
      })
      
      if (page && page.childPages?.some(child => child.id === data.parentPage)) {
        throw new Error('Cannot set child page as parent (circular reference)')
      }
    }
  }
}