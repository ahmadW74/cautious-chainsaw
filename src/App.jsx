import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Blog from "@/pages/Blog.jsx";
import BlogPost from "@/pages/BlogPost.jsx";
import WriteBlog from "@/pages/WriteBlog.jsx";
import About from "@/pages/About.jsx";
import Support from "@/pages/Support.jsx";
import Policy from "@/pages/Policy.jsx";
import License from "@/pages/License.jsx";
import Goals from "@/pages/Goals.jsx";
import Goals2 from "@/pages/Goals2.jsx";
import History from "@/pages/History.jsx";
import Stats from "@/pages/Stats.jsx";
import GlassNavbar from "@/components/GlassNavbar.jsx";
import Profile from "@/pages/Profile.jsx";

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

function HomePage() {
  return <Goals2 />;
}

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
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const location = useLocation();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [userEmail, setUserEmail] = useState("");
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
          setUserEmail(data.email || "");
          setLoginOpen(false);
          setRememberMe(true);
          return;
        }
      } catch {
        // fall through to open login
      }
      localStorage.removeItem("rememberMe");
    }
    setLoginOpen(true);
  }, []);

  const isSignedIn = userId !== null;

  // Track anonymous graph usage
  const MAX_GRAPH_USES = 2;
  const [graphUses, setGraphUses] = useState(() => {
    const stored = getCache("graph_uses");
    return stored ? parseInt(stored, 10) || 0 : 0;
  });

  useEffect(() => {
    setCache("graph_uses", graphUses);
  }, [graphUses]);

  const incrementGraphUses = () => setGraphUses((u) => u + 1);

  const resetGraphUses = () => {
    setGraphUses(0);
    try {
      localStorage.removeItem("graph_uses");
    } catch {
      // ignore
    }
  };

  const limitReached = !isSignedIn && graphUses >= MAX_GRAPH_USES;

  useEffect(() => {
    if (limitReached) {
      setLoginOpen(true);
    }
  }, [limitReached]);

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
  const [googleReady, setGoogleReady] = useState(false);

  const renderGoogleButtons = () => {
    if (!window.google) return;
    const loginDiv = document.getElementById("googleSignIn");
    if (loginDiv && loginDiv.childElementCount === 0) {
      window.google.accounts.id.renderButton(loginDiv, {
        theme: "outline",
        size: "large",
      });
    }
    const signupDiv = document.getElementById("googleSignup");
    if (signupDiv && signupDiv.childElementCount === 0) {
      window.google.accounts.id.renderButton(signupDiv, {
        theme: "outline",
        size: "large",
      });
    }
  };
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
        setGoogleReady(true);
        renderGoogleButtons();
      }
    };
    document.body.appendChild(script);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (googleReady && (loginOpen || signupOpen)) {
      renderGoogleButtons();
    }
  });

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
        setUserEmail(data.email || "");
        resetGraphUses();
        setLoginOpen(false);
        setSignupOpen(false);
        if (rememberMe) {
          localStorage.setItem(
            "rememberMe",
            JSON.stringify({
              username: data.success,
              profilePic: data.picture || null,
              userId: data.id || null,
              email: data.email || "",
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
        setUserEmail(loginEmail);
        resetGraphUses();
        setLoginError("");
        setLoginOpen(false);
        if (rememberMe) {
          localStorage.setItem(
            "rememberMe",
            JSON.stringify({
              username: successVal,
              profilePic: null,
              userId: data.id || null,
              email: loginEmail,
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

  const addHistory = (domain, date) => {
    if (!userId) return;
    try {
      const key = `graph_history_${userId}`;
      const stored = JSON.parse(localStorage.getItem(key) || "[]");
      stored.push({ domain, date });
      localStorage.setItem(key, JSON.stringify(stored));
    } catch {
      // ignore storage errors
    }
  };

  const addStats = (domain) => {
    fetch(`http://127.0.0.1:8000/stats/${encodeURIComponent(domain)}`, {
      method: "POST",
    }).catch(() => {
      // ignore network errors
    });
  };

  //graph logic
  const handleAnalyze = () => {
    const cleaned = (domain || "").trim().toLowerCase();
    if (!cleaned) return;
    if (!isSignedIn) {
      if (limitReached) {
        setLoginOpen(true);
        return;
      }
      incrementGraphUses();
    }
    setCurrentDomain(cleaned);
    setGraphGenerated(true);
    addHistory(cleaned, selectedDate.toISOString().slice(0, 7));
    addStats(cleaned);
  };

  const handleRefresh = () => {
    if (!currentDomain) return;
    if (!isSignedIn) {
      if (limitReached) {
        setLoginOpen(true);
        return;
      }
      incrementGraphUses();
    }
    setRefreshTrigger((prev) => prev + 1);
  };
  const handleLogout = async () => {
    if (userId) {
      try {
        await fetch(`http://127.0.0.1:8000/logout/${userId}`);
      } catch {
        // ignore network errors
      }
    }
    setUsername("");
    setProfilePic(null);
    setUserEmail("");
    setUserId(null);
    localStorage.removeItem("rememberMe");
    resetGraphUses();
    setLoginOpen(true);
  };

  // Removed theme toggle handler with the new navbar

  //tooltip
  const selectedDate = dateOptions[timelineIndex] || new Date();
  const tooltipLabel =
    timelineIndex === dateOptions.length - 1
      ? "Today"
      : selectedDate.toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        });

  return (
    <div
      className={`${
        theme !== "light" ? theme : ""
      } bg-background text-foreground min-h-screen flex flex-col text-base lg:text-lg`}
    >
      <div className="bg-gradient-animate" />
      <GlassNavbar
        isSignedIn={isSignedIn}
        onSignIn={() => setLoginOpen(true)}
      />
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
          <Route
            path="/"
            element={
              <HomePage
                domain={domain}
                setDomain={setDomain}
                handleAnalyze={handleAnalyze}
                timelineIndex={timelineIndex}
                setTimelineIndex={setTimelineIndex}
                dateOptions={dateOptions}
                tooltipLabel={tooltipLabel}
                graphGenerated={graphGenerated}
                currentDomain={currentDomain}
                refreshTrigger={refreshTrigger}
                theme={theme}
                viewMode={viewMode}
                handleRefresh={handleRefresh}
                userId={userId}
                selectedDate={selectedDate}
                limitReached={limitReached}
              />
            }
          />
          <Route path="/goals" element={<Goals />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/writeblog" element={<WriteBlog />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/license" element={<License />} />
          <Route
            path="/profile"
            element={
              <Profile
                username={username}
                email={userEmail}
                profilePic={profilePic}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/history"
            element={<History userId={userId} viewMode={viewMode} />}
          />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>
      {location.pathname !== "/goals" && location.pathname !== "/" && (
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
