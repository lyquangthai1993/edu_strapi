export default {
  routes: [
    {
      method: 'GET',
      path: '/categories',
      handler: 'category.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/categories/slug/:slug',
      handler: 'category.findBySlug',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/categories/:documentId',
      handler: 'category.findOne',
      config: {
        auth: false,
      },
    },
  ],
}