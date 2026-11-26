import { TextureLoader, ShaderMaterial, Vector3, SRGBColorSpace } from "three";

import * as solar from "solar-calculator";

// Earth textures from the Globe.gl example assets.
const texturePath = "https://cdn.jsdelivr.net/npm/three-globe/example/img/";

// Apply geographical day and night illumination.
export async function enableIllumination(earth) {
  const loader = new TextureLoader();

  const [dayTexture, nightTexture] = await Promise.all([
    loader.loadAsync(texturePath + "earth-blue-marble.jpg"),
    loader.loadAsync(texturePath + "earth-night.jpg"),
  ]);

  // Configure texture color spaces.
  dayTexture.colorSpace = SRGBColorSpace;
  nightTexture.colorSpace = SRGBColorSpace;

  // Load a transparent global cloud texture.
  const cloudTexture = await loader
    .loadAsync("https://unpkg.com/globe.gl@2.33.1/example/clouds/clouds.png")
    .catch(() => null);

  // Custom material combining two Earth textures.
  const material = new ShaderMaterial({
    uniforms: {
      dayMap: { value: dayTexture },
      nightMap: { value: nightTexture },
      cloudMap: { value: cloudTexture },
      cloudOpacity: { value: cloudTexture ? 0.65 : 0.0 },
      explorationMode: { value: 0.0 },
      sunDirection: { value: new Vector3() },
    },

    vertexShader: `
            varying vec2 earthUV;
            varying vec3 surfaceNormal;

            void main() {
                earthUV = uv;

                surfaceNormal = normalize(
                    mat3(modelMatrix) * normal
                );

                gl_Position = projectionMatrix
                    * modelViewMatrix
                    * vec4(position, 1.0);
            }
        `,

    fragmentShader: `
            uniform sampler2D dayMap;
            uniform sampler2D nightMap;
            uniform sampler2D cloudMap;
            uniform float cloudOpacity;
            uniform float explorationMode;
            uniform vec3 sunDirection;

            varying vec2 earthUV;
            varying vec3 surfaceNormal;

            void main() {

                float sunlight = dot(
                    normalize(surfaceNormal),
                    normalize(sunDirection)
                );

                float daylight = smoothstep(
                    -0.10, 0.15, sunlight
                );

                vec3 day = texture2D(
                    dayMap, earthUV
                ).rgb;

                vec3 night = texture2D(
                    nightMap, earthUV
                ).rgb;

                // Apply gradual sunlight shading.
                float lighting = 0.75 + 0.25 * max(sunlight, 0.0);

                // Restore depth to the illuminated hemisphere.
                vec3 realisticDay = day * lighting * 1.7;

                // Combine night lights and shaded daytime texture.
                                vec3 color = mix(
                    night, realisticDay, daylight
                );

                // Add clouds affected by sunlight.
                if (cloudOpacity > 0.0) {

                    float cloud = texture2D(
                        cloudMap, earthUV
                    ).a;

                    float cloudLight =
                        0.04 + 0.96 * daylight;

                    vec3 cloudColor = vec3(cloudLight);

                    color = mix(
                        color,
                        cloudColor,
                        cloud * cloudOpacity
                    );
                }
                // Switch to clear geographical exploration when enabled.
                color = mix(color, day * 1.25, explorationMode);
                gl_FragColor = vec4(color, 1.0);

                #include <colorspace_fragment>
            }
        `,
  });

  // Calculate the Sun's geographical position.
  function updateSunPosition() {
    const now = new Date();
    const century = solar.century(now.getTime());

    const utcHours =
      now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

    const latitude = solar.declination(century);

    const longitude = 180 - utcHours * 15 - solar.equationOfTime(century) / 4;

    const position = earth.getCoords(latitude, longitude, 0);

    material.uniforms.sunDirection.value
      .set(position.x, position.y, position.z)
      .normalize();
  }

  // Initialize illumination before applying the material.
  updateSunPosition();

  earth.globeMaterial(material);

  // Recalculate the Sun's position every minute.
  setInterval(updateSunPosition, 60000);
  // Allow other modules to switch observation modes.
  return function setExplorationMode(enabled) {
    material.uniforms.explorationMode.value = enabled ? 1.0 : 0.0;
  };
}
