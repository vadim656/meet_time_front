module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/client/all',
            handler: 'client.getAllUsers',
            config: {
                auth: false,
            },
        }
    ]
}