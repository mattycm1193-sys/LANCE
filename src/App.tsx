import React, { useState } from 'react';
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
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { generateContent, generateImage, findOpportunities } from './services/gemini';
import { Section, CaseStudy, ProfileData, BrandingAsset } from './types';
import Markdown from 'react-markdown';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  
  // State for different features
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [brandingAssets, setBrandingAssets] = useState<BrandingAsset[]>([]);
  const [opportunities, setOpportunities] = useState<string>('');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio Builder', icon: Briefcase },
    { id: 'profile', label: 'Profile Curation', icon: UserCircle },
    { id: 'branding', label: 'Branding Studio', icon: Palette },
    { id: 'opportunities', label: 'Opportunity Finder', icon: TrendingUp },
  ];

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
        
        <div className="mt-auto p-6 border-t border-white/10">
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-4 rounded-2xl border border-indigo-500/20">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Pro Status</p>
            <p className="text-sm text-gray-300 mb-3">Your profile is 85% optimized for conversion.</p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-[85%]" />
            </div>
          </div>
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/20" />
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
              {activeSection === 'portfolio' && <PortfolioView caseStudies={caseStudies} setCaseStudies={setCaseStudies} />}
              {activeSection === 'profile' && <ProfileView profileData={profileData} setProfileData={setProfileData} />}
              {activeSection === 'branding' && <BrandingView assets={brandingAssets} setAssets={setBrandingAssets} />}
              {activeSection === 'opportunities' && <OpportunitiesView opportunities={opportunities} setOpportunities={setOpportunities} />}
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

function PortfolioView({ caseStudies, setCaseStudies }: { caseStudies: CaseStudy[], setCaseStudies: (c: CaseStudy[]) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState('');

  const handleGenerate = async () => {
    if (!input) return;
    setIsGenerating(true);
    try {
      const prompt = `Create a high-conversion freelancing case study based on this project: ${input}. 
      Format as JSON with fields: title, client, challenge, solution, results, tags (array).
      Make it professional, data-driven, and persuasive.`;
      
      const result = await generateContent(prompt, "You are a world-class conversion copywriter for freelancers.");
      const cleaned = result.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleaned);
      
      setCaseStudies([{ ...data, id: Date.now().toString() }, ...caseStudies]);
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
        <h3 className="text-lg font-bold mb-4">New Case Study</h3>
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

function ProfileView({ profileData, setProfileData }: { profileData: ProfileData | null, setProfileData: (p: ProfileData) => void }) {
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
      setProfileData(JSON.parse(cleaned));
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

function BrandingView({ assets, setAssets }: { assets: BrandingAsset[], setAssets: (a: BrandingAsset[]) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'banner' | 'profile-pic'>('banner');

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const fullPrompt = `${type === 'banner' ? 'A professional, high-end freelance profile banner for' : 'A stylized, professional profile picture for'} a freelancer who specializes in ${prompt}. Modern, clean, professional aesthetic, high resolution.`;
      const url = await generateImage(fullPrompt, type === 'banner' ? '16:9' : '1:1');
      setAssets([{ id: Date.now().toString(), type, url, prompt }, ...assets]);
      setPrompt('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#141414] p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-4">Branding Studio</h3>
        <div className="flex gap-4 mb-4">
          <button 
            onClick={() => setType('banner')}
            className={cn("flex-1 py-3 rounded-xl font-bold text-sm transition-all", type === 'banner' ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10")}
          >
            Profile Banner
          </button>
          <button 
            onClick={() => setType('profile-pic')}
            className={cn("flex-1 py-3 rounded-xl font-bold text-sm transition-all", type === 'profile-pic' ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10")}
          >
            Profile Picture
          </button>
        </div>
        <div className="space-y-4">
          <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your style (e.g. 'Minimalist Tech', 'Vibrant Creative', 'Corporate Professional')"
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Palette className="w-5 h-5" />}
            Generate Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-[#141414] rounded-3xl overflow-hidden border border-white/5 group">
            <div className={cn("relative overflow-hidden", asset.type === 'banner' ? "aspect-video" : "aspect-square")}>
              <img 
                src={asset.url} 
                alt={asset.prompt} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
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

  const handleSearch = async () => {
    if (!niche) return;
    setIsGenerating(true);
    try {
      const result = await findOpportunities(niche);
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
        <h3 className="text-lg font-bold mb-4">Opportunity Finder</h3>
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
