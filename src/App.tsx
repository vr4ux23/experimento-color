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
          <div className="p-10 w-full flex flex-col items-center">
            <Logo />
            <div className="mt-8 mb-10 text-center">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Hola</h2>
              <p className="text-slate-500 text-base mt-2">Completa tus datos para empezar</p>
            </div>
            <div className="w-full space-y-5">
              <input 
                required
                placeholder="Nombre completo"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 focus:ring-2 focus:ring-blue-400 outline-none transition-all text-lg"
                value={participant.name}
                onChange={e => setParticipant({...participant, name: e.target.value})}
              />
              <input 
                required
                type="number"
                placeholder="Edad"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 focus:ring-2 focus:ring-blue-400 outline-none transition-all text-lg"
                value={participant.age}
                onChange={e => setParticipant({...participant, age: e.target.value})}
              />
              <select 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 focus:ring-2 focus:ring-blue-400 outline-none transition-all text-slate-600 text-lg"
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
                className="w-full bg-gradient-to-r from-[#1a73e8] to-[#9334e6] text-white font-bold py-5 rounded-2xl shadow-md hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 text-xl"
              >
                Entrar
              </button>
            </div>
          </div>
        );

      case 'instructions':
        return (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-3xl font-bold mb-6 text-slate-800 tracking-tight">¿Cómo funciona?</h2>
            <p className="text-slate-600 text-xl mb-10 leading-relaxed font-light">
              Verás 4 objetos. Toca <span className="font-bold text-blue-600">IGUALES</span> si todos son del mismo color o <span className="font-bold text-pink-600">DIFERENTE</span> si hay uno distinto.
            </p>
            <button onClick={startExperiment} className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 text-xl">
              ¡Entendido!
            </button>
          </div>
        );

      case 'transition':
        const diff = getCurrentDifficulty(round);
        const labels = { easy: 'FÁCIL', intermediate: 'INTERMEDIO', difficult: 'DIFÍCIL' };
        return (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="text-sm font-black text-blue-500 mb-3 tracking-[0.4em] uppercase">Siguiente Nivel</div>
            <h2 className="text-5xl font-black mb-8 text-slate-800 tracking-tighter uppercase">{labels[diff]}</h2>
            <p className="text-slate-500 mb-12 text-lg font-light italic text-pretty">Prepárate para las próximas 10 rondas.</p>
            <button 
              onClick={() => {
                setScreen('playing');
                startTime.current = Date.now();
              }} 
              className="w-full bg-gradient-to-r from-[#1a73e8] to-[#9334e6] text-white font-black py-6 rounded-[2rem] shadow-2xl active:scale-95 transition-all text-2xl tracking-widest"
            >
              COMENZAR
            </button>
          </div>
        );

      case 'playing':
        if (!currentTrial) return null;
        return (
          <div className="w-full p-10 flex flex-col items-center justify-between min-h-[580px]">
            <div className="flex justify-between items-center w-full mb-10">
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 px-4 py-2 rounded-full">RONDA {round}/30</span>
              <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300" style={{ width: `${(round/30)*100}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10 p-10 bg-slate-50 rounded-[4rem] border border-slate-100 shadow-inner w-full aspect-square">
              {currentTrial.shapes.map((s, idx) => {
                const ShapeComp = shapes[s.type];
                return (
                  <div key={idx} className="flex items-center justify-center transform transition-transform hover:scale-110 duration-300">
                    <ShapeComp 
                      className="w-full h-full drop-shadow-lg" 
                      style={s.style} 
                      gradientId={`grad-${round}-${idx}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="w-full grid grid-cols-2 gap-5 mt-14">
              <button 
                onClick={() => handleResponse(true)}
                className="bg-blue-50 text-blue-600 border-2 border-blue-100 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-100 transition-all active:scale-95 shadow-sm"
              >
                Iguales
              </button>
              <button 
                onClick={() => handleResponse(false)}
                className="bg-pink-50 text-pink-600 border-2 border-pink-100 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-pink-100 transition-all active:scale-95 shadow-sm"
              >
                Diferente
              </button>
            </div>
          </div>
        );

      case 'results':
        const correctCount = results.filter(r => r.correct).length;
        return (
          <div className="p-12 text-center flex flex-col items-center w-full">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border border-emerald-100">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-slate-800 tracking-tight">¡Misión Cumplida!</h2>
            <p className="text-slate-500 mb-10 text-lg">Has completado el experimento con éxito.</p>
            <div className="w-full bg-slate-50 p-8 rounded-[3rem] mb-10 border border-slate-100 shadow-inner">
              <span className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] block mb-2">PUNTUACIÓN TOTAL</span>
              <span className="text-6xl font-black text-slate-800 tracking-tighter">{correctCount}<span className="text-2xl text-slate-300 ml-1">/ 30</span></span>
            </div>
            <button 
              onClick={() => setScreen('registration')}
              className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-bold text-xl shadow-xl hover:bg-slate-800 transition-all active:scale-95"
            >
              Nuevo Participante
            </button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-[500px] bg-white rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.08)] border border-white flex flex-col items-center overflow-hidden z-10 mx-auto transform scale-[1.05] md:scale-110">
      {renderContent()}
    </div>
  );
}

export default App;
