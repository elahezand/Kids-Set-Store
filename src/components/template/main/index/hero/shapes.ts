import { CanvasTexture, ExtrudeGeometry, Shape, SRGBColorSpace } from "three";

export const createLetterTexture = (letter: string, background: string) => {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.roundRect(24, 24, size - 48, size - 48, 36);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 160px 'Arial Rounded MT Bold', ui-rounded, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, size / 2, size / 2 + 10);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

export const createStarGeometry = (outer = 0.5, inner = 0.22, depth = 0.16) => {
  const shape = new Shape();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3,
  });
  geometry.center();
  return geometry;
};

export const createShirtGeometry = () => {
  const shape = new Shape();
  shape.moveTo(-0.25, 0.7);
  shape.quadraticCurveTo(0, 0.48, 0.25, 0.7);
  shape.lineTo(0.7, 0.55);
  shape.lineTo(0.95, 0.15);
  shape.lineTo(0.68, 0);
  shape.lineTo(0.55, 0.2);
  shape.lineTo(0.55, -0.75);
  shape.lineTo(-0.55, -0.75);
  shape.lineTo(-0.55, 0.2);
  shape.lineTo(-0.68, 0);
  shape.lineTo(-0.95, 0.15);
  shape.lineTo(-0.7, 0.55);
  shape.closePath();

  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 4,
  });
  geometry.center();
  return geometry;
};
