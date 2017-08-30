#!/usr/bin/env node

const assert = require('assert')
const net = require('net')

const C = require('./constants')


// Keep local state in one place
const localState = {
    username: 'tester',
    currentRoom: 'general',
    mostRecentTimestamp: 0,
    input: []
}


// Read port number from CLI TODO expand to support IP
assert(process.argv.length === 3, 'Usage: ./client.js [PORT]')
const port = parseInt(process.argv[2])
assert(port >=0 && port < (1 << 16), `Invalid port ${process.argv[2]}`)


// Connect to the server
const socket = net.createConnection({port: port}, () => {
    log(`Connected on port ${port}, room #${localState.currentRoom} as @${localState.username}`)
    getMessages(localState.currentRoom)
}).on('end', () => {
    log('Disconnected from server')
    process.exit(0)
})


// Handle data received from the server
socket.on('data', (dataString) => {
    const data = JSON.parse(dataString)
    if (data.status !== C.MSG_STATUS_OK) return console.error(data)

    switch (data.code) {
    case C.MSG_CODE_GET_MESSAGES:
        for (let i = 0; i < data.payload.messages.length; i++)
            possiblyShowMessage(data.payload.messages[i])
        break
    case C.MSG_CODE_PUT_MESSAGE:
        possiblyShowMessage(data.payload.message)
        break
    }
})

const log = (msg) => {
    process.stdout.write('\033[G')
    console.log(msg)
    refreshPrompt()
}

const handleUserCommand = (line) => {
    if (line[0] == '/') {
        const i = line.indexOf(' ')
        const cmd = line.substring(1, i)
        const arg = line.substring(i + 1)
        switch (cmd) {
        case 'join':
            log(`Switching to #${arg}...`)
            localState.currentRoom = arg
            localState.mostRecentTimestamp = 0
            getMessages(arg)
            break
        case 'user':
            localState.username = arg
            log(`Now acting as ${arg}`)
            break
        default:
            log(`Unknown command ${cmd}`)
        }
    } else {
        putMessage(line)
    }
}


const refreshPrompt = () => {
    process.stdout.write('\033[G') // move to start of line
    process.stdout.write('\033[K') // clear to end
    process.stdout.write('> ')
    process.stdout.write(localState.input.join(''))
}


// Read raw chars from stdin
process.stdin.setRawMode(true)
process.stdin.setEncoding('utf8')


process.stdin.on('data', (c) => {
    if (c === '\u0003' /* ctrl-C */) { process.exit(0) }
    else if (c === '\u007f' /* backspace */) {
        localState.input.pop()
        refreshPrompt()
    }
    else if (c === '\u000D' /* newline */) {
        handleUserCommand(localState.input.join(''))
        localState.input = []
        refreshPrompt()
    } else {
        localState.input.push(c)
        process.stdout.write(c)
    }
})


// Attempt to post the user's message to the chatroom
const putMessage = (text) => {
    socket.write(JSON.stringify({
        code: C.MSG_CODE_PUT_MESSAGE,
        payload: {
            room: localState.currentRoom,
            username: localState.username,
            text: text,
        }
    }))
}


// Get recent messages if any
const getMessages = (room) => {
    socket.write(JSON.stringify({
        code: C.MSG_CODE_GET_MESSAGES,
        payload: {
            username: localState.username,
            room: room
        }
    }))
}

// Print the message, avoiding duplication
const possiblyShowMessage = (message) => {
    if (message.timestamp > localState.mostRecentTimestamp
          && message.room === localState.currentRoom) {
        log(`${message.username}: ${message.text}`)
        localState.mostRecentTimestamp = message.timestamp
        return 1
    }
    return 0
}


// Poll for changes
setInterval(() => getMessages(localState.currentRoom), 1000)
