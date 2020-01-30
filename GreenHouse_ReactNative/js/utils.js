function createMessage(messageType, sendData) {
    return JSON.stringify({ type: messageType, data: sendData })
}


export {createMessage}