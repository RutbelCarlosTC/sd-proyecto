const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const ShareDB = require('sharedb');
const richText = require('rich-text');

ShareDB.types.register(richText.type);

const backend = new ShareDB();
const connection = backend.connect();
const doc = connection.get('examples', 'richtext');
doc.create({ ops: [] }, 'rich-text');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let roomPassword;

app.use(express.static(__dirname + '/public'));

app.get('/editor', (req, res) => {
    res.sendFile(__dirname + '/editor.html');
});

app.get('/getServerIp', (req, res) => {
    res.json({ ip: getServerIp() });
});

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (data) => {
        const { name, password } = data;
        if (!roomPassword) {
            roomPassword = password;
            socket.emit('initialContent', doc.data);
            socket.join('editorRoom');
        } else if (password === roomPassword) {
            doc.fetch((err) => {
                if (err) throw err;
                socket.emit('initialContent', doc.data);
                socket.join('editorRoom');

                socket.on('text-change', (delta) => {
                    doc.submitOp(delta, { source: socket });
                });

                doc.on('op', (op, source) => {
                    if (source !== socket) {
                        socket.emit('text-change', op);
                    }
                });

                socket.on('chatMessage', (messageData) => {
                    io.to('editorRoom').emit('chatMessage', messageData);
                });
            });
        } else {
            socket.emit('invalidPassword');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

function getServerIp() {
    const interfaces = require('os').networkInterfaces();
    for (let iface in interfaces) {
        for (let alias of interfaces[iface]) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}
