import GameCanvas from "./components/GameCanvas";
import GameHud from "./components/GameHud";

export default function App() {
  return (
    <main className="app-shell">
      <GameCanvas />
      <GameHud />
    </main>
  );
}
