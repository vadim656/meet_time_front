'use strict';

const fs = require("node:fs");
module.exports = {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     *
     * This gives you an opportunity to extend code.
     */
    register({strapi}) {
        // strapi.service('plugin::users-permissions.user').fetchAuthenticatedUser = (id) => {
        //     return strapi
        //         .query('plugin::users-permissions.user')
        //         .findOne({where: {id}, populate: ['Type', 'Name']})
        // }
    },

    /**
     * An asynchronous bootstrap function that runs before
     * your application gets started.
     *
     * This gives you an opportunity to set up your data model,
     * run jobs, or perform some special logic.
     */
    bootstrap(/*{ strapi }*/) {


        const {Server} = require("socket.io");

        const io = new Server({
            cors: true
        });

        const emailToSocketIdMap = new Map();
        const socketidToEmailMap = new Map();

        io.on("connection", (socket) => {
            console.log(`Socket Connected`, socket.id);
            socket.on("room:join", (data) => {
                const {email, room} = data;
                emailToSocketIdMap.set(email, socket.id);
                socketidToEmailMap.set(socket.id, email);
                io.to(room).emit("user:joined", {email, id: socket.id});
                socket.join(room);
                io.to(socket.id).emit("room:join", data);
            });

            socket.on("user:call", ({to, offer}) => {
                console.log("user:call", to, offer)
                io.to(to).emit("incomming:call", {
                    from: socket.id,
                    offer,
                });
            });

            socket.on("call:accepted", ({to, ans}) => {
                io.to(to).emit("call:accepted", {from: socket.id, ans});
            });

            socket.on("peer:nego:needed", ({to, offer}) => {
                // console.log("peer:nego:needed", offer);
                io.to(to).emit("peer:nego:needed", {from: socket.id, offer});
            });

            socket.on("peer:nego:done", ({to, ans}) => {
                // console.log("peer:nego:done", ans);
                io.to(to).emit("peer:nego:final", {from: socket.id, ans});
            });
        });

        io.listen(8090);


        const {PeerServer} = require("peer");

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

    },
};
