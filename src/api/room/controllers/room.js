'use strict';

/**
 * room controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::room.room', ({ strapi }) => ({
    async users(ctx) {
        ctx.query = { ...ctx.query }
        const user = ctx.state.user.documentId

        const allUsers = await strapi.entityService.findMany('plugin::users-permissions.user', {
            fields: ['id', 'username', 'email', 'Name'],
            filters: {
                documentId: {
                    $ne: user
                }
            }
        });

        console.log("user -> ", allUsers);


        return allUsers;
    },
}));
