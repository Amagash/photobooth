// Adapted from https://www.shadertoy.com/view/lssGDj

import { CustomWebGLProgram } from "../../webgl-program.class";

export function asciiShader(pixelSize = 10 /* 10 - 20*/) {
  return () => {
    const SHADER = `
    precision highp float;

    varying vec2 imgCoord;
    
    uniform vec4 filterArea;
    uniform float pixelSize;
    uniform sampler2D texture;
    
    vec2 mapCoord( vec2 coord ) {
      coord *= filterArea.xy;
      coord += filterArea.zw;
      return coord;
    }
    
    vec2 unmapCoord( vec2 coord ) {
      coord -= filterArea.zw;
      coord /= filterArea.xy;
  
      return coord;
    }
    
    vec2 pixelate(vec2 coord, vec2 size) {
      return floor( coord / size ) * size;
    }
    
    vec2 getMod(vec2 coord, vec2 size) {
      return mod( coord , size) / size;
    }
    
    float character(float asciiCode, vec2 p) {
      p = floor( p * vec2(4.0, -4.0) + 2.5);
      
      if (clamp(p.x, 0.0, 4.0) == p.x) {
        if (clamp(p.y, 0.0, 4.0) == p.y) {
          if (int(mod(asciiCode / exp2(p.x + 5.0 * p.y), 2.0)) == 1) {
            return 1.0;
          }
        }
      }
      return 0.0;
    }
    
    void main() {
      vec2 coord = mapCoord(imgCoord);
  
      // get the rounded color
      vec2 pixCoord = pixelate(coord, vec2(pixelSize));
      pixCoord = unmapCoord(pixCoord);
  
      vec4 color = texture2D(texture, pixCoord);
  
      // determine the character to use
      float gray = (color.r + color.g + color.b + color.a) / 4.0;
  
      float asciiCode =  65536.0;             // .
      if (gray > 0.2) asciiCode = 65600.0;    // :
      if (gray > 0.3) asciiCode = 332772.0;   // *
      if (gray > 0.4) asciiCode = 15255086.0; // o
      if (gray > 0.5) asciiCode = 23385164.0; // &
      if (gray > 0.6) asciiCode = 15252014.0; // 8
      if (gray > 0.7) asciiCode = 13199452.0; // @
      if (gray > 0.8) asciiCode = 11512810.0; // #
  
      // get the mod
      vec2 modd = getMod(coord, vec2(pixelSize));
  
      gl_FragColor = color * character( asciiCode, vec2(-1.0) + modd * 2.0); 
      gl_FragColor.a = 1.0;
    }
    `;

    const program = this.compileShader(SHADER) as CustomWebGLProgram;
    this.gl.uniform4fv(program.uniform.filterArea, [this.width, this.height, 0, 0]);
    this.gl.uniform1f(program.uniform.pixelSize, pixelSize);
    this.apply();
  };
}
