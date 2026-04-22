/**
 * Pure JS implementation of a 2D Kalman Filter for GPS Smoothing.
 * Smooths jittery GPS coordinates and predicts path when signal drops.
 */

interface KalmanState {
  lat: number;
  lng: number;
  vLat: number; // velocity latitude (degrees/sec)
  vLng: number; // velocity longitude (degrees/sec)
  pLat: number; // prediction error covariance
  pLng: number;
  lastUpdated: number; // ms timestamp
}

let state: KalmanState | null = null;

// Process noise covariance (Q) - variance of acceleration
const Q = 0.00001; 
// Measurement noise scaling factor (R depends on GPS accuracy)
const R_SCALE = 0.0001;

/**
 * Initialize the Kalman filter with an initial known position.
 * @param lat Initial latitude
 * @param lng Initial longitude
 */
export function initFilter(lat: number, lng: number): void {
  state = {
    lat,
    lng,
    vLat: 0,
    vLng: 0,
    pLat: 1, // high initial uncertainty
    pLng: 1,
    lastUpdated: Date.now(),
  };
}

/**
 * Predict the next position based on current velocity and time elapsed.
 * Used when GPS signal drops (dead reckoning).
 * @param dt Time elapsed in seconds since last update/prediction
 * @returns Predicted { lat, lng }
 */
export function predict(dt: number): { lat: number; lng: number } {
  if (!state) return { lat: 0, lng: 0 };
  
  // State prediction: x = x + v * dt
  state.lat += state.vLat * dt;
  state.lng += state.vLng * dt;
  
  // Covariance prediction: P = P + Q
  state.pLat += Q * dt;
  state.pLng += Q * dt;
  state.lastUpdated += dt * 1000;

  return { lat: state.lat, lng: state.lng };
}

/**
 * Update the filter with a new actual GPS measurement.
 * @param lat Measured latitude
 * @param lng Measured longitude
 * @param accuracy Measurement accuracy in meters
 * @returns Smoothed { lat, lng }
 */
export function update(lat: number, lng: number, accuracy: number): { lat: number; lng: number } {
  if (!state) {
    initFilter(lat, lng);
    return { lat, lng };
  }

  const now = Date.now();
  const dt = (now - state.lastUpdated) / 1000;
  if (dt > 0) predict(dt);

  // Measurement noise covariance (R) scales with reported accuracy
  const R = accuracy * R_SCALE;

  // Kalman Gain (K) = P / (P + R)
  const kLat = state.pLat / (state.pLat + R);
  const kLng = state.pLng / (state.pLng + R);

  // Update state with measurement: x = x + K * (measurement - x)
  const prevLat = state.lat;
  const prevLng = state.lng;

  state.lat = state.lat + kLat * (lat - state.lat);
  state.lng = state.lng + kLng * (lng - state.lng);

  // Update velocity: v = dx / dt
  if (dt > 0) {
    state.vLat = (state.lat - prevLat) / dt;
    state.vLng = (state.lng - prevLng) / dt;
  }

  // Update covariance: P = (1 - K) * P
  state.pLat = (1 - kLat) * state.pLat;
  state.pLng = (1 - kLng) * state.pLng;
  state.lastUpdated = now;

  return { lat: state.lat, lng: state.lng };
}
