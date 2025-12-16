import React, { useState } from 'react';
import { Shield, Bot, PieChart, ArrowRight, CheckCircle, Menu, X, ChevronRight, Lock, Sparkles, Building2, Play } from 'lucide-react';

interface LandingPageProps {
  onLogin: (plan: string, email: string, businessName?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [selectedPlan, setSelectedPlan] = useState('SME');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth delay
    const planToUse = authMode === 'login' ? 'Existing User' : selectedPlan;
    setTimeout(() => {
        onLogin(planToUse, email || 'user@example.com', businessName);
    }, 800);
  };

  const openSignup = (plan: string) => {
    setSelectedPlan(plan);
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="bg-indigo-600 p-2 rounded-lg shadow-md shadow-indigo-200">
                <Shield className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-indigo-950">FOJ's Finance</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Features</button>
              <button onClick={() => scrollToSection('compliance')} className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Tax Compliance</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Pricing</button>
              <button 
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="text-indigo-600 font-semibold hover:bg-indigo-50 px-4 py-2 rounded-full transition-colors"
              >
                Log in
              </button>
              <button 
                onClick={() => openSignup('SME')}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </div>

            <button className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl absolute w-full animate-fade-in-down z-40">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left text-gray-600 font-medium py-2">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-gray-600 font-medium py-2">Pricing</button>
            <button 
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); setIsMenuOpen(false); }}
                className="block w-full text-left text-indigo-600 font-bold py-2"
            >
                Log In
            </button>
            <button 
                onClick={() => { openSignup('SME'); setIsMenuOpen(false); }}
                className="block w-full bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-md"
            >
                Get Started
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 animate-fade-in-up cursor-default">
            <Sparkles size={16} />
            <span>Now with Gemini AI Tax Consultant</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
            Accounting on the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Blockchain.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            FOJ's Finance helps Nigerian SMEs and Enterprises automate bookkeeping, generate audit-ready financial statements, and stay compliant with the new Finance Act using Stellar & AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
                onClick={() => openSignup('SME')}
                className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
            >
                Start Free Trial <ArrowRight size={20} />
            </button>
            <button 
                onClick={() => setShowDemoModal(true)}
                className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
            >
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <Play size={10} className="ml-0.5 text-gray-700 fill-current" />
                </div>
                Watch Demo
            </button>
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-100 flex justify-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
             <div className="text-xl font-bold text-gray-400 hover:text-indigo-600 transition-colors">STELLAR</div>
             <div className="text-xl font-bold text-gray-400 hover:text-indigo-600 transition-colors">Gemini</div>
             <div className="text-xl font-bold text-gray-400 hover:text-indigo-600 transition-colors">FIRS-Ready</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Modern Businesses Choose FOJ's</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We combine the security of distributed ledgers with the intelligence of Google's Gemini AI.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Shield className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Immutable Ledger</h3>
              <p className="text-gray-600 leading-relaxed">
                Every transaction is hashed and recorded on the Stellar network, providing undeniable proof of your financial history for audits.
              </p>
            </div>
            <div id="compliance" className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 transform hover:-translate-y-1 scroll-mt-24">
              <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Bot className="text-indigo-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Tax Consultant</h3>
              <p className="text-gray-600 leading-relaxed">
                Our embedded Gemini AI analyzes your books in real-time, estimating VAT, CIT, and offering advice based on the latest Nigerian Finance Act.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <PieChart className="text-purple-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Reporting</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate IFRS-compliant Income Statements and Balance Sheets with a single click. No more waiting for end-of-month manual reconciliation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing/Audience Section */}
      <section id="pricing" className="py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Plans for Every Stage</h2>
                <p className="text-gray-600">Choose the package that fits your business scale.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* SME Plan */}
                <div className="border border-gray-200 rounded-2xl p-8 hover:border-indigo-300 transition-colors relative bg-white flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900">SME</h3>
                    <div className="my-4">
                        <span className="text-4xl font-extrabold text-gray-900">₦5,000</span>
                        <span className="text-gray-500">/mo</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 flex-1">Perfect for small businesses and solo-preneurs.</p>
                    <button 
                        onClick={() => openSignup('SME')}
                        className="w-full py-3 border-2 border-indigo-600 text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                        Select SME
                    </button>
                    <ul className="mt-8 space-y-3 text-sm text-gray-600">
                        <li className="flex gap-2"><CheckCircle size={16} className="text-green-500" /> Basic Ledger</li>
                        <li className="flex gap-2"><CheckCircle size={16} className="text-green-500" /> Monthly AI Reports</li>
                        <li className="flex gap-2"><CheckCircle size={16} className="text-green-500" /> 1 User Seat</li>
                    </ul>
                </div>

                {/* Startup Plan */}
                <div className="border-2 border-indigo-600 bg-indigo-50/50 rounded-2xl p-8 relative shadow-xl transform md:-translate-y-4 flex flex-col">
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                        POPULAR
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Startup</h3>
                    <div className="my-4">
                        <span className="text-4xl font-extrabold text-gray-900">₦15,000</span>
                        <span className="text-gray-500">/mo</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 flex-1">For growing teams requiring tax automation.</p>
                    <button 
                        onClick={() => openSignup('Startup')}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        Select Startup
                    </button>
                    <ul className="mt-8 space-y-3 text-sm text-gray-600">
                        <li className="flex gap-2"><CheckCircle size={16} className="text-indigo-600" /> Advanced Ledger + Analytics</li>
                        <li className="flex gap-2"><CheckCircle size={16} className="text-indigo-600" /> Unlimited AI Tax Advice</li>
                        <li className="flex gap-2"><CheckCircle size={16} className="text-indigo-600" /> Stellar Hash Verification</li>
                        <li className="flex gap-2"><CheckCircle size={16} className="text-indigo-600" /> 5 User Seats</li>
                    </ul>
                </div>

                {/* Enterprise Plan */}
                <div className="border border-gray-200 rounded-2xl p-8 hover:border-indigo-300 transition-colors bg-white flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900">Enterprise</h3>
                    <div className="my-4">
                        <span className="text-4xl font-extrabold text-gray-900">Contact</span>
                        <span className="text-gray-500">Sales</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 flex-1">Custom auditing solutions for large corps.</p>
                    <button 
                        onClick={() => openSignup('Enterprise')}
                        className="w-full py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    >
                        Contact Sales
                    </button>
                    <ul className="mt-8 space-y-3 text-sm text-gray-600">
                        <li className="flex gap-2"><CheckCircle size={16} className="text-gray-400" /> Custom Blockchain Nodes</li>
                        <li className="flex gap-2"><CheckCircle size={16} className="text-gray-400" /> API Access</li>
                        <li className="flex gap-2"><CheckCircle size={16} className="text-gray-400" /> Dedicated Account Manager</li>
                        <li className="flex gap-2"><CheckCircle size={16} className="text-gray-400" /> Unlimited Seats</li>
                    </ul>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="text-white" size={24} />
                    <span className="text-xl font-bold text-white">FOJ's Finance</span>
                </div>
                <p className="text-sm max-w-xs">Empowering African businesses with transparent, immutable, and intelligent financial tools.</p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                    <li><button onClick={() => scrollToSection('features')} className="hover:text-white hover:underline text-left">Features</button></li>
                    <li><button onClick={() => scrollToSection('features')} className="hover:text-white hover:underline text-left">Security</button></li>
                    <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white hover:underline text-left">Pricing</button></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                    <li><button className="hover:text-white hover:underline text-left cursor-not-allowed opacity-70">About</button></li>
                    <li><button className="hover:text-white hover:underline text-left cursor-not-allowed opacity-70">Contact</button></li>
                    <li><button className="hover:text-white hover:underline text-left cursor-not-allowed opacity-70">Privacy Policy</button></li>
                </ul>
            </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div 
                className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl animate-fade-in-up" 
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={() => setShowAuthModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>
                
                <div className="text-center mb-8">
                    <div className="inline-block bg-indigo-100 p-3 rounded-full mb-4">
                        {authMode === 'login' ? <Lock className="text-indigo-600" size={24} /> : <Building2 className="text-indigo-600" size={24} />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {authMode === 'login' ? 'Access your financial dashboard' : `Start your ${selectedPlan} journey`}
                    </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {authMode === 'signup' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Business Name</label>
                            <input 
                                type="text" 
                                required
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="My Awesome Business Ltd"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                        />
                    </div>

                    {authMode === 'signup' && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 flex justify-between items-center">
                            <span>Selected Plan:</span>
                            <span className="font-bold text-indigo-600">{selectedPlan}</span>
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 mt-2 active:scale-95 transform"
                    >
                        {authMode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    {authMode === 'login' ? (
                        <p className="text-gray-500">
                            Don't have an account? <button onClick={() => setAuthMode('signup')} className="text-indigo-600 font-semibold hover:underline">Sign up</button>
                        </p>
                    ) : (
                        <p className="text-gray-500">
                            Already have an account? <button onClick={() => setAuthMode('login')} className="text-indigo-600 font-semibold hover:underline">Log in</button>
                        </p>
                    )}
                </div>
            </div>
            {/* Click outside to close */}
            <div className="absolute inset-0 z-[-1]" onClick={() => setShowAuthModal(false)}></div>
        </div>
      )}

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-black w-full max-w-5xl aspect-video rounded-xl relative flex items-center justify-center border border-gray-800 shadow-2xl animate-scale-in">
                <button 
                    onClick={() => setShowDemoModal(false)} 
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2"
                >
                    <X size={24} />
                    <span className="sr-only">Close Demo</span>
                </button>
                <div className="text-center">
                    <div 
                        className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 cursor-pointer hover:bg-indigo-500 transition-all hover:scale-110 shadow-lg shadow-indigo-500/50"
                        onClick={() => alert("This is a demo placeholder. In a real app, a video would play here!")}
                    >
                        <Play size={32} className="ml-2 text-white fill-current" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">FOJ's Finance Platform Demo</h3>
                    <p className="text-gray-400">Video Walkthrough Placeholder</p>
                </div>
             </div>
             {/* Click outside to close */}
             <div className="absolute inset-0 z-[-1]" onClick={() => setShowDemoModal(false)}></div>
        </div>
      )}
    </div>
  );
};