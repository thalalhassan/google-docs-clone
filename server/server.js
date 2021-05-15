require("./utils/setup");
const Documents = require("./models/documents");
const defaultDataValue = "";

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    method: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await upsert(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-text-change", (delta) => {
      socket.broadcast.to(documentId).emit("receive-text-change", delta);
    });

    socket.on("save-document", async (document) => {
      await Documents.findByIdAndUpdate(documentId, { data: document });
    });
  });
});

async function upsert(id, data) {
  const document = await Documents.findById(id);
  if (document) return document;
  return Documents.create({ _id: id, data: defaultDataValue });
}
