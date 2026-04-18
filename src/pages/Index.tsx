import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Briefcase,
  Search,
  Building2,
  UserCheck,
  ArrowRight,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import Footer  from "@/components/Footer";

const Index: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const images = [
    "/public/back/1.png",
    "/public/back/2.png",
    "/public/back/3.png",
    "/public/back/4.png",
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const dashboardPath =
    user?.role === "company"
      ? "/company"
      : user?.role === "admin"
        ? "/admin"
        : "/candidate";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="h-16 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6 lg:px-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Briefcase size={18} className="text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-xl">HireFlow</span>
        </Link>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button asChild>
              <Link to={dashboardPath}>
                Dashboard <ArrowRight size={16} />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden text-primary-foreground py-24 lg:py-32">
        {/* 1. Background Images */}
        {images.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out z-0 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        {/* 2. Optional Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40 z-0" />

        {/* 3. Content Container (Must be relative and higher Z-index) */}
        <div className="container relative z-10 mx-auto px-6 lg:px-12 text-center max-w-4xl">
          <h1 className="font-heading text-4xl lg:text-6xl font-bold mb-6 leading-tight">
             <span className="text-accent">HireFlow</span>
          </h1>
          <p className="text-lg lg:text-xl opacity-80 mb-10 max-w-2xl mx-auto">
            Connect talented candidates with top companies. Search, apply, and
            hire — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-base px-8"
            >
              <Link to="/register?role=candidate">
                <Search size={18} className="mr-2" /> I'm Looking for a Job
              </Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/register?role=company">
                <Building2 size={18} className="mr-2" /> I'm Hiring
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="font-heading text-3xl font-bold text-center mb-14">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <UserCheck size={28} />,
                title: "Create Your Profile",
                desc: "Sign up as a candidate or company and complete your profile with all relevant details.",
              },
              {
                icon: <Search size={28} />,
                title: "Search & Discover",
                desc: "Browse job offers by domain and specialty, or search for the perfect candidate.",
              },
              {
                icon: <Zap size={28} />,
                title: "Apply & Hire",
                desc: "Submit applications with your CV, or review candidates and manage your hiring pipeline.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-8 shadow-card hover:shadow-elevated transition-shadow border"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  {f.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: "...", label: "Job Offers" },
              { value: "...", label: "Candidates" },
              { value: "...", label: "Companies" },
              { value: "95%", label: "Satisfaction" },
            ].map((s, i) => (
              <div key={i}>
                <div className="font-heading text-3xl font-bold text-primary">
                  {s.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default Index;
