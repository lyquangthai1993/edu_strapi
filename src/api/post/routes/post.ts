export default {
  routes: [
    {
      method: 'GET',
      path: '/posts',
      handler: 'post.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/posts/slug/:slug',
      handler: 'post.findBySlug',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/posts/:documentId',
      handler: 'post.findOne',
      config: {
        auth: false,
      },
    },
  ],
}