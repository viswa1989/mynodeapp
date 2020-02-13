const sockethelpers = require("../../app/helpers/socketHelper");

module.exports = function (socketData) {
  socketData.on('connection', (socket) => {
    //         console.log("Socket.io user connected");
    //         Logout the user
    socket.on('logout', (data) => {
      const userId = data.userId;
      sockethelpers.logout(socket.id, (error, result) => {
        if (result && result !== null && result.division_id) {
          sockethelpers.getSuperuser((errs, activeuser) => {
            if (activeuser && activeuser !== null && activeuser.length > 0) {
              sockethelpers.getDivisionuser((err, resdata) => {
                if (resdata) {
                  activeuser.forEach((userdata) => {
                    socketData.sockets.in(userdata.socketId).emit('DivisionUser', result);
                  });
                }
              });
            }
          });
        }
        socket.disconnect();
      });
    });

    //        sending the disconnected user to all socket users.
    socket.on('disconnect', () => {
      setTimeout(() => {
        sockethelpers.disconnectUser(socket.id, (response) => {
          if (response && response !== null && response.user_id) {
            sockethelpers.getSuperuser((errs, activeuser) => {
              if (activeuser && activeuser !== null && activeuser.length > 0) {
                sockethelpers.getDivisionuser((err, result) => {
                  if (result) {
                    activeuser.forEach((userdata) => {
                      socketData.sockets.in(userdata.socketId).emit('DivisionUser', result);
                    });
                  }
                });
              }
            });
          }
        });
      }, 500);
    });

    socket.on('getDivisionuser', (data) => {
      sockethelpers.getDivisionuser((err, result) => {
        if (result) {
          socket.emit('DivisionUser', result);
        }
      });
    });

    socket.on('getStockdetails', (data) => {
      if (data && data !== null && data.division_id) {
        sockethelpers.getSuperuser((errs, activeuser) => {
          if (activeuser && activeuser !== null && activeuser.length > 0) {
            sockethelpers.getStockdetails(data.division_id, (err, result) => {
              if (result && result !== null && result.length > 0) {
                activeuser.forEach((userdata) => {
                  socketData.sockets.in(userdata).emit('Stockdetails', { division: data.division_id, stock: result });
                });
              }
            });
          }
        });
      }
    });

    socket.on('login', (data) => {
      const userID = socket.request._query.userId;
      const Role = socket.request._query.Role;

      const userSocketId = socket.id;
      const userD = {
        user_id: userID,
        role: Role,
        socketId: userSocketId,
      };

      if (socket.request._query.Division) {
        userD.division_id = socket.request._query.Division;
      }

      sockethelpers.addSocketId(userD, (error, response) => {
        if (userD.division_id) {
          sockethelpers.getSuperuser((errs, activeuser) => {
            if (activeuser && activeuser !== null && activeuser.length > 0) {
              sockethelpers.getDivisionuser((err, result) => {
                if (result) {
                  activeuser.forEach((userdata) => {
                    socketData.sockets.in(userdata.socketId).emit('DivisionUser', result);
                  });
                }
              });
            }
          });
        }
      });
    });
  });
};
