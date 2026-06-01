// Standard p5.js 2.x WEBGL pass-through vertex shader.
// Maps the rect drawn at screen-space [0..w, 0..h] into normalized device coords.
// Reusable across every full-screen fragment shader on the site.
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
