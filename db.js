/*

The database is a set of files, which maintain records in simple binary format

db/message (total 256 bytes)
    timestamp (4 bytes)
    room (12 bytes, ascii)
    username (16 bytes, ascii)
    text  (224 bytes, ascii)
*/

const assert = require('assert')
const fs = require('fs')


const unpack = (buf) => buf.toString('ascii', 0, buf.indexOf(0x00))


// Given a JS object representing a message, return a buffer ready to write to db
const _serializeMessage = (message) => {
    const buf = Buffer.alloc(256, 0)
    buf.writeUInt32BE(message.timestamp)
    buf.write(message.room, 4, 12, 'ascii')
    buf.write(message.username, 16, 16, 'ascii')
    buf.write(message.text, 32, 224, 'ascii')
    return buf
}

// Given a buffer representing a db record of a message, return a JS object
const _deserializeMessage = (buf) => {
    return {
        timestamp: buf.readUInt32BE(),
        room: unpack(buf.slice(4, 16)),
        username: unpack(buf.slice(16, 32)),
        text: unpack(buf.slice(32, 256)),
    }
}


// Serialize a chat message for storage as db record
const insertMessage = (room, username, text) => {
    const message = {
        timestamp: Math.floor(Date.now() / 1000),
        room,
        username,
        text
    }
    const record = _serializeMessage(message)
    assert.deepEqual(message, _deserializeMessage(record))
    fs.appendFileSync('db/messages', record)
    return message
}


// Select and return all messages
const selectMessages = () => {
    const recordsBytes = fs.readFileSync('db/messages')
    const messages = []
    for (let i = 0; i < recordsBytes.length; i += 256) {
        messages.push(_deserializeMessage(recordsBytes.slice(i, i + 256)))
    }
    return messages
}

module.exports = {
    insertMessage,
    selectMessages
}
