import { useEffect } from "react";
import { SCENARIO_MAP, SCENARIOS } from "./data/scenarios";
import { DEFAULT_CONTEXT } from "./data/context";
import type { Challenge } from "./data/challenges";
import { CHALLENGES } from "./data/challenges";
import type { OrgContext } from "./data/types";
import type { Stack, Weights } from "./lib/scoring";
import { usePersistentState } from "./lib/usePersistentState";
import { WeightPanel } from "./components/WeightPanel";
import { ContextPanel } from "./components/ContextPanel";
import { CompareView } from "./views/CompareView";
import { StackView } from "./views/StackView";
import { SwapView } from "./views/SwapView";
import { ChallengesView } from "./views/ChallengesView";
import { LearnView } from "./views/LearnView";

type TabId = "compare" | "stack" | "swap" | "challenges" | "learn";

const TABS: { id: TabId; label: string }[] = [
  { id: "compare", label: "Compare" },
  { id: "stack", label: "Stack Builder" },
  { id: "swap", label: "Swap Map" },
  { id: "challenges", label: "Challenges" },
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
  const [ctx, setCtx] = usePersistentState<OrgContext>("ab.context", {
    ...DEFAULT_CONTEXT,
  });
  const [stack, setStack] = usePersistentState<Stack>("ab.stack", {});
  const [challengeId, setChallengeId] = usePersistentState<string | null>(
    "ab.challenge",
    null,
  );
  const [theme, setTheme] = usePersistentState<ThemeChoice>("ab.theme", "dark");

  useEffect(() => {
    if (theme === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
  }, [theme]);

  const activeChallenge =
    CHALLENGES.find((c) => c.id === challengeId) ?? null;

  const scenarioName =
    scenarioId === "custom"
      ? "Custom"
      : (SCENARIO_MAP[scenarioId]?.name ?? "Custom");

  function takeChallenge(ch: Challenge) {
    setChallengeId(ch.id);
    if (ch.id !== challengeId) {
      setStack(ch.presetStack ? { ...ch.presetStack } : {});
    }
    setTab("stack");
  }

  // Weights/context editing hides while a challenge pins them in Stack Builder.
  const showPanels =
    tab === "compare" || (tab === "stack" && !activeChallenge);

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
        {showPanels && (
          <div className="panel-stack">
            <WeightPanel
              weights={weights}
              scenarioId={scenarioId}
              onChange={(w, id) => {
                setWeights(w);
                setScenarioId(id);
              }}
            />
            <ContextPanel ctx={ctx} onChange={setCtx} />
          </div>
        )}
        {tab === "compare" && <CompareView weights={weights} ctx={ctx} />}
        {tab === "stack" && (
          <StackView
            weights={weights}
            scenarioName={scenarioName}
            ctx={ctx}
            stack={stack}
            onStackChange={setStack}
            activeChallenge={activeChallenge}
            onAbandonChallenge={() => setChallengeId(null)}
          />
        )}
        {tab === "swap" && <SwapView />}
        {tab === "challenges" && (
          <ChallengesView
            activeChallengeId={challengeId}
            onTake={takeChallenge}
          />
        )}
        {tab === "learn" && <LearnView />}
      </main>
    </>
  );
}
