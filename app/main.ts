import * as net from "net";

const server = net.createServer((socket) => {
  socket.on("data", (data: Buffer) => {
    const req: string = data.toString();
    const path = req.split(" ")[1];
    
    if(path.includes("echo") || path === "/")
        return socket.write(Buffer.from("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 3\r\n\r\nabc"))

    return socket.write(Buffer.from("HTTP/1.1 404 Not Found\r\n\r\n"));
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
