import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function downloadProject(html, css, js) {
  const zip = new JSZip();

  // Add files to the zip
  zip.file("index.html", html);
  zip.file("style.css", css);
  zip.file("script.js", js);

  // Generate and download
  zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "codepen-clone.zip");
  });
}
