export default () => ({
  navigation: {
    enabled: true,
    config: {
      additionalFields: ['audience'],
      contentTypes: ['api::page.page', 'api::post.post'],
      allowedLevels: 2,
      gql: {
        navigationItemRelated: ['Page', 'Post']
      }
    }
  }
});
