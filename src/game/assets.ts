const publicAsset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

export const assets = {
  visualTarget: publicAsset("environment-cinematic.png"),
  runeMark: publicAsset("oath-banner.png"),
  portrait: publicAsset("arssony-reference.png"),
  ground: publicAsset("ground-pbr.png"),
  banner: publicAsset("oath-banner.png"),
} as const;

export const oathRed = "#B52F2B";
