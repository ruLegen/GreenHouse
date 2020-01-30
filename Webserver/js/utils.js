
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function configureSocket(webSocket) {
    webSocket.sendAll = function (data) {
        webSocket.clients.forEach(function (socket) {
            socket.send(data)
        })
    }
    webSocket.sendAllExcept = function (id, data) {
        webSocket.clients.forEach(function (socket) {
            if (socket.id != id) {
                socket.send(data)
            }
        })
    }
    webSocket.renameSocket = function (id, newID) {
        webSocket.clients.forEach(function (socket) {
            if (socket.id == id) {
                socket.id = newID
            }
        })
    }
    webSocket.terminateById = function (id) {
        webSocket.clients.forEach(function (socket) {
            if (socket.id == id) {
                socket.terminate()
            }
        })
    }
    webSocket.getSocketById = function (id) {
        var sock = null
        webSocket.clients.forEach(function (socket) {
            if (socket.id == id) {
                sock = socket
            }
        });
        return sock
    }

}
function createMessage(messageType, sendData) {
    return JSON.stringify({ type: messageType, data: sendData })
}



module.exports.makeid = makeid
module.exports.configureSocket = configureSocket
module.exports.createMessage = createMessage
// module.exports.months = months
