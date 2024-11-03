import {useEffect, useRef} from "react";
import {webglUtils} from "./webglUtils";

export default function Canvas(props: any) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
        const shader: WebGLShader | null = gl.createShader(type);
        if (!shader) return;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        } else {
            gl.deleteShader(shader);
        }
    }

    function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        const program = gl.createProgram();
        if (!program) return;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        } else {
            gl.deleteProgram(program);
        }
    }

    useEffect(() => {
        const canvas: HTMLCanvasElement | null = canvasRef.current
        if (!canvas) return

        const gl: WebGL2RenderingContext | null = canvas.getContext("webgl2", {alpha: true})
        if (!gl) return

        // const vertexShaderSource = `#version 300 es
        //     in vec4 a_position;
        //     void main() {
        //       gl_Position = a_position;
        //     }
        //     `;

        const vertexShaderSource = `#version 300 es
    in vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;


        const fragmentShaderSource = `#version 300 es
            precision highp float;
            uniform vec4 u_color;
            out vec4 outColor;
             
            void main() {
              outColor = u_color;
            }
            `;

        const vertexShader: WebGLShader | undefined = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader: WebGLShader | undefined = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) return;

        const program = createProgram(gl, vertexShader, fragmentShader);
        if (!program) return
        gl.useProgram(program);

        // gl.deleteShader(vertexShader);
        // gl.deleteShader(fragmentShader);
        // gl.deleteProgram(program);

        const positionAttributeLocation: number = gl.getAttribLocation(program, "a_position");

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        const vao: WebGLVertexArrayObject | null = gl.createVertexArray();
        if (!vao) return;

        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(
            positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

        webglUtils().resizeCanvasToDisplaySize(gl.canvas)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        const colorLocation = gl.getUniformLocation(program, "u_color");

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const randomAngle = () => Math.random() * Math.PI * 2; // 0에서 360도 사이의 랜덤 각도
        const randomLength = () => Math.random() * 0.1 + 0.3 // 변 길이 (0.1 ~ 0.5)

        for (let i = -5; i < 5; i++) {
            const vertices = [0, 0];  // 첫 번째 꼭짓점은 (0, 0)에 고정

            console.log(Math.ceil(Math.random() - i * randomLength()))

            vertices.push(Math.floor(Math.random()) - i * randomLength(), Math.floor(Math.random()) - i * randomLength(), 0);
            vertices.push(Math.floor(Math.random()) - i * randomLength(), Math.floor(Math.random()) - i * randomLength(), 0);

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

            gl.uniform4fv(colorLocation, [Math.random(), Math.random(), Math.random(), Math.random()]);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
    }, [])

    return <div id="canvas-container">
        {props?.word}
        <canvas ref={canvasRef} width={500} height={500}>
        </canvas>
    </div>
}