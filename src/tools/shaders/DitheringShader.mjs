import DefaultShader from "../../tree/DefaultShader.mjs";
import NoiseTexture from "../../textures/NoiseTexture.mjs";

/**
 * This shader can be used to fix a problem that is known as 'gradient banding'.
 */
export default class DitheringShader extends DefaultShader {

    constructor(ctx) {
        super(ctx);

        this._graining = 1/256;

        this._random = false;
    }

    set graining(v) {
        this._graining = v;
        this.redraw();
    }

    set random(v) {
        this._random = v;
        this.redraw();
    }

    useDefault() {
        return this._graining === 0;
    }


    static getWebGLImpl() {
        return WebGLDitheringShaderImpl;
    }
}


import WebGLDefaultShader from "../../tree/core/render/webgl/WebGLDefaultShaderImpl.mjs";
class WebGLDitheringShaderImpl extends WebGLDefaultShader {

    constructor(shader) {
        super(shader)

        this._noiseTexture = new NoiseTexture(shader.ctx.stage);
    }

    setExtraAttribsInBuffer(operation) {
        // Make sure that the noise texture is uploaded to the GPU.
        this._noiseTexture.load();

        let offset = operation.extraAttribsDataByteOffset / 4;
        let floats = operation.quads.floats;

        let length = operation.length;

        for (let i = 0; i < length; i++) {

            // Calculate ǹoise texture coordinates so that it spans the full view.
            let brx = operation.getViewWidth(i) / this._noiseTexture.getRenderWidth();
            let bry = operation.getViewHeight(i) / this._noiseTexture.getRenderHeight();

            let ulx = 0;
            let uly = 0;
            if (this.shader._random) {
                ulx = Math.random();
                uly = Math.random();

                brx += ulx;
                bry += uly;

                if (Math.random() < 0.5) {
                    // Flip for more randomness.
                    const t = ulx;
                    ulx = brx;
                    brx = t;
                }

                if (Math.random() < 0.5) {
                    // Flip for more randomness.
                    const t = uly;
                    uly = bry;
                    bry = t;
                }
            }

            // Specify all corner points.
            floats[offset] = ulx;
            floats[offset + 1] = uly;

            floats[offset + 2] = brx;
            floats[offset + 3] = uly;

            floats[offset + 4] = brx;
            floats[offset + 5] = bry;

            floats[offset + 6] = ulx;
            floats[offset + 7] = bry;

            offset += 8;
        }
    }

    beforeDraw(operation) {
        let gl = this.gl;
        gl.vertexAttribPointer(this._attrib("aNoiseTextureCoord"), 2, gl.FLOAT, false, 8, this.getVertexAttribPointerOffset(operation));

        let glTexture = this._noiseTexture.source.nativeTexture;
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.activeTexture(gl.TEXTURE0);
    }

    getExtraAttribBytesPerVertex() {
        return 8;
    }

    setupUniforms(operation) {
        super.setupUniforms(operation);
        this._setUniform("uNoiseSampler", 1, this.gl.uniform1i);
        this._setUniform("graining", 2 * this.shader._graining, this.gl.uniform1f);
    }

    enableAttribs() {
        super.enableAttribs();
        let gl = this.gl;
        gl.enableVertexAttribArray(this._attrib("aNoiseTextureCoord"));
    }

    disableAttribs() {
        super.disableAttribs();
        let gl = this.gl;
        gl.disableVertexAttribArray(this._attrib("aNoiseTextureCoord"));
    }

    afterDraw(operation) {
        if (this._random) {
            this.redraw();
        }
    }

}

WebGLDitheringShaderImpl.vertexShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec2 aNoiseTextureCoord;
    attribute vec4 aColor;
    uniform vec2 projection;
    varying vec2 vTextureCoord;
    varying vec2 vNoiseTextureCoord;
    varying vec4 vColor;
    void main(void){
        gl_Position = vec4(aVertexPosition.x * projection.x - 1.0, aVertexPosition.y * -abs(projection.y) + 1.0, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vNoiseTextureCoord = aNoiseTextureCoord;
        vColor = aColor;
        gl_Position.y = -sign(projection.y) * gl_Position.y;
    }
`;

WebGLDitheringShaderImpl.fragmentShaderSource = `
    #ifdef GL_ES
    precision lowp float;
    #endif
    varying vec2 vTextureCoord;
    varying vec2 vNoiseTextureCoord;
    varying vec4 vColor;
    uniform sampler2D uSampler;
    uniform sampler2D uNoiseSampler;
    uniform float graining;
    void main(void){
        vec4 noise = texture2D(uNoiseSampler, vNoiseTextureCoord);
        vec4 color = texture2D(uSampler, vTextureCoord);
        gl_FragColor = (color * vColor) + graining * (noise.r - 0.5);
    }
`;

