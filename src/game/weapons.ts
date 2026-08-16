export type WeaponId = "sword" | "twins" | "bow" | "spear";

export type WeaponSpec = {
  id: WeaponId;
  name: string;
  detail: string;
  damage: number;
  range: number;
  cooldown: number;
  color: string;
  projectile?: boolean;
};

export const weapons: Record<WeaponId, WeaponSpec> = {
  sword: { id: "sword", name: "Espada", detail: "golpe equilibrado", damage: 24, range: 2.75, cooldown: 0.62, color: "#d8e7e0" },
  twins: { id: "twins", name: "Lâminas gêmeas", detail: "sequência veloz", damage: 14, range: 2.5, cooldown: 0.34, color: "#c93c38" },
  bow: { id: "bow", name: "Arco", detail: "flecha ritual", damage: 30, range: 14, cooldown: 0.9, color: "#f2bc5c", projectile: true },
  spear: { id: "spear", name: "Lança", detail: "alcance maior", damage: 36, range: 3.7, cooldown: 1.05, color: "#f5ead0" },
};

export const weaponOrder: WeaponId[] = ["sword", "twins", "bow", "spear"];
