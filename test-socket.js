const net = require('net');

const client = new net.Socket();
console.log('Connecting via Socket...');

client.setTimeout(5000);

client.connect(3306, '154.19.37.71', function() {
    console.log('TCP Connection established!');
});

client.on('data', function(data) {
    console.log('Received data:', data.toString());
    client.destroy(); // kill client after server's response
});

client.on('error', function(err) {
    console.error('Socket Error:', err);
});

client.on('timeout', function() {
    console.error('Socket Timeout!');
    client.destroy();
});
