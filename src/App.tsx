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
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { cn } from './lib/utils';
import { 
  generateContent, 
  generateContentWithThinking, 
  generateHighQualityImage, 
  editImage, 
  animateImageToVideo, 
  findOpportunities 
} from './services/gemini';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  getDocFromServer,
  handleFirestoreError,
  OperationType
} from './firebase';
import { Section, CaseStudy, ProfileData, BrandingAsset, User } from './types';
import Markdown from 'react-markdown';
import { Chatbot } from './components/Chatbot';
import { VoiceAgent } from './components/VoiceAgent';
import { SectionErrorBoundary } from './components/SectionErrorBoundary';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // State for different features
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [brandingAssets, setBrandingAssets] = useState<BrandingAsset[]>([]);
  const [opportunities, setOpportunities] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAuthReady(true);
      
      if (u) {
        // Sync user to Firestore
        const userRef = doc(db, 'users', u.uid);
        try {
          const userDoc = await getDocFromServer(userRef);
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              photoURL: u.photoURL,
              role: 'user',
              createdAt: Date.now()
            });
          }
        } catch (e) {
          console.error("Error syncing user:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore Sync
  useEffect(() => {
    if (!user) {
      setCaseStudies([]);
      setProfileData(null);
      setBrandingAssets([]);
      return;
    }

    const qCaseStudies = query(collection(db, 'caseStudies'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubCaseStudies = onSnapshot(qCaseStudies, (snapshot) => {
      setCaseStudies(snapshot.docs.map(doc => doc.data() as CaseStudy));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'caseStudies'));

    const qProfiles = query(collection(db, 'profiles'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubProfiles = onSnapshot(qProfiles, (snapshot) => {
      if (!snapshot.empty) setProfileData(snapshot.docs[0].data() as ProfileData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'profiles'));

    const qAssets = query(collection(db, 'brandingAssets'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubAssets = onSnapshot(qAssets, (snapshot) => {
      setBrandingAssets(snapshot.docs.map(doc => doc.data() as BrandingAsset));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'brandingAssets'));

    return () => {
      unsubCaseStudies();
      unsubProfiles();
      unsubAssets();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-600/20">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Freelance Success Agent</h1>
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
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col bg-[#0f0f0f]">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">FreelanceAgent</h1>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as Section)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  activeSection === item.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", activeSection === item.id ? "text-white" : "text-gray-400 group-hover:text-white")} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-white/10 space-y-4">
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-4 rounded-2xl border border-indigo-500/20">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Pro Status</p>
            <p className="text-sm text-gray-300 mb-3">Your profile is 85% optimized for conversion.</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-[85%]" />
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
              {activeSection === 'portfolio' && <PortfolioView user={user} caseStudies={caseStudies} />}
              {activeSection === 'profile' && <ProfileView user={user} profileData={profileData} />}
              {activeSection === 'branding' && <SectionErrorBoundary><BrandingView user={user} assets={brandingAssets} /></SectionErrorBoundary>}
              {activeSection === 'opportunities' && <SectionErrorBoundary><OpportunitiesView opportunities={opportunities} setOpportunities={setOpportunities} /></SectionErrorBoundary>}
              {activeSection === 'chat' && <SectionErrorBoundary><Chatbot /></SectionErrorBoundary>}
              {activeSection === 'voice' && <SectionErrorBoundary><VoiceAgent /></SectionErrorBoundary>}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function DashboardView({ setActiveSection }: { setActiveSection: (s: Section) => void }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Profile Views', value: '1.2k', trend: '+12%', color: 'text-emerald-400' },
          { label: 'Conversion Rate', value: '4.8%', trend: '+0.5%', color: 'text-indigo-400' },
          { label: 'Active Leads', value: '12', trend: '+2', color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#141414] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold">{stat.value}</span>
              <span className={cn("text-xs font-medium mb-1.5", stat.color)}>{stat.trend}</span>
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
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
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
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
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

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Ready to scale?</h3>
            <p className="text-indigo-100/80 mb-6 max-w-[240px]">Our agent found 3 new high-paying niches in your field today.</p>
            <button 
              onClick={() => setActiveSection('opportunities')}
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
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

function PortfolioView({ user, caseStudies }: { user: User, caseStudies: CaseStudy[] }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState('');
  const [useHighThinking, setUseHighThinking] = useState(false);

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
      
      const studyId = doc(collection(db, 'caseStudies')).id;
      await setDoc(doc(db, 'caseStudies', studyId), {
        ...data,
        id: studyId,
        userId: user.uid,
        createdAt: Date.now()
      });
      
      setInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#141414] p-6 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">New Case Study</h3>
          <button 
            onClick={() => setUseHighThinking(!useHighThinking)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
              useHighThinking ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/10 text-gray-500"
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
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] transition-all"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !input}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Case Study
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {caseStudies.map((study) => (
          <div key={study.id} className="bg-[#141414] p-8 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{study.title}</h4>
                <p className="text-sm text-gray-500">Client: {study.client}</p>
              </div>
              <div className="flex gap-2">
                {study.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold uppercase tracking-wider text-gray-400">{tag}</span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Challenge</p>
                <p className="text-sm text-gray-300 leading-relaxed">{study.challenge}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-purple-400 uppercase mb-2">Solution</p>
                <p className="text-sm text-gray-300 leading-relaxed">{study.solution}</p>
              </div>
              <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                <p className="text-xs font-bold text-emerald-400 uppercase mb-2">Results</p>
                <p className="text-sm text-white font-medium leading-relaxed">{study.results}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileView({ user, profileData }: { user: User, profileData: ProfileData | null }) {
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
      
      const profileId = doc(collection(db, 'profiles')).id;
      await setDoc(doc(db, 'profiles', profileId), {
        ...data,
        id: profileId,
        userId: user.uid,
        createdAt: Date.now()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#141414] p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-4">Profile Optimizer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Platform</label>
            <select 
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !skills}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCircle className="w-5 h-5" />}
          Curate Profile
        </button>
      </div>

      {profileData && (
        <div className="bg-[#141414] p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
              {profileData.platform}
            </span>
          </div>
          
          <div className="max-w-2xl">
            <h4 className="text-2xl font-bold mb-4 text-white">{profileData.headline}</h4>
            <div className="prose prose-invert prose-sm mb-8">
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

function BrandingView({ user, assets }: { user: User, assets: BrandingAsset[] }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'banner' | 'profile-pic' | 'video'>('banner');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
      if (type === 'video') {
        if (!uploadedFile) throw new Error("Please upload a photo first");
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(uploadedFile);
        });
        url = await animateImageToVideo(base64, uploadedFile.type, prompt || "Animate this photo professionally");
      } else {
        url = await generateHighQualityImage(prompt, imageSize, type === 'banner' ? '16:9' : '1:1');
      }

      const assetId = doc(collection(db, 'brandingAssets')).id;
      await setDoc(doc(db, 'brandingAssets', assetId), {
        id: assetId,
        userId: user.uid,
        type,
        url,
        prompt: prompt || "Generated from photo",
        createdAt: Date.now()
      });
      setPrompt('');
      setUploadedFile(null);
    } catch (e) {
      console.error(e);
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
      
      const assetId = doc(collection(db, 'brandingAssets')).id;
      await setDoc(doc(db, 'brandingAssets', assetId), {
        id: assetId,
        userId: user.uid,
        type: editingAsset.type,
        url,
        prompt: `Edit of ${editingAsset.prompt}: ${editPrompt}`,
        createdAt: Date.now()
      });
      
      setEditingAsset(null);
      setEditPrompt('');
    } catch (e) {
      console.error(e);
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
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
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
        <h3 className="text-lg font-bold mb-4">Branding Studio</h3>
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { id: 'banner', label: 'Banner', icon: ImageIcon },
            { id: 'profile-pic', label: 'Profile Pic', icon: UserCircle },
            { id: 'video', label: 'Video (Veo)', icon: Video },
          ].map((t) => (
            <button 
              key={t.id}
              onClick={() => setType(t.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border",
                type === t.id ? "bg-indigo-600 border-indigo-400 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {type !== 'video' && (
          <div className="mb-6">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Resolution</label>
            <div className="flex gap-2">
              {['1K', '2K', '4K'].map((size) => (
                <button
                  key={size}
                  onClick={() => setImageSize(size as any)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold border transition-all",
                    imageSize === size ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/10 text-gray-500"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {type === 'video' && (
          <div {...getRootProps()} className={cn(
            "mb-6 border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
            isDragActive ? "border-indigo-500 bg-indigo-500/5" : "border-white/10 hover:border-white/20 bg-black/20"
          )}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              {uploadedFile ? (
                <p className="text-sm text-indigo-400 font-medium">{uploadedFile.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium">Drop a photo here or click to upload</p>
                  <p className="text-xs text-gray-500 text-balance">Veo will animate this photo into a professional video</p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={type === 'video' ? "Describe the animation (optional)" : "Describe your style (e.g. 'Minimalist Tech', 'Vibrant Creative')"}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!prompt && !uploadedFile)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Palette className="w-5 h-5" />}
            {type === 'video' ? 'Generate Video' : 'Generate Asset'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-[#141414] rounded-3xl overflow-hidden border border-white/5 group">
            <div className={cn("relative overflow-hidden", asset.type === 'banner' ? "aspect-video" : "aspect-square")}>
              {asset.type === 'video' ? (
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
                  className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                  title="Edit Image"
                >
                  <Palette className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs font-bold text-indigo-400 uppercase mb-1">{asset.type.replace('-', ' ')}</p>
              <p className="text-sm text-gray-400 truncate">{asset.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpportunitiesView({ opportunities, setOpportunities }: { opportunities: string, setOpportunities: (o: string) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [niche, setNiche] = useState('');
  const [useHighThinking, setUseHighThinking] = useState(false);

  const handleSearch = async () => {
    if (!niche) return;
    setIsGenerating(true);
    try {
      const result = useHighThinking 
        ? await generateContentWithThinking(`Analyze high-demand monetization opportunities for a freelancer in the ${niche} niche. Focus on high-conversion services and emerging platforms. Use search grounding.`, "You are a world-class market analyst.")
        : await findOpportunities(niche);
      setOpportunities(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#141414] p-6 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Opportunity Finder</h3>
          <button 
            onClick={() => setUseHighThinking(!useHighThinking)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
              useHighThinking ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/10 text-gray-500"
            )}
          >
            <BrainCircuit className="w-4 h-4" />
            High Thinking Mode
          </button>
        </div>
        <div className="flex gap-4">
          <input 
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Enter your niche (e.g. 'AI Automation', 'Web3 Development')"
            className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSearch}
            disabled={isGenerating || !niche}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-8 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
            Find
          </button>
        </div>
      </div>

      {opportunities && (
        <div className="bg-[#141414] p-8 rounded-3xl border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-xl font-bold">Market Analysis: {niche}</h4>
          </div>
          <div className="prose prose-invert max-w-none">
            <Markdown>{opportunities}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
