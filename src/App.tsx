import React, { useState, useRef, useMemo } from 'react';
import { shapes } from './components/Shapes';
import { generateTrial } from './utils/colorGenerator';
import type { Difficulty, TrialData } from './utils/colorGenerator';
import Logo from './components/Logo';

type Screen = 'registration' | 'instructions' | 'transition' | 'playing' | 'results';

interface ParticipantData {
  name: string;
  age: string;
  gender: string;
}

interface ResultRecord {
  difficulty: Difficulty;
  correct: boolean;
  responseTime: number;
}

function App() {
  const [screen, setScreen] = useState<Screen>('registration');
  const [participant, setParticipant] = useState<ParticipantData>({ name: '', age: '', gender: '' });
  const [currentTrial, setCurrentTrial] = useState<TrialData | null>(null);
  const [round, setRound] = useState(1);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const startTime = useRef<number>(0);

  const totalRounds = 30;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setScreen('instructions');
  };

  const startExperiment = () => {
    setRound(1);
    setResults([]);
    nextTrial(1);
    setScreen('transition');
  };

  const getCurrentDifficulty = (r: number): Difficulty => {
    if (r <= 10) return 'easy';
    if (r <= 20) return 'intermediate';
    return 'difficult';
  };

  const nextTrial = (r: number) => {
    const difficulty = getCurrentDifficulty(r);
    setCurrentTrial(generateTrial(difficulty));
    startTime.current = Date.now();
  };

  const handleResponse = (userSaysSame: boolean) => {
    const responseTime = Date.now() - startTime.current;
    const isCorrect = userSaysSame === currentTrial?.isAllSame;

    const newResult: ResultRecord = {
      difficulty: getCurrentDifficulty(round),
      correct: isCorrect,
      responseTime
    };

    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    if (round < totalRounds) {
      const nextR = round + 1;
      setRound(nextR);
      nextTrial(nextR);
      
      // Show transition screen every 10 rounds
      if (nextR === 11 || nextR === 21) {
        setScreen('transition');
      }
    } else {
      sendDataToSheets(updatedResults);
      setScreen('results');
    }
  };

  const sendDataToSheets = async (finalResults: ResultRecord[]) => {
    const SCRIPT_URL = 'https://script.google.com/macros/s/REEMPLAZAR_CON_TU_URL/exec';
    const payload = {
      nombre: participant.name,
      edad: participant.age,
      sexo: participant.gender,
      aciertos_total: finalResults.filter(r => r.correct).length,
      fecha: new Date().toLocaleString()
    };
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Error al enviar datos:', error);
    }
  };

  const renderContent = () => {
    switch (screen) {
      case 'registration':
        return (
          <div className="p-8 w-full flex flex-col items-center">
            <Logo />
            <div className="mt-6 mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-800">Hola</h2>
              <p className="text-slate-500 text-sm">Completa tus datos para empezar</p>
            </div>
            <div className="w-full space-y-4">
              <input 
                required
                placeholder="Nombre"
                className="w-full bg-white/50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                value={participant.name}
                onChange={e => setParticipant({...participant, name: e.target.value})}
              />
              <input 
                required
                type="number"
                placeholder="Edad"
                className="w-full bg-white/50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                value={participant.age}
                onChange={e => setParticipant({...participant, age: e.target.value})}
              />
              <select 
                required
                className="w-full bg-white/50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-400 outline-none transition-all text-slate-600 appearance-none"
                value={participant.gender}
                onChange={e => setParticipant({...participant, gender: e.target.value})}
              >
                <option value="">Género</option>
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no decirlo">Prefiero no decirlo</option>
              </select>
              <button 
                onClick={handleRegister}
                disabled={!participant.name || !participant.age || !participant.gender}
                className="w-full bg-gradient-to-r from-[#1a73e8] to-[#9334e6] text-white font-bold py-4 rounded-xl shadow-md hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Entrar
              </button>
            </div>
          </div>
        );

      case 'instructions':
        return (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">¿Cómo funciona?</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Verás 4 objetos. Toca el botón azul si todos son <span className="font-bold text-blue-600">iguales</span> o el botón rosa si hay <span className="font-bold text-pink-600">uno distinto</span>.
            </p>
            <button onClick={startExperiment} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              ¡Listo!
            </button>
          </div>
        );

      case 'transition':
        const diff = getCurrentDifficulty(round);
        const labels = { easy: 'FÁCIL', intermediate: 'INTERMEDIO', difficult: 'DIFÍCIL' };
        return (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="text-xs font-bold text-blue-500 mb-2 tracking-[0.3em]">PRÓXIMO NIVEL</div>
            <h2 className="text-4xl font-black mb-6 text-slate-800 tracking-tighter">{labels[diff]}</h2>
            <p className="text-slate-500 mb-10 text-sm">Estás por iniciar la ronda {round} de 30.</p>
            <button 
              onClick={() => {
                setScreen('playing');
                startTime.current = Date.now();
              }} 
              className="w-full bg-gradient-to-r from-[#1a73e8] to-[#9334e6] text-white font-bold py-5 rounded-2xl shadow-xl active:scale-95 transition-all"
            >
              CONTINUAR
            </button>
          </div>
        );

      case 'playing':
        if (!currentTrial) return null;
        return (
          <div className="w-full p-6 flex flex-col items-center justify-between min-h-[500px]">
            <div className="flex justify-between items-center w-full px-2 mb-8">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Ronda {round}/30</span>
              <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300" style={{ width: `${(round/30)*100}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-inner">
              {currentTrial.shapes.map((s, idx) => {
                const ShapeComp = shapes[s.type];
                return (
                  <div key={idx} className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
                    <ShapeComp 
                      className="w-full h-full drop-shadow-sm" 
                      style={s.style} 
                      gradientId={`grad-${round}-${idx}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-12">
              <button 
                onClick={() => handleResponse(true)}
                className="bg-blue-50 text-blue-600 border border-blue-100 p-5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-blue-100 transition-all active:scale-95"
              >
                Iguales
              </button>
              <button 
                onClick={() => handleResponse(false)}
                className="bg-pink-50 text-pink-600 border border-pink-100 p-5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-pink-100 transition-all active:scale-95"
              >
                Diferente
              </button>
            </div>
          </div>
        );

      case 'results':
        const correctCount = results.filter(r => r.correct).length;
        return (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-800">¡Terminado!</h2>
            <p className="text-slate-500 mb-8">Gracias por tu tiempo, {participant.name}.</p>
            <div className="w-full bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest block mb-1">Tu puntuación</span>
              <span className="text-4xl font-bold text-slate-800">{correctCount}<span className="text-lg text-slate-300"> / 30</span></span>
            </div>
            <button 
              onClick={() => setScreen('registration')}
              className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-95"
            >
              Nuevo intento
            </button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 md:p-8 font-sans selection:bg-purple-100">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
