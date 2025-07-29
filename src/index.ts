import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Global lifecycle to invalidate Next.js navigation cache when content changes
    strapi.db.lifecycles.subscribe({
      models: ['api::post.post', 'api::page.page'],
      
      async afterCreate(event: any) {
        await invalidateNextJSNavigationCache(event);
      },
      
      async afterUpdate(event: any) {
        await invalidateNextJSNavigationCache(event);
      },
      
      async afterDelete(event: any) {
        await invalidateNextJSNavigationCache(event);
      },
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    console.log('🚀 Strapi bootstrap completed with navigation cache invalidation hooks');
  },
};

/**
 * Invalidate Next.js navigation cache when Post/Page content changes
 * This ensures navigation titles update when content titles change
 */
async function invalidateNextJSNavigationCache(event: any) {
  try {
    const nextjsUrl = process.env.NEXTJS_URL || 'http://localhost:3000';
    const contentType = event.model.uid.split('.').pop(); // Extract 'post' or 'page'
    const contentData = event.result;
    
    console.log(`🔄 Content changed: ${contentType} - ${contentData?.title || contentData?.slug}`);
    console.log(`📡 Notifying Next.js to update navigation cache...`);
    
    // Only invalidate navigation cache (keep Strapi simple, no Redis)
    const response = await fetch(`${nextjsUrl}/api/cache/invalidate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Strapi-Lifecycle-Hook'
      },
      body: JSON.stringify({ 
        type: 'navigation',
        contentType,
        slug: contentData?.slug,
        title: contentData?.title,
        source: 'strapi-lifecycle'
      })
    });

    if (response.ok) {
      console.log(`✅ Next.js navigation cache invalidated successfully`);
    } else {
      console.error(`❌ Failed to invalidate navigation cache: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.error('❌ Navigation cache invalidation error:', error);
  }
}
