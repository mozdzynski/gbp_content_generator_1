import { useState, FormEvent } from "react";
import { 
  Globe, 
  Sparkles, 
  Layout, 
  Image as ImageIcon, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  generatePostTitles, 
  generatePostContent, 
  generatePostImage, 
  GBPPostProposal, 
  GBPPostContent 
} from "./services/geminiService";

export default function App() {
  const [url, setUrl] = useState("");
  const [serviceOrProduct, setServiceOrProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: URL, 2: Titles, 3: Content & Image
  
  const [proposals, setProposals] = useState<GBPPostProposal[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [finalContent, setFinalContent] = useState<GBPPostContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState<GBPPostContent | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [customImagePrompt, setCustomImagePrompt] = useState("");

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    try {
      const titles = await generatePostTitles(url, serviceOrProduct);
      setProposals(titles);
      setStep(2);
    } catch (error) {
      console.error(error);
      alert("Wystąpił błąd podczas analizy strony.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTitle = async (title: string) => {
    setSelectedTitle(title);
    setLoading(true);
    setStep(3);
    
    try {
      const content = await generatePostContent(url, title, serviceOrProduct);
      setFinalContent(content);
      setEditableContent(content);
      
      // Automatically start image generation
      setImageLoading(true);
      const image = await generatePostImage(content.body);
      setGeneratedImage(image);
    } catch (error) {
      console.error(error);
      alert("Wystąpił błąd podczas generowania treści.");
    } finally {
      setLoading(false);
      setImageLoading(false);
    }
  };

  const handleRegenerateImage = async () => {
    if (!finalContent) return;
    setImageLoading(true);
    try {
      const image = await generatePostImage(finalContent.body, customImagePrompt);
      setGeneratedImage(image);
    } catch (error) {
      console.error(error);
      alert("Wystąpił błąd podczas generowania grafiki.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleSaveEdit = () => {
    if (editableContent) {
      setFinalContent(editableContent);
      setIsEditing(false);
    }
  };

  const reset = () => {
    setStep(1);
    setUrl("");
    setProposals([]);
    setSelectedTitle(null);
    setFinalContent(null);
    setGeneratedImage(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center py-12 px-4">
      <header className="max-w-3xl w-full text-center mb-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4"
        >
          <Sparkles size={16} />
          <span>AI Content Generator for GBP</span>
        </motion.div>
        <h1 className="text-5xl font-display font-bold tracking-tight text-neutral-900 mb-4">
          Wizytówka GBP w kilka sekund
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-6">
          Wklej adres swojej strony www, a my przygotujemy profesjonalne wpisy do Twojej wizytówki Google wraz z realistycznymi grafikami.
        </p>
        <button
          onClick={async () => {
            await window.aistudio.openSelectKey();
          }}
          className="text-sm bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-full hover:bg-neutral-100 transition-all"
        >
          Ustaw/Zmień klucz API Gemini
        </button>
      </header>

      <main className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100"
            >
              <form onSubmit={handleAnalyze} className="space-y-6">
                <div>
                  <label htmlFor="url" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Adres strony internetowej
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                      <Globe size={20} />
                    </div>
                    <input
                      type="url"
                      id="url"
                      required
                      placeholder="https://twojafirma.pl"
                      className="block w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="serviceOrProduct" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Usługa lub produkt (opcjonalnie)
                  </label>
                  <input
                    type="text"
                    id="serviceOrProduct"
                    placeholder="np. serwis rowerów, sprzedaż części"
                    className="block w-full px-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg"
                    value={serviceOrProduct}
                    onChange={(e) => setServiceOrProduct(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !url}
                  className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Analizowanie treści...
                    </>
                  ) : (
                    <>
                      Generuj propozycje
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-display font-bold text-neutral-900">Wybierz temat wpisu</h2>
                <button 
                  onClick={() => setStep(1)}
                  className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Zmień URL
                </button>
              </div>
              <div className="grid gap-4">
                {proposals.map((proposal, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectTitle(proposal.title)}
                    className="text-left p-6 bg-white rounded-2xl border border-neutral-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-emerald-700 transition-colors">
                          {proposal.title}
                        </h3>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                          {proposal.reasoning}
                        </p>
                      </div>
                      <div className="p-2 rounded-full bg-neutral-50 text-neutral-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Content Preview */}
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                      <Layout size={18} />
                      <span>Podgląd wpisu GBP</span>
                    </div>
                    {!loading && finalContent && !isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edytuj
                      </button>
                    )}
                  </div>
                  
                  {loading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-8 bg-neutral-100 rounded-lg w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-neutral-100 rounded-lg"></div>
                        <div className="h-4 bg-neutral-100 rounded-lg"></div>
                        <div className="h-4 bg-neutral-100 rounded-lg w-5/6"></div>
                      </div>
                      <div className="h-12 bg-neutral-100 rounded-xl w-1/2 mt-8"></div>
                    </div>
                  ) : finalContent && editableContent && (
                    isEditing ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editableContent.title}
                          onChange={(e) => setEditableContent({...editableContent, title: e.target.value})}
                          className="w-full text-2xl font-bold text-neutral-900 p-2 border border-neutral-300 rounded-lg"
                        />
                        <textarea
                          value={editableContent.body}
                          onChange={(e) => setEditableContent({...editableContent, body: e.target.value})}
                          className="w-full text-neutral-600 leading-relaxed p-2 border border-neutral-300 rounded-lg h-40"
                        />
                        <input
                          type="text"
                          value={editableContent.callToAction}
                          onChange={(e) => setEditableContent({...editableContent, callToAction: e.target.value})}
                          className="w-full text-neutral-900 p-2 border border-neutral-300 rounded-lg"
                        />
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={handleSaveEdit}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold"
                          >
                            Zapisz
                          </button>
                          <button 
                            onClick={() => {
                              setEditableContent(finalContent);
                              setIsEditing(false);
                            }}
                            className="px-6 py-2 bg-neutral-200 text-neutral-700 rounded-lg font-semibold"
                          >
                            Anuluj
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-neutral-900">{finalContent.title}</h3>
                        <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                          {finalContent.body}
                        </p>
                        <div className="pt-4 flex gap-3">
                          <div className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md">
                            {finalContent.callToAction}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                              className="p-3 bg-neutral-100 rounded-lg hover:bg-neutral-200 text-neutral-600"
                              title="Udostępnij na Facebooku"
                            >
                              <Facebook size={20} />
                            </button>
                            <button 
                              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(finalContent.body)}`, '_blank')}
                              className="p-3 bg-neutral-100 rounded-lg hover:bg-neutral-200 text-neutral-600"
                              title="Udostępnij na X"
                            >
                              <Twitter size={20} />
                            </button>
                            <button 
                              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                              className="p-3 bg-neutral-100 rounded-lg hover:bg-neutral-200 text-neutral-600"
                              title="Udostępnij na LinkedIn"
                            >
                              <Linkedin size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <button
                  onClick={() => {
                    setStep(2);
                    setFinalContent(null);
                    setEditableContent(null);
                    setGeneratedImage(null);
                    setSelectedTitle(null);
                  }}
                  className="w-full py-4 rounded-2xl border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-100 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Powrót do listy tytułów
                </button>
                <button
                  onClick={reset}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-neutral-300 text-neutral-500 font-medium hover:border-neutral-400 hover:text-neutral-600 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Zacznij od nowa
                </button>
              </div>

              {/* Image Preview */}
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-6">
                    <ImageIcon size={18} />
                    <span>Grafika do wpisu (4:3)</span>
                  </div>

                  <div className="aspect-[4/3] bg-neutral-100 rounded-2xl overflow-hidden relative group">
                    {imageLoading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-50">
                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                        <span className="text-sm font-medium text-neutral-500">Generowanie realistycznej grafiki...</span>
                      </div>
                    ) : generatedImage ? (
                      <>
                        <img 
                          src={generatedImage} 
                          alt="Generated GBP content" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a 
                            href={generatedImage} 
                            download="gbp-post.png"
                            className="bg-white text-neutral-900 px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
                          >
                            Pobierz obraz
                          </a>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                        <ImageIcon size={48} strokeWidth={1} />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="text-emerald-500 mt-0.5" size={18} />
                      <p className="text-sm text-neutral-600">
                        Grafika została wygenerowana w formacie 4:3, idealnym dla wizytówek Google Business Profile. Styl jest realistyczny i profesjonalny.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="customImagePrompt" className="block text-sm font-semibold text-neutral-700">
                        Własny opis grafiki (opcjonalnie)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="customImagePrompt"
                          placeholder="np. zdjęcie wnętrza kawiarni w stylu loft"
                          className="flex-grow px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                          value={customImagePrompt}
                          onChange={(e) => setCustomImagePrompt(e.target.value)}
                        />
                        <button
                          onClick={handleRegenerateImage}
                          disabled={imageLoading}
                          className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-all disabled:opacity-50"
                        >
                          {imageLoading ? <Loader2 className="animate-spin" size={16} /> : "Generuj ponownie"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 text-neutral-400 text-sm flex items-center gap-4">
        <span>Powered by Gemini AI</span>
        <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
        <a href="#" className="hover:text-neutral-600 flex items-center gap-1">
          Dokumentacja GBP <ExternalLink size={12} />
        </a>
      </footer>
    </div>
  );
}
