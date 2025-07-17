import React, { useState, useEffect } from "react";
import Editor from "./Editor";
import useLocalStorage from "../hooks/useLocalStorage";
import { downloadProject } from "../utils/download";
import "../index.css";

function App() {
  const [htmlFiles, setHtmlFiles] = useLocalStorage("html", {
    "index.html": ""
  });
  const [cssFiles, setCssFiles] = useLocalStorage("css", {
    "style.css": ""
  });
  const [jsFiles, setJsFiles] = useLocalStorage("js", {
    "script.js": ""
  });

  const [activeHtmlTab, setActiveHtmlTab] = useState("index.html");
  const [activeCssTab, setActiveCssTab] = useState("style.css");
  const [activeJsTab, setActiveJsTab] = useState("script.js");

  const [srcDoc, setSrcDoc] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const updateHtml = (code) => {
    setHtmlFiles((prev) => ({ ...prev, [activeHtmlTab]: code }));
  };
  const updateCss = (code) => {
    setCssFiles((prev) => ({ ...prev, [activeCssTab]: code }));
  };
  const updateJs = (code) => {
    setJsFiles((prev) => ({ ...prev, [activeJsTab]: code }));
  };

  function getFilesByType(type) {
    return type === "html" ? htmlFiles : type === "css" ? cssFiles : jsFiles;
  }

  function setFilesByType(type, updated) {
    if (type === "html") setHtmlFiles(updated);
    else if (type === "css") setCssFiles(updated);
    else setJsFiles(updated);
  }

  function setActiveByType(type, file) {
    if (type === "html") setActiveHtmlTab(file);
    else if (type === "css") setActiveCssTab(file);
    else setActiveJsTab(file);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <head>
            <style>${cssFiles[activeCssTab]}</style>
          </head>
          <body>
            ${htmlFiles[activeHtmlTab]}
            <script>${jsFiles[activeJsTab]}</script>
          </body>
        </html>
      `);
    }, 250);
    return () => clearTimeout(timeout);
  }, [htmlFiles, cssFiles, jsFiles, activeHtmlTab, activeCssTab, activeJsTab]);

  return (
    <div className={darkMode ? "app dark" : "app light"}>
      <div className="top-bar">
        <button onClick={toggleTheme} className="theme-toggle">
          {darkMode ? "🌙 Dark" : "🌞 Light"}
        </button>
        <button
          onClick={() => downloadProject(
            htmlFiles[activeHtmlTab],
            cssFiles[activeCssTab],
            jsFiles[activeJsTab]
          )}
          className="download-btn"
        >
          ⬇️ Download Code
        </button>
      </div>

      <div className="pane top-pane">
        {/* HTML Tabs */}
        <div className="tab-bar">
          {Object.keys(htmlFiles).map((file) => (
            <button
              key={file}
              onClick={() => setActiveHtmlTab(file)}
              className={file === activeHtmlTab ? "active-tab" : ""}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ fileType: "html", file, x: e.pageX, y: e.pageY });
              }}
            >
              {file}
            </button>
          ))}
          <button
            onClick={() => {
              const newFile = `file${Object.keys(htmlFiles).length + 1}.html`;
              setHtmlFiles((prev) => ({ ...prev, [newFile]: "" }));
              setActiveHtmlTab(newFile);
            }}
          >
            +
          </button>
        </div>
        <Editor
          language="xml"
          displayName="HTML"
          value={htmlFiles[activeHtmlTab]}
          onChange={updateHtml}
          darkMode={darkMode}
        />

        {/* CSS Tabs */}
        <div className="tab-bar">
          {Object.keys(cssFiles).map((file) => (
            <button
              key={file}
              onClick={() => setActiveCssTab(file)}
              className={file === activeCssTab ? "active-tab" : ""}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ fileType: "css", file, x: e.pageX, y: e.pageY });
              }}
            >
              {file}
            </button>
          ))}
          <button
            onClick={() => {
              const newFile = `style${Object.keys(cssFiles).length + 1}.css`;
              setCssFiles((prev) => ({ ...prev, [newFile]: "" }));
              setActiveCssTab(newFile);
            }}
          >
            +
          </button>
        </div>
        <Editor
          language="css"
          displayName="CSS"
          value={cssFiles[activeCssTab]}
          onChange={updateCss}
          darkMode={darkMode}
        />

        {/* JS Tabs */}
        <div className="tab-bar">
          {Object.keys(jsFiles).map((file) => (
            <button
              key={file}
              onClick={() => setActiveJsTab(file)}
              className={file === activeJsTab ? "active-tab" : ""}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ fileType: "js", file, x: e.pageX, y: e.pageY });
              }}
            >
              {file}
            </button>
          ))}
          <button
            onClick={() => {
              const newFile = `script${Object.keys(jsFiles).length + 1}.js`;
              setJsFiles((prev) => ({ ...prev, [newFile]: "" }));
              setActiveJsTab(newFile);
            }}
          >
            +
          </button>
        </div>
        <Editor
          language="javascript"
          displayName="JS"
          value={jsFiles[activeJsTab]}
          onChange={updateJs}
          darkMode={darkMode}
        />
      </div>

      <div className="pane">
        <iframe
          srcDoc={srcDoc}
          title="output"
          sandbox="allow-scripts"
          frameBorder="0"
          width="100%"
          height="100%"
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ul
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            position: "absolute",
            zIndex: 1000
          }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <li
            onClick={() => {
              const newName = prompt("Rename file:", contextMenu.file);
              if (!newName || newName === contextMenu.file) return;
              const files = getFilesByType(contextMenu.fileType);
              if (files[newName]) return alert("File already exists!");
              const updated = { ...files };
              updated[newName] = updated[contextMenu.file];
              delete updated[contextMenu.file];
              setFilesByType(contextMenu.fileType, updated);
              setActiveByType(contextMenu.fileType, newName);
              setContextMenu(null);
            }}
          >
            ✏️ Rename
          </li>
          <li
            onClick={() => {
              const files = getFilesByType(contextMenu.fileType);
              if (Object.keys(files).length === 1) return alert("Must keep 1 file.");
              const updated = { ...files };
              delete updated[contextMenu.file];
              setFilesByType(contextMenu.fileType, updated);
              const keys = Object.keys(updated);
              setActiveByType(contextMenu.fileType, keys[0]);
              setContextMenu(null);
            }}
          >
            🗑️ Delete
          </li>
        </ul>
      )}
    </div>
  );
}

export default App;
