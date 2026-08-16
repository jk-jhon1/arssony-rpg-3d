# Memória de implementação — Arssony RPG 3D

## Descobertas

O arquivo `Hero_Forge_Explorer_Demo_3D_Tabletop.zip` contém somente `Hero_Forge_Explorer_Demo.unity3d`, sem projeto Unity ou código-fonte editável. Os arquivos TypeScript/React/Babylon enviados separadamente também são apenas um recorte: `GameCanvas.tsx`, `GameHud.tsx`, `InputManager.ts` e `assets.ts` referenciam módulos ausentes (`@/game/scene`, `GameWorld`, `weapons`, `Player`, `Enemy` e o bootstrap `main.tsx`).

## Decisão

Para entregar uma atualização realmente executável, será montada uma versão web Babylon.js autocontida no diretório `arssony-game`, preservando o contrato de combate descrito em `PLAN.md`: movimentação WASD/setas, ataque, quatro armas, inimigos, projéteis e HUD. A atualização visual usará materiais procedurais PBR, texturas geradas e pós-processamento compatível com o navegador, com fallback seguro caso recursos avançados de hardware não estejam disponíveis.

## Requisitos visíveis

- Manter combate e troca de armas.
- Ocultar o rack de botões inferiores; os controles ficam no teclado.
- Adicionar tutorial curto em português, discreto e fechável.
- Usar estética de fantasia sombria, vermelho de juramento, pedra/ferro/madeira gastos.
- Adicionar ambiente com densidade geométrica e iluminação cinematográfica, sem prometer ray tracing nativo obrigatório em todo navegador.

## Limites técnicos

O build Unity original não é editável com os arquivos fornecidos. A implementação entregue será uma recriação web editável baseada no design e nas mecânicas documentadas, não uma alteração binária do arquivo Unity.

## Próximo passo

Criar os assets visuais mínimos e implementar a cena/combate/HUD em uma aplicação Vite + React + Babylon.js.

