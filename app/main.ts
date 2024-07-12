import * as net from "net";

const server = net.createServer((socket) => {
  socket.on("data", (data: Buffer) => {
    const req: string = data.toString();
    const path = req.split(" ")[1];
    const body = path.split("/")[2];
    if(path.includes("echo"))
        return socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${body.length}\r\n\r\n${body}`))

    else if(path.includes("user-agent")){
        const userAgent = req.split("\n")[3].split(":")[1];
        return socket.write(Buffer.from(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`))
    }
    else if(path === "/")
        return socket.write(Buffer.from('HTTP/1.1 200 OK\r\n\r\n'));

    return socket.write(Buffer.from("HTTP/1.1 404 Not Found\r\n\r\n"));
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
