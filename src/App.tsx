import React, {useEffect, useRef} from 'react';
import './App.css';
import Wave from "./components/wave";
import global from "./global";

function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const gl = canvas.getContext('webgl');

            if(!gl) return

            global().set('gl', gl)
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height) // 캔버스 전체 viewport

            // 버퍼 초기화
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);


        }}, [])

  return (
    <div className="App">
        <header className="App-header">
            <Wave/>
            <canvas ref={canvasRef} width={400} height={400}></canvas>
        </header>
    </div>
  );
}

export default App;
