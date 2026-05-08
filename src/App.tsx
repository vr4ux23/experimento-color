import React, { useState, useRef } from 'react';
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
    const isCorrect = userSaysSame === (currentTrial?.isAllSame ?? false);

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
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Hola</h2>
              <p className="text-slate-500 text-sm mt-1">Ingresa tus datos para empezar</p>
            </div>
            <div className="w-full space-y-4">
              <input 
                required
                placeholder="Nombre completo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                value={participant.name}
                onChange={e => setParticipant({...participant, name: e.target.value})}
              />
              <input 
                required
                type="number"
                placeholder="Edad"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                value={participant.age}
                onChange={e => setParticipant({...participant, age: e.target.value})}
              />
              <select 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-400 outline-none transition-all text-slate-600"
                value={participant.gender}
                onChange={e => setParticipant({...participant, gender: e.target.value})}
              >
                <option value="">Selecciona tu sexo</option>
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
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800 tracking-tight">¿Cómo funciona?</h2>
            <p className="text-slate-600 mb-8 leading-relaxed text-sm px-4">
              Verás 4 objetos. Toca <span className="font-bold text-blue-600 uppercase">Iguales</span> si todos son del mismo color o <span className="font-bold text-pink-600 uppercase">Diferente</span> si hay uno distinto.
            </p>
            <button onClick={startExperiment} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              ¡Entendido!
            </button>
          </div>
        );

      case 'transition':
        const diff = getCurrentDifficulty(round);
        const labels = { easy: 'FÁCIL', intermediate: 'INTERMEDIO', difficult: 'DIFÍCIL' };
        return (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="text-[10px] font-bold text-blue-500 mb-2 tracking-[0.3em] uppercase opacity-70">Siguiente Nivel</div>
            <h2 className="text-4xl font-black mb-6 text-slate-800 tracking-tighter uppercase">{labels[diff]}</h2>
            <p className="text-slate-400 mb-10 text-xs italic">Prepárate para las próximas 10 rondas.</p>
            <button 
              onClick={() => {
                setScreen('playing');
                startTime.current = Date.now();
              }} 
              className="w-full bg-gradient-to-r from-[#1a73e8] to-[#9334e6] text-white font-bold py-4 rounded-xl shadow-xl active:scale-95 transition-all uppercase tracking-widest"
            >
              Comenzar
            </button>
          </div>
        );

      case 'playing':
        if (!currentTrial) return null;
        return (
          <div className="w-full p-6 flex flex-col items-center justify-between min-h-[500px]">
            <div className="flex justify-between items-center w-full mb-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1 rounded-full shadow-sm">RONDA {round}/30</span>
              <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300" style={{ width: `${(round/30)*100}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner w-full aspect-square max-w-[260px]">
              {currentTrial.shapes.map((s, idx) => {
                const ShapeComp = shapes[s.type];
                return (
                  <div key={idx} className="flex items-center justify-center">
                    <ShapeComp 
                      className="w-full h-full drop-shadow-md" 
                      style={s.style} 
                      gradientId={`grad-${round}-${idx}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-10">
              <button 
                onClick={() => handleResponse(true)}
                className="bg-blue-50 text-blue-600 border border-blue-100/50 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all active:scale-95"
              >
                Iguales
              </button>
              <button 
                onClick={() => handleResponse(false)}
                className="bg-pink-50 text-pink-600 border border-pink-100/50 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-pink-100 transition-all active:scale-95"
              >
                Diferente
              </button>
            </div>
          </div>
        );

      case 'results':
        const correctCount = results.filter(r => r.correct).length;
        return (
          <div className="p-10 text-center flex flex-col items-center w-full">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-emerald-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-800 tracking-tight text-center">¡Misión Cumplida!</h2>
            <p className="text-slate-400 mb-8 text-sm">Has terminado el experimento.</p>
            <div className="w-full bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100 shadow-inner">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Puntuación</span>
              <span className="text-5xl font-black text-slate-800 tracking-tighter">{correctCount}<span className="text-xl text-slate-300 ml-1">/ 30</span></span>
            </div>
            <button 
              onClick={() => setScreen('registration')}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
            >
              Nuevo Participante
            </button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-[450px] bg-white rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.06)] border border-white flex flex-col items-center overflow-hidden z-10 mx-auto">
      {renderContent()}
    </div>
  );
}

export default App;
