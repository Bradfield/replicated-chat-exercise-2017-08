#!/usr/bin/env node

const net = require('net')

const C = require('./constants')
const db = require('./db')

// Format and append the given message to the messages db file
const handlePutMessage = ({ room, username, text}, socket) => {
    const message = db.insertMessage(room, username, text)
    socket.write(JSON.stringify({
        status: C.MSG_STATUS_OK,
        code: C.MSG_CODE_PUT_MESSAGE,
        payload: { message: message }
    }))
}

// Retrieve and send the most recent 100 messages
const handleGetMessages = ({ room }, socket) => {
    const messages = db.selectMessages()
    socket.write(JSON.stringify({
        status: C.MSG_STATUS_OK,
        code: C.MSG_CODE_GET_MESSAGES,
        payload: { messages: messages.slice(-100) }
    }))
}

const HANDLERS = {
    [C.MSG_CODE_PUT_MESSAGE]: handlePutMessage,
    [C.MSG_CODE_GET_MESSAGES]: handleGetMessages,
}

const server = net.createServer(socket => {
    socket.on('data', (dataString) => {
        const data = JSON.parse(dataString)
        const handle = HANDLERS[data.code]
        if (handle === undefined) return console.error('Unknown message type')
        handle(data.payload, socket)
    })
})

server.on('error', err => {throw err})

server.listen(55555, () => {
    const a = server.address()
    console.log(`Server running on ${a.address}${a.port}`)
})
