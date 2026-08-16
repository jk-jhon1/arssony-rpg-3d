import {
  Color3,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Scene,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { WeaponId, weapons } from "./weapons";

const material = (scene: Scene, name: string, hex: string, roughness: number, metallic = 0) => {
  const result = new PBRMaterial(name, scene);
  result.albedoColor = Color3.FromHexString(hex);
  result.roughness = roughness;
  result.metallic = metallic;
  result.environmentIntensity = 0.55;
  return result;
};

export class Player {
  readonly root: TransformNode;
  readonly weaponRoot: TransformNode;
  readonly weaponMeshes = new Map<WeaponId, Mesh[]>();
  private readonly scene: Scene;
  private readonly oathRed = material;
  private activeWeapon: WeaponId = "sword";
  private attackTimer = 0;
  private cooldown = 0;
  private attackSerial = 0;
  private lastConsumedAttack = 0;
  private readonly bodyMaterial;
  private readonly metalMaterial;
  private readonly boneMaterial;

  constructor(scene: Scene) {
    this.scene = scene;
    this.root = new TransformNode("arssony-root", scene);
    this.root.position = new Vector3(0, 0, 4.6);
    this.bodyMaterial = material(scene, "ash-fur", "#252a27", 0.92);
    this.metalMaterial = material(scene, "worn-steel", "#89949a", 0.32, 0.76);
    this.boneMaterial = material(scene, "old-bone", "#c8bca4", 0.64, 0.05);
    this.createBody();
    this.weaponRoot = new TransformNode("active-weapon", scene);
    this.weaponRoot.parent = this.root;
    this.weaponRoot.position = new Vector3(0.48, 1.02, 0.32);
    this.createWeapons();
    this.equip("sword");
  }

  private createBody() {
    const torso = MeshBuilder.CreateCapsule("ash-fur-torso", { height: 1.45, radius: 0.42, tessellation: 16, subdivisions: 3 }, this.scene);
    torso.parent = this.root;
    torso.position.y = 1.15;
    torso.material = this.bodyMaterial;

    const belt = MeshBuilder.CreateTorus("leather-belt", { diameter: 0.87, thickness: 0.09, tessellation: 20 }, this.scene);
    belt.parent = this.root;
    belt.position.y = 0.86;
    belt.rotation.x = Math.PI / 2;
    belt.material = material(this.scene, "leather", "#694331", 0.86, 0.05);

    const head = MeshBuilder.CreateSphere("silver-haired-head", { diameter: 0.66, segments: 20 }, this.scene);
    head.parent = this.root;
    head.position.y = 2.03;
    head.material = material(this.scene, "skin", "#925849", 0.72, 0.02);

    for (let i = 0; i < 8; i += 1) {
      const lock = MeshBuilder.CreateSphere(`silver-lock-${i}`, { diameter: 0.22, segments: 10 }, this.scene);
      lock.parent = this.root;
      lock.position = new Vector3(-0.24 + (i % 4) * 0.16, 2.29 + Math.floor(i / 4) * 0.11, -0.08 - (i % 3) * 0.03);
      lock.scaling = new Vector3(0.8, 1.7, 0.8);
      lock.rotation.z = (i - 3.5) * 0.11;
      lock.material = this.metalMaterial;
    }

    const shoulderL = MeshBuilder.CreateSphere("fur-shoulder-l", { diameter: 0.6, segments: 14 }, this.scene);
    const shoulderR = shoulderL.clone("fur-shoulder-r")!;
    shoulderL.parent = shoulderR.parent = this.root;
    shoulderL.position = new Vector3(-0.48, 1.48, 0);
    shoulderR.position = new Vector3(0.48, 1.48, 0);
    shoulderL.scaling = shoulderR.scaling = new Vector3(1, 0.55, 0.78);
    shoulderL.material = shoulderR.material = this.bodyMaterial;

    for (const side of [-1, 1]) {
      const leg = MeshBuilder.CreateCylinder(`wrapped-leg-${side}`, { height: 0.86, diameter: 0.26, tessellation: 12 }, this.scene);
      leg.parent = this.root;
      leg.position = new Vector3(side * 0.22, 0.43, 0);
      leg.material = material(this.scene, `wrapped-cloth-${side}`, "#4b3f37", 0.9);
      const shin = MeshBuilder.CreateTorus(`bone-shin-${side}`, { diameter: 0.34, thickness: 0.06, tessellation: 14 }, this.scene);
      shin.parent = this.root;
      shin.position = new Vector3(side * 0.22, 0.49, -0.03);
      shin.rotation.x = Math.PI / 2;
      shin.material = this.boneMaterial;
      const foot = MeshBuilder.CreateBox(`bare-foot-${side}`, { width: 0.25, height: 0.12, depth: 0.52 }, this.scene);
      foot.parent = this.root;
      foot.position = new Vector3(side * 0.22, 0.08, 0.16);
      foot.material = material(this.scene, `skin-foot-${side}`, "#855241", 0.8);
    }

    const rune = MeshBuilder.CreateTorus("back-rune", { diameter: 0.32, thickness: 0.045, tessellation: 20 }, this.scene);
    rune.parent = this.root;
    rune.position = new Vector3(0, 1.43, -0.44);
    rune.rotation.x = Math.PI / 2;
    rune.material = this.oathRed(this.scene, "rune-red", "#B52F2B", 0.42, 0.2);
  }

  private createWeapons() {
    const sword = MeshBuilder.CreateBox("sword-blade", { width: 0.12, height: 1.55, depth: 0.045 }, this.scene);
    sword.position.y = 0.82;
    sword.material = this.metalMaterial;
    const swordGuard = MeshBuilder.CreateBox("sword-guard", { width: 0.45, height: 0.06, depth: 0.09 }, this.scene);
    swordGuard.position.y = 0.1;
    swordGuard.material = this.boneMaterial;
    this.weaponMeshes.set("sword", [sword, swordGuard]);

    const twins: Mesh[] = [];
    for (const side of [-1, 1]) {
      const blade = MeshBuilder.CreateBox(`twin-blade-${side}`, { width: 0.1, height: 1.25, depth: 0.04 }, this.scene);
      blade.position = new Vector3(side * 0.22, 0.72, 0.01);
      blade.rotation.z = side * 0.12;
      blade.material = this.oathRed(this.scene, `twin-red-${side}`, "#B52F2B", 0.29, 0.8);
      twins.push(blade);
    }
    this.weaponMeshes.set("twins", twins);

    const bow = MeshBuilder.CreateTorus("ritual-bow", { diameter: 1.4, thickness: 0.055, tessellation: 20 }, this.scene);
    bow.rotation.z = Math.PI / 2;
    bow.position.y = 0.74;
    bow.material = this.oathRed(this.scene, "bow-amber", "#c48745", 0.5, 0.15);
    const bowString = MeshBuilder.CreateBox("bow-string", { width: 0.03, height: 1.32, depth: 0.02 }, this.scene);
    bowString.position.y = 0.74;
    bowString.material = this.boneMaterial;
    this.weaponMeshes.set("bow", [bow, bowString]);

    const spear = MeshBuilder.CreateBox("ritual-spear", { width: 0.095, height: 2.1, depth: 0.065 }, this.scene);
    spear.position.y = 1.05;
    spear.material = this.boneMaterial;
    const spearTip = MeshBuilder.CreateCylinder("spear-tip", { height: 0.38, diameterTop: 0, diameterBottom: 0.22, tessellation: 8 }, this.scene);
    spearTip.position.y = 2.2;
    spearTip.material = this.metalMaterial;
    this.weaponMeshes.set("spear", [spear, spearTip]);

    for (const meshes of this.weaponMeshes.values()) {
      for (const mesh of meshes) {
        mesh.parent = this.weaponRoot;
        mesh.isVisible = false;
      }
    }
  }

  equip(id: WeaponId) {
    this.activeWeapon = id;
    for (const [weapon, meshes] of this.weaponMeshes) {
      for (const mesh of meshes) mesh.isVisible = weapon === id;
    }
  }

  get weapon() { return this.activeWeapon; }
  get attackId() { return this.attackSerial; }
  get attackInProgress() { return this.attackTimer > 0; }
  get position() { return this.root.position; }

  move(direction: Vector3, delta: number) {
    if (direction.lengthSquared() > 0.01) {
      const step = direction.normalize().scale(3.4 * delta);
      this.root.position.addInPlace(step);
      this.root.position.x = Math.max(-14, Math.min(14, this.root.position.x));
      this.root.position.z = Math.max(-10, Math.min(10, this.root.position.z));
      this.root.rotation.y = Math.atan2(direction.x, direction.z);
    }
  }

  tryAttack() {
    if (this.cooldown > 0 || this.attackTimer > 0) return false;
    this.cooldown = weapons[this.activeWeapon].cooldown;
    this.attackTimer = this.activeWeapon === "twins" ? 0.26 : 0.34;
    this.attackSerial += 1;
    return true;
  }

  consumeAttackFrame() {
    if (this.lastConsumedAttack === this.attackSerial) return false;
    this.lastConsumedAttack = this.attackSerial;
    return true;
  }

  update(delta: number) {
    this.cooldown = Math.max(0, this.cooldown - delta);
    if (this.attackTimer > 0) {
      this.attackTimer = Math.max(0, this.attackTimer - delta);
      const progress = 1 - this.attackTimer / (this.activeWeapon === "twins" ? 0.26 : 0.34);
      this.weaponRoot.rotation.z = -1.05 + Math.sin(progress * Math.PI) * 2.1;
      this.weaponRoot.rotation.y = Math.sin(progress * Math.PI) * 0.3;
    } else {
      this.weaponRoot.rotation.z = 0;
      this.weaponRoot.rotation.y = 0;
    }
    this.root.position.y = Math.sin(performance.now() * 0.002) * 0.015;
  }
}
