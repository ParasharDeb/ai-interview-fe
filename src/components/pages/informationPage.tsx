import {
  Field,
  FieldDescription,
  FieldLabel,
} from "../../components/ui/field"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useTheme } from "../../lib/theme-context";
import { Sun, Moon, ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../lib/apiClient";
import { toast } from "sonner";
import { Loader } from "./loadercomponent";
import { AnimatePresence, motion } from "framer-motion";

const INTERVIEW_ROLES = [
  "Backend Engineer",
  "Frontend Engineer",
  "Full Stack Engineer",
  "DevOps Engineer",
  "Data Engineer",
  "Mobile Engineer",
  "QA Engineer",
  "Product Manager",
  "Solutions Architect",
];

// Shared easing curve so every motion on this page feels like the same hand drew it
const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
};

export const InformationPage = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [role, setRole] = useState<string>("");
  const [github, setgithub] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitgithuburl(){
    if (!role) {
      toast.error("Role selection required", {
        description: "Please select the role you're applying for.",
      });
      return;
    }
    if (!github || github.trim() === "") {
      toast.error("GitHub URL is required", {
        description: "Please enter a valid GitHub URL to continue.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(`/github-verification`, {
        githuburl: github,
        role: role
      });
      toast.success("GitHub profile loaded!", {
        description: "Starting your personalized interview...",
      });
      localStorage.setItem("interviewRole", role);
      console.log(response);
      navigate(`/interview/${response.data.id}`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Error loading GitHub profile", {
        description: errorMessage || "Please check your GitHub URL and try again.",
      });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Loader />
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="min-h-screen bg-gradient-to-br from-background to-card transition-colors duration-300"
        >
          {/* Header with Theme Toggle */}
          <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => navigate("/about")}
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.92 }}
                  className="p-2 rounded-lg hover:bg-accent/10 transition-colors duration-200 text-foreground"
                  aria-label="Go back home"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
                <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg font-mono">
                  &gt;_
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  InterviewAI
                </h1>
              </div>

              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-accent/10 transition-colors duration-200 text-foreground overflow-hidden"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="block"
                  >
                    {theme === "light" ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.header>

          {/* Main Content */}
          <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
            <div className="w-full max-w-md">
              {/* Card Container */}
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
                className="bg-card border border-border/50 rounded-2xl shadow-xl p-8 space-y-8"
              >
                {/* Greeting Section */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2 text-center"
                >
                  <motion.p
                    variants={itemVariants}
                    className="text-muted-foreground text-sm uppercase tracking-wide font-medium"
                  >
                    Welcome
                  </motion.p>
                  <motion.h2
                    variants={itemVariants}
                    className="text-3xl font-bold text-foreground"
                  >
                    Get Started
                  </motion.h2>
                  <motion.p variants={itemVariants} className="text-muted-foreground text-sm">
                    Enter your GitHub URL to begin your AI-powered technical interview
                  </motion.p>

                  {/* Terminal signature strip — echoes the landing page's terminal window */}
                  <motion.div
                    variants={itemVariants}
                    className="!mt-5 rounded-lg border border-border/50 bg-background/60 text-left overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/40">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                      <span className="ml-2 text-[11px] font-mono text-muted-foreground">
                        session.init
                      </span>
                    </div>
                    <div className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      >
                        {"> awaiting github url"}
                      </motion.span>
                      <motion.span
                        aria-hidden
                        animate={{ opacity: [1, 1, 0, 0] }}
                        transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
                        className="inline-block w-[6px] h-[12px] bg-foreground/70 ml-1 translate-y-[1px]"
                      />
                    </div>
                  </motion.div>
                </motion.div>

                {/* Form Section */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  <motion.div variants={itemVariants} whileFocus={{ scale: 1.01 }}>
                    <Field>
                      <FieldLabel htmlFor="role-select" className="text-base font-semibold">
                        Role
                      </FieldLabel>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger id="role-select" className="h-11 text-base rounded-lg border-border/50 focus:border-primary focus:ring-primary/20 transition-shadow duration-200">
                          <SelectValue placeholder="Select the role you're applying for" />
                        </SelectTrigger>
                        <SelectContent>
                          {INTERVIEW_ROLES.map((roleOption) => (
                            <SelectItem key={roleOption} value={roleOption}>
                              {roleOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription className="text-xs text-muted-foreground">
                        Select the role you're preparing for to personalize your interview.
                      </FieldDescription>
                    </Field>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Field>
                      <FieldLabel htmlFor="input-field-username" className="text-base font-semibold">
                        GitHub URL
                      </FieldLabel>
                      <motion.div whileFocus={{ scale: 1.01 }} whileHover={{ scale: 1.005 }}>
                        <Input
                          id="input-field-username"
                          type="text"
                          placeholder="https://github.com/yourprofile"
                          className="h-11 text-base rounded-lg border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                          value={github}
                          onChange={(e) => setgithub(e.target.value)}
                        />
                      </motion.div>
                      <FieldDescription className="text-xs text-muted-foreground">
                        We'll analyze your GitHub profile to personalize your interview experience.
                      </FieldDescription>
                    </Field>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Field>
                      <FieldLabel htmlFor="resume-upload" className="text-base font-semibold">
                        Resume
                      </FieldLabel>
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                        className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 file:transition-colors file:duration-200"
                      />
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={resumeFile ? resumeFile.name : "empty"}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                        >
                          <FieldDescription className="text-xs text-muted-foreground flex items-center gap-1">
                            {resumeFile ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-primary" />
                                {`Selected file: ${resumeFile.name}`}
                              </>
                            ) : (
                              "Upload a resume to help tailor your interview prep."
                            )}
                          </FieldDescription>
                        </motion.div>
                      </AnimatePresence>
                    </Field>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants}>
                    <motion.div
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Button
                        className="w-full h-11 text-base font-semibold rounded-lg transition-shadow duration-200 hover:shadow-lg"
                        size="lg"
                        onClick={submitgithuburl}
                        disabled={loading}
                      >
                        Start Interview
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Footer Note */}
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="border-t border-border/30 pt-6"
                >
                  <p className="text-xs text-muted-foreground text-center">
                    Your data is secure and will only be used for this interview session.
                  </p>
                </motion.div>
              </motion.div>

              {/* Bottom Decoration */}
              <div className="mt-8 flex justify-center gap-1">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay, ease: "easeInOut" }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                ))}
              </div>
            </div>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  )
}