import { CustomWebGLProgram } from "../../webgl-program.class";

export function chromaKeyShader(
  threshold = 0.13, // 0 - 1
  smoothing = 0.87 // 0 - 1
) {
  return () => {
    const SHADER = `
    precision highp float;

    varying highp vec2 imgCoord;

    uniform sampler2D texture;
    uniform float threshold;
    uniform float smoothing;

    void main() {
      lowp vec4 tempColor = texture2D(texture, imgCoord);
      lowp float avg = 0.0;
      lowp float delta = 0.0;

      // red
      // avg = tempColor.g * 0.5 + tempColor.b * 0.5;
      // delta = tempColor.r - avg;

      // green
      avg = tempColor.r * 0.5 + tempColor.b * 0.5;
      delta = tempColor.g - avg;
      
      // blue
      // avg = tempColor.r * 0.5 + tempColor.g * 0.5;
      // delta = tempColor.b - avg;

      lowp float fact = 1.0 - smoothstep(threshold, 1.0 - smoothing, delta);
      tempColor.a = fact;
      tempColor.a = tempColor.a * tempColor.a * tempColor.a;
      
      gl_FragColor = tempColor; //mix(tempColor, blendColor, 1.0);
    }
    
    `;
    const program = this.compileShader(SHADER) as CustomWebGLProgram;

    this.gl.uniform1f(program.uniform.threshold, threshold);
    this.gl.uniform1f(program.uniform.smoothing, smoothing);

    this.apply();
  };
}
