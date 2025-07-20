import React, { useState, useEffect } from "react";
import { Search, User } from "lucide-react";
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_BASE } from "@/lib/api";
export default function App() {
  // UI state
  const [domain, setDomain] = useState("");
  const [currentDomain, setCurrentDomain] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const MAX_DAYS = 1825;
  const [timeline, setTimeline] = useState(MAX_DAYS);
  const [loginOpen, setLoginOpen] = useState(true);
  const [signupOpen, setSignupOpen] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState(null);
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
  const [theme, setTheme] = useState("dark");

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
    if (domain.trim()) {
      setCurrentDomain(domain.trim());
    }
  };

  const handleRefresh = () => {
    if (currentDomain) {
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("high-contrast");
    } else if (theme === "high-contrast") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const handleLogout = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    if (userId) {
      fetch(`/logout/${userId}`).catch(() => {});
    }
    setUsername("");
    setProfilePic(null);
    setUserId(null);
    setLoginEmail("");
    setLoginPassword("");
    setLoginOpen(true);
    setRememberMe(false);
    localStorage.removeItem("rememberMe");
  };

  //tooltip
  const selectedDate = new Date();
  selectedDate.setDate(selectedDate.getDate() - (MAX_DAYS - timeline));
  const tooltipLabel =
    timeline === MAX_DAYS ? "Today" : selectedDate.toLocaleDateString();

  return (
    <div
      className={`${
        theme !== "light" ? theme : ""
      } bg-background text-foreground min-h-screen flex flex-col text-base lg:text-lg`}
    >
      <div className="bg-gradient-animate" />
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

      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl p-6 flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight">DNSCAP</h1>
          <div className="flex items-center space-x-2">
            {profilePic ? (
              <img
                src={profilePic}
                alt={username}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <User className="h-6 w-6 text-foreground" />
            )}
            {username && <p className="text-lg text-foreground">{username}</p>}
            {!username && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setLoginOpen(true)}
                type="button"
              >
                Sign in
              </Button>
            )}
            {username && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                type="button"
              >
                Log out
              </Button>
            )}
            <Button
              size="icon"
              variant="secondary"
              onClick={toggleTheme}
              type="button"
            >
              {theme === "dark" && <div className="text-primary">🌙</div>}
              {theme === "high-contrast" && (
                <div className="text-primary">⚡</div>
              )}
              {theme === "light" && <div className="text-primary">☀️</div>}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-start justify-center p-6 lg:p-10">
        <div className="w-full max-w-6xl space-y-6 lg:space-y-8">
          {/* Search bar */}
          <div className="flex justify-center mb-4 lg:mb-6">
            <Input
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-80 h-12 lg:h-14 text-lg rounded-l-full rounded-r-none shadow-inner"
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

          {/*Timeline*/}
          <div className="relative mb-6 h-6 lg:h-8">
            <div className="absolute -top-10 left-0 w-full pointer-events-none">
              <div
                style={{ left: `${(timeline / MAX_DAYS) * 100}%` }}
                className="absolute transform -translate-x-1/2 bg-popover text-popover-foreground text-sm lg:text-base px-3 py-2 rounded shadow"
              >
                {tooltipLabel}
              </div>
            </div>
            <Slider
              min={0}
              max={MAX_DAYS}
              step={1}
              value={[timeline]}
              onValueChange={(v) => setTimeline(v[0])}
              className="h-full"
            />
          </div>
          <SampleGraph
            domain={currentDomain}
            refreshTrigger={refreshTrigger}
            theme={theme}
            onRefresh={handleRefresh}
            userId={userId}
            selectedDate={selectedDate.toISOString().split("T")[0]}
          />
        </div>
      </main>
      <footer className="border-t border-border bg-card text-card-foreground p-4 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <p className="font-semibold">DNSCAP</p>
            <p className="text-xs">Demo dashboard for domain analysis.</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">
              Docs
            </a>
            <a href="#" className="hover:underline">
              API
            </a>
            <a href="#" className="hover:underline">
              Support
            </a>
          </div>
          <p className="text-xs sm:text-sm">
            &copy; 2025 EUNOMATIX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
