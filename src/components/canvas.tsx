import {useEffect, useRef} from "react";

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // TODO shader 생성
    function getShader(gl: any, id: any) {
        let shaderScript: { type: any, firstChild: object } | any = document.getElementById(id);
        let theSource: any = ""
        let currentChild: {
            nodeType: any,
            ['TEXT_NODE']: any,
            textContent: any,
            nextSibling: any
        } = shaderScript.firstChild
        let shader: WebGLShader | null = null

        if (!shaderScript) return null;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }

        while (currentChild) {
            if (currentChild.nodeType == currentChild.TEXT_NODE) {
                theSource += currentChild.textContent;
            }
            currentChild = currentChild.nextSibling;
        }

        if (shader) {
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
            gl.shaderSource(shader, theSource);
            // Compile the shader program
            gl.compileShader(shader);
            // See if it compiled successfully

            return shader;
        }
    }

    const initShaders = (gl: any) => {
        const fragmentShader: WebGLShader | null | undefined = getShader(gl, "shader-fs");
        const vertexShader: WebGLShader | null | undefined = getShader(gl, "shader-vs");
        const shaderProgram: WebGLRenderingContext = gl.createProgram();

        if (!vertexShader || !shaderProgram) return

        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Unable to initialize the shader program.");
        }

        gl.useProgram(shaderProgram);

        let vertexPositionAttribute = gl.getAttribLocation(
            shaderProgram,
            "aVertexPosition",
        );
        gl.enableVertexAttribArray(vertexPositionAttribute);
    }


    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const gl = canvas.getContext("webgl")
        if (!gl) return

        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set clear color to black, fully opaque
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the color as well as the depth buffer.

        gl.viewport(0, 0, canvas.width, canvas.height);

        initShaders(gl)

        // 객체 생성
        const horizAspect = 480.0 / 640.0;

        const squareVerticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

        const vertices = [
            1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    }, [])

    return <div id="canvas-container">
        <canvas ref={canvasRef} width={640} height={480}>
            Your browser doesn't appear to support the HTML5
        </canvas>
    </div>
}