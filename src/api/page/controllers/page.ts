import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::page.page', ({ strapi }) => ({
  // Custom controller to find page by slug
  async findBySlug(ctx) {
    const { slug } = ctx.params
    const { populate } = ctx.query

    const entity = await strapi.db.query('api::page.page').findOne({
      where: { 
        slug,
        publishedAt: { $notNull: true } // Only published pages
      },
      populate: populate || {
        seo: true,
        components: true,
        parentPage: true,
        childPages: true
      }
    })

    if (!entity) {
      return ctx.notFound('Page not found')
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx)
    return this.transformResponse(sanitizedEntity)
  },

  // Override default find to support slug query parameter
  async find(ctx) {
    const { slug } = ctx.query

    // If slug parameter is provided, find by slug
    if (slug) {
      const entity = await strapi.db.query('api::page.page').findOne({
        where: { 
          slug
        },
        populate: {
          seo: true,
          components: true,
          parentPage: true,
          childPages: true
        }
      })

      if (!entity) {
        return ctx.notFound('Page not found')
      }

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx)
      return this.transformResponse(sanitizedEntity)
    }

    // Otherwise, use default find behavior
    const { data, meta } = await super.find(ctx)
    return { data, meta }
  }
}))