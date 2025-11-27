import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download } from 'lucide-react';

// --- CONFIGURATION ---
const BACKGROUND_URL = "/brain-buzz-lp.jpg";
const CANVAS_WIDTH = 2700;
const CANVAS_HEIGHT = 3375;

export default function App() {
  const [question, setQuestion] = useState("What is the meaning of design?");
  const [answer, setAnswer] = useState("Design is not just what it looks like and feels like. Design is how it works.");
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Initialize Image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = BACKGROUND_URL;
    img.onload = () => {
      imageRef.current = img;
      setIsImageLoaded(true);
    };
  }, []);

  // Helper: Wrap text into lines
  const getLines = (ctx, text, maxWidth) => {
    const paragraphs = text.split('\n');
    const lines = [];

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      if (paragraph === "") {
        lines.push("");
        continue;
      }

      const words = paragraph.split(" ");
      let currentLine = words[0];

      for (let j = 1; j < words.length; j++) {
        const word = words[j];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
    }
    return lines;
  };

  // Helper: Simulate object-fit: cover
  const drawImageProp = (ctx, img, x, y, w, h, offsetX = 0.5, offsetY = 0.5) => {
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    let iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,
        nh = ih * r,
        cx, cy, cw, ch, ar = 1;

    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
    nw *= ar;
    nh *= ar;

    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
  };

  // Main Draw Function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Background
    if (isImageLoaded && imageRef.current) {
      drawImageProp(ctx, imageRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 3. Setup Font Styles
    const padding = 200;
    const maxWidth = canvas.width - (padding * 2);
  const questionColor = "#0F52BA";  // black
const answerColor   = "#333333";  // dark gray


    // No Shadow
    ctx.shadowColor = "transparent";

    // 4. Measure and Prepare Text
    // Question Style
    const qFontSize = 120;
    const qLineHeight = 120;
    ctx.font = `700 ${qFontSize}px 'Montserrat'`;
    const qLines = getLines(ctx, question, maxWidth);

    // Answer Style
    const aFontSize = 95;
    const aLineHeight = 120;
    const spacing = 150;
    ctx.font = `400 ${aFontSize}px 'Montserrat'`;
    const aText = answer;
    const aLines = getLines(ctx, aText, maxWidth);

    // Calculate total height
    const totalTextHeight = (qLines.length * qLineHeight) + spacing + (aLines.length * aLineHeight);
    
    // Determine starting Y
    let startY = (canvas.height - totalTextHeight) / 2;

    // 5. Draw Question (fixed position)
ctx.textAlign = "center";
ctx.font = `700 ${qFontSize}px 'Montserrat'`;
ctx.fillStyle = questionColor;

// Fixed Y position for question block
let questionStartY = 1100; // 🔴 change this number to move Q up/down
let currentY = questionStartY;

qLines.forEach((line) => {
  ctx.fillText(line, canvas.width / 2, currentY);
  currentY += qLineHeight;
});

// 6. Draw Answer (fixed position)
ctx.font = `700 ${aFontSize}px 'Montserrat'`;
ctx.fillStyle = answerColor;

// Fixed Y position for answer block
let answerStartY = 1500; // 🔴 change this number to move Answer up/down
currentY = answerStartY;

aLines.forEach((line) => {
  ctx.fillText(line, canvas.width / 2, currentY);
  currentY += aLineHeight;
});



  }, [question, answer, isImageLoaded]);

  // Trigger draw on updates
  useEffect(() => {
    document.fonts.ready.then(() => {
      draw();
    });
  }, [draw]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'quote-image.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      {/* Inject Font */}
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`body { font-family: 'Montserrat', sans-serif; }`}</style>

      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-6xl flex flex-col md:flex-row gap-8">
        
        {/* Controls Section */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Q&A Image Creator</h1>
          <p className="text-sm text-gray-500 mb-4">Edit text below. The image output will be 2700x3375px.</p>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Question</label>
            <textarea 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="Enter your question here..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Answer</label>
            <textarea 
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="Enter the answer here..."
            />
          </div>

          <button 
            onClick={handleDownload}
            className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-md flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Download Image
          </button>
        </div>

        {/* Preview Section */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg p-4 border border-gray-200">
          <canvas 
            ref={canvasRef}
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT}
            className="w-full h-auto max-w-[500px] shadow-lg rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}