import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share, X, PlusSquare, Smartphone } from 'lucide-react';

export const PWAInstall: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isStandalone) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show iOS tip after 3 seconds if on iOS and not standalone
    if (isIOS) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      setShowIOSTip(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 z-50 flex justify-center"
          >
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 max-w-md w-full border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Instalar App</p>
                  <p className="text-xs text-slate-400">Acesse offline e mais rápido</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleInstall}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  Instalar
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIOSTip && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl"
            >
              <button
                onClick={() => setShowIOSTip(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Share className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-syne">Instalar no iOS</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  Siga os passos abaixo para adicionar o app à sua tela de início:
                </p>

                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-xs font-bold text-slate-600">1</div>
                    <p className="text-sm text-slate-700">Toque no ícone de <strong>Compartilhar</strong> na barra inferior.</p>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-xs font-bold text-slate-600">2</div>
                    <p className="text-sm text-slate-700">Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</p>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-xs font-bold text-slate-600">3</div>
                    <p className="text-sm text-slate-700">Toque em <strong>Adicionar</strong> no canto superior direito.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSTip(false)}
                  className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
