import { factories } from '@strapi/strapi'

export default factories.createCoreRouter('api::page.page', {
  config: {
    find: {
      auth: {
        scope: ['api::page.page.find']
      },
    },
    findOne: {
      auth: {
        scope: ['api::page.page.findOne']
      },
    },
  },
})