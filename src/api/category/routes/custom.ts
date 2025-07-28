export default {
  routes: [
    {
      method: 'GET',
      path: '/categories/slug/:slug',
      handler: 'category.findBySlug',
      config: {
        auth: false,
      },
    },
  ],
}