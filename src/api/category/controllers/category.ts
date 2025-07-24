import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::category.category', ({ strapi }) => ({
  // Custom controller to find category by slug
  async findBySlug(ctx) {
    const { slug } = ctx.params
    const { populate } = ctx.query

    const entity = await strapi.db.query('api::category.category').findOne({
      where: { 
        slug,
        isActive: true
      },
      populate: populate || ['posts', 'parentCategory', 'childCategories']
    })

    if (!entity) {
      return ctx.notFound('Category not found')
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx)
    return this.transformResponse(sanitizedEntity)
  },

  // Override default find to only show active categories
  async find(ctx) {
    ctx.query.filters = {
      ...ctx.query.filters,
      isActive: true
    }

    const { data, meta } = await super.find(ctx)
    return { data, meta }
  }
}))