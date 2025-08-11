import { useEffect, useRef } from "react";

// Utility to convert hex color to normalized rgb array
function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const bigint = parseInt(h, 16);
  return [
    ((bigint >> 16) & 255) / 255,
    ((bigint >> 8) & 255) / 255,
    (bigint & 255) / 255,
  ];
}

const defaultColors = ["#ff5f6d", "#ffc371", "#43cea2", "#185a9d"]; // warm palette

const NebulaBackground = ({
  colors = defaultColors,
  speed = 0.3,
  intensity = 0.5,
  blur = 12,
  grain = 0.02,
  seed = 0,
  saturation = 1,
  brightness = 1,
}) => {
  const canvasRef = useRef(null);
  const grainRef = useRef(null);
  const animationRef = useRef(null);
  const glRef = useRef(null);
  const grainCtxRef = useRef(null);
  const usingWebGLRef = useRef(false);

  // init and animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const grainCanvas = grainRef.current;
    const parent = canvas.parentElement;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const maxFPS = isMobile ? 45 : 60;
    const minFrameTime = 1000 / maxFPS;
    const scale = Math.max(0.6, Math.min(0.8, window.devicePixelRatio || 1));
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    grainCanvas.width = width;
    grainCanvas.height = height;
    grainCanvas.style.width = "100%";
    grainCanvas.style.height = "100%";

    // check battery saver / reduced motion
    let effectiveIntensity = intensity;
    if (navigator.connection && navigator.connection.saveData) {
      effectiveIntensity *= 0.5;
    }
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) effectiveIntensity *= 0.5;

    const gl = canvas.getContext("webgl");
    if (gl) {
      usingWebGLRef.current = true;
      glRef.current = gl;
      initWebGL(gl, width * scale, height * scale, colors);
    } else {
      const ctx2d = canvas.getContext("2d");
      glRef.current = ctx2d; // use to store ctx
      initCanvas(ctx2d, width * scale, height * scale, colors, seed);
    }
    grainCtxRef.current = grainCanvas.getContext("2d");

    let last = 0;
    const render = (now) => {
      if (document.hidden) {
        last = now;
        animationRef.current = requestAnimationFrame(render);
        return;
      }
      if (now - last < minFrameTime) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }
      last = now;
      if (usingWebGLRef.current) {
        drawWebGL(glRef.current, now, speed, effectiveIntensity, saturation, brightness);
      } else if (glRef.current) {
        drawCanvas(glRef.current, now, speed, effectiveIntensity);
      }
      drawGrain(grainCtxRef.current, grain);
      animationRef.current = requestAnimationFrame(render);
    };
    animationRef.current = requestAnimationFrame(render);

    const handleVisibility = () => {
      if (document.hidden && animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      } else {
        last = performance.now();
        animationRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animationRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [colors, speed, intensity, blur, grain, seed, saturation, brightness]);

  // base gradient
  const baseGradient = colors
    .map((c, i) => `radial-gradient(circle at ${20 + i * 30}% ${20 + i * 20}%, ${c}, transparent 70%)`)
    .join(",");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: baseGradient,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          filter: `blur(${blur}px)`,
        }}
      />
      <canvas
        ref={grainRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default NebulaBackground;

// ---- WebGL implementation ----
function initWebGL(gl, width, height, colors) {
  const vertex = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;
  const fragment = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_intensity;
    uniform float u_speed;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
    uniform vec3 u_color4;
    uniform float u_saturation;
    uniform float u_brightness;

    vec3 mod289(vec3 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec2 mod289(vec2 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    float fbm(vec2 st){
      float value = 0.0;
      float amp = 0.5;
      for(int i=0;i<4;i++){
        value += amp * snoise(st);
        st *= 2.0;
        amp *= 0.5;
      }
      return value;
    }
    vec3 rgb2hsv(vec3 c){
      vec4 K = vec4(0., -1./3., 2./3., -1.);
      vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
      float d = q.x - min(q.w, q.y);
      float e = 1e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6. * d + e)), d / (q.x + e), q.x);
    }
    vec3 hsv2rgb(vec3 c){
      vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);
      return c.z * mix(vec3(1.0), rgb, c.y);
    }
    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      st *= 3.0;
      float t = u_time * u_speed;
      vec2 q = vec2(fbm(st + vec2(t)), fbm(st - vec2(t)));
      st += q * u_intensity;
      float n = fbm(st + vec2(t*0.5));
      float n2 = fbm(st * 0.5 - vec2(t));
      float n3 = fbm(st * 2.0 + vec2(-t));
      vec3 col = mix(u_color1, u_color2, n);
      col = mix(col, u_color3, n2);
      col = mix(col, u_color4, n3);
      vec3 hsv = rgb2hsv(col);
      hsv.x += sin(u_time * 0.02) * 0.03; // gentle hue shift
      hsv.y *= u_saturation;
      hsv.z *= u_brightness;
      col = hsv2rgb(hsv);
      gl_FragColor = vec4(col,1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, vertex);
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
    gl.STATIC_DRAW
  );
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  gl.viewport(0, 0, width, height);
  gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), width, height);

  const colorUniforms = [
    "u_color1",
    "u_color2",
    "u_color3",
    "u_color4",
  ];
  const cols = colors.map(hexToRgb);
  while (cols.length < 4) cols.push(cols[cols.length - 1] || [0, 0, 0]);
  colorUniforms.forEach((name, i) => {
    gl.uniform3fv(gl.getUniformLocation(program, name), cols[i]);
  });
}

function drawWebGL(gl, now, speed, intensity, saturation, brightness) {
  const program = gl.getParameter(gl.CURRENT_PROGRAM);
  gl.uniform1f(gl.getUniformLocation(program, "u_time"), now * 0.001);
  gl.uniform1f(gl.getUniformLocation(program, "u_speed"), speed);
  gl.uniform1f(gl.getUniformLocation(program, "u_intensity"), intensity);
  gl.uniform1f(gl.getUniformLocation(program, "u_saturation"), saturation);
  gl.uniform1f(gl.getUniformLocation(program, "u_brightness"), brightness);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// ---- Canvas fallback ----
const blobCount = 4;
const blobs = [];
function initCanvas(ctx, width, height, colors, seed) {
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  blobs.length = 0;
  const rand = mulberry32(seed);
  for (let i = 0; i < blobCount; i++) {
    blobs.push({
      x: rand() * width,
      y: rand() * height,
      r: (0.2 + rand() * 0.3) * Math.max(width, height),
      color: colors[i % colors.length],
      offsetX: rand() * 1000,
      offsetY: rand() * 1000,
    });
  }
}

function drawCanvas(ctx, now, speed, intensity) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";
  blobs.forEach((b) => {
    const t = now * 0.0001 * speed;
    const x = (perlin(t + b.offsetX) - 0.5) * intensity * width + b.x;
    const y = (perlin(t*1.3 + b.offsetY) - 0.5) * intensity * height + b.y;
    const grd = ctx.createRadialGradient(x, y, 0, x, y, b.r);
    grd.addColorStop(0, hexToCss(b.color, 0.6));
    grd.addColorStop(1, hexToCss(b.color, 0));
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
  });
  ctx.globalCompositeOperation = "source-over";
}

// helper to add alpha to hex
function hexToCss(hex, alpha) {
  const [r, g, b] = hexToRgb(hex).map((v) => Math.round(v * 255));
  return `rgba(${r},${g},${b},${alpha})`;
}

// simple pseudo perlin noise
function perlin(x) {
  return (Math.sin(x) + Math.sin(x * 0.27) + Math.sin(x * 0.13)) / 3 * 0.5 + 0.5;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Grain ----
function drawGrain(ctx, grain) {
  if (!ctx) return;
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = data[i + 1] = data[i + 2] = v;
    data[i + 3] = grain * 255;
  }
  ctx.putImageData(imageData, 0, 0);
  // vignette
  const rad = Math.max(width, height) * 0.8;
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    rad * 0.5,
    width / 2,
    height / 2,
    rad
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.15)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

