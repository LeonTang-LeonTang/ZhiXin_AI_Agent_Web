import React, { useState, useEffect } from 'react';
import CompanionInput from './components/AcademyExplainer';
import StoryGallery from './components/Playground';
import Header from './components/Header';
import SettingsBar from './components/SettingsBar';
import { GuidanceContent } from './services/geminiService';
import { SoulMateIcon } from './components/icons/AcademyIcon';
import { LocalizationProvider, useLocalization, Language } from './hooks/useLocalization';

export type Theme = 'amber' | 'cool' | 'forest' | 'rose';

// --- Static assets for homepage, encoded as data URIs ---
const overwhelmedCharacterImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAATTSURBVHhe7d1NcBtFFgVR9Iq7cIe4gTsEmYBSQAmwAzqADlBC4hCdwA5wgjiBuwN3B65ADpGz2Zk9/h78fOfM3pl9k2RkXW8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQb/z1+keA/+L99U+AwL+aXz8GBG5b/gAITDf/AghMN38CCEQ3/wIIRAX/AgikBP8CCKQE/wIIpAT/Agj8t/n348cfl/8fev9k/k38eP2z8g9+/fX45eV/SgCA/zV/ftT88Uvzz8uf65+lf158AwEA/gz/Vf/N/Lv5l/qL+qf65/S7AgEA/i/5Z/Jn8w/l/8i/mX+pP5d/Jn8u/wIIfAL/Vf6L+Sflz+TfAgEA/gT+rfy7+U/KZ+Q/AgEA/g/8U/kz+Vfyl/KnAgEA/g38C/mX8jflH8g/AQIA/BP4D/IX8rfl38o/AgQA+Cfwn+W/yN+S/wYEAPgnsDfl/8bflH8r/wYEAPj/hL8l/wP+j/wr+DcAAID/Bf6V/Jv5Z/JX8G8AAAD+X8O/wX+RvzP/BgAAgH8j/zZ/I38H/g0AAID/JP82fyf/Bv4NAACA/wr/Fv4N/E3+DRAAgP8G/ib/Nn8n/wb+DRAAgH8D/zb/Jv8G/g0AAID/AP8W/g38G/g3AACAX8a/wX+D/wb+DQAA4J/C/4Z/g38D/wYAAHBP4G/C/wH/Bv4NAADgrsDfhD8B/wb+DQAA4K7C34D/An8D/wYAAHBP4T/F/wF/A/8GAAAAd+HvA/+N/wb+DQAA4K7B3wX/F/4N/BsAAADuhv8D/zb+DQAA4K7E3wT/Fv4NAADgrpD/AP8N/BsAAADuSvgt+F/wawAHAHBHwH+V/wj/FgAAcFfAf5l/hX8LAADgDsX/hP8V/jdhAAAA7gj8D/mv8m/CfwUAANwR+C/yf+T/ys+EfwUAANwR+T/yX+Q/wU+EfwUAANwR+J/wP+V/yn+Gnwj/FQAAcEfkv8h/kv8kPxX+KwAA4I7A/4b/Hf4D/FP4rwAAgDsC/yv87/D/4L/FfwUAANwR+d/hv8//Bf8t/lcAAECa8D/nP8//kP8t/lcAAECa8H/kf8//m/8t/lcAAECa8D/m/8n/lf8t/lcAAECa8D/if8r/n/8g/1f+KwAAIE343+b/yv+T/yL/V/4rAACgVfhf8v/A/5X/Jv9D/q/8VwAAQJrwv8//l/8i/0f+r/xXAABAmvB/4P/O/4//X/6f/F/5rwAAgDTxP+T/wv+D/yf/V/4rAACg9eD/yv+Z/y3/Jv9D/q/8VwAAQJrwP+J/wv+P/wP/R/6v/FcAAMCm4X/M/wP/a/7P/A/5v/JzAQAAbAj+X/zP+B/yv+T/ys8FAACwKfi/83/B/5r/A/8f/q/8XAAAANuC/0f+r/g/8f/jf8X/is8FAACwKfg/8X/I/43/K/8v/q/8XAAAANuC/w/+X/x/+f/g/8r/is8FAACwKfh/8n/O/5P/K/8X/q/8XAAAANuC/xv/N/4v/A/4f/H/is8FAACwKfgf83/h/8f/h/8D/6/8XAAAANuA/w/+J/x/+d/xP+L/1f/5BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKB7/wKjSg7G6tM2mAAAAABJRU5ErkJggg==";
const pathForwardCharacterImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAS1SURBVHhe7d1NcBxFFgVR9Ii7cIe4gTsEmYAJwASwAzoAnYAJcAI4gRPASeAE7g7cHVhASpk9O7v+HvyPOTO72U+Skdnf9hYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMC/8NfrHwH+i/fX/wQc+Ffza8DgbsvPAwHSzS8BAtPNLwEC0c2vAALSxS8BAtlFFwECqUU3AQKpRTeBAKnFNwECqUU3AQKp/Pf448flf6P3n8Sfxo+vf1D+g19/PX55+W8lAMB/m78+av74pfmn5e/1L9O/LD4IAAB/Kv5Z/YP5h/JX9a/qL+tf1T+tXhUAAOCvyp/LX5V/K/8W/qL+Vf2r+pf0ewEBAP4b/Fv5t/Bv5U/lHwECAHyE/yj/Dv4l/6T8IwABAP4D/AP5T/Kv5G/JnwgQAODvhL8pfwH/Sv6V/CMAAeBvw3+Rvzz/Q/6N/CcAAYC/DP9D/pL8G/k38Z8ABAAY/kv8G/lr8tfkPwECAPy3+U/xH+TvzH+C/wIEAPgn+G/x3+Y/xf+AvwIEAPjP8z/jv83/AP8X/AUIAHC7/P/xv+A/wf+AvwIEALhd/hP85/kv8Z/gf4A/AQIAbof/gv8F/vP8j/gH+BMgAMBt8v/gH+A/wH+C/wB/AgQAW+Q/wH+M/wn+C/wJEABsi/8F/xH+s/wX+BMgALAt/hP85/kv8p/gP8CfAAEAW+H/wX+V/wn+8/wD/AkQAGyV/wH/Mf5n/E/4H/AP4E+AANg6/wP+p/if8b/Av4AfAQJg6/xP+Z/wX+Z/wS/A3wABsFX+D/if8T/lP8//gX8BPgECYAv8f+B/yf+F/yP/e/wC/AkQAOyY/wf/E/5T/E/4P/B/4M/AnwABwLbkf8f/kv8//3v8AvwJEADYBP/H/w/+c/z3+AX4EyAAbBP+f/yf8L/nP89/gF+BPwECgG3L/w//Z/5f+T/yn+e/wC/A3wABgG3xP+Z/wv+I/xj/Sf4D/Av4DRCA1sX/lv8H/vP8j/Ev4DdAAJoW/wP+r/i/8X/AP4HfAAFoWvwv+H/xP+F/wX+C3wABaFr8H/gf8n/gP8//Av8NvAAC0LT4v/B/43/N/4//Df4DBKAp8D/m/8H/lv8t/yv+DwSgKfC/4X/O/wH/R/5X/B8IQFPgf8j/mv8f/z/87/A/IIBMhf8d/3f8j/x/+J8QQCbD/4L/Pf4P/O/xPyGAzIT/L/4n/A/4f/A/IYBMg/8d/wX+f/y/+B8QQCbB/w7/N/4f/F/4HxBAJsD/mf8f/h/87/B/IIBMg/8b/jP8h/zv8D8ggEyB/xX/d/yv+B8QQCbA/5r/Bf4P/O/wPyCAzPz/8H/N/wH/b/y/8D8ggEyE/wf+b/wv+N/xPyGAzPT/gf8t/3f8r/E/IYBMhP8r/i/8j/iv8T8hgEyE/wf+L/zv8b/hP0MAmQj/F/5v/N/wPyKAjPzP+L/xf+J/QACZDP8P/O/xv+B/RAD5//w/8H/h/4r/C/5PBCD58P/A/4r/Jf9z/J8QQLYw/1/8X/Ff8j/B/5EASDY8/w/+r/g/8X/h/8gAJBs+f/hv+L/yv+L/wv+RAP43AAAAAAA/1z+AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0J//ANsKqC28oN1hAAAAAElFTkSuQmCC";
const smileAgainCharacterImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAASdSURBVHhe7d1NcBxFFgVR9Ii7cIe4gTsEmYAJwASwAzoAnYAJcAI4gRPASeAE7g7cHVhASpk9O7v+HvyPOTO72U+Skdnf9hYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMC/8NfrHwH+i/fX/wQc+Ffza8DgbsvPAwHSzS8BAtPNLwEC0c2vAALSxS8BAtlFFwECqUU3AQKpRTeBAKnFNwECqUU3AQKp/Pf448flf6P3n8Sfxo+vf1D+g19/PX55+W8lAMB/m78+av74pfmn5e/1L9O/LD4IAAB/Kv5Z/YP5h/JX9a/qL+tf1T+tXhUAAOCvyp/LX5V/K/8W/qL+Vf2r+pf0ewEBAP4b/Fv5t/Bv5U/lHwECAHyE/yj/Dv4l/6T8IwABAP4D/AP5T/Kv5G/JnwgQAODvhL8pfwH/Sv6V/CMAAeBvw3+Rvzz/Q/6N/CcAAYC/DP9D/pL8G/k38Z8ABAAY/kv8G/lr8tfkPwECAPy3+U/xH+TvzH+C/wIEAPgn+G/x3+Y/xf+AvwIEAPjP8z/jv83/AP8X/AUIAHC7/P/xv+A/wf+AvwIEALhd/hP85/kv8Z/gf4A/AQIAbof/gv8F/vP8j/gH+BMgAMBt8v/gH+A/wH+C/wB/AgQAW+Q/wH+M/wn+C/wJEABsi/8F/xH+s/wX+BMgALAt/hP85/kv8p/gP8CfAAEAW+H/wX+V/wn+8/wD/AkQAGyV/wH/Mf5n/E/4H/AP4E+AANg6/wP+p/if8b/Av4AfAQJg6/xP+Z/wX+Z/wS/A3wABsFX+D/if8T/lP8//gX8BPgECYAv8f+B/yf+F/yP/e/wC/AkQAOyY/wf/E/5T/E/4P/B/4M/AnwABwLbkf8f/kv8//3v8AvwJEADYBP/H/w/+c/z3+AX4EyAAbBP+f/yf8L/nP89/gF+BPwECgG3L/w//Z/5f+T/yn+e/wC/A3wABgG3xP+Z/wv+I/xj/Sf4D/Av4DRCA1sX/lv8H/vP8j/Ev4DdAAJoW/wP+r/i/8X/AP4HfAAFoWvwv+H/xP+F/wX+C3wABaFr8H/gf8n/gP8//Av8NvAAC0LT4v/B/43/N/4//Df4DBKAp8D/m/8H/lv8t/yv+DwSgKfC/4X/O/wH/R/5X/B8IQFPgf8j/mv8f/z/87/A/IIBMhf8d/3f8j/x/+J8QQCbD/4L/Pf4P/O/xPyGAzIT/L/4n/A/4f/A/IYBMg/8d/wX+f/y/+B8QQCbB/w7/N/4f/F/4HxBAJsD/mf8f/h/87/B/IIBMg/8b/jP8h/zv8D8ggEyB/xX/d/yv+B8QQCbA/5r/Bf4P/O/wPyCAzPz/8H/N/wH/b/y/8D8ggEyE/wf+b/wv+N/xPyGAzPT/gf8t/3f8r/E/IYBMhP8r/i/8j/iv8T8hgEyE/wf+L/zv8b/hP0MAmQj/F/5v/N/wPyKAjPzP+L/xf+J/QACZDP8P/O/xv+B/RAD5//w/8H/h/4r/C/5PBCD58P/A/4r/Jf9z/J8QQLYw/1/8X/Ff8j/B/5EASDY8/w/+r/g/8X/h/8gAJBs+f/hv+L/yv+L/wv+RAP43AAAAAAA/1z+AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0J//ANsKqC28oN1hAAAAAElFTkSuQmCC";

// --- Homepage Icons ---
const OverwhelmedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    <path d="M15.5 8.5c-.5-1-1.5-1.5-2.5-1.5s-2 .5-2.5 1.5M8.5 8.5c-.5-1-1.5-1.5-2.5-1.5s-2 .5-2.5 1.5" stroke="currentColor" fill="none" />
    <path d="M12 14v-4" strokeDasharray="2 2" />
    <path d="M12 21.35c-1.5-1.5-2.5-3.5-2.5-5.85" stroke="currentColor" fill="none" />
    <path d="M12 21.35c1.5-1.5 2.5-3.5 2.5-5.85" stroke="currentColor" fill="none" />
  </svg>
);
const PathForwardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4.5c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v15l-5-4-4 3-4-3-5 4V4.5z"/>
    <path d="M12 11.5l-2-2 2-2 2 2-2 2z"/>
    <path d="M9 4.5v12"/>
    <path d="M15 4.5v7"/>
  </svg>
);
const SmileAgainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);
const SupportersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
);


const HomePage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { t } = useLocalization();
  return (
    <div className="text-center p-4 animate-fade-in space-y-16">
      {/* Hero Section */}
      <div>
        <SoulMateIcon className="h-24 w-24 text-amber-600 mx-auto" />
        <h1 className="text-5xl md:text-6xl font-bold text-amber-800 mt-4">{t('title')}</h1>
        <p className="text-xl text-slate-600 mt-2 max-w-2xl mx-auto">{t('tagline')}</p>
      </div>

      {/* Section 1: For Individuals */}
      <div>
        <h2 className="text-4xl font-bold text-amber-800">{t('homeSection1Title')}</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto my-12 text-left">
            <div className="bg-white/60 p-6 rounded-2xl shadow-md border border-amber-200">
                <img src={overwhelmedCharacterImg} alt={t('homeSection1Card1Alt')} className="w-32 h-32 mx-auto -mt-16" />
                <div className="flex justify-center items-center gap-2 mt-4">
                  <OverwhelmedIcon className="h-8 w-8 text-amber-700 flex-shrink-0" />
                  <h3 className="text-2xl font-bold text-amber-800">{t('homeSection1Card1Title')}</h3>
                </div>
                <p className="text-slate-600 mt-2 font-sans text-center">{t('homeSection1Card1Text')}</p>
            </div>
            <div className="bg-white/60 p-6 rounded-2xl shadow-md border border-amber-200">
                <img src={pathForwardCharacterImg} alt={t('homeSection1Card2Alt')} className="w-32 h-32 mx-auto -mt-16" />
                <div className="flex justify-center items-center gap-2 mt-4">
                  <PathForwardIcon className="h-8 w-8 text-amber-700 flex-shrink-0" />
                  <h3 className="text-2xl font-bold text-amber-800">{t('homeSection1Card2Title')}</h3>
                </div>
                <p className="text-slate-600 mt-2 font-sans text-center">{t('homeSection1Card2Text')}</p>
            </div>
            <div className="bg-white/60 p-6 rounded-2xl shadow-md border border-amber-200">
                <img src={smileAgainCharacterImg} alt={t('homeSection1Card3Alt')} className="w-32 h-32 mx-auto -mt-16" />
                <div className="flex justify-center items-center gap-2 mt-4">
                  <SmileAgainIcon className="h-8 w-8 text-amber-700 flex-shrink-0" />
                  <h3 className="text-2xl font-bold text-amber-800">{t('homeSection1Card3Title')}</h3>
                </div>
                <p className="text-slate-600 mt-2 font-sans text-center">{t('homeSection1Card3Text')}</p>
            </div>
        </div>
      </div>
      
      {/* Section 2: For Supporters */}
      <div className="bg-amber-100/70 p-8 rounded-3xl shadow-lg border border-amber-200 max-w-4xl mx-auto">
         <div className="flex justify-center items-center gap-3">
            <SupportersIcon className="h-10 w-10 text-amber-700" />
            <h2 className="text-4xl font-bold text-amber-800">{t('homeSection2Title')}</h2>
         </div>
         <p className="text-lg text-amber-700 font-bold mt-1">{t('homeSection2Subtitle')}</p>
         <p className="text-slate-600 mt-4 max-w-3xl mx-auto font-sans text-left md:text-center text-base leading-relaxed">{t('homeSection2Text')}</p>
      </div>

      <button onClick={onStart} className="px-12 py-4 bg-amber-600 text-white text-2xl font-bold rounded-full shadow-lg hover:bg-amber-700 transform hover:scale-105 transition duration-300">
          {t('startButton')}
      </button>
    </div>
  );
};


const MainApp: React.FC = () => {
  const [view, setView] = useState<'home' | 'academy' | 'playground'>('home');
  const [sharedStories, setSharedStories] = useState<GuidanceContent[]>([]);
  const [activeStory, setActiveStory] = useState<GuidanceContent | null>(null);
  const [theme, setTheme] = useState<Theme>('rose');
  
  const { language, setLanguage, t } = useLocalization();

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    document.documentElement.lang = language;
  }, [theme, language]);

  const handleShare = (story: GuidanceContent) => {
    if (sharedStories.find(s => s.id === story.id)) {
        setView('playground');
        return;
    }
    setSharedStories(prev => [story, ...prev]);
    setView('playground');
  };

  const handleSelectStory = (story: GuidanceContent) => {
    setActiveStory(story);
    setView('academy');
  };

  const handleSetView = (newView: 'academy' | 'playground') => {
    if (newView === 'academy') {
      setActiveStory(null);
    }
    setView(newView);
  }

  const handleRatingUpdate = (storyId: string, newCounts: { likes: number; dislikes: number }) => {
    setSharedStories(prevStories =>
      prevStories.map(story =>
        story.id === storyId ? { ...story, ...newCounts } : story
      )
    );
  };

  return (
    <div className="min-h-screen font-gaegu text-slate-800 flex flex-col items-center p-4 bg-amber-50 comforting-background">
      <main className="container mx-auto max-w-3xl w-full relative">
        <SettingsBar 
          theme={theme}
          onSetTheme={setTheme}
          language={language}
          onSetLanguage={setLanguage}
        />
        
        {view === 'home' ? (
          <div className="pt-20">
            <HomePage onStart={() => setView('academy')} />
          </div>
        ) : (
          <>
            <header className="text-center mb-8 pt-12 md:pt-4">
              <div className="flex justify-center items-center gap-4">
                <SoulMateIcon className="h-16 w-16 text-amber-600" />
                <div>
                  <h1 className="text-5xl md:text-6xl font-bold text-amber-800">{t('title')}</h1>
                  <p className="text-xl text-slate-600 mt-2">{t('tagline')}</p>
                </div>
              </div>
            </header>
            
            <Header activeView={view} setView={handleSetView} />

            {view === 'academy' && (
              <CompanionInput
                key={activeStory?.id || 'new'} 
                onShare={handleShare} 
                initialContent={activeStory}
                language={language}
              />
            )}
            {view === 'playground' && (
              <StoryGallery lessons={sharedStories} onSelect={handleSelectStory} onRatingUpdate={handleRatingUpdate} />
            )}
          </>
        )}

      </main>
      <footer className="text-center mt-12 text-slate-500 text-sm">
        <p>{t('footer')}</p>
      </footer>
       <style>{`
        .comforting-background {
          background-image: url("data:image/svg+xml,%3csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cstyle%3e.text { font: bold 18px 'Gaegu', cursive; opacity: 0.06; fill: %23000; } .icon { opacity: 0.06; stroke: %23000; stroke-width: 2; fill: none; }%3c/style%3e%3c/defs%3e%3ctext x='40' y='60' class='text' transform='rotate(-10 40 60)'%3eIt's okay%3c/text%3e%3cpath class='icon' d='M150 40 q 5 15 10 0 q 5 -15 10 0' stroke-width='1.5' /%3e%3ctext x='180' y='90' class='text' transform='rotate(10 180 90)'%3e你已经很努力了%3c/text%3e%3ctext x='60' y='170' class='text' transform='rotate(8 60 170)'%3eBreathe%3c/text%3e%3cpath class='icon' d='M20 150 C 40 170, 60 170, 80 150' /%3e%3ctext x='200' y='220' class='text' transform='rotate(-12 200 220)'%3e괜찮아%3c/text%3e%3cpath class='icon' d='M300 200 l5 5 l-5 5 l-5-5z M315 215 l5 5 l-5 5 l-5-5z' fill='%23000'/%3e%3ctext x='150' y='320' class='text' transform='rotate(10 150 320)'%3eÇa va aller%3c/text%3e%3ctext x='230' y='350' class='text' transform='rotate(-8 230 350)'%3e黑夜总会迎来黎明%3c/text%3e%3cpath class='icon' d='M 61,292 C 61,292 92,261 115,283 C 138,305 91,348 91,348' stroke-width='3' stroke-linecap='round' /%3e%3c/svg%3e");
          background-size: 400px;
          transition: background-color 0.5s ease;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => (
  <LocalizationProvider>
    <MainApp />
  </LocalizationProvider>
);

export default App;