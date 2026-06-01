// Guilloché Living Crest — fragment shader.
//
// Two rose-curve envelopes modulate a high-frequency radial carrier to produce
// the engraved interlace seen on Victorian banknotes and pocket watch movements.
// Mouse position nudges the petal counts; per-load seed shifts the phase so
// every visit lands on a different braid pattern. Disk-masked, with a compass
// ring + four cardinal ticks borrowed from the static crest.svg.
//
// Designed for p5.js 2.x WEBGL (GLSL ES 1.00, no extensions).

precision highp float;

uniform vec2  u_resolution;
uniform vec2  u_mouse;     // normalized [0, 1] from pointermove
uniform float u_time;
uniform float u_seed;
uniform float u_intensity; // 0 .. 1, fades pattern in/out

#define PI  3.14159265359
#define TAU 6.28318530718

const vec3 INK   = vec3(0.0588, 0.0549, 0.0471); // #0F0E0C
const vec3 BRASS = vec3(0.6902, 0.5529, 0.3412); // #B08D57
const vec3 BONE  = vec3(0.9490, 0.9294, 0.8784); // #F2EDE0

float ring(float r, float center, float thickness) {
  return smoothstep(thickness, 0.0, abs(r - center));
}

float guilloche(vec2 p, float t) {
  float r     = length(p);
  float theta = atan(p.y, p.x);

  float k1 = 5.0 + floor(u_mouse.x * 6.0);    // 5..10 petals on envelope A
  float k2 = 7.0 + floor(u_mouse.y * 5.0);    // 7..11 petals on envelope B
  float carrier = 110.0;

  float env_a = sin(k1 * theta + t * 0.20 + u_seed * TAU);
  float env_b = sin(k2 * theta - t * 0.17 + u_seed * TAU * 1.7);

  float wave_a = cos(carrier * r + 1.4 * env_a);
  float wave_b = cos(carrier * r + 1.4 * env_b + PI * 0.5);

  float line_a = smoothstep(0.92, 0.99, wave_a);
  float line_b = smoothstep(0.92, 0.99, wave_b);

  return clamp(line_a + line_b, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) /
            min(u_resolution.x, u_resolution.y);
  float r = length(uv);

  float disk    = smoothstep(0.48, 0.46, r);
  float pattern = guilloche(uv, u_time) * disk;

  float ringOuter = ring(r, 0.47, 0.004);
  float ringInner = ring(r, 0.43, 0.0018);

  float ticks = 0.0;
  for (int i = 0; i < 4; i++) {
    float a = float(i) * PI * 0.5;
    vec2  tickPos = vec2(cos(a), sin(a)) * 0.455;
    float d = length(uv - tickPos);
    ticks += smoothstep(0.014, 0.005, d);
  }

  vec3 col = INK;
  col = mix(col, BRASS * 0.95, pattern * u_intensity);
  col = mix(col, BRASS, ringOuter);
  col = mix(col, BRASS * 0.7, ringInner);
  col = mix(col, BONE * 0.85, ticks);

  // Final alpha = 1 inside disk, 0 outside — let the host element show through.
  float alpha = max(disk, ringOuter);
  gl_FragColor = vec4(col, alpha);
}
