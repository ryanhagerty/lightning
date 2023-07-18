uniform float uWavesElevation;
uniform float uWavesElevationR;
uniform float uWavesSpeed;
uniform vec2 uWavesFrequency;
varying float vElevation;
#define PI 3.1415926535897932384626433832795

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  float elevation = sin(modelPosition.x * uWavesFrequency.x * uWavesSpeed) * sin(modelPosition.z * uWavesFrequency.y * uWavesSpeed) * uWavesElevation;
  
  modelPosition.y += elevation;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  vElevation = elevation;
}