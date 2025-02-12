'use strict';

/**
 * client controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::client.client', ({ strapi }) =>  ({
    async getAllUsers(ctx) {
        try {
            ctx.body = await strapi.service('api::client.client').getAllUsers();
        } catch (err) {
            ctx.body = err;
        }
    },
}));
