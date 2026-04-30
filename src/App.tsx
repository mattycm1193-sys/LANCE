import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  UserCircle, 
  Palette, 
  TrendingUp, 
  ChevronRight, 
  Loader2, 
  Sparkles,
  Search,
  ArrowRight,
  Download,
  MessageSquare,
  Mic,
  LogIn,
  LogOut,
  BrainCircuit,
  Video,
  Image as ImageIcon,
  Upload,
  Droplet,
  ExternalLink,
  Eye,
  MousePointerClick,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { Analytics } from '@vercel/analytics/react';
import { cn } from './lib/utils';
import { 
  generateContent, 
  generateContentWithThinking, 
  generateHighQualityImage, 
  generateImage,
  editImage, 
  animateImageToVideo, 
  findOpportunities,
  generatePalette
} from './services/gemini';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  dataconnect
} from './firebase';
import { Section, CaseStudy, ProfileData, BrandingAsset, User, Comment as AppComment } from './types';
import Markdown from 'react-markdown';
import { Chatbot } from './components/Chatbot';
import { VoiceAgent } from './components/VoiceAgent';
import { ToastContainer, ToastProps } from './components/Toast';
import { parseError } from './lib/error-handler';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  
  const addToast = (title: string, message: string, type: ToastProps['type'] = 'error') => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, title, message, type, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleError = (error: any) => {
    const parsed = parseError(error);
    addToast(parsed.title, parsed.message, parsed.type);
  };
  
  // State for different features
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [brandingAssets, setBrandingAssets] = useState<BrandingAsset[]>([]);
  const [opportunities, setOpportunities] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Data Connect Sync (Placeholder for actual Data Connect logic)
  useEffect(() => {
    if (!user) {
      setCaseStudies([]);
      setProfileData(null);
      setBrandingAssets([]);
      return;
    }
    // TODO: Implement Data Connect queries here when SDK is generated
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      addToast('Welcome back!', 'Successfully signed in with Google.', 'success');
    } catch (error) {
      handleError(error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      addToast('Signed out', 'You have been successfully signed out.', 'info');
    } catch (error) {
      handleError(error);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio Builder', icon: Briefcase },
    { id: 'profile', label: 'Profile Curation', icon: UserCircle },
    { id: 'branding', label: 'Branding Studio', icon: Palette },
    { id: 'opportunities', label: 'Opportunity Finder', icon: TrendingUp },
    { id: 'chat', label: 'AI Coach', icon: MessageSquare },
    { id: 'voice', label: 'Voice Agent', icon: Mic },
  ];

  if (!isAuthReady) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-cyan-950/20">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 drop-shadow-[0_0_12px_#00FFFF]">
              <path d="M22 2L12 22L9 15L2 12L22 2Z" fill="#00FFFF" />
            </svg>
          </div>
          <h1 className="text-5xl font-serif font-extrabold mb-4 tracking-tight text-cyan-100">LANCE: <span className="text-white">success engine</span></h1>
          <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
            Scale your freelancing career with AI-powered portfolios, profile curation, and real-time market insights.
          </p>
          <button
            onClick={handleLogin}
            className="bg-white text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform shadow-xl"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
        <Analytics />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col bg-[#0f0f0f]">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 drop-shadow-[0_0_8px_#9900FF]">
                <path d="M22 2L12 22L9 15L2 12L22 2Z" fill="#9900FF" />
              </svg>
            </div>
            <h1 className="text-xl font-serif font-extrabold tracking-tight text-[#E6E6FA]">LANCE</h1>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as Section)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  activeSection === item.id 
                    ? "bg-[radial-gradient(circle_at_center,_#581c87_0%,_#1e0b1c_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 text-white chiseled-text" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", activeSection === item.id ? "text-white" : "text-gray-400 group-hover:text-white")} />
                <span className="font-serif font-semibold">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-white/10 space-y-4">
          <div className="bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Pro Status</p>
            <p className="text-sm text-gray-300 mb-3">Your profile is 85% optimized for conversion.</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full w-[85%]" />
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 px-8 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-200 capitalize">{activeSection.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <img 
              src={user.photoURL || ''} 
              alt={user.displayName || ''} 
              className="w-8 h-8 rounded-full border border-white/20"
              referrerPolicy="no-referrer"
            />
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'dashboard' && <DashboardView setActiveSection={setActiveSection} />}
              {activeSection === 'portfolio' && <PortfolioView user={user} caseStudies={caseStudies} setCaseStudies={setCaseStudies} handleError={handleError} addToast={addToast} />}
              {activeSection === 'profile' && <ProfileView user={user} profileData={profileData} setProfileData={setProfileData} handleError={handleError} addToast={addToast} />}
              {activeSection === 'branding' && <BrandingView user={user} assets={brandingAssets} setBrandingAssets={setBrandingAssets} handleError={handleError} addToast={addToast} />}
              {activeSection === 'opportunities' && <OpportunitiesView handleError={handleError} />}
              {activeSection === 'chat' && <Chatbot handleError={handleError} />}
              {activeSection === 'voice' && <VoiceAgent handleError={handleError} />}
            </motion.div>
          </AnimatePresence>
        </div>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </main>
      <Analytics />
    </div>
  );
}

function DashboardView({ setActiveSection }: { setActiveSection: (s: Section) => void }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Profile Views', value: '1.2k', trend: '+12%', color: 'text-emerald-400' },
          { label: 'Conversion Rate', value: '4.8%', trend: '+0.5%', color: 'text-cyan-400' },
          { label: 'Active Leads', value: '12', trend: '+2', color: 'text-cyan-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#141414] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-serif font-bold italic">{stat.value}</span>
              <span className={cn("text-xs font-medium mb-2", stat.color)}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#141414] p-8 rounded-3xl border border-white/5">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => setActiveSection('portfolio')}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Generate Case Study</p>
                  <p className="text-xs text-gray-500">Create a high-conversion example</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </button>
            <button 
              onClick={() => setActiveSection('branding')}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Palette className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Design Profile Banner</p>
                  <p className="text-xs text-gray-500">AI-powered branding assets</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        <div className="bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-3xl font-serif font-extrabold mb-2">Ready to scale?</h3>
            <p className="text-cyan-100/80 mb-6 max-w-[240px] font-sans">Our agent found 3 new high-paying niches in your field today.</p>
            <button 
              onClick={() => setActiveSection('opportunities')}
              className="bg-white text-cyan-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform font-sans"
            >
              View Opportunities <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <TrendingUp className="absolute -bottom-4 -right-4 w-48 h-48 text-white/10 -rotate-12 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>
    </div>
  );
}

function PortfolioView({ user, caseStudies, setCaseStudies, handleError, addToast }: { user: User, caseStudies: CaseStudy[], setCaseStudies: React.Dispatch<React.SetStateAction<CaseStudy[]>>, handleError: (e: any) => void, addToast: (t: string, m: string, ty?: ToastProps['type']) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [authorExplanation, setAuthorExplanation] = useState('');
  const [useHighThinking, setUseHighThinking] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  const handlePostComment = (studyId: string) => {
    const rawText = commentInputs[studyId];
    if (!rawText) return;
    
    const text = rawText.trim();
    if (!text) {
      addToast('Invalid Comment', 'Comment cannot be empty.', 'error');
      return;
    }
    
    if (text.length > 500) {
      addToast('Invalid Comment', 'Comment exceeds maximum length of 500 characters.', 'error');
      return;
    }

    const lowerText = text.toLowerCase();
    const badWords = ['spam', 'viagra', 'buy now', 'crypto investment', 'sugar daddy'];
    if (badWords.some(word => lowerText.includes(word))) {
      addToast('Validation Failed', 'Comment contains inappropriate content.', 'error');
      return;
    }

    const newComment: AppComment = {
      id: Date.now().toString(),
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      text: text,
      timestamp: Date.now()
    };
    
    setCaseStudies((prev: CaseStudy[]) => prev.map((s: CaseStudy) => s.id === studyId ? { ...s, comments: [...(s.comments || []), newComment] } : s));
    setCommentInputs({ ...commentInputs, [studyId]: '' });
  };

  const handleGenerate = async () => {
    if (!input) return;
    setIsGenerating(true);
    try {
      const prompt = `Create a high-conversion freelancing case study based on this project: ${input}. 
      Format as JSON with fields: title, client, challenge, solution, results, tags (array).
      Make it professional, data-driven, and persuasive.`;
      
      const result = useHighThinking 
        ? await generateContentWithThinking(prompt, "You are a world-class conversion copywriter for freelancers.")
        : await generateContent(prompt, "You are a world-class conversion copywriter for freelancers.");
      
      const cleaned = result.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleaned);
      
      const newStudy: CaseStudy = {
        id: Date.now().toString(),
        userId: user.uid,
        ...data,
        externalLink: externalLink.trim() || undefined,
        authorExplanation: authorExplanation.trim() || undefined,
        views: Math.floor(Math.random() * 500), 
        clicks: Math.floor(Math.random() * 100),
        comments: [],
        createdAt: Date.now()
      };

      // Data Connect: Implement save logic here
      setCaseStudies((prev: CaseStudy[]) => [newStudy, ...prev]);
      addToast('Case Study Generated', 'Your new case study is ready to review.', 'success');
      
      setInput('');
      setExternalLink('');
      setAuthorExplanation('');
    } catch (e) {
      handleError(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#141414] p-6 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-serif font-extrabold">New Case Study</h3>
          <button 
            onClick={() => setUseHighThinking(!useHighThinking)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border font-sans",
              useHighThinking 
                ? "bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border-cyan-500/50 text-cyan-400 chiseled-text hover:shadow-[inset_0_4px_8px_rgba(0,0,0,0.8),0_0_15px_rgba(6,182,212,0.2)]" 
                : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] active:scale-95"
            )}
          >
            <BrainCircuit className="w-4 h-4" />
            High Thinking Mode
          </button>
        </div>
        <div className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a project you worked on (e.g., 'Built a SaaS dashboard for a fintech startup that reduced churn by 15%')"
            className="w-full bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-cyan-500/50 hover:border-white/20 outline-none min-h-[120px] transition-all duration-300"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="External Link (Optional, e.g., GitHub, Live Site)"
              className="w-full bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-cyan-500/50 hover:border-white/20 outline-none transition-all duration-300"
            />
            <input
              type="text"
              value={authorExplanation}
              onChange={(e) => setAuthorExplanation(e.target.value)}
              placeholder="Author's Elaboration or Behind-the-Scenes Note (Optional)"
              className="w-full bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-cyan-500/50 hover:border-white/20 outline-none transition-all duration-300"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !input}
            className="w-full bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-cyan-500/20 hover:opacity-90 hover:shadow-[0_0_30px_rgba(6,182,212,0.4),inset_0_2px_4px_rgba(0,0,0,0.2)] disabled:opacity-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-500 text-white chiseled-text"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Case Study
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {caseStudies.map((study) => {
          const views = study.views || 0;
          const clicks = study.clicks || 0;
          const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';

          return (
          <div key={study.id} className="bg-[#141414] p-8 rounded-2xl border border-white/5 hover:border-cyan-500/40 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)] transition-all duration-500 group relative">
            <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-6">
              <div>
                <h4 className="text-2xl font-serif font-extrabold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-3">
                  {study.title}
                  {study.externalLink && (
                    <a href={study.externalLink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyan-400 transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </h4>
                <p className="text-sm text-gray-500 font-sans mt-1">Client: {study.client}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex gap-2">
                  {study.tags && study.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold uppercase tracking-wider text-gray-400">{tag}</span>
                  ))}
                </div>
                <div className="flex gap-4 text-xs font-mono text-gray-400 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-1" title="Views"><Eye className="w-3 h-3"/> {views}</div>
                  <div className="flex items-center gap-1" title="Clicks on Link"><MousePointerClick className="w-3 h-3"/> {clicks}</div>
                  <div className="flex items-center gap-1 text-cyan-500" title="Click-Through Rate"><Activity className="w-3 h-3"/> {ctr}% CTR</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6 border-b border-white/5 pb-6">
              <div>
                <p className="text-xs font-bold text-cyan-400 uppercase mb-2">Challenge</p>
                <p className="text-sm text-gray-300 leading-relaxed">{study.challenge}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-cyan-400 uppercase mb-2">Solution</p>
                <p className="text-sm text-gray-300 leading-relaxed">{study.solution}</p>
              </div>
              <div className="bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] p-4 rounded-xl border border-white/10">
                <p className="text-xs font-bold text-emerald-400 uppercase mb-2">Results</p>
                <p className="text-sm text-white font-medium leading-relaxed chiseled-text">{study.results}</p>
              </div>
            </div>

            {study.authorExplanation && (
              <div className="mb-6 bg-cyan-900/10 border-l-4 border-cyan-500 p-4 rounded-r-xl">
                <p className="text-xs font-bold text-cyan-400 uppercase mb-1 flex items-center gap-2">
                  <UserCircle className="w-4 h-4" /> 
                  Author's Elaboration
                </p>
                <p className="text-sm text-gray-300 italic">"{study.authorExplanation}"</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-white/5">
              <h5 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-500" />
                Discussion ({study.comments?.length || 0})
              </h5>
              <div className="space-y-4 mb-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {study.comments?.map(comment => (
                  <div key={comment.id} className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white">{comment.userName}</span>
                      <span className="text-[10px] text-gray-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-300">{comment.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question or leave a comment..."
                  value={commentInputs[study.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [study.id]: e.target.value })}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-cyan-500/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePostComment(study.id);
                    }
                  }}
                />
                <button 
                  onClick={() => handlePostComment(study.id)}
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 rounded-xl text-sm font-bold border border-cyan-500/20 transition-all font-sans"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileView({ user, profileData, setProfileData, handleError, addToast }: { user: User, profileData: ProfileData | null, setProfileData: (p: ProfileData) => void, handleError: (e: any) => void, addToast: (t: string, m: string, ty?: ToastProps['type']) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [platform, setPlatform] = useState('Upwork');
  const [skills, setSkills] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Create a high-conversion profile for ${platform}. 
      My core skills are: ${skills}. 
      Format as JSON with fields: platform, headline, bio, skills (array), pricing.
      Focus on monetization and attracting high-ticket clients.`;
      
      const result = await generateContent(prompt, "You are a professional freelance profile consultant.");
      const cleaned = result.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleaned);
      
      // Data Connect: Implement save logic here
      setProfileData({
        ...data,
        id: Date.now().toString(),
        userId: user.uid,
        createdAt: Date.now()
      });
      addToast('Profile Optimized', `Your ${platform} profile has been updated.`, 'success');
    } catch (e) {
      handleError(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#141414] p-6 rounded-2xl border border-white/5">
        <h3 className="text-xl font-serif font-extrabold mb-4">Profile Optimizer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 font-sans">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Platform</label>
            <select 
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50 hover:border-white/20 transition-all duration-300"
            >
              <option>Upwork</option>
              <option>Fiverr</option>
              <option>LinkedIn</option>
              <option>Toptal</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Core Skills</label>
            <input 
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, UI Design, Copywriting"
              className="w-full bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50 hover:border-white/20 transition-all duration-300"
            />
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !skills}
            className="flex-1 bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-cyan-500/20 hover:opacity-90 hover:shadow-[0_0_30px_rgba(6,182,212,0.4),inset_0_2px_4px_rgba(0,0,0,0.2)] disabled:opacity-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-500 text-white chiseled-text"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCircle className="w-5 h-5" />}
            Curate Profile
          </button>
          {profileData && (
            <button
              onClick={async () => {
                setIsGenerating(true);
                try {
                  const analysis = await generateContentWithThinking(
                    `Analyze this freelance profile and suggest 3 high-impact improvements to increase conversion and pricing power: ${JSON.stringify(profileData)}`,
                    "You are a world-class freelance business consultant."
                  );
                  alert(analysis);
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsGenerating(false);
                }
              }}
              disabled={isGenerating}
              className="px-6 py-3 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <BrainCircuit className="w-5 h-5" />
              Smart Analysis
            </button>
          )}
        </div>
      </div>

      {profileData && (
        <div className="bg-[#141414] p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-bold uppercase tracking-widest border border-cyan-500/20 chiseled-text">
              {profileData.platform}
            </span>
          </div>
          
          <div className="max-w-2xl">
            <h4 className="text-3xl font-serif font-extrabold mb-4 text-white">{profileData.headline}</h4>
            <div className="prose prose-invert prose-sm mb-8 font-sans">
              <Markdown>{profileData.bio}</Markdown>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {profileData.skills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-white/5 rounded-lg text-xs font-medium text-gray-300 border border-white/5">
                  {skill}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Recommended Rate</p>
                <p className="text-xl font-bold text-white">{profileData.pricing}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BrandingView({ user, assets, setBrandingAssets, handleError, addToast }: { user: User, assets: BrandingAsset[], setBrandingAssets: React.Dispatch<React.SetStateAction<BrandingAsset[]>>, handleError: (e: any) => void, addToast: (t: string, m: string, ty?: ToastProps['type']) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'banner' | 'profile-pic' | 'video' | 'social-post' | 'palette'>('banner');
  const [activePaletteId, setActivePaletteId] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageQuality, setImageQuality] = useState<'Standard' | 'Studio'>('Standard');
  const [postDimension, setPostDimension] = useState<'Square' | 'Portrait' | 'Landscape'>('Square');
  const [contentFocus, setContentFocus] = useState<'Educational' | 'Promotional' | 'Personal'>('Educational');
  const [includeVoiceover, setIncludeVoiceover] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');

  const onDrop = (acceptedFiles: File[]) => {
    setUploadedFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  });

  const [editingAsset, setEditingAsset] = useState<BrandingAsset | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt && !uploadedFile) return;
    setIsGenerating(true);
    try {
      let url = '';
      let caption = '';
      
      let finalPrompt = prompt;
      if (activePaletteId && type !== 'palette') {
        const activePalette = assets.find(a => a.id === activePaletteId);
        if (activePalette && activePalette.colors) {
          finalPrompt += `. Use this exact color palette for styling and background: ${activePalette.colors.map(c => `${c.name} (${c.hex})`).join(', ')}. Do not use other colors.`;
        }
      }

      if (type === 'palette') {
        let base64: string | undefined;
        let mimeType: string | undefined;
        
        if (uploadedFile) {
          mimeType = uploadedFile.type;
          const reader = new FileReader();
          base64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(uploadedFile);
          });
        }
        
        const responseText = await generatePalette(finalPrompt || "A vibrant and professional color palette.", base64, mimeType);
        const startIdx = responseText.indexOf('{');
        const endIdx = responseText.lastIndexOf('}');
        if (startIdx === -1 || endIdx === -1) throw new Error("Could not parse palette JSON");
        
        const paletteData = JSON.parse(responseText.substring(startIdx, endIdx + 1));
        
        const newAsset: BrandingAsset = {
          id: Date.now().toString(),
          userId: user.uid,
          type: 'palette',
          prompt: prompt || (uploadedFile ? "Generated from photo" : "Custom Color Palette"),
          colors: paletteData.palette,
          tips: paletteData.tips,
          projectName: projectName.trim() || undefined,
          tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
          createdAt: Date.now()
        };
        
        setBrandingAssets(prev => [newAsset, ...prev]);
        addToast('Palette Created', `Your color palette has been generated in your assets.`, 'success');
        setPrompt('');
        setUploadedFile(null);
        setIsGenerating(false);
        return;
      }

      if (type === 'social-post') {
        const captionPrompt = `Generate a high-conversion social media caption for a ${contentFocus} post. 
        Topic: ${prompt}. 
        Platform: General Social Media. 
        Include relevant hashtags and a call to action.`;
        caption = await generateContent(captionPrompt, "You are a world-class social media manager and copywriter.");

        if (includeVoiceover) {
          if (!uploadedFile) throw new Error("Please upload a photo first for video generation");
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(uploadedFile);
          });
          url = await animateImageToVideo(base64, uploadedFile.type, `Create a professional ${contentFocus} video post about: ${finalPrompt}`);
        } else {
          const ar = postDimension === 'Square' ? '1:1' : postDimension === 'Portrait' ? '4:5' : '16:9';
          url = imageQuality === 'Studio' 
            ? await generateHighQualityImage(`A professional ${contentFocus} social media post visual about: ${finalPrompt}`, imageSize, ar)
            : await generateImage(`A professional ${contentFocus} social media post visual about: ${finalPrompt}`, ar);
        }
      } else if (type === 'video') {
        if (!uploadedFile) throw new Error("Please upload a photo first");
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(uploadedFile);
        });
        url = await animateImageToVideo(base64, uploadedFile.type, finalPrompt || "Animate this photo professionally");
      } else {
        url = imageQuality === 'Studio'
          ? await generateHighQualityImage(finalPrompt, imageSize, type === 'banner' ? '16:9' : aspectRatio)
          : await generateImage(finalPrompt, type === 'banner' ? '16:9' : aspectRatio);
      }

      // Data Connect: Implement save logic here
      const newAsset: BrandingAsset = {
        id: Date.now().toString(),
        userId: user.uid,
        type,
        url,
        prompt: prompt || "Generated from photo",
        caption: caption || undefined,
        projectName: projectName.trim() || undefined,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        createdAt: Date.now()
      };
      setBrandingAssets(prev => [newAsset, ...prev]);
      addToast('Asset Created', `Your ${type} has been generated successfully.`, 'success');
      setPrompt('');
      setUploadedFile(null);
    } catch (e) {
      handleError(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!editingAsset || !editPrompt) return;
    setIsGenerating(true);
    try {
      // Fetch the image as base64
      const response = await fetch(editingAsset.url);
      const blob = await response.blob();
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const url = await editImage(editPrompt, base64, blob.type);
      
      const updatedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      
      // Data Connect: Implement save logic here
      const newAsset: BrandingAsset = {
        id: Date.now().toString(),
        userId: user.uid,
        type: editingAsset.type,
        url,
        prompt: `Edit of ${editingAsset.prompt}: ${editPrompt}`,
        projectName: projectName.trim() || editingAsset.projectName,
        tags: updatedTags.length > 0 ? updatedTags : editingAsset.tags,
        createdAt: Date.now()
      };
      setBrandingAssets(prev => [newAsset, ...prev]);
      addToast('Asset Updated', 'Image edit completed successfully.', 'success');
      
      setEditingAsset(null);
      setEditPrompt('');
    } catch (e) {
      handleError(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Edit Modal */}
      <AnimatePresence>
        {editingAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#141414] border border-white/10 p-8 rounded-3xl max-w-lg w-full space-y-6"
            >
              <h3 className="text-xl font-bold">Edit Image</h3>
              <div className="aspect-video rounded-xl overflow-hidden border border-white/5">
                <img src={editingAsset.url} alt="To edit" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-4">
                <input 
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="What would you like to change? (e.g. 'Add a sunset background')"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => setEditingAsset(null)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleEdit}
                    disabled={isGenerating || !editPrompt}
                    className="flex-1 bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-cyan-500/20 hover:opacity-90 hover:shadow-[0_0_30px_rgba(6,182,212,0.4),inset_0_2px_4px_rgba(0,0,0,0.2)] disabled:opacity-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 text-white chiseled-text"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Apply Edit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-[#141414] p-6 rounded-2xl border border-white/5">
        <h3 className="text-xl font-serif font-extrabold mb-4">Branding Studio</h3>
        <div className="flex flex-wrap gap-3 mb-6 font-sans">
            {[
              { id: 'banner', label: 'Banner', icon: ImageIcon },
              { id: 'profile-pic', label: 'Profile Pic', icon: UserCircle },
              { id: 'social-post', label: 'Social Post', icon: MessageSquare },
              { id: 'video', label: 'Video (Veo)', icon: Video },
              { id: 'palette', label: 'Color Palette', icon: Droplet },
            ].map((t) => (
            <button 
              key={t.id}
              onClick={() => setType(t.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border",
                type === t.id 
                  ? "bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border-cyan-500/50 text-white chiseled-text hover:shadow-[inset_0_4px_8px_rgba(0,0,0,0.8),0_0_15px_rgba(6,182,212,0.3)]" 
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {type !== 'video' && type !== 'social-post' && type !== 'palette' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 font-sans">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Aspect Ratio</label>
              <div className="flex flex-wrap gap-2">
                {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map((ar) => (
                  <button
                    key={ar}
                    onClick={() => setAspectRatio(ar)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-300",
                      aspectRatio === ar 
                        ? "bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border-cyan-500/50 text-cyan-400 chiseled-text" 
                        : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)] active:scale-95"
                    )}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Quality & Size</label>
              <div className="flex gap-4 items-center">
                <div className="flex gap-2">
                  {['Standard', 'Studio'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setImageQuality(q as any)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold border transition-all duration-300",
                        imageQuality === q 
                          ? "bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border-cyan-500/50 text-cyan-400 chiseled-text" 
                          : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)] active:scale-95"
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                {imageQuality === 'Studio' && (
                  <div className="flex gap-2">
                    {['1K', '2K', '4K'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setImageSize(size as any)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-bold border transition-all duration-300",
                          imageSize === size 
                            ? "bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border-cyan-500/50 text-cyan-400 chiseled-text" 
                            : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)] active:scale-95"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {type === 'social-post' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 font-sans">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Post Dimensions</label>
              <div className="flex gap-2">
                {['Square', 'Portrait', 'Landscape'].map((dim) => (
                  <button
                    key={dim}
                    onClick={() => setPostDimension(dim as any)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold border transition-all duration-300",
                      postDimension === dim 
                        ? "bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border-cyan-500/50 text-cyan-400 chiseled-text" 
                        : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)] active:scale-95"
                    )}
                  >
                    {dim}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Image Quality</label>
              <div className="flex gap-2">
                {['Standard', 'Studio'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setImageQuality(q as any)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold border transition-all duration-300",
                      imageQuality === q 
                        ? "bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border-cyan-500/50 text-cyan-400 chiseled-text" 
                        : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)] active:scale-95"
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Content Focus</label>
              <select 
                value={contentFocus}
                onChange={(e) => setContentFocus(e.target.value as any)}
                className="w-full bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50 hover:border-white/20 transition-all duration-300"
              >
                <option>Educational</option>
                <option>Promotional</option>
                <option>Personal</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">AI Video / Voiceover</label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                  onClick={() => setIncludeVoiceover(!includeVoiceover)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    includeVoiceover ? "bg-cyan-500" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                    includeVoiceover ? "left-7" : "left-1"
                  )} />
                </div>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Enable Veo Animation</span>
              </label>
            </div>
          </div>
        )}

        {(type === 'video' || type === 'social-post' || type === 'palette') && (
          <div {...getRootProps()} className={cn(
            "mb-6 border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-500 cursor-pointer",
            isDragActive 
              ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_30px_rgba(6,182,212,0.15),inset_0_0_20px_rgba(6,182,212,0.05)]" 
              : "border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/[0.02] hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.2)] bg-black/20"
          )}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              {uploadedFile ? (
                <p className="text-sm text-cyan-400 font-medium">{uploadedFile.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium">Drop a photo here or click to upload</p>
                  <p className="text-xs text-gray-500 text-balance">
                    {type === 'video' ? 'Veo will animate this photo into a professional video' : type === 'palette' ? 'Upload an inspiration image to extract a color palette' : 'Use this as the base for your social media post'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input 
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name (e.g. 'CyberLaunch 2026')"
            className="w-full bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50 hover:border-white/20 transition-all duration-300"
          />
          <input 
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags (comma-separated, e.g. 'hero, dark, organic')"
            className="w-full bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50 hover:border-white/20 transition-all duration-300"
          />
        </div>

        <div className="space-y-4">
          <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={type === 'video' ? "Describe the animation (optional)" : type === 'palette' ? "Describe the mood (e.g., 'Cyberpunk Neon', 'Earthy Minimalist')" : "Describe your style (e.g. 'Minimalist Tech', 'Vibrant Creative')"}
            className="w-full bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50 hover:border-white/20 transition-all duration-300"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!prompt && !uploadedFile)}
            className="w-full bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-cyan-500/20 hover:opacity-90 hover:shadow-[0_0_30px_rgba(6,182,212,0.4),inset_0_2px_4px_rgba(0,0,0,0.2)] disabled:opacity-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-500 text-white chiseled-text"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Palette className="w-5 h-5" />}
            {type === 'video' ? 'Generate Video' : type === 'palette' ? 'Generate Palette' : 'Generate Asset'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#141414] p-4 rounded-2xl border border-white/5 font-sans">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search assets by prompt, caption, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 md:w-40 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50 text-white"
          >
            <option value="all">All Types</option>
            <option value="banner">Banners</option>
            <option value="profile-pic">Profile Pics</option>
            <option value="social-post">Social Posts</option>
            <option value="video">Videos</option>
            <option value="palette">Palettes</option>
          </select>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="flex-1 md:w-48 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50 text-white"
          >
            <option value="all">All Projects</option>
            {Array.from(new Set(assets.map(a => a.projectName).filter(Boolean))).map(proj => (
              <option key={proj!} value={proj!}>{proj}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assets.filter(asset => {
          if (filterType !== 'all' && asset.type !== filterType) return false;
          if (filterProject !== 'all' && asset.projectName !== filterProject) return false;
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const promptMatch = asset.prompt?.toLowerCase().includes(query);
            const captionMatch = asset.caption?.toLowerCase().includes(query);
            const tagMatch = asset.tags?.some(t => t.toLowerCase().includes(query));
            const projectMatch = asset.projectName?.toLowerCase().includes(query);
            if (!promptMatch && !captionMatch && !tagMatch && !projectMatch) return false;
          }
          return true;
        }).map((asset) => (
          <div 
            key={asset.id} 
            className="bg-[#141414] rounded-3xl overflow-hidden border border-white/5 transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)] group flex flex-col"
          >
            {asset.type === 'palette' ? (
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex gap-1 mb-4 h-24 rounded-xl overflow-hidden">
                  {asset.colors?.map(color => (
                    <div key={color.hex} className="flex-1 transition-transform hover:scale-110 cursor-pointer relative group/color" style={{ backgroundColor: color.hex }}>
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/color:opacity-100 bg-black/40 transition-opacity">
                        <span className="text-white text-xs font-mono font-bold drop-shadow-md">{color.hex}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <h4 className="text-white font-bold mb-2">Palette Guidelines</h4>
                <ul className="text-xs text-gray-400 space-y-2 mb-4 flex-1">
                  {asset.tips?.map((tip, i) => (
                    <li key={i} className="flex gap-2 items-start"><Sparkles className="w-3 h-3 text-cyan-500 shrink-0 mt-0.5" /> <span>{tip}</span></li>
                  ))}
                </ul>

                <button
                  onClick={() => setActivePaletteId(activePaletteId === asset.id ? null : asset.id)}
                  className={cn("w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 border flex items-center justify-center gap-2", 
                    activePaletteId === asset.id 
                      ? "bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border-cyan-500/50 text-cyan-400 chiseled-text" 
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  )}
                >
                  <Droplet className="w-4 h-4" />
                  {activePaletteId === asset.id ? "Active Palette" : "Set as Active Palette"}
                </button>
              </div>
            ) : (
              <div className={cn("relative overflow-hidden", asset.type === 'banner' ? "aspect-video" : asset.type === 'social-post' ? "aspect-[4/5]" : "aspect-square")}>
                {asset.type === 'video' || (asset.type === 'social-post' && asset.url?.includes('.mp4')) ? (
                  <video src={asset.url} controls className="w-full h-full object-cover" />
                ) : (
                  <img 
                    src={asset.url} 
                    alt={asset.prompt} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={() => setEditingAsset(asset)}
                    className="p-3 bg-white text-black rounded-full hover:bg-cyan-500 hover:text-white hover:scale-110 transition-all duration-300 shadow-xl"
                    title="Edit Image"
                  >
                    <Palette className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-white text-black rounded-full hover:bg-cyan-500 hover:text-white hover:scale-110 transition-all duration-300 shadow-xl">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            <div className="p-4 border-t border-white/5 bg-black/20">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-bold text-cyan-400 uppercase">{asset.type.replace('-', ' ')}</p>
                {asset.projectName && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {asset.projectName}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 truncate mb-2">{asset.prompt}</p>
              
              {asset.tags && asset.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {asset.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] text-gray-400 px-2 py-1 rounded bg-black/40 border border-white/10 uppercase tracking-wide">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {asset.caption && (
                <div className="bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] p-3 rounded-lg border border-white/5">
                  <p className="text-xs text-gray-300 line-clamp-3 italic">"{asset.caption}"</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpportunitiesView({ handleError }: { handleError: (e: any) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [niche, setNiche] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!niche) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/findOpportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: niche }),
      });
      
      if (!response.ok) throw response;
      
      const data = await response.json();
      setResults(data.opportunities || []);
    } catch (e) {
      handleError(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#141414] p-6 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-serif font-extrabold">Opportunity Finder</h3>
        </div>
        <div className="flex gap-4 font-sans">
          <input 
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Enter your niche (e.g. 'AI Automation', 'Web3 Development')"
            className="flex-1 bg-black/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50 hover:border-white/20 transition-all duration-300"
          />
          <button
            onClick={handleSearch}
            disabled={isGenerating || !niche}
            className="bg-[radial-gradient(circle_at_center,_#0e7490_0%,_#083344_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-cyan-500/20 hover:opacity-90 hover:shadow-[0_0_30px_rgba(6,182,212,0.4),inset_0_2px_4px_rgba(0,0,0,0.2)] disabled:opacity-50 px-8 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-500 text-white chiseled-text min-w-[140px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Find
              </>
            )}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((opp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#141414] p-6 rounded-3xl border border-white/5 hover:border-cyan-500/40 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)] transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <div className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded text-[10px] font-bold uppercase tracking-wider border border-cyan-500/20">
                  {opp.difficulty || 'Emerging'}
                </div>
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-serif font-extrabold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                    {opp.title}
                  </h4>
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mt-1">
                    Potential: {opp.potential || '$5k - $15k / mo'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed font-sans mb-4">
                {opp.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {opp.tags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-500 uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
