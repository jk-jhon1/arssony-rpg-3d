# Assets — Arssony RPG 3D

**Direção de arte:** fantasia sombria fotorrealista, com floresta úmida, pedra ardósia, cinza, musgo e vermelho de juramento. O ambiente combina uma referência panorâmica cinematográfica com geometria procedural Babylon.js e materiais PBR com variação de roughness, microdesgaste, bump, poeira e reflexos de ambiente.

| Asset | Função | Origem | Uso no jogo |
|---|---|---|---|
| `public/assets/environment-cinematic.png` | referência/background panorâmico da clareira | gerado para esta atualização | Layer de fundo e painel inicial |
| `public/assets/ground-pbr.png` | albedo e bump de solo rochoso úmido | gerado para esta atualização | solo repetido, arena e slabs |
| `public/assets/oath-banner.png` | estandarte de pano gasto com runa | gerado para esta atualização | bandeiras da clareira e marca do HUD |
| `public/assets/arssony-reference.png` | referência visual enviada pelo usuário | fornecido pelo usuário | painel de entrada; não é carregado como modelo 3D |

## Pipeline visual implementado

A cena usa `PBRMaterial` para solo, pedra, musgo, metal, couro, osso, madeira, estandartes e personagens. O solo usa a textura gerada como albedo e bump com tiling; as superfícies recebem roughness e metallic distintos. A iluminação combina hemisférica, direcional com `ShadowGenerator` em mapa de sombras suave e pontos de luz para braseiros. A apresentação adiciona `DefaultRenderingPipeline` com FXAA, bloom, ACES tone mapping, contraste, exposição e depth of field, além de `SSAO2RenderingPipeline` quando suportado pelo navegador.

## Limitações assumidas

O ray tracing nativo não é garantido em WebGL2/browser. Por isso, a implementação usa o caminho compatível com navegador: PBR + iluminação indireta simulada por environment/background, sombras filtradas, ambient occlusion em screen space, fog atmosférico e pós-processamento. A geometria de personagens, armas, ruínas, árvores, rochas e arena é procedural para manter o pacote editável e leve.
