import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  // Custom controller to find post by slug
  async findBySlug(ctx) {
    const { slug } = ctx.params
    const { populate } = ctx.query

    const entity = await strapi.db.query('api::post.post').findOne({
      where: { 
        slug,
        publishedAt: { $notNull: true }
      },
      populate: populate || ['featuredImage', 'author', 'categories']
    })

    if (!entity) {
      return ctx.notFound('Post not found')
    }

    // Increment view count
    await strapi.db.query('api::post.post').update({
      where: { id: entity.id },
      data: { viewCount: entity.viewCount + 1 }
    })

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx)
    return this.transformResponse(sanitizedEntity)
  },

  // Override default find to only show published posts
  async find(ctx) {
    ctx.query.filters = {
      ...ctx.query.filters,
      publishedAt: { $notNull: true }
    }

    const { data, meta } = await super.find(ctx)
    return { data, meta }
  },

  // Custom method to get all slugs for static generation
  async getSlugs(ctx) {
    const entities = await strapi.db.query('api::post.post').findMany({
      select: ['slug'],
      where: { publishedAt: { $notNull: true } }
    })

    return entities.map(entity => entity.slug)
  }
}))