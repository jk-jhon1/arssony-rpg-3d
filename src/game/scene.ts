import {
  ArcRotateCamera,
  Color3,
  Color4,
  DefaultRenderingPipeline,
  DirectionalLight,
  Engine,
  GlowLayer,
  HemisphericLight,
  ImageProcessingConfiguration,
  Layer,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  PointLight,
  Scene,
  ShadowGenerator,
  SSAO2RenderingPipeline,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { GameWorld } from "./GameWorld";
import { InputManager } from "./InputManager";
import { assets } from "./assets";

export type GameHandle = { scene: Scene; dispose: () => void };

const pbr = (scene: Scene, name: string, color: string, roughness: number, metallic = 0) => {
  const material = new PBRMaterial(name, scene);
  material.albedoColor = Color3.FromHexString(color);
  material.roughness = roughness;
  material.metallic = metallic;
  material.environmentIntensity = 0.65;
  return material;
};

const addShadowCaster = (generator: ShadowGenerator, node: TransformNode | Mesh) => {
  if (node instanceof Mesh) generator.addShadowCaster(node);
  for (const mesh of node.getChildMeshes()) generator.addShadowCaster(mesh);
};

function createPine(scene: Scene, x: number, z: number, scale: number, bark: PBRMaterial, needles: PBRMaterial) {
  const root = new TransformNode(`pine-${x}-${z}`, scene);
  root.position = new Vector3(x, 0, z);
  root.scaling = new Vector3(scale, scale, scale);
  const trunk = MeshBuilder.CreateCylinder("pine-trunk", { height: 3.8, diameterTop: 0.24, diameterBottom: 0.52, tessellation: 10 }, scene);
  trunk.parent = root;
  trunk.position.y = 1.9;
  trunk.material = bark;
  for (let i = 0; i < 3; i += 1) {
    const crown = MeshBuilder.CreateCylinder(`pine-crown-${i}`, { height: 2.6 - i * 0.35, diameterTop: 0.08, diameterBottom: 2.25 - i * 0.38, tessellation: 8 }, scene);
    crown.parent = root;
    crown.position.y = 3.15 + i * 1.35;
    crown.material = needles;
  }
  return root;
}

function createBanner(scene: Scene, x: number, z: number, rotation: number) {
  const root = new TransformNode("oath-banner-root", scene);
  root.position = new Vector3(x, 0, z);
  root.rotation.y = rotation;
  const pole = MeshBuilder.CreateCylinder("banner-pole", { height: 4.2, diameter: 0.08, tessellation: 12 }, scene);
  pole.parent = root;
  pole.position.y = 2.1;
  pole.material = pbr(scene, "banner-pole-metal", "#3a3732", 0.62, 0.7);
  const cloth = MeshBuilder.CreatePlane("oath-banner-cloth", { width: 1.16, height: 2.15, sideOrientation: Mesh.DOUBLESIDE }, scene);
  cloth.parent = root;
  cloth.position = new Vector3(0.28, 2.95, 0);
  cloth.rotation.y = Math.PI / 2;
  const material = new StandardMaterial("oath-banner-texture", scene);
  material.diffuseTexture = new Texture(assets.banner, scene);
  material.opacityTexture = material.diffuseTexture;
  material.backFaceCulling = false;
  material.useAlphaFromDiffuseTexture = true;
  material.specularColor = Color3.Black();
  cloth.material = material;
  return root;
}

function createSceneGeometry(scene: Scene, shadowGenerator: ShadowGenerator) {
  const ground = MeshBuilder.CreateGround("ashen-ground", { width: 120, height: 120, subdivisions: 8 }, scene);
  const groundMaterial = pbr(scene, "ground-pbr", "#a19d8f", 0.92, 0.08);
  const groundAlbedo = new Texture(assets.ground, scene);
  groundAlbedo.uScale = 7;
  groundAlbedo.vScale = 6;
  groundAlbedo.level = 1.35;
  groundMaterial.albedoTexture = groundAlbedo;
  groundMaterial.emissiveColor = Color3.FromHexString("#2f3a35");
  groundMaterial.emissiveIntensity = 0.28;
  const groundBump = new Texture(assets.ground, scene);
  groundBump.uScale = 7;
  groundBump.vScale = 6;
  groundBump.level = 0.22;
  groundMaterial.bumpTexture = groundBump;
  ground.material = groundMaterial;
  ground.receiveShadows = true;

  const stone = pbr(scene, "slate-stone", "#5d6461", 0.78, 0.24);
  const stoneAlbedo = new Texture(assets.ground, scene);
  stoneAlbedo.uScale = 0.75;
  stoneAlbedo.vScale = 0.75;
  stoneAlbedo.level = 1.2;
  stone.albedoTexture = stoneAlbedo;
  stone.emissiveColor = Color3.FromHexString("#0b100f");
  stone.emissiveIntensity = 0.12;
  const moss = pbr(scene, "mossy-stone", "#3f5041", 0.94, 0.02);
  const darkWood = pbr(scene, "dark-wood", "#40322c", 0.9, 0.04);
  const pineBark = pbr(scene, "pine-bark", "#3d3029", 0.92, 0.04);
  const pineNeedles = pbr(scene, "pine-needles", "#1a2925", 0.94, 0.02);

  const arena = MeshBuilder.CreateCylinder("circular-rune-arena", { diameter: 11.5, height: 0.22, tessellation: 48 }, scene);
  arena.position.y = 0.12;
  arena.material = stone;
  arena.receiveShadows = true;
  for (let i = 0; i < 3; i += 1) {
    const ring = MeshBuilder.CreateTorus(`rune-ring-${i}`, { diameter: 3.4 + i * 2.35, thickness: 0.07, tessellation: 64 }, scene);
    ring.position.y = 0.27 + i * 0.01;
    ring.material = i === 1 ? pbr(scene, `rune-red-${i}`, "#8e302c", 0.46, 0.15) : moss;
    ring.receiveShadows = true;
  }
  for (let i = 0; i < 14; i += 1) {
    const angle = (i / 14) * Math.PI * 2;
    const slab = MeshBuilder.CreateBox(`arena-slab-${i}`, { width: 1.9, height: 0.22, depth: 0.58 }, scene);
    slab.position = new Vector3(Math.cos(angle) * 4.75, 0.3, Math.sin(angle) * 4.75);
    slab.rotation.y = angle;
    slab.material = stone;
    slab.receiveShadows = true;
  }

  const ruinPositions = [new Vector3(-10, 0, -5), new Vector3(9.8, 0, -5.5), new Vector3(-9.6, 0, 6.2), new Vector3(9.7, 0, 7.0)];
  ruinPositions.forEach((position, index) => {
    const pillar = MeshBuilder.CreateBox(`ruin-pillar-${index}`, { width: 1.45, height: 3.5 + (index % 2) * 1.25, depth: 1.25 }, scene);
    pillar.position = position.add(new Vector3(0, pillar.scaling.y * 0.5 + 1.5, 0));
    pillar.rotation.y = (index * 0.4) - 0.25;
    pillar.material = index % 2 ? stone : moss;
    pillar.receiveShadows = true;
    const cap = MeshBuilder.CreateBox(`ruin-cap-${index}`, { width: 1.9, height: 0.25, depth: 1.65 }, scene);
    cap.parent = pillar;
    cap.position.y = 1.9;
    cap.material = stone;
  });

  const pinePositions: [number, number, number][] = [
    [-14, -9, 1.4], [-11, -10, 1.1], [-6, -11, 1.5], [0, -11, 1.2], [7, -11, 1.45], [13, -9, 1.2],
    [-15, 1, 1.3], [14, 1.5, 1.35], [-14, 9, 1.1], [-10, 10, 1.45], [-4, 11, 1.1], [4, 11, 1.35], [10, 10, 1.2], [15, 9, 1.45],
  ];
  pinePositions.forEach(([x, z, s]) => {
    const tree = createPine(scene, x, z, s, pineBark, pineNeedles);
    tree.getChildMeshes().forEach((mesh) => { mesh.receiveShadows = true; addShadowCaster(shadowGenerator, mesh); });
  });

  for (const [x, z, rotation] of [[-7.4, -6.2, 0.2], [7.2, -6.6, -0.35], [-7.6, 6.7, 2.6], [7.7, 6.5, -2.9]] as [number, number, number][]) {
    const banner = createBanner(scene, x, z, rotation);
    addShadowCaster(shadowGenerator, banner);
  }

  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2 + 0.3;
    const rock = MeshBuilder.CreateIcoSphere(`foreground-rock-${i}`, { radius: 0.55 + (i % 3) * 0.18, subdivisions: 1 }, scene);
    rock.position = new Vector3(Math.cos(angle) * (8.5 + (i % 2)), 0.35, Math.sin(angle) * (8.5 + (i % 2)));
    rock.scaling.y = 0.65;
    rock.material = moss;
    rock.receiveShadows = true;
  }

  return { ground, stone };
}

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.035, 0.05, 0.052, 1);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.006;
  scene.fogColor = new Color3(0.09, 0.13, 0.13);
  scene.ambientColor = new Color3(0.28, 0.3, 0.28);

  new Layer("cinematic-background", assets.visualTarget, scene, true);
  const camera = new ArcRotateCamera("third-person-camera", -Math.PI * 0.74, 1.03, 15.5, new Vector3(0, 1.2, 1.4), scene);
  camera.lowerRadiusLimit = 9;
  camera.upperRadiusLimit = 20;
  camera.lowerBetaLimit = 0.62;
  camera.upperBetaLimit = 1.33;
  camera.wheelPrecision = 75;
  camera.panningSensibility = 0;
  camera.attachControl(canvas, true);

  const hemi = new HemisphericLight("cold-sky-fill", new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.95;
  hemi.diffuse = Color3.FromHexString("#9baea9");
  hemi.groundColor = Color3.FromHexString("#252a26");
  const moon = new DirectionalLight("moon-key", new Vector3(-0.35, -1, 0.28), scene);
  moon.position = new Vector3(13, 19, -11);
  moon.intensity = 3.15;
  moon.diffuse = Color3.FromHexString("#d5ded9");
  moon.specular = Color3.FromHexString("#c8d6d2");
  const shadowGenerator = new ShadowGenerator(1536, moon);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 28;
  shadowGenerator.darkness = 0.36;

  const fireLights: PointLight[] = [];
  for (const [x, z] of [[-5.5, -4.2], [5.4, -4.5], [-5.8, 4.3], [5.8, 4.8]] as [number, number][]) {
    const brazier = MeshBuilder.CreateSphere("ember-brazier", { diameter: 0.28, segments: 12 }, scene);
    brazier.position = new Vector3(x, 0.55, z);
    const ember = pbr(scene, `ember-material-${x}-${z}`, "#b52f2b", 0.28, 0.18);
    ember.emissiveColor = Color3.FromHexString("#de5d32");
    ember.emissiveIntensity = 2.4;
    brazier.material = ember;
    const light = new PointLight(`ember-light-${x}-${z}`, new Vector3(x, 0.85, z), scene);
    light.diffuse = Color3.FromHexString("#dc6036");
    light.intensity = 10;
    light.range = 6;
    fireLights.push(light);
  }

  const { ground } = createSceneGeometry(scene, shadowGenerator);
  const input = new InputManager(canvas);
  const world = new GameWorld(scene, input, camera);
  addShadowCaster(shadowGenerator, world.player.root);
  for (const enemy of world.enemies) addShadowCaster(shadowGenerator, enemy.root);

  const glow = new GlowLayer("oath-glow", scene);
  glow.intensity = 0.28;
  const pipeline = new DefaultRenderingPipeline("cinematic-pipeline", true, scene, [camera]);
  pipeline.samples = 2;
  pipeline.fxaaEnabled = true;
  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = 0.72;
  pipeline.bloomWeight = 0.22;
  pipeline.bloomKernel = 48;
  pipeline.imageProcessingEnabled = true;
  pipeline.imageProcessing.contrast = 1.18;
  pipeline.imageProcessing.exposure = 1.28;
  pipeline.imageProcessing.toneMappingEnabled = true;
  pipeline.imageProcessing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
  pipeline.depthOfFieldEnabled = true;
  pipeline.depthOfField.focalLength = 52;
  pipeline.depthOfField.focusDistance = 1700;
  pipeline.depthOfField.fStop = 2.6;
  try {
    const ssao = new SSAO2RenderingPipeline("deep-ambient-occlusion", scene, { ssaoRatio: 0.7, blurRatio: 0.7 }, [camera]);
    ssao.radius = 2.6;
    ssao.totalStrength = 1.25;
    ssao.expensiveBlur = true;
  } catch {
    // Fallback: depth, fog and contact shadows continue to provide depth on limited GPUs.
  }

  const observer = scene.onBeforeRenderObservable.add(() => {
    const delta = Math.min(0.05, engine.getDeltaTime() / 1000);
    world.update(delta);
    camera.target = Vector3.Lerp(camera.target, world.player.position.add(new Vector3(0, 1.15, 0)), 0.075);
    fireLights.forEach((light, index) => { light.intensity = 6.6 + Math.sin(performance.now() * 0.006 + index) * 0.8; });
  });

  return {
    scene,
    dispose: () => {
      scene.onBeforeRenderObservable.remove(observer);
      world.dispose();
      camera.detachControl();
      scene.dispose();
    },
  };
}
