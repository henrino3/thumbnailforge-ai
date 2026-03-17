import sharp from "sharp";

export const THUMBNAIL_SIZE = {
  width: 1280,
  height: 720,
};

export async function createWatermarkOverlay() {
  const svg = `
    <svg width="${THUMBNAIL_SIZE.width}" height="${THUMBNAIL_SIZE.height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .pill { fill: rgba(8, 10, 18, 0.72); stroke: rgba(255,255,255,0.18); stroke-width: 1; }
        .text { fill: white; font-family: Arial, Helvetica, sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 0.4px; }
      </style>
      <g transform="translate(${THUMBNAIL_SIZE.width - 330}, ${THUMBNAIL_SIZE.height - 62})">
        <rect class="pill" width="290" height="38" rx="19" />
        <text class="text" x="145" y="26" text-anchor="middle">Made with ThumbnailForge</text>
      </g>
    </svg>
  `;

  return Buffer.from(svg);
}

export async function postProcessThumbnail(input: Buffer, addWatermark: boolean) {
  const image = sharp(Buffer.from(input)).resize({
    width: THUMBNAIL_SIZE.width,
    height: THUMBNAIL_SIZE.height,
    fit: "cover",
    position: "centre",
  });

  if (addWatermark) {
    const overlay = await createWatermarkOverlay();
    image.composite([{ input: overlay }]);
  }

  return image.png({ quality: 100 }).toBuffer();
}

export function toDataUrl(buffer: Buffer) {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
