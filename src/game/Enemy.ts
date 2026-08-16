import {
  Color3,
  MeshBuilder,
  PBRMaterial,
  Scene,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

const mat = (scene: Scene, name: string, color: string, roughness: number, metallic = 0) => {
  const material = new PBRMaterial(name, scene);
  material.albedoColor = Color3.FromHexString(color);
  material.roughness = roughness;
  material.metallic = metallic;
  return material;
};

export class Enemy {
  readonly root: TransformNode;
  readonly spawn: Vector3;
  readonly id: number;
  health = 80;
  private defeated = false;
  private respawnTimer = 0;
  private hitFlash = 0;
  private attackCooldown = 0;
  private readonly shell;
  private readonly eye;

  constructor(scene: Scene, id: number, position: Vector3) {
    this.id = id;
    this.spawn = position.clone();
    this.root = new TransformNode(`ash-sentinel-${id}`, scene);
    this.root.position.copyFrom(position);
    this.shell = mat(scene, `sentinel-shell-${id}`, id % 2 === 0 ? "#4b5552" : "#554741", 0.88, 0.12);
    this.eye = mat(scene, `sentinel-eye-${id}`, "#b52f2b", 0.3, 0.45);

    const body = MeshBuilder.CreateCylinder(`sentinel-body-${id}`, { height: 1.2, diameterTop: 0.48, diameterBottom: 0.7, tessellation: 10 }, scene);
    body.parent = this.root;
    body.position.y = 0.68;
    body.material = this.shell;
    const head = MeshBuilder.CreateIcoSphere(`sentinel-mask-${id}`, { radius: 0.38, subdivisions: 1 }, scene);
    head.parent = this.root;
    head.position.y = 1.52;
    head.material = this.shell;
    for (const side of [-1, 1]) {
      const horn = MeshBuilder.CreateCylinder(`sentinel-horn-${id}-${side}`, { height: 0.44, diameterTop: 0.03, diameterBottom: 0.15, tessellation: 8 }, scene);
      horn.parent = this.root;
      horn.position = new Vector3(side * 0.2, 1.84, 0);
      horn.rotation.z = side * 0.33;
      horn.material = this.shell;
      const eye = MeshBuilder.CreateSphere(`sentinel-eye-${id}-${side}`, { diameter: 0.07, segments: 8 }, scene);
      eye.parent = this.root;
      eye.position = new Vector3(side * 0.12, 1.56, -0.32);
      eye.material = this.eye;
    }
    const blade = MeshBuilder.CreateBox(`sentinel-blade-${id}`, { width: 0.08, height: 1.22, depth: 0.06 }, scene);
    blade.parent = this.root;
    blade.position = new Vector3(0.5, 0.8, -0.03);
    blade.rotation.z = -0.35;
    blade.material = mat(scene, `sentinel-steel-${id}`, "#a1aaa2", 0.38, 0.72);
  }

  get alive() { return !this.defeated; }
  get canAttack() { return this.alive && this.attackCooldown <= 0; }

  takeDamage(amount: number) {
    if (!this.alive) return;
    this.health = Math.max(0, this.health - amount);
    this.hitFlash = 0.16;
    if (this.health <= 0) {
      this.defeated = true;
      this.respawnTimer = 5.5;
      this.root.setEnabled(false);
    }
  }

  update(delta: number, playerPosition: Vector3) {
    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    this.hitFlash = Math.max(0, this.hitFlash - delta);
    if (this.defeated) {
      this.respawnTimer -= delta;
      if (this.respawnTimer <= 0) {
        this.defeated = false;
        this.health = 80;
        this.root.position.copyFrom(this.spawn);
        this.root.setEnabled(true);
      }
      return;
    }

    const toPlayer = playerPosition.subtract(this.root.position);
    toPlayer.y = 0;
    const distance = toPlayer.length();
    if (distance > 2.45) {
      this.root.position.addInPlace(toPlayer.normalize().scale(1.05 * delta));
      this.root.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
    } else if (this.canAttack) {
      this.attackCooldown = 1.25;
      this.root.scaling = new Vector3(1.08, 0.92, 1.08);
    }

    this.root.scaling = Vector3.Lerp(this.root.scaling, Vector3.One(), Math.min(1, delta * 9));
    this.root.position.y = Math.sin(performance.now() * 0.002 + this.id) * 0.02;
  }

  consumeAttack() {
    if (!this.alive || this.attackCooldown > 0.82) return false;
    return this.attackCooldown > 0.55;
  }

  dispose() { this.root.dispose(false, true); }
}
