import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ClientHome: React.FC = () => {
  const navigate = useNavigate();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Déclenche les animations dès que le composant est monté
    setAnimated(true);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">
      
      {/* =================================================================== */}
      {/* SECTION HERO : RÉORGANISÉE ET PARFAITEMENT ÉQUILIBRÉE             */}
      {/* =================================================================== */}
      <div className="relative bg-[#112222] pt-36 pb-32 px-6 text-center flex flex-col items-center justify-center">
        
        {/* Éléments de décoration subtils avec animation de flottement */}
        <div className="absolute left-10 top-28 text-4xl opacity-10 select-none animate-bounce" style={{ animationDuration: '6s' }}>🌿</div>
        <div className="absolute right-10 top-40 text-4xl opacity-10 select-none animate-bounce" style={{ animationDuration: '5s' }}>🌿</div>

        {/* Bloc de Contenu Principal */}
        <div className="max-w-4xl mx-auto flex flex-col items-center z-10">
          
          {/* Titre Principal : Animation d'apparition fluide */}
          <h1 
            style={{ fontFamily: "'Playfair Display', serif" }}
            className={`text-3xl sm:text-5xl md:text-6xl text-white font-medium tracking-tight leading-tight transition-all duration-1000 ease-out transform ${
              animated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            Une cuisine délicieuse & <br />
            une expérience culinaire d’exception
          </h1>

          {/* Sous-titre aéré */}
          <p 
            className={`text-gray-400 text-xs sm:text-sm tracking-[0.25em] uppercase mt-6 transition-all duration-1000 delay-300 ease-out transform ${
              animated ? 'opacity-70 translate-y-0' : 'opacity-0'
            }`}
          >
            Nous servons l'harmonie et l'excellence depuis 2026.
          </p>

          {/* Bouton d'action Orange Réduit et Élégant */}
          <div 
            className={`mt-8 transition-all duration-1000 delay-500 ease-out transform ${
              animated ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <button
              onClick={() => navigate('/menu')}
              className="px-8 py-3 bg-[#D96B27] hover:bg-[#c25a1e] text-white font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Découvrir le Menu
            </button>
          </div>
        </div>

        {/* L'ASSIETTE CENTRALE : RÉDUITE ET ENTIÈREMENT VISIBLE */}
        <div 
          className={`mt-12 w-64 sm:w-80  transition-all duration-1000 delay-700 ease-out transform z-20 ${
            animated ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-90 translate-y-8'
          }`}
        >
          <img 
            src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80" 
            alt="Assiette de Sushis" 
            className="w-full h-auto object-cover rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-4 border-[#112222] transform hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION DE PRÉSENTATION DU BAS                                     */}
      {/* =================================================================== */}
      <div className="max-w-6xl mx-auto px-6 sm:px-12 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white">
        
        {/* Image secondaire harmonisée */}
        <div 
          className={`flex justify-center transition-all duration-1000 delay-900 ease-out transform ${
            animated ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}
        >
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-xl border border-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=500&q=80" 
              alt="Art culinaire" 
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

        {/* Textes de présentation */}
        <div 
          className={`space-y-5 text-left transition-all duration-1000 delay-1000 ease-out transform ${
            animated ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
        >
          <span className="text-xs font-bold tracking-[0.2em] text-[#D96B27] uppercase block">
            Éveillez Vos Sens
          </span>
          <h2 
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-2xl sm:text-4xl font-normal text-[#112222] leading-tight"
          >
            Immergez-vous dans une <br />
            authentique expérience.
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed font-light">
            Savourer la perfection culinaire — créée dans le respect de la tradition, avec des ingrédients d'une fraîcheur absolue et un amour inconditionnel du détail.
          </p>
          <div className="border-l-2 border-[#D96B27] pl-4 italic py-0.5">
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              L'art des sushis d'exception, méticuleusement façonnés par nos maîtres artisans pour une harmonie parfaite.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};