import {useEffect, useRef} from "react";
import {webglUtils} from "./webglUtils";

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const vertexShaderSource = `#version 300 es
// attribute는 정점 셰이더에 대한 입력(in)입니다.
// 버퍼로부터 데이터를 받습니다.
in vec4 a_position;
 
// 모든 셰이더는 main 함수를 가지고 있습니다.
void main() {
 
  // gl_Position은 정점 셰이더가 설정해 주어야 하는 내장 변수입니다.
  gl_Position = a_position;
}
`;

    const fragmentShaderSource = `#version 300 es
// 프래그먼트 셰이더는 기본 정밀도를 가지고 있지 않으므로 선언을 해야합니다.
// highp는 기본값으로 적당합니다. "높은 정밀도(high precision)"를 의미합니다.
precision highp float;
 
// 프래그먼트 셰이더는 출력값을 선언 해야합니다.
out vec4 outColor;
 
void main() {
  // 붉은-보라색 상수로 출력값을 설정합니다.
  outColor = vec4(1, 0, 0.5, 1);
}
`;

    function createShader(gl: any, type: any, source: any) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    function createProgram(gl: any, vertexShader: any, fragmentShader: any) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }

        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const gl = canvas.getContext("webgl2")
        if (!gl) return

        //shader
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        // program
        const program = createProgram(gl, vertexShader, fragmentShader);

        //방금 작성한 프로그램의 attribute location을 찾는것 입니다.
        const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // 세 개의 2d 점
        const positions = [
            0, 0,
            0, 0.5,
            0.7, 0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        gl.enableVertexAttribArray(positionAttributeLocation);

        const size = 2;          // iteration마다 두개 구성 요소 사용
        const type = gl.FLOAT;   // 데이터는 32비트 부동 소수점
        const normalize = false; // 데이터를 정규화하지 않음
        const stride = 0;        // 0인 경우 실행할 때마다 `size * sizeof(type)`만큼 다음 위치로 이동합니다.
        const offset = 0;        // 버퍼의 시작부터 데이터를 읽어옴
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset)

        webglUtils().resizeCanvasToDisplaySize(gl.canvas)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // 캔버스 지우기
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 우리가 만든 프로그램(셰이더 쌍)을 사용할 것이라고 알려줍니다.
        gl.useProgram(program);

        // 원하는 attribute/버퍼 집합을 바인딩합니다.
        gl.bindVertexArray(vao);

        const primitiveType = gl.TRIANGLES;
        const count = 3;
        gl.drawArrays(primitiveType, offset, count);
    }, [])

    return <div id="canvas-container">
        <canvas ref={canvasRef} width={640} height={480}>
        </canvas>
    </div>
}