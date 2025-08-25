import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SampleGraph from "./SampleGraph.jsx";
import { ReactFlowProvider } from "@xyflow/react";
import FillerContent from "@/components/FillerContent.jsx";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Blog from "@/pages/Blog.jsx";
import About from "@/pages/About.jsx";
import Support from "@/pages/Support.jsx";
import Policy from "@/pages/Policy.jsx";
import License from "@/pages/License.jsx";
import Goals from "@/pages/Goals.jsx";
import GlassNavbar from "@/components/GlassNavbar.jsx";

const getCache = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setCache = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore write errors
  }
};

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_BASE } from "@/lib/api";
export default function App() {
  // UI state
  const [domain, setDomain] = useState("");
  const [currentDomain, setCurrentDomain] = useState("");
  const [graphGenerated, setGraphGenerated] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const dateOptions = useMemo(() => {
    const dates = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(1);
      d.setMonth(now.getMonth() - i);
      dates.push(d);
    }
    return dates;
  }, []);

  const [timelineIndex, setTimelineIndex] = useState(
    dateOptions.length - 1
  );
  const [loginOpen, setLoginOpen] = useState(true);
  const [signupOpen, setSignupOpen] = useState(false);
  const location = useLocation();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [, setUsername] = useState("");
  const [, setProfilePic] = useState(null);
  const [userId, setUserId] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Load stored credentials if remember me was enabled
  useEffect(() => {
    const stored = localStorage.getItem("rememberMe");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.expiry && Date.now() < data.expiry) {
          setUsername(data.username || "");
          setProfilePic(data.profilePic || null);
          setUserId(data.userId || null);
          setLoginOpen(false);
          setRememberMe(true);
        } else {
          localStorage.removeItem("rememberMe");
        }
      } catch {
        localStorage.removeItem("rememberMe");
      }
    }
  }, []);

  // Theme state
  const [theme] = useState("light");

  // Diagram display mode
  const [viewMode] = useState(() => {
    const stored = getCache("display_mode");
    return stored === "reactflow" || stored === "reactflow-color"
      ? "reactflow"
      : "graphviz";
  });

  useEffect(() => {
    setCache("display_mode", viewMode);
  }, [viewMode]);

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupMessage, setSignupMessage] = useState("");
  const [signupMessageType, setSignupMessageType] = useState("");

  // Google OAuth initialization
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            "376144524625-v49q48ldo2lm4q6nvtoumehm1s4m7gdr.apps.googleusercontent.com",
          callback: (response) => handleGoogleCredential(response.credential),
        });
        const loginDiv = document.getElementById("googleSignIn");
        if (loginDiv) {
          window.google.accounts.id.renderButton(loginDiv, {
            theme: "outline",
            size: "large",
          });
        }
        const signupDiv = document.getElementById("googleSignup");
        if (signupDiv) {
          window.google.accounts.id.renderButton(signupDiv, {
            theme: "outline",
            size: "large",
          });
        }
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleGoogleCredential = async (credential) => {
    try {
      const res = await fetch(`/google-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsername(data.success);
        setProfilePic(data.picture || null);
        setUserId(data.id || null);
        setLoginOpen(false);
        setSignupOpen(false);
        if (rememberMe) {
          localStorage.setItem(
            "rememberMe",
            JSON.stringify({
              username: data.success,
              profilePic: data.picture || null,
              userId: data.id || null,
              expiry: Date.now() + 24 * 60 * 60 * 1000,
            })
          );
        } else {
          localStorage.removeItem("rememberMe");
        }
      }
    } catch (e) {
      console.error("Google auth failed", e);
    }
  };

  const handleLogin = async () => {
    setLoginError("");
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/login/${loginEmail}/${loginPassword}`
      );
      if (!res.ok) {
        setLoginError("Unable to verify credentials.");
        return;
      }
      const data = await res.json();
      const successVal = data.success.trim();
      if (successVal !== "no") {
        setUsername(successVal);
        setProfilePic(null);
        setUserId(data.id || null);
        setLoginError("");
        setLoginOpen(false);
        if (rememberMe) {
          localStorage.setItem(
            "rememberMe",
            JSON.stringify({
              username: successVal,
              profilePic: null,
              userId: data.id || null,
              expiry: Date.now() + 24 * 60 * 60 * 1000,
            })
          );
        } else {
          localStorage.removeItem("rememberMe");
        }
      } else {
        setLoginError("Invalid email or password.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Error verifying credentials.");
    }
  };

  const handleSignup = async () => {
    setSignupMessage("");
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/signup/${signupEmail}/${signupPassword}/${signupName}`
      );
      if (res.ok) {
        setSignupMessageType("success");
        setSignupMessage("Signup successful! Redirecting to login...");
        setTimeout(() => {
          setSignupOpen(false);
          setLoginOpen(true);
          setSignupMessage("");
        }, 1500);
      } else {
        setSignupMessageType("error");
        setSignupMessage("Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setSignupMessageType("error");
      setSignupMessage("Error during signup. Please try later.");
    }
  };

  //graph logic
  const handleAnalyze = () => {
    const cleaned = domain.trim().toLowerCase();
    if (cleaned) {
      setCurrentDomain(cleaned);
      setGraphGenerated(true);
    }
  };

  const handleRefresh = () => {
    if (currentDomain) {
      setRefreshTrigger((prev) => prev + 1);
    }
  };
  // Removed theme toggle and logout handlers with the new navbar

  //tooltip
  const selectedDate = dateOptions[timelineIndex] || new Date();
  const tooltipLabel =
    timelineIndex === dateOptions.length - 1
      ? "Today"
      : selectedDate.toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        });

  function HomePage() {
    return (
      <>
        {/* Hero Section */}
        <section className="relative text-center py-20 px-4 overflow-hidden min-h-[92vh] bg-[#0077b6]">
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">DNSSEC Explorer</h1>
            <p className="mb-10">Visualize and understand domain security chains.</p>
            <div className="flex justify-center mb-6">
              <Input
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-80 h-12 lg:h-14 text-lg rounded-l-full rounded-r-none shadow-inner text-black"
              />
              <Button
                size="icon"
                variant="secondary"
                onClick={handleAnalyze}
                disabled={!domain.trim()}
                className="rounded-r-full rounded-l-none border-l-0 h-12 lg:h-14"
                type="button"
              >
                <Search className="h-6 w-6" />
              </Button>
            </div>
            <div className="relative mb-6 h-6 lg:h-8 max-w-3xl mx-auto">
              <div className="absolute -top-10 left-0 w-full pointer-events-none">
                <div
                  style={{ left: `${(timelineIndex / (dateOptions.length - 1)) * 100}%` }}
                  className="absolute transform -translate-x-1/2 bg-white text-black text-sm lg:text-base px-3 py-2 rounded shadow"
                >
                  {tooltipLabel}
                </div>
              </div>
              <div className="relative h-full">
                <Slider
                  min={0}
                  max={dateOptions.length - 1}
                  step={1}
                  value={[timelineIndex]}
                  onValueChange={(v) => setTimelineIndex(v[0])}
                  className="h-full"
                />
                {dateOptions.map((_, i) => (
                  <div
                    key={i}
                    style={{ left: `${(i / (dateOptions.length - 1)) * 100}%` }}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-white/50 pointer-events-none"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Filler content or graph */}
        <div className="relative">
          <div
            className={`transition-all duration-500 ${
              graphGenerated ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100"
            }`}
          >
            <FillerContent />
          </div>
          <div
            className={`transition-opacity duration-500 ${
              graphGenerated ? "opacity-100" : "opacity-0 max-h-0 overflow-hidden"
            }`}
          >
            {graphGenerated && (
              <div className="p-6 lg:p-10 flex justify-center">
                <div className="w-full max-w-[100rem]">
                  <ReactFlowProvider>
                    <SampleGraph
                      domain={currentDomain}
                      refreshTrigger={refreshTrigger}
                      theme={theme}
                      viewMode={viewMode}
                      onRefresh={handleRefresh}
                      userId={userId}
                      selectedDate={selectedDate.toISOString().slice(0, 7)}
                    />
                  </ReactFlowProvider>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={`${
        theme !== "light" ? theme : ""
      } bg-background text-foreground min-h-screen flex flex-col text-base lg:text-lg`}
    >
      <div className="bg-gradient-animate" />
      <GlassNavbar />
      {/* Login dialog */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-lg text-base space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">Log in</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your account credentials to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {loginError && (
              <div className="bg-red-600 text-white p-2 rounded">
                {loginError}
              </div>
            )}
            <Input
              placeholder="Email"
              type="email"
              className="h-12 text-lg"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              className="h-12 text-lg"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe" className="text-sm">
                Remember me
              </label>
            </div>
            <Button
              className="w-full h-12 text-lg"
              onClick={handleLogin}
              type="button"
            >
              Log in
            </Button>
            <div id="googleSignIn" className="flex justify-center"></div>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-blue-400 hover:underline"
                onClick={() => {
                  setLoginOpen(false);
                  setSignupOpen(true);
                }}
              >
                Sign up
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signup*/}
      <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
        <DialogContent className="sm:max-w-lg text-base space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">Sign up</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new account to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {signupMessage && (
              <div
                className={`${
                  signupMessageType === "success"
                    ? "bg-green-600"
                    : "bg-red-600"
                } text-white p-2 rounded`}
              >
                {signupMessage}
              </div>
            )}
            <Input
              placeholder="Name"
              className="h-12 text-lg"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
            />
            <Input
              placeholder="Email"
              type="email"
              className="h-12 text-lg"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              className="h-12 text-lg"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />
            <Button
              className="w-full h-12 text-lg"
              onClick={handleSignup}
              type="button"
            >
              Sign up
            </Button>
            <div id="googleSignup" className="flex justify-center"></div>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                className="text-blue-400 hover:underline"
                onClick={() => {
                  setSignupOpen(false);
                  setLoginOpen(true);
                }}
              >
                Log in
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/license" element={<License />} />
        </Routes>
      </main>
      {location.pathname !== "/goals" && (
        <footer className="border-t border-border bg-card text-card-foreground p-4 text-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="font-semibold">DNSCAP</p>
              <p className="text-xs">Demo dashboard for domain analysis.</p>
            </div>
            <div className="flex space-x-4">
              <Link to="/blog" className="hover:underline">
                Blog
              </Link>
              <Link to="/about" className="hover:underline">
                About
              </Link>
              <Link to="/support" className="hover:underline">
                Support
              </Link>
              <Link to="/policy" className="hover:underline">
                Policy
              </Link>
              <Link to="/license" className="hover:underline">
                License
              </Link>
            </div>
            <p className="text-xs sm:text-sm">
              &copy; 2025 EUNOMATIX. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
