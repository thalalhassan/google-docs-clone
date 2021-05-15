import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
const SAVE_INTERNAL_MS = 2000;
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ["bold", "italic", "underline", "strike"], // toggled buttons
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  ["image", "blockquote", "code-block"],
  [{ align: [] }],

  ["clean"], // remove formatting button
];

export default function TestEditor() {
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const { id: documentId } = useParams();

  useEffect(() => {
    const currentSocket = io("http://localhost:3001");
    setSocket(currentSocket);
    return () => {
      currentSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket === null || quill === null) return;
    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });
    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);

  useEffect(() => {
    if (socket === null || quill === null) return;

    const internal = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERNAL_MS);

    return () => {
      clearInterval(internal);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket === null || quill === null) return;

    const handleReceiveTextChange = (delta, oldDelta, source) => {
      quill.updateContents(delta);
    };

    socket.on("receive-text-change", handleReceiveTextChange);

    return () => {
      socket.off("receive-text -change", handleReceiveTextChange);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket === null || quill === null) return;

    const handleTextChange = (delta, oldDelta, source) => {
      if (source === "api") {
        console.log("An API call triggered this change.");
      } else if (source === "user") {
        socket.emit("send-text-change", delta);
        console.log("A user action triggered this change.");
      }
    };

    quill.on("text-change", handleTextChange);

    return () => {
      quill.off("text-change", handleTextChange);
    };
  }, [socket, quill]);

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper === null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const currentQuill = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS,
      },
    });
    currentQuill.disable();
    currentQuill.setText("Loading...");
    setQuill(currentQuill);
  }, []);

  return <div id="container" ref={wrapperRef} className="container"></div>;
}
