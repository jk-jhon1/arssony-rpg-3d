import { useEffect, useMemo, useState } from "react";
import { assets } from "../game/assets";
import type { HudState } from "../game/GameWorld";
import type { ArssonyCommand } from "../game/InputManager";
import type { WeaponId } from "../game/weapons";

const initialState: HudState = {
  started: false,
  health: 100,
  maxHealth: 100,
  arrows: 12,
  weapon: "sword",
  objective: "Purifique o Círculo de Cinzas",
  message: "O Círculo de Cinzas aguarda.",
  enemies: 4,
};

const weaponLabels: Record<WeaponId, { name: string; detail: string; key: string }> = {
  sword: { name: "Espada", detail: "golpe equilibrado", key: "1" },
  twins: { name: "Lâminas gêmeas", detail: "sequência veloz", key: "2" },
  bow: { name: "Arco", detail: "flecha ritual", key: "3" },
  spear: { name: "Lança", detail: "alcance maior", key: "4" },
};

const dispatch = (command: ArssonyCommand) => window.dispatchEvent(new CustomEvent<ArssonyCommand>("arssony-command", { detail: command }));

export default function GameHud() {
  const [state, setState] = useState<HudState>(initialState);
  const [showTutorial, setShowTutorial] = useState(true);
  const health = useMemo(() => Math.max(0, Math.min(100, (state.health / state.maxHealth) * 100)), [state.health, state.maxHealth]);
  const activeWeapon = weaponLabels[state.weapon];

  useEffect(() => {
    const onHud = (event: Event) => setState((event as CustomEvent<HudState>).detail);
    window.addEventListener("arssony-hud", onHud);
    return () => window.removeEventListener("arssony-hud", onHud);
  }, []);

  return (
    <div className="game-hud pointer-events-none fixed inset-0 z-10 overflow-hidden text-[#f2ecdc]">
      <header className="absolute left-4 top-4 flex items-start gap-3 sm:left-7 sm:top-7">
        <img className="h-11 w-11 object-contain sm:h-14 sm:w-14" src={assets.runeMark} alt="Estandarte rúnico de Arssony" />
        <section className="hud-plate min-w-[206px] p-3 sm:min-w-[256px] sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="hud-kicker">Juramento de ferro</span>
            <span className="font-mono text-[10px] text-[#c9bca1]">VIGIAS {state.enemies}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="hud-title text-xl sm:text-2xl">Arssony</h1>
            <span className="text-xs font-semibold tracking-[0.16em] text-[#e98a78]">{Math.ceil(state.health)}/{state.maxHealth}</span>
          </div>
          <div className="health-track mt-2.5"><div className="health-fill" style={{ width: `${health}%` }} /></div>
        </section>
      </header>

      <aside className="hud-plate absolute right-4 top-4 hidden w-56 p-3 sm:right-7 sm:top-7 md:block">
        <div className="flex items-center justify-between">
          <span className="hud-kicker">Arma ativa</span>
          <span className="weapon-key">{activeWeapon.key}</span>
        </div>
        <p className="mt-1 font-['Cinzel'] text-base text-[#fff2da]">{activeWeapon.name}</p>
        <p className="text-xs uppercase tracking-[0.12em] text-[#c9bca1]">{activeWeapon.detail}</p>
        {state.weapon === "bow" ? <p className="mt-2 text-xs text-[#f2c269]">FLECHAS {state.arrows}</p> : null}
        <div className="mt-3 h-px bg-[#c9bca1]/20" />
        <p className="mt-2 text-[10px] leading-relaxed tracking-[0.08em] text-[#d4c4a9]">1–4 equipam · Q alterna</p>
      </aside>

      <section className="absolute left-1/2 top-5 w-[min(90vw,520px)] -translate-x-1/2 text-center sm:top-7">
        <p className="hud-kicker">Objetivo da jornada</p>
        <h2 className="mt-1 font-['Cinzel'] text-sm font-semibold tracking-[0.08em] text-[#f7f1e1] sm:text-base">{state.objective}</h2>
      </section>

      <section className="absolute bottom-5 left-1/2 w-[min(94vw,760px)] -translate-x-1/2 text-center sm:bottom-7">
        <p className="font-['Barlow_Condensed'] text-xs font-medium uppercase tracking-[0.16em] text-[#e8c7a5] sm:text-sm">{state.message}</p>
      </section>

      {state.started && showTutorial ? (
        <aside className="tutorial-panel">
          <button type="button" className="tutorial-close" aria-label="Ocultar tutorial" onClick={() => setShowTutorial(false)}>×</button>
          <h2 className="tutorial-title">Como jogar</h2>
          <p className="tutorial-copy"><kbd>WASD</kbd> ou setas movem Arssony. <kbd>ESPAÇO</kbd> ou clique ataca. Use <kbd>1–4</kbd> para trocar o estilo de combate e <kbd>Q</kbd> para alternar.</p>
        </aside>
      ) : null}

      {!state.started ? (
        <div className="pointer-events-auto absolute inset-0 grid place-items-center bg-[#0f1519]/70 px-5 backdrop-blur-[2px]">
          <section className="start-panel relative grid max-w-[790px] overflow-hidden md:grid-cols-[0.75fr_1.25fr]">
            <span className="oath-fissure" aria-hidden="true" />
            <div className="relative min-h-56 overflow-hidden bg-[#2a3635] md:min-h-full">
              <img src={assets.visualTarget} alt="Clareira de combate de Arssony" className="absolute inset-0 h-full w-full object-cover opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101416] via-transparent to-transparent" />
              <img src={assets.portrait} alt="Referência visual de Arssony" className="absolute bottom-0 left-1/2 h-[78%] w-auto -translate-x-1/2 object-contain object-bottom drop-shadow-2xl" />
              <span className="absolute bottom-4 left-4 hud-kicker">Arssony · o juramentado</span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="brand-lockup mb-5"><img src={assets.runeMark} alt="" /><span>ARSSONY</span><i>JURAMENTO DE FERRO</i></div>
              <p className="hud-kicker">RPG de ação · clareira de cinzas</p>
              <h2 className="mt-3 font-['Cinzel'] text-3xl font-bold leading-tight text-[#fff9ec] sm:text-4xl">Troque o aço.<br /><span className="text-[#da5549]">Mude o destino.</span></h2>
              <p className="mt-4 max-w-md font-['Barlow_Condensed'] text-base leading-relaxed text-[#d8ccb8]">Explore a rota de Movium, enfrente as sentinelas e purifique o círculo. Cada arma muda o ritmo do combate.</p>
              <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2 text-xs text-[#cfc0aa]"><span><kbd>WASD</kbd> mover</span><span><kbd>1–4</kbd> equipar</span><span><kbd>Q</kbd> alternar</span><span><kbd>ESPAÇO</kbd> atacar</span></div>
              <button type="button" className="start-button mt-7" onClick={() => dispatch({ type: "start" })}>Entrar na clareira <span>→</span></button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
