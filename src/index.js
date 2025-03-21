'use strict';

const fs = require("node:fs");
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const urlJoin = require('url-join');
const rpcMethods = require("./utils/RPCmethods");
const getService = (name) => {
    return strapi.plugin('users-permissions').service(name);
};
const { sanitize } = require('@strapi/utils');
const { v4: uuidv4 } = require("uuid");
const USER_MODEL_UID = 'plugin::users-permissions.user';
module.exports = {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     *
     * This gives you an opportunity to extend code.
     */
    register({ strapi }) {
        strapi.plugins["users-permissions"].services["user"].sendConfirmationEmail = async (user) => {
            const userPermissionService = getService('users-permissions');
            const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });
            const userSchema = strapi.getModel(USER_MODEL_UID);

            const settings = await pluginStore
                .get({ key: 'email' })
                .then((storeEmail) => storeEmail.email_confirmation.options);

            // Sanitize the template's user information
            const sanitizedUserInfo = await sanitize.sanitizers.defaultSanitizeOutput(
                {
                    schema: userSchema,
                    getModel: strapi.getModel.bind(strapi),
                },
                user
            );

            const confirmationToken = Math.floor(100000 + (crypto.randomBytes(4).readUInt32LE(0) % 900000));
            console.log('confirmationToken -> ', confirmationToken);


            await getService('user').edit(user.id, { confirmationToken });

            const apiPrefix = strapi.config.get('api.rest.prefix');

            try {
                settings.message = await userPermissionService.template(settings.message, {
                    URL: urlJoin(
                        strapi.config.get('server.absoluteUrl'),
                        apiPrefix,
                        '/auth/email-confirmation'
                    ),
                    SERVER_URL: strapi.config.get('server.absoluteUrl'),
                    ADMIN_URL: strapi.config.get('admin.absoluteUrl'),
                    USER: sanitizedUserInfo,
                    CODE: confirmationToken,
                });

                settings.object = await userPermissionService.template(settings.object, {
                    USER: sanitizedUserInfo,
                });
            } catch {
                strapi.log.error(
                    '[plugin::users-permissions.sendConfirmationEmail]: Failed to generate a template for "user confirmation email". Please make sure your email template is valid and does not contain invalid characters or patterns'
                );
                return;
            }

            // Send an email to the user.
            await strapi
                .plugin('email')
                .service('email')
                .send({
                    to: user.email,
                    from:
                        settings.from.email && settings.from.name
                            ? `${settings.from.name} <${settings.from.email}>`
                            : undefined,
                    replyTo: settings.response_email,
                    subject: settings.object,
                    text: settings.message,
                    html: settings.message,
                });
        }
    },

    /**
     * An asynchronous bootstrap function that runs before
     * your application gets started.
     *
     * This gives you an opportunity to set up your data model,
     * run jobs, or perform some special logic.
     */
    bootstrap(/*{ strapi }*/) {
        const WebSocket = require("ws");

        const { Server } = require("socket.io");

        const io = new Server({
            cors: true
        });

        const emailToSocketIdMap = new Map();
        const socketidToEmailMap = new Map();

        io.on("connection", (socket) => {
            console.log(`Socket Connected`, socket.id);
            socket.on("room:join", (data) => {
                const { email, room } = data;
                emailToSocketIdMap.set(email, socket.id);
                socketidToEmailMap.set(socket.id, email);
                io.to(room).emit("user:joined", { email, id: socket.id });
                socket.join(room);
                io.to(socket.id).emit("room:join", data);
            });

            socket.on("user:call", ({ to, offer }) => {
                console.log("user:call", to, offer)
                io.to(to).emit("incomming:call", {
                    from: socket.id,
                    offer,
                });
            });

            socket.on("call:accepted", ({ to, ans }) => {
                io.to(to).emit("call:accepted", { from: socket.id, ans });
            });

            socket.on("peer:nego:needed", ({ to, offer }) => {
                // console.log("peer:nego:needed", offer);
                io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
            });

            socket.on("peer:nego:done", ({ to, ans }) => {
                // console.log("peer:nego:done", ans);
                io.to(to).emit("peer:nego:final", { from: socket.id, ans });
            });
        });

        io.listen(8090);


        const { PeerServer } = require("peer");

        const peerServer = PeerServer({
            port: 9000,
            path: "/myapp",
            allow_discovery: true,
            // ssl: {
            //     key: fs.readFileSync()
            // }
        });


        peerServer.on('connection', (client) => {
            console.log("peerServer connection -> ", client.id);
        });

        peerServer.on('disconnect', (client) => {
            console.log("peerServer disconnect -> ", client.id);
        });


        //ws

        const clients = new Set();

        const wss = new WebSocket.Server({ port: 9102 })

        const isValidJSON = (str) => {
            try {
                JSON.parse(str);
                return true;
            } catch (e) {
                return false;
            }
        };

        async function blockUser(id) {
            console.log('user 1 -> ', id);
            const user = await getService('user').edit(id, {
                blocked: true
            });
            clients.forEach((socket) => {
                socket.send(rpcMethods("user_blocked", user.id, ""));
            });
            console.log('user -> ', user);

        }

        wss.on("connection", function connection(ws) {
            ws.isAlive = true;
            ws.id = uuidv4();

            clients.add(ws);

            ws.on("message", (message) => {
                if (message !== undefined && isValidJSON(message)) {
                    const messData = JSON.parse(message);
                    if (messData?.method === 'blockUser') {
                        console.log('tut 1');
                        blockUser(messData.params.id);

                    } else {
                        console.log('tut');

                    }
                    console.log('message 2', messData);


                } else {
                    console.log("connect fails");
                }
            });
            ws.on("error", console.error);
            ws.on("close", (event) => {
                if (event?.wasClean) {
                    console.log(
                        "Соединение закрыто чисто, код:",
                        event.code,
                        "причина:",
                        event.reason,
                    );
                } else {
                    console.log("Обрыв соединения");
                }
            });
        });

    },
};
