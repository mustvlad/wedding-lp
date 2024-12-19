import { Uniform } from "three";
import { Effect as PostEffect, BlendFunction } from "postprocessing";
import { forwardRef, useEffect, useMemo } from "react";
import PropTypes from 'prop-types';

class RiverEffect extends PostEffect {
  constructor({ progress = 0, scale = 1 } = {}) {
    super(
      "RiverEffect",
      /* glsl */ `
          uniform float u_time;
          uniform float u_progress;
          uniform float u_scale;
          uniform sampler2D tDiffuse; // Texture from the previous pass
    
          varying vec2 v_uv;
    
          void mainUv(inout vec2 uv) {
            vec2 p = 2.0 * uv - 1.0;
            
            // Add river-like distortion
            p += 0.4 * cos(u_scale * 2.0 * p.yx + 1.4 * u_time + vec2(2.2, 3.4));
            p += 0.4 * cos(u_scale * 3.5 * p.yx + 1.8 * u_time + vec2(1.2, 3.4));
            p += 0.3 * cos(u_scale * 5.0 * p.yx + 2.2 * u_time + vec2(4.2, 1.4));
    
            // Compute distorted UVs
            vec2 distorted = vec2(
              length(p) * 0.5 + 0.5,
              length(p) * 0.5 + 0.5
            );
            
            uv = mix(uv, distorted, u_progress);
          }
    
          void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
            // Sample the previous texture with the distorted UVs
            vec4 color = texture2D(tDiffuse, uv);
    
            // Output the distorted color
            outputColor = color;
          }
        `
    );

    this.uniforms.set("u_time", new Uniform(0));
    this.uniforms.set("u_progress", new Uniform(progress));
    this.uniforms.set("u_scale", new Uniform(scale));
    this.uniforms.set("tDiffuse", new Uniform(null)); // Previous pass texture

    this.blendMode.blendFunction = BlendFunction.NORMAL;
  }

  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get("u_time").value += deltaTime;
    this.uniforms.get("tDiffuse").value = inputBuffer.texture; // Pass previous texture
  }
}

// Create and export the pass
export const RiverPass = forwardRef(({ progress = 0, scale = 1 }, ref) => {
  const effect = useMemo(() => new RiverEffect({ progress, scale }), [scale]);
  
  useEffect(() => {
    effect.uniforms.get("u_progress").value = progress;
  }, [effect, progress]);

  return <primitive ref={ref} object={effect} dispose={null} />;
});

RiverPass.propTypes = {
  progress: PropTypes.number,
  scale: PropTypes.number
};

RiverPass.displayName = "RiverPass";
