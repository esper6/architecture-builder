import { useEffect } from "react";
import { SCENARIO_MAP, SCENARIOS } from "./data/scenarios";
import type { Stack, Weights } from "./lib/scoring";
import { usePersistentState } from "./lib/usePersistentState";
import { WeightPanel } from "./components/WeightPanel";
import { CompareView } from "./views/CompareView";
import { StackView } from "./views/StackView";
import { SwapView } from "./views/SwapView";
import { LearnView } from "./views/LearnView";

type TabId = "compare" | "stack" | "swap" | "learn";

const TABS: { id: TabId; label: string }[] = [
  { id: "compare", label: "Compare" },
  { id: "stack", label: "Stack Builder" },
  { id: "swap", label: "Swap Map" },
  { id: "learn", label: "Learn" },
];

type ThemeChoice = "system" | "light" | "dark";

export default function App() {
  const [tab, setTab] = usePersistentState<TabId>("ab.tab", "compare");
  const [scenarioId, setScenarioId] = usePersistentState<string>(
    "ab.scenario",
    "balanced",
  );
  const [weights, setWeights] = usePersistentState<Weights>("ab.weights", {
    ...SCENARIOS[0].weights,
  });
  const [stack, setStack] = usePersistentState<Stack>("ab.stack", {});
  const [theme, setTheme] = usePersistentState<ThemeChoice>("ab.theme", "system");

  useEffect(() => {
    if (theme === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
  }, [theme]);

  const scenarioName =
    scenarioId === "custom"
      ? "Custom"
      : (SCENARIO_MAP[scenarioId]?.name ?? "Custom");

  const showWeights = tab === "compare" || tab === "stack";

  return (
    <>
      <header className="app-header">
        <h1 className="app-title">
          Architecture Builder <span>· tradeoffs, stacks, substitutions</span>
        </h1>
        <nav className="tab-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={t.id === tab ? "active" : ""}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <button
          className="theme-toggle"
          onClick={() =>
            setTheme(
              theme === "system" ? "dark" : theme === "dark" ? "light" : "system",
            )
          }
          title="Cycle theme: system → dark → light"
        >
          {theme === "system" ? "◐ System" : theme === "dark" ? "● Dark" : "○ Light"}
        </button>
      </header>

      <main className="app-main">
        {showWeights && (
          <WeightPanel
            weights={weights}
            scenarioId={scenarioId}
            onChange={(w, id) => {
              setWeights(w);
              setScenarioId(id);
            }}
          />
        )}
        {tab === "compare" && <CompareView weights={weights} />}
        {tab === "stack" && (
          <StackView
            weights={weights}
            scenarioName={scenarioName}
            stack={stack}
            onStackChange={setStack}
          />
        )}
        {tab === "swap" && <SwapView />}
        {tab === "learn" && <LearnView />}
      </main>
    </>
  );
}
