const net = require('net');

const client = new net.Socket();
console.log('Connecting via Socket with long timeout...');

client.setTimeout(60000); // 60 seconds

client.connect(3306, '154.19.37.71', function() {
    console.log('TCP Connection established!');
});

client.on('data', function(data) {
    console.log('Received data:', data.toString());
    client.destroy();
});

client.on('error', function(err) {
    console.error('Socket Error:', err);
});

client.on('timeout', function() {
    console.error('Socket Timeout 60s!');
    client.destroy();
});
