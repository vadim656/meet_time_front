'use strict';

/**
 * client service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::client.client', ({ strapi }) => ({
   async getAllUsers(){
        const data = await strapi.documents('api::client.client').findMany({
            fields: ["Name", "Status_microphone"],
        })

        return {
            data: data,
            status : 200
        }
    },
}));
