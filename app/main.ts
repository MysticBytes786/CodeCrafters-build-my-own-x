import * as net from "net";

const server = net.createServer((socket) => {
  socket.on("data", (data: Buffer) => {
    const req: string = data.toString();
    const path = req.split(" ")[1];
    if (path !== "/")
      socket.write(Buffer.from("HTTP/1.1 404 Not Found\r\n\r\n"));
    else socket.write(Buffer.from("HTTP/1.1 200 OK\r\n\r\n"));
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
