module.exports = {
    routes: [
      { // Path defined with an URL parameter
        method: 'GET',
        path: '/rooms/users', 
        handler: 'room.users',
      },
     
    ]
  }