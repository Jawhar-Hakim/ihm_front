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
  Star,
  CheckCircle2,
  Cpu,
  HeartPulse,
  Banknote,
  Layout,
  ChevronRight,
} from "lucide-react";
import Footer from "@/components/Footer";

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
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const dashboardPath =
    user?.role === "company"
      ? "/company"
      : user?.role === "admin"
        ? "/admin"
        : "/candidate";

  const categories = [
    { icon: <Cpu className="w-6 h-6" />, name: "Technology", jobs: "1.2k+" },
    { icon: <HeartPulse className="w-6 h-6" />, name: "Healthcare", jobs: "850+" },
    { icon: <Banknote className="w-6 h-6" />, name: "Finance", jobs: "430+" },
    { icon: <Layout className="w-6 h-6" />, name: "Design", jobs: "320+" },
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Software Engineer",
      content: "Found my dream job at a top tech company within two weeks! The platform is so intuitive.",
      avatar: "https://i.pravatar.cc/150?u=alex",
    },
    {
      name: "Sarah Williams",
      role: "HR Manager",
      content: "HireFlow has streamlined our recruitment process significantly. The quality of candidates is exceptional.",
      avatar: "https://i.pravatar.cc/150?u=sarah",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <nav className="h-20 border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <Briefcase size={22} className="text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-2xl tracking-tight">HireFlow</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/jobs" className="text-sm font-medium hover:text-primary transition-colors hidden md:block">
            Browse Jobs
          </Link>
          <div className="h-6 w-px bg-border hidden md:block" />
          {isAuthenticated ? (
            <Button asChild className="rounded-full px-6">
              <Link to={dashboardPath}>
                Dashboard <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="rounded-full">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden text-primary-foreground">
        {images.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out z-0 ${
              i === index ? "opacity-100 scale-105" : "opacity-0 scale-100"
            } transform duration-[10000ms] transition-transform`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-0" />

        <div className="container relative z-10 mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span>The #1 platform for global talent</span>
            </div>
            <h1 className="font-heading text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
              Your Career <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Refined & Realized</span>
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 mb-10 max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-900">
              Connect with top companies worldwide. Browse thousands of curated jobs and find your perfect fit today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Button size="lg" variant="secondary" asChild className="text-base px-8 h-14 rounded-full font-semibold">
                <Link to="/jobs">
                  <Search size={20} className="mr-2" /> Browse Job Openings
                </Link>
              </Button>
              <Button size="lg" asChild className="text-base px-8 h-14 rounded-full font-semibold bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-sm text-white border">
                <Link to="/register?role=company">
                  <Building2 size={20} className="mr-2" /> Post a Job Offer
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 border-b bg-card">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
            <span className="text-2xl font-bold italic">TECHNO</span>
            <span className="text-2xl font-bold">GLOBAL</span>
            <span className="text-2xl font-bold tracking-tighter">FUTURE</span>
            <span className="text-2xl font-bold uppercase">Nexus</span>
            <span className="text-2xl font-bold underline decoration-primary">Swift</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">
                Explore by Category
              </h2>
              <p className="text-muted-foreground text-lg">
                Find the right opportunity across various industries and domains.
              </p>
            </div>
            <Button variant="outline" asChild className="rounded-full">
              <Link to="/jobs">View All Categories <ChevronRight size={16} className="ml-1" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <Link 
                key={i} 
                to={`/jobs?domain=${cat.name}`}
                className="group p-8 rounded-2xl border bg-card hover:bg-primary hover:border-primary transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-white/20 group-hover:text-white flex items-center justify-center mb-6 transition-colors">
                  {cat.icon}
                </div>
                <h3 className="font-heading font-bold text-xl mb-1 group-hover:text-white transition-colors">{cat.name}</h3>
                <p className="text-muted-foreground group-hover:text-white/80 transition-colors">{cat.jobs} open positions</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/50 border-y relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform origin-top translate-x-1/2" />
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">
              Streamlined Hiring Process
            </h2>
            <p className="text-muted-foreground text-lg">
              We've simplified the journey from searching to hiring.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden lg:block absolute top-20 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-primary/20" />
            
            {[
              {
                icon: <UserCheck size={32} />,
                title: "Build Your Identity",
                desc: "Create a professional profile that showcases your skills, experience, and aspirations.",
                step: "01"
              },
              {
                icon: <Search size={32} />,
                title: "Smart Discovery",
                desc: "Our intelligent filters help you find the exact match for your career goals or team needs.",
                step: "02"
              },
              {
                icon: <Zap size={32} />,
                title: "Instant Connection",
                desc: "Apply with one click and communicate directly with decision-makers through our platform.",
                step: "03"
              },
            ].map((f, i) => (
              <div key={i} className="relative group">
                <div className="absolute -top-6 -left-4 text-6xl font-black text-primary/5 group-hover:text-primary/10 transition-colors">
                  {f.step}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-background shadow-sm flex items-center justify-center mb-8 relative z-10 border group-hover:border-primary/50 transition-all">
                  <div className="text-primary">{f.icon}</div>
                </div>
                <h3 className="font-heading font-bold text-xl mb-4">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-6">
                Loved by thousands of <br />
                <span className="text-primary">Professionals & HRs</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Don't just take our word for it. Here's what our community members have to say about their experience with HireFlow.
              </p>
              <div className="flex gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-12 h-12 rounded-full border-4 border-background" alt="User" />
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-sm font-medium">4.9/5 from 10k+ reviews</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {testimonials.map((t, i) => (
                <div key={i} className="p-8 rounded-2xl bg-card border shadow-sm relative">
                  <Star className="absolute top-8 right-8 text-primary/10 w-12 h-12" />
                  <p className="text-lg italic mb-6 relative z-10 text-foreground/90">"{t.content}"</p>
                  <div className="flex items-center gap-4">
                    <img src={t.avatar} className="w-12 h-12 rounded-full shadow-sm" alt={t.name} />
                    <div>
                      <h4 className="font-bold text-base">{t.name}</h4>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="bg-primary rounded-[2.5rem] p-8 md:p-16 text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/40">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-20 -mb-20 blur-3xl" />
            
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="font-heading text-4xl lg:text-5xl font-bold mb-6">
                Ready to take the next step in your career?
              </h2>
              <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                Join 50,000+ professionals and 2,000+ companies already using HireFlow to build the future of work.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild className="h-14 px-10 rounded-full font-bold text-lg">
                  <Link to="/register">Create Your Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-14 px-10 rounded-full font-bold text-lg bg-transparent border-white/30 hover:bg-white/10">
                  <Link to="/jobs">Explore All Jobs</Link>
                </Button>
              </div>
              <div className="mt-10 flex items-center justify-center gap-6 text-sm opacity-80">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} /> No credit card required</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} /> Free for candidates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
