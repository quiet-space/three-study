import {useEffect, useRef} from "react";
import {webglUtils} from "./webglUtils";

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // memo 셰이더를 컴파일하는 함수가 필요
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

    // memo 두개의 셰이더를 프로그램으로 링크 해야합니다.
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

    // memo 버퍼에 직사각형을 정의하는 값을 채웁니다.
    function setRectangle(gl: WebGL2RenderingContext, x: number, y: number, width: number, height: number) {
        const x1 = x;
        const x2 = x + width;
        const y1 = y;
        const y2 = y + height;

        // 참고: gl.bufferData(gl.ARRAY_BUFFER, ...)는 `ARRAY_BUFFER` 바인드 포인트에 어떤 버퍼가
        // 바인딩되었는지에 따라 영향을 받지만, 지금은 버퍼가 하나만 존재합니다.
        // 만일 버퍼가 여러개 있었다면 먼저 해당 버퍼를 `ARRAY_BUFFER`에 바인딩 해야만 합니다.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2]), gl.STATIC_DRAW);
    }


    useEffect(() => {
        // memo DOM 요소의 Type
        const canvas: HTMLCanvasElement | null = canvasRef.current
        if (!canvas) return

        // memo Canvas의 Context
        const gl: WebGL2RenderingContext | null = canvas.getContext("webgl2")
        if (!gl) return

        // memo 셰이더 프로그램을 GPU에 넣기 위해 컴파일해야 하므로 먼저 셰이더를 문자열로 가져와야 합니다.
        // memo  자바스크립트에서 문자열을 만드는 일반적인 방법을 활용해 GLSL 문자열을 만들 수 있습니다.
        // memo AJAX를 사용하여 다운로드하거나, 자바 스크립트가 아닌 스크립트 태그에 삽입할 수 있습니다.

        // memo 사실 대부분 3D 엔진에서는 다양한 유형의 템플릿, 코드 연결(concatenation) 등의 기법을 사용하여 GLSL 셰이더들을 그때그때 생성합니다.
        // memo #version 300 es는 반드시 첫 번째 라인에 작성해야 합니다.
        // memo #version 300 es는 WebGL2에게 GLSL ES 3.00이라 부르는 셰이더 언어를 사용하라고 알려줍니다.
        const vertexShaderSource = `#version 300 es
                in vec2 a_position;
              uniform vec2 u_resolution;
              void main() {
                vec2 zeroToOne = a_position / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
              }`;

        const fragmentShaderSource = `#version 300 es
            // 프래그먼트 셰이더는 기본 정밀도를 가지고 있지 않으므로 선언을 해야합니다.
            // highp는 기본값으로 적당합니다. "높은 정밀도(high precision)"를 의미합니다.
            precision highp float;
             
            // 프래그먼트 셰이더는 출력값을 선언 해야합니다.
            out vec4 outColor;
             
            void main() {
              // 붉은-보라색 상수로 출력값을 설정합니다.
                  outColor = vec4(1, 0, 0.5, 1);
            }`;

        // memo 위 GLSL 소스를 컴파일해서 만든 함수
        const vertexShader: WebGLShader | undefined = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader: WebGLShader | undefined = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) return;
        // memo 두개의 셰이더를 프로그램으로 링크 해야합니다.
        const program = createProgram(gl, vertexShader, fragmentShader);
        if (!program) return;
        const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            gl.deleteProgram(program);
        }


        // memo 이제 GPU에 GLSL 프로그램을 만들었으니, 다음으로 데이터를 제공해야합니다.
        // memo  WebGL API는 우리가 만든 GLSL 프로그램에 데이터를 제공하기 위한 상태를 설정하기 위해 존재합니다.
        // memo 이 예제의 GLSL 프로그램에는 오직 하나의 입력값인 a_position attribute만 존재합니다.
        // memo 이제 방금 작성한 프로그램의 attribute location을 찾아야 합니다.
        const positionAttributeLocation: number = gl.getAttribLocation(program, "a_position");

        // memo attribute의 location(또한 uniform의 location)을 찾는 것은 초기화 과정에서 해야하지,
        // memo 렌더 루프(render loop)에서 하면 안됩니다.
        // memo Attribute는 버퍼에서 데이터를 가져오기 때문에 우선 버퍼를 생성해야 합니다.
        const positionBuffer = gl.createBuffer();

        // memo WebGL은 많은 WebGL 리소스들을 전역 바인드 포인트(bind point)를 통해 조작하도록 되어 있습니다.
        // memo 바인드 포인트는 WebGL의 내부 전역 변수라고 생각하시면 됩니다.
        // memo 그런 다음 다른 모든 함수들은 그 바인드 포인트를 통해 리소스를 참조합니다. positionBuffer를 바인드 해봅시다.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // 세 개의 2d 점
        // const positions = [
        //     0, 0,
        //     0, 0.5,
        //     0.7, 0,
        // ];
        // memo gl.bufferData는 그 배열을 GPU에 있는 positionBuffer에 복사합니다
        // memo 위에서 ARRAY_BUFFER 바인드 포인트 positionBuffer를 바인드해둔 상태이기 때문에
        // memo positionBuffer에 복사되는 것입니다.
        // memo gl.STATIC_DRAW는 데이터를 많이 변경하지는 않을 것이라는 의미입니다. (DYNAMIC으로 수정)
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);

        const positions = [
            10, 20,
            80, 20,
            10, 30,
            10, 30,
            80, 20,
            80, 30,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // ---- 데이터를 버퍼에 넣기 성공 ----

        // memo attribute에게 데이터를 가져오는 방법을 알려줘야 합니다.
        const vao: WebGLVertexArrayObject | null = gl.createVertexArray();
        if (!vao) return;

        // memo 이를 현재 사용중인 vertex array로 만들어야합니다.
        gl.bindVertexArray(vao);

        // memo 저 attribute를 켜야 합니다.
        // memo 이는 WebGL에게 우리가 버퍼에서 데이터를 가져오려고 한다는 것을 알려주는 것입니다.
        gl.enableVertexAttribArray(positionAttributeLocation);

        // memo 데이터를 가져오는 방법
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
        // gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // 우리가 만든 프로그램(셰이더 쌍)을 사용할 것이라고 알려줍니다.
        gl.useProgram(program);

        // 셰이더 내에서 픽셀 위치를 클립 공간으로 변환 할 수 있도록 캔버스 해상도를 전달합니다.
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // 원하는 attribute/버퍼 집합을 바인딩합니다.
        // gl.bindVertexArray(vao);

        // WebGL에 우리의 GLSL 프로그램을 실행하라고 요청
        // const primitiveType = gl.TRIANGLES;
        // const count = 3;
        // gl.drawArrays(primitiveType, offset, count);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // ---------- 사각형 그리기 ---------
        // const colorLocation = gl.getUniformLocation(program, "u_color");
        //
        // const {randomInt} = webglUtils()
        // for (let ii: number = 0; ii < 50; ++ii) {
        //     setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
        //     gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);
        //     gl.drawArrays(gl.TRIANGLES, 0, 6); // primitiveType, offset, count
        // }


    }, [])

    return <div id="canvas-container">
        <canvas ref={canvasRef} width={640} height={480}>
        </canvas>
    </div>
}