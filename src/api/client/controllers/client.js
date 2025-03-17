'use strict';

/**
 * client controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const getService = (name) => {
    return strapi.plugin('users-permissions').service(name);
};
module.exports = createCoreController('api::client.client', ({ strapi }) => ({
    async getAllUsers(ctx) {
        try {
            ctx.body = await strapi.service('api::client.client').getAllUsers();
        } catch (err) {
            ctx.body = err;
        }
    },
    async customRegister(ctx) {
        try {

            console.log('ctx.query 1 -> ', ctx.request.body);
            // const userService = getService('user');
            const user = await strapi.db.query("plugin::users-permissions.user").findOne({

                where: {
                    id: ctx.request.body.user.id
                },
            });

            if (user.confirmationToken === ctx.request.body.token) {
                console.log('user CONFIRMED ->> ', user);
                await strapi.db.query("plugin::users-permissions.user").update({

                    where: {
                        id: user.id
                    },
                    data: {
                        confirmed: true
                    },
                });
                return ctx.send({ status: 200 });


            } else {
                return ctx.send({ status: 500 });
            }


            // const user = await strapi.service('plugin::users-permissions.user').add(userData);
            // await userService.edit(user.id, { confirmed: true, confirmationToken: null });



        } catch (err) {
            ctx.body = err;
        }
    },
}));
