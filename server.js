const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs'); // Importar el módulo fs


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('codeChange', (data) => {
        socket.broadcast.emit('codeChange', data);
        // Escribir los cambios en un archivo
            ('editorContent.txt', data, (err) => {
            if (err) {
                console.error('Error writing to file', err);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.argv[2] || 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`:)`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use, please try another port.`);
        process.exit(1);
    } else {
        throw error;
    }
});
