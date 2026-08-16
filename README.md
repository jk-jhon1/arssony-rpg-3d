# Arssony RPG 3D — Juramento de Ferro

Esta entrega contém a versão editável web do protótipo Arssony, reconstruída em React, TypeScript e Babylon.js a partir dos arquivos-fonte parciais enviados. O pacote Unity original (`Hero_Forge_Explorer_Demo.unity3d`) permanece preservado na raiz apenas como referência; ele não foi alterado porque o ZIP fornecido não contém um projeto Unity editável.

## O que foi atualizado

O cenário agora apresenta uma clareira de fantasia sombria com arena circular rúnica, ruínas, pinheiros, monólitos, rochas, estandartes e braseiros. A apresentação combina materiais PBR, textura de solo com microdesgaste e bump, roughness/metallic por material, sombras filtradas, ambient occlusion em screen space, bloom sutil, ACES tone mapping, profundidade de campo e névoa atmosférica.

As mecânicas de ataque foram preservadas: espada, lâminas gêmeas, arco com flechas e lança continuam disponíveis, com alcance, dano, cooldown, inimigos perseguindo Arssony, dano recebido, derrota e ressurgimento. Os botões inferiores foram removidos. A troca de arma e o ataque permanecem no teclado e no clique do canvas.

O tutorial compacto fica no canto inferior esquerdo após iniciar e pode ser fechado. O overlay de entrada também lista os comandos essenciais em português.

## Controles

| Ação | Atalho |
|---|---|
| Mover Arssony | `W`, `A`, `S`, `D` ou setas |
| Atacar | `Espaço` ou clique no canvas |
| Equipar espada | `1` |
| Equipar lâminas gêmeas | `2` |
| Equipar arco | `3` |
| Equipar lança | `4` |
| Alternar arma | `Q` |

## Executar localmente

```bash
pnpm install
pnpm dev
```

Abra `http://127.0.0.1:5173/`. Para validação automática, use `http://127.0.0.1:5173/?demo`.

## Validar

```bash
pnpm check
pnpm build
```

## Estrutura principal

```text
src/
├── components/
│   ├── GameCanvas.tsx
│   └── GameHud.tsx
├── game/
│   ├── Enemy.ts
│   ├── GameWorld.ts
│   ├── InputManager.ts
│   ├── Player.ts
│   ├── assets.ts
│   ├── scene.ts
│   └── weapons.ts
├── App.tsx
├── main.tsx
└── styles.css
public/assets/
├── environment-cinematic.png
├── ground-pbr.png
├── oath-banner.png
└── arssony-reference.png
```

## Nota sobre fotorrealismo e ray tracing

A experiência foi elevada visualmente dentro do caminho compatível com navegadores WebGL2. O ray tracing nativo não é garantido no navegador; o resultado usa PBR, sombras suaves, AO, reflexos de ambiente, depth of field, fog e bloom para aproximar a leitura cinematográfica sem depender de uma GPU específica.
