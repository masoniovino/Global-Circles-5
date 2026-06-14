// camera.js
// Smooth-follow camera with world->screen transform, lerp interpolation,
// and dynamic zoom-out as the player grows in size.

class Camera {
  constructor(viewWidth, viewHeight) {
    this.x = 0; // world coords of camera center
    this.y = 0;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.lerpFactor = 0.08; // smoothing strength

    this.zoom = 1;        // current zoom level (1 = normal scale)
    this.targetZoom = 1;  // desired zoom level based on player size
    this.zoomLerpFactor = 0.04;
  }

  resize(viewWidth, viewHeight) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
  }

  // smoothly move camera center toward target (player position)
  follow(targetX, targetY) {
    this.x += (targetX - this.x) * this.lerpFactor;
    this.y += (targetY - this.y) * this.lerpFactor;
  }

  // Set the desired zoom based on the player's current radius.
  // Larger radius -> zoom out (smaller zoom value) to keep player visible
  // along with more of their surroundings.
  setZoomForRadius(radius, baseRadius = 60) {
    const ratio = radius / baseRadius;
    let z = 1 / Math.pow(ratio, 0.5);
    z = Math.max(0.25, Math.min(1, z));
    this.targetZoom = z;
  }

  updateZoom() {
    this.zoom += (this.targetZoom - this.zoom) * this.zoomLerpFactor;
  }

  // convert world coordinates to screen coordinates
  worldToScreen(wx, wy) {
    return {
      x: (wx - this.x) * this.zoom + this.viewWidth / 2,
      y: (wy - this.y) * this.zoom + this.viewHeight / 2
    };
  }

  // convert screen coordinates to world coordinates (useful for input)
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.viewWidth / 2) / this.zoom + this.x,
      y: (sy - this.viewHeight / 2) / this.zoom + this.y
    };
  }
}
