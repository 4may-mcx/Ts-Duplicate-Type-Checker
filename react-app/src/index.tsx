import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { DuplicateTypeMessage } from "../../types/message";
import { FileLinkCell } from "./file-link-cell";

const App = () => {
  const [fileList, setFileList] = useState<DuplicateTypeMessage>();

  useEffect(() => {
    const handleMessage = (event: MessageEvent<DuplicateTypeMessage>) => {
      setFileList(event.data);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div>
      <div style={{ padding: "20px" }}>
        {fileList?.map((item) => (
          <FileLinkCell record={item} />
        ))}
      </div>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
