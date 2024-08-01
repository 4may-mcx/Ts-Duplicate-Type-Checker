import React, { useState } from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  console.log("hello React");
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Hello React!!!! {count}</h1>
      <div style={{ padding: "20px" }}>
        <input style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }} type="text" />
        <button onClick={() => setCount((i) => i + 3)}>提交</button>
      </div>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
