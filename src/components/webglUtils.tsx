export const webglUtils = () => {
    return {
        resizeCanvasToDisplaySize: (canvas: any) => {
            // 브라우저가 캔버스를 표시하고 있는 크기를 CSS 픽셀 단위로 얻어옵니다.
            const displayWidth = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;

            // 캔버스와 크기가 다른지 확인합니다.
            const needResize = canvas.width !== displayWidth ||
                canvas.height !== displayHeight;

            if (needResize) {
                // 캔버스를 동일한 크기가 되도록 합니다.
                canvas.width = displayWidth;
                canvas.height = displayHeight;
            }

            return needResize;
        }
    }
}

