import {factories} from '@strapi/strapi';

export default factories.createCoreController('api::post.post', ({strapi}) => ({
    async findBySlug(ctx) {
        const {slug} = ctx.params;
        
        const entity = await strapi.db.query('api::post.post').findOne({
            where: {slug},
            populate: ['featuredImage', 'author', 'categories']
        });

        if (!entity) {
            return ctx.notFound();
        }

        const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
        return this.transformResponse(sanitizedEntity);
    }
}));