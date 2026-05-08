import React, { useState, useRef } from 'react';
import { shapes } from './components/Shapes';
import { generateTrial } from './utils/colorGenerator';
import type { Difficulty, TrialData } from './utils/colorGenerator';
import Logo from './components/Logo';

type Screen = 'registration' | 'instructions' | 'playing' | 'results';

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
    setScreen('playing');
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
      setRound(round + 1);
      nextTrial(round + 1);
    } else {
      sendDataToSheets(updatedResults);
      setScreen('results');
    }
  };

  const sendDataToSheets = async (finalResults: ResultRecord[]) => {
    const SCRIPT_URL = 'https://script.google.com/macros/s/REEMPLAZAR_CON_TU_URL/exec';
    
    const correctEasy = finalResults.filter(r => r.difficulty === 'easy' && r.correct).length;
    const correctInter = finalResults.filter(r => r.difficulty === 'intermediate' && r.correct).length;
    const correctDiff = finalResults.filter(r => r.difficulty === 'difficult' && r.correct).length;
    const avgTime = finalResults.reduce((acc, r) => acc + r.responseTime, 0) / finalResults.length;

    const payload = {
      nombre: participant.name,
      edad: participant.age,
      sexo: participant.gender,
      aciertos_facil: correctEasy,
      aciertos_intermedio: correctInter,
      aciertos_dificil: correctDiff,
      aciertos_total: finalResults.filter(r => r.correct).length,
      tiempo_promedio_ms: avgTime.toFixed(2),
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

  if (screen === 'registration') {
    return (
      <div className="min-h-screen bg-[#FBFBFC] flex flex-col items-center justify-center p-6 text-slate-800 font-sans">
        <Logo />
        <form onSubmit={handleRegister} className="mt-12 w-full max-w-sm bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Bienvenido</h2>
            <p className="text-sm text-slate-400">Ingresa tus datos para comenzar</p>
          </div>
          <div className="space-y-4">
            <div>
              <input 
                required
                placeholder="Nombre completo"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300"
                value={participant.name}
                onChange={e => setParticipant({...participant, name: e.target.value})}
              />
            </div>
            <div>
              <input 
                required
                type="number"
                placeholder="Edad"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300"
                value={participant.age}
                onChange={e => setParticipant({...participant, age: e.target.value})}
              />
            </div>
            <div>
              <select 
                required
                className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-400"
                value={participant.gender}
                onChange={e => setParticipant({...participant, gender: e.target.value})}
              >
                <option value="">Selecciona tu sexo</option>
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no decirlo">Prefiero no decirlo</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium py-4 rounded-2xl shadow-sm transition-all active:scale-95">
            Comenzar
          </button>
        </form>
      </div>
    );
  }

  if (screen === 'instructions') {
    return (
      <div className="min-h-screen bg-[#FBFBFC] flex flex-col items-center justify-center p-6 text-slate-800 text-center font-sans">
        <div className="max-w-lg w-full bg-white p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-3xl font-semibold mb-6 tracking-tight">Cómo jugar</h2>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed font-light">
            Observa los 4 objetos. <br/>
            ¿Son todos del <span className="font-semibold text-slate-800 underline decoration-blue-200 underline-offset-4">mismo color</span> o hay uno diferente?
          </p>
          <button onClick={startExperiment} className="w-full bg-slate-900 text-white font-medium px-12 py-5 rounded-2xl text-lg hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
            Entendido
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'playing' && currentTrial) {
    return (
      <div className="min-h-screen bg-[#FBFBFC] flex flex-col items-center justify-between py-12 px-6 text-slate-800 font-sans">
        <div className="w-full max-w-sm flex flex-col items-center space-y-4">
          <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm border border-slate-100 flex items-center space-y-0 space-x-3">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Ronda {round} de 30</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:gap-16 p-12 bg-white rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.03)] border border-slate-50 transition-all">
          {currentTrial.shapes.map((s, idx) => {
            const ShapeComp = shapes[s.type];
            return (
              <div key={idx} className="w-24 h-24 md:w-36 md:h-36 flex items-center justify-center transition-transform hover:scale-105 duration-500">
                <ShapeComp className="w-full h-full drop-shadow-[0_10px_10px_rgba(0,0,0,0.05)]" style={s.style} />
              </div>
            );
          })}
        </div>

        <div className="w-full max-w-md grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleResponse(true)}
            className="bg-[#E8F1FF] text-[#0066FF] hover:bg-[#D8E8FF] p-7 rounded-[2rem] font-semibold text-sm transition-all active:scale-95 border border-blue-100/50"
          >
            TODOS IGUALES
          </button>
          <button 
            onClick={() => handleResponse(false)}
            className="bg-[#FFF0F3] text-[#FF4D6D] hover:bg-[#FFE5EB] p-7 rounded-[2rem] font-semibold text-sm transition-all active:scale-95 border border-rose-100/50"
          >
            HAY UN DIFERENTE
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'results') {
    const correctCount = results.filter(r => r.correct).length;
    const avgTime = results.reduce((acc, r) => acc + r.responseTime, 0) / results.length;

    return (
      <div className="min-h-screen bg-[#FBFBFC] flex flex-col items-center justify-center p-6 text-slate-800 text-center font-sans">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-3xl font-semibold mb-2 tracking-tight">Finalizado</h2>
          <p className="text-slate-400 mb-10 font-light">Gracias por tu participación, {participant.name}.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-widest mb-2">Aciertos</span>
              <span className="text-3xl font-light text-slate-800">{correctCount}<span className="text-sm text-slate-300 ml-1">/ 30</span></span>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-widest mb-2">Tiempo</span>
              <span className="text-3xl font-light text-slate-800">{(avgTime / 1000).toFixed(2)}<span className="text-sm text-slate-300 ml-1">s</span></span>
            </div>
          </div>

          <button 
            onClick={() => setScreen('registration')}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-medium transition-all hover:bg-slate-800"
          >
            Nuevo participante
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
