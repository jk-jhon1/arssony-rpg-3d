import {
  ArcRotateCamera,
  Color3,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Quaternion,
  Scene,
  Vector3,
} from "@babylonjs/core";
import { Enemy } from "./Enemy";
import { InputManager } from "./InputManager";
import { Player } from "./Player";
import { WeaponId, weaponOrder, weapons } from "./weapons";

export type HudState = {
  started: boolean;
  health: number;
  maxHealth: number;
  arrows: number;
  weapon: WeaponId;
  objective: string;
  message: string;
  enemies: number;
};

type Projectile = { mesh: Mesh; velocity: Vector3; damage: number; life: number };

const sendHud = (state: HudState) => window.dispatchEvent(new CustomEvent<HudState>("arssony-hud", { detail: state }));

export class GameWorld {
  readonly player: Player;
  readonly enemies: Enemy[];
  private readonly scene: Scene;
  private readonly input: InputManager;
  private readonly camera: ArcRotateCamera;
  private readonly projectiles: Projectile[] = [];
  private health = 100;
  private arrows = 12;
  private started = false;
  private message = "O Círculo de Cinzas aguarda.";
  private hudTimer = 0;
  private demo = false;
  private demoClock = 0;
  private lastWeapon: WeaponId = "sword";
  private readonly projectileMaterial: PBRMaterial;

  constructor(scene: Scene, input: InputManager, camera: ArcRotateCamera) {
    this.scene = scene;
    this.input = input;
    this.camera = camera;
    this.demo = new URLSearchParams(window.location.search).has("demo");
    this.player = new Player(scene);
    this.enemies = [
      new Enemy(scene, 1, new Vector3(-5.4, 0, -2.4)),
      new Enemy(scene, 2, new Vector3(4.8, 0, -3.4)),
      new Enemy(scene, 3, new Vector3(-5.6, 0, 4.8)),
      new Enemy(scene, 4, new Vector3(5.4, 0, 5.2)),
    ];
    this.projectileMaterial = new PBRMaterial("ritual-projectile", scene);
    this.projectileMaterial.albedoColor = Color3.FromHexString("#e0a64a");
    this.projectileMaterial.emissiveColor = Color3.FromHexString("#9c4c1b");
    this.projectileMaterial.emissiveIntensity = 1.6;
    this.broadcast();
    if (this.demo) this.start();
  }

  private start() {
    this.started = true;
    this.message = "A clareira respira. Elimine as sentinelas.";
    this.broadcast();
  }

  private cycleWeapon() {
    const index = weaponOrder.indexOf(this.player.weapon);
    this.player.equip(weaponOrder[(index + 1) % weaponOrder.length]);
    this.message = `Equipado: ${weapons[this.player.weapon].name}.`;
  }

  private resolveAttack() {
    const spec = weapons[this.player.weapon];
    if (spec.projectile) {
      if (this.arrows <= 0) {
        this.message = "As flechas acabaram. Troque de arma.";
        return;
      }
      this.arrows -= 1;
      const origin = this.player.position.add(new Vector3(0, 1.1, 0));
      const direction = new Vector3(Math.sin(this.player.root.rotation.y), 0, Math.cos(this.player.root.rotation.y));
      const arrow = MeshBuilder.CreateBox("ritual-arrow", { width: 0.06, height: 0.06, depth: 0.72 }, this.scene);
      arrow.position.copyFrom(origin.add(direction.scale(0.75)));
      arrow.material = this.projectileMaterial;
      arrow.lookAt(arrow.position.add(direction));
      this.projectiles.push({ mesh: arrow, velocity: direction.scale(13), damage: spec.damage, life: 1.25 });
      this.message = "Flecha ritual lançada.";
      return;
    }

    const hits = this.player.weapon === "twins" ? 2 : 1;
    let hitCount = 0;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const distance = Vector3.Distance(this.player.position, enemy.root.position);
      if (distance <= spec.range) {
        enemy.takeDamage(spec.damage * hits);
        hitCount += 1;
      }
    }
    this.message = hitCount ? `${weapons[this.player.weapon].name}: ${hitCount} sentinela(s) atingida(s).` : `${weapons[this.player.weapon].name}: fora de alcance.`;
  }

  private updateProjectiles(delta: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = this.projectiles[i];
      projectile.life -= delta;
      projectile.mesh.position.addInPlace(projectile.velocity.scale(delta));
      let remove = projectile.life <= 0 || Math.abs(projectile.mesh.position.x) > 18 || Math.abs(projectile.mesh.position.z) > 16;
      for (const enemy of this.enemies) {
        if (!enemy.alive || Vector3.Distance(projectile.mesh.position, enemy.root.position.add(new Vector3(0, 1, 0))) > 0.9) continue;
        enemy.takeDamage(projectile.damage);
        this.message = "A flecha encontrou uma sentinela.";
        remove = true;
        break;
      }
      if (remove) {
        projectile.mesh.dispose();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private broadcast() {
    sendHud({
      started: this.started,
      health: this.health,
      maxHealth: 100,
      arrows: this.arrows,
      weapon: this.player.weapon,
      objective: "Purifique o Círculo de Cinzas",
      message: this.message,
      enemies: this.enemies.filter((enemy) => enemy.alive).length,
    });
  }

  update(delta: number) {
    if (!this.started) {
      if (this.input.consumeStart()) this.start();
      return;
    }

    this.demoClock += delta;
    if (this.demo) {
      this.input.setDemoMovement(Math.sin(this.demoClock * 0.45) * 0.72, Math.cos(this.demoClock * 0.45) * 0.72);
      if (this.demoClock % 2.8 < delta) this.input.queueDemoAttack();
      if (this.demoClock % 6 < delta) this.cycleWeapon();
    }

    const movement = this.input.movement;
    const forward = new Vector3(Math.sin(this.camera.alpha), 0, Math.cos(this.camera.alpha));
    const right = new Vector3(Math.cos(this.camera.alpha), 0, -Math.sin(this.camera.alpha));
    this.player.move(right.scale(movement.x).add(forward.scale(movement.z)), delta);

    const requestedWeapon = this.input.consumeWeapon();
    if (requestedWeapon) {
      this.player.equip(requestedWeapon);
      this.message = `Equipado: ${weapons[requestedWeapon].name}.`;
    }
    if (this.input.consumeCycle()) this.cycleWeapon();
    if (this.input.consumeAttack() && this.player.tryAttack()) this.resolveAttack();

    this.player.update(delta);
    for (const enemy of this.enemies) {
      const distance = Vector3.Distance(this.player.position, enemy.root.position);
      const shouldStrike = enemy.alive && enemy.canAttack && distance <= 2.45;
      enemy.update(delta, this.player.position);
      if (shouldStrike) {
        this.health = Math.max(0, this.health - 7);
        this.message = "A sentinela atingiu Arssony.";
        if (this.health <= 0) {
          this.health = 100;
          this.player.root.position.copyFrom(new Vector3(0, 0, 4.6));
          this.message = "O juramento resiste. Arssony retorna ao círculo.";
        }
      }
    }
    this.updateProjectiles(delta);

    this.hudTimer -= delta;
    if (this.hudTimer <= 0 || this.lastWeapon !== this.player.weapon) {
      this.hudTimer = 0.08;
      this.lastWeapon = this.player.weapon;
      this.broadcast();
    }
  }

  dispose() {
    this.input.dispose();
    for (const enemy of this.enemies) enemy.dispose();
    for (const projectile of this.projectiles) projectile.mesh.dispose();
    this.projectiles.length = 0;
    this.player.root.dispose(false, true);
  }
}
