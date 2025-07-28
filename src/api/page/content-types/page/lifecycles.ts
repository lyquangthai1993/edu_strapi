

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

    // Validate slug uniqueness and auto-generate if needed
    if (data.slug) {
      const existing = await strapi.db.query('api::page.page').findOne({
        where: { slug: data.slug }
      })
      
      if (existing) {
        // Auto-generate a unique slug instead of throwing error
        const baseSlug = data.slug
        let counter = 1
        let newSlug = `${baseSlug}-${counter}`
        
        while (true) {
          const duplicateCheck = await strapi.db.query('api::page.page').findOne({
            where: { slug: newSlug }
          })
          
          if (!duplicateCheck) {
            data.slug = newSlug
            break
          }
          
          counter++
          newSlug = `${baseSlug}-${counter}`
        }
      }
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params
    
    // Get the current page ID (could be documentId in Strapi v5)
    const currentId = where.documentId || where.id
    
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

    // Validate slug uniqueness on update (only if slug is being changed)
    if (data.slug) {
      const existing = await strapi.db.query('api::page.page').findOne({
        where: { 
          slug: data.slug,
          $not: where
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
      
      if (page && page.childPages?.some(child => 
        child.id === data.parentPage || child.documentId === data.parentPage
      )) {
        throw new Error('Cannot set child page as parent (circular reference)')
      }
    }
  }
}