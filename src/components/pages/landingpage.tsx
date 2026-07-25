import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  Github,
  GitCommitHorizontal,
  MessageSquareText,
  Gauge,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { useTheme } from "../../lib/theme-context";

// ---------------------------------------------------------------------------
// Signature element: a looping mock interview transcript. It types itself
// out line by line, the way a terminal session would, then shows the score
// the AI gives the (invented) candidate. This is the whole pitch of the
// product in miniature: it reads your code, then asks about it.
// ---------------------------------------------------------------------------

type Line = { speaker: "system" | "interviewer" | "candidate"; text: string };

const SCRIPT: Line[] = [
  { speaker: "system", text: "$ connect github.com/achen/rate-limiter" },
  { speaker: "system", text: "> indexing 22 repos — Go, Redis, gRPC" },
  { speaker: "system", text: "> opening rate-limiter · last commit 3d ago" },
  {
    speaker: "interviewer",
    text: "You swapped a fixed bucket for a sliding window in limiter.go. What broke that made you switch?",
  },
  {
    speaker: "candidate",
    text: "We were letting through double the limit right at the window edge, so—",
  },
  { speaker: "interviewer", text: "Right at the edge, specifically — walk me through the exact request pattern." },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

const InterviewTerminal = () => {
  const reducedMotion = useReducedMotion();
  const [lineIndex, setLineIndex] = useState(reducedMotion ? SCRIPT.length : 0);
  const [charIndex, setCharIndex] = useState(reducedMotion ? SCRIPT[SCRIPT.length - 1].text.length : 0);
  const [showScore, setShowScore] = useState(reducedMotion);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(0);

  useEffect(() => {
    if (reducedMotion) return;

    const line = SCRIPT[lineIndex];

    if (!line) {
      // finished the script — hold, then loop
      timeoutRef.current = setTimeout(() => {
        setShowScore(false);
        setLineIndex(0);
        setCharIndex(0);
      }, 4200);
      return () => clearTimeout(timeoutRef.current);
    }

    if (charIndex < line.text.length) {
      const speed = line.speaker === "candidate" ? 18 : 24;
      timeoutRef.current = setTimeout(() => setCharIndex((c) => c + 1), speed);
    } else {
      const pause = line.speaker === "interviewer" ? 900 : 500;
      timeoutRef.current = setTimeout(() => {
        setLineIndex((i) => i + 1);
        setCharIndex(0);
        if (lineIndex === SCRIPT.length - 1) setShowScore(true);
      }, pause);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [charIndex, lineIndex, reducedMotion]);

  const visibleLines = SCRIPT.slice(0, lineIndex);
  const current = SCRIPT[lineIndex];

  return (
    <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="ml-3 text-xs font-mono text-muted-foreground">interview.session</span>
      </div>

      <div className="p-5 font-mono text-sm leading-relaxed min-h-[240px] flex flex-col gap-2.5">
        {visibleLines.map((line, i) => (
          <TerminalLine key={i} line={line} />
        ))}
        {current && (
          <TerminalLine line={current} partial={current.text.slice(0, charIndex)} />
        )}

        <AnimatePresence>
          {showScore && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-2 flex items-center gap-2 pt-3 border-t border-border/30"
            >
              <Gauge className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">follow-up fired in</span>
              <span className="text-primary">0.4s</span>
              <span className="text-muted-foreground">— vague-answer detected</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TerminalLine = ({ line, partial }: { line: Line; partial?: string }) => {
  const text = partial ?? line.text;
  const isTyping = partial !== undefined && partial.length < line.text.length;

  if (line.speaker === "system") {
    return <div className="text-muted-foreground/70">{text}</div>;
  }

  const label = line.speaker === "interviewer" ? "Interviewer" : "You";
  const color = line.speaker === "interviewer" ? "text-primary" : "text-foreground";

  return (
    <div>
      <span className={`font-semibold ${color}`}>{label}: </span>
      <span className="text-foreground/90">{text}</span>
      {isTyping && <span className="inline-block w-[2px] h-[1em] bg-primary align-middle ml-0.5 animate-pulse" />}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Scroll-reveal helpers
// ---------------------------------------------------------------------------

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const Reveal = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-80px" }}
    className={className}
  >
    {children}
  </motion.div>
);

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const STEPS = [
  {
    line: "01",
    title: "Connect your GitHub",
    description:
      "We index your repos, commit history, and languages — not a resume upload, your actual work.",
    icon: Github,
  },
  {
    line: "02",
    title: "Get interviewed on your own code",
    description:
      "Questions come from specific functions and decisions you shipped, so you can't memorize your way through.",
    icon: GitCommitHorizontal,
  },
  {
    line: "03",
    title: "Answer, get pushed on it",
    description:
      "Vague answers get a follow-up, the way a real interviewer would dig in — not the next scripted question.",
    icon: MessageSquareText,
  },
  {
    line: "04",
    title: "Review the transcript",
    description:
      "See exactly where you were sharp, where you rambled, and what to tighten before it counts.",
    icon: Gauge,
  },
];

const FEATURES = [
  "Questions generated from your actual commits and file structure, not a static bank",
  "Follow-ups that adapt to your last answer instead of running a fixed script",
  "Scored on correctness, clarity, and how you communicate under pressure",
  "Full transcript and replay, so you can see exactly where you lost the thread",
  "Difficulty that climbs or eases based on your last three answers",
  "Rerun the same repo as many times as it takes to stop fumbling the same question",
];

const STATS = [
  { number: "22K+", label: "repos indexed" },
  { number: "3.1", label: "follow-ups per question, on average" },
  { number: "0.4s", label: "to catch a vague answer" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const Landingpage = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const navOpacity = useTransform(scrollYProgress, [0, 0.04], [0, 1]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full border-b border-border/20 z-50">
        <motion.div
          style={{ opacity: navOpacity }}
          className="absolute inset-0 bg-background/85 backdrop-blur-lg"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-mono text-sm font-bold">
              &gt;_
            </div>
            <span className="font-mono font-semibold text-lg text-foreground hidden sm:inline">
              InterviewAI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
              Docs
            </button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
              Features
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border/60 bg-background/70 text-foreground hover:bg-accent/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button size="sm" onClick={() => navigate("/about")}>
              Get started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono font-medium text-primary">
                reads your repo before it asks a question
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-6xl font-bold leading-[1.08] text-foreground"
            >
              Practice interviews on the{" "}
              <span className="text-primary">code you actually wrote.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground leading-relaxed max-w-xl"
            >
              Connect GitHub and this interviewer builds every question from your real
              repos — your architecture, your tradeoffs, the bug you papered over at
              11pm. Answer out loud, get pushed on the weak spots, and see it all
              scored the moment you're done.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button size="lg" className="gap-2 text-base h-12" onClick={() => navigate("/about")}>
                Connect GitHub <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 text-base"
                onClick={() => navigate("/about")}
              >
                Watch a sample interview
              </Button>
            </motion.div>

            <motion.p variants={fadeUp} className="text-xs text-muted-foreground/70 font-mono pt-1">
              no resume required — your commit history is the resume
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-primary/10 rounded-3xl blur-3xl" />
            <div className="relative">
              <InterviewTerminal />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-2xl mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Four steps, no question bank
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything the interviewer asks traces back to something in your repo —
              here's how it gets there.
            </p>
          </Reveal>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-2 gap-6"
          >
            {STEPS.map((step) => (
              <motion.div
                key={step.line}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="group relative p-6 rounded-xl border border-border/50 bg-card/40 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <step.icon className="w-7 h-7 text-primary" />
                  <span className="font-mono text-xs text-muted-foreground/60">
                    // {step.line}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature list + annotated code visual */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Built to feel like the real thing
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Most prep tools quiz you on algorithms in a vacuum. This one interrogates
              the decisions in your own commits.
            </p>

            <motion.ul
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="space-y-3"
            >
              {FEATURES.map((feature) => (
                <motion.li
                  key={feature}
                  variants={fadeUp}
                  className="flex items-start gap-3 text-foreground/90"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="leading-relaxed">{feature}</span>
                </motion.li>
              ))}
            </motion.ul>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-border/50 bg-card/60 p-6 font-mono text-sm"
          >
            <div className="text-muted-foreground/60 mb-1">limiter.go</div>
            <div className="space-y-1 text-foreground/80">
              <div><span className="text-muted-foreground/50">14</span>  <span className="text-primary">func</span> (l *Limiter) Allow(key string) bool {"{"}</div>
              <div><span className="text-muted-foreground/50">15</span>    window := l.now().Truncate(l.interval)</div>
              <div><span className="text-muted-foreground/50">16</span>    count := l.store.Incr(key + window.String())</div>
              <div><span className="text-muted-foreground/50">17</span>    <span className="text-primary">return</span> count &lt;= l.limit</div>
              <div><span className="text-muted-foreground/50">18</span>  {"}"}</div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-4 flex gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20"
            >
              <MessageSquareText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-foreground/80 text-xs leading-relaxed">
                Two requests landing right at the truncation boundary both read
                count=0 before either writes. Is that the race you hit in prod?
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <Reveal className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="border border-border/50 rounded-2xl p-10 sm:p-14">
            <div className="grid sm:grid-cols-3 gap-10 text-center">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-4xl sm:text-5xl font-bold font-mono text-primary mb-2">
                    {stat.number}
                  </div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* CTA */}
      <Reveal className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-5">
            Read the repo. Ask the hard question.
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Ten minutes with your own GitHub tells you more than another afternoon of
            flashcards.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="h-12 text-base gap-2" onClick={() => navigate("/interview")}>
              Start your first interview <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 text-base"
              onClick={() => navigate("/interview")}
            >
              View a sample transcript
            </Button>
          </div>
        </div>
      </Reveal>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-mono font-bold text-base mb-3 text-foreground">
                InterviewAI
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A technical interviewer that reads your GitHub before it writes a
                single question.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "FAQ"] },
              { title: "Company", links: ["About", "Blog", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-4 text-sm text-foreground">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border/20 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2025 InterviewAI. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
              <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};