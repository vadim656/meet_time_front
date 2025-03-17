module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/client/all',
            handler: 'client.getAllUsers',
            config: {
                auth: false,
            },
        },
        {
            method: 'POST',
            path: '/client/register',
            handler: 'client.customRegister',
            config: {
                auth: false,
            },
        }
    ]
}