# Estrutura do Arssony RPG 3D

## Composição

`src/App.tsx` monta somente o `GameCanvas` e o `GameHud`. React controla o quadro da aplicação e o HUD DOM; Babylon.js controla a cena, câmera, luzes, materiais, geometria e loop de renderização.

## Cena e ciclo de vida

`src/components/GameCanvas.tsx` cria um único `Engine`, chama `createGameScene` e remove loop, listeners e cena no unmount. `src/game/scene.ts` cria a câmera orbital, a clareira, a arena, ruínas, árvores, estandartes, iluminação, sombras, AO e pós-processamento; devolve `{ scene, dispose }`.

## Gameplay

`GameWorld` é o dono do estado de partida: início, vida, flechas, mensagens, projéteis, inimigos e comandos de combate. `InputManager` traduz teclado, clique, eventos do HUD e modo `?demo` em ações sem espalhar verificações de teclas pelo jogo. `Player` possui a malha procedimental, posição, arma ativa e janela de ataque. `Enemy` possui perseguição, dano, derrota e ressurgimento. `weapons.ts` é a fonte dos parâmetros das quatro armas.

## UI

`GameHud.tsx` escuta `arssony-hud` e desenha vida, arma ativa, objetivo, vigias, mensagem de combate e tutorial. Os botões inferiores foram removidos deliberadamente; o controle continua disponível por teclado e clique no canvas. A tela inicial continua contendo uma única ação para desbloquear o foco do jogo.

## Assets

`public/assets` contém os arquivos gerados e a referência local do herói. O ambiente e o solo são usados respectivamente como camada visual e material PBR; o estandarte é usado na cena e na marca do HUD.

## Verificação

A verificação padrão é `pnpm check`, `pnpm build` e execução de `pnpm dev` com a rota `/?demo`. A rota demo inicia a partida, movimenta Arssony, troca as armas e dispara ataques automaticamente, permitindo observar a cena sem entrada manual.
