import React, { useState, useEffect, useRef } from 'react';
import { shapes } from './components/Shapes';
import { generateTrial, Difficulty, TrialData } from './utils/colorGenerator';
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
    // URL de ejemplo - El usuario deberá reemplazarla con su Web App URL de Google Apps Script
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
        mode: 'no-cors', // Importante para Google Apps Script
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('Datos enviados correctamente');
    } catch (error) {
      console.error('Error al enviar datos:', error);
    }
  };

  if (screen === 'registration') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <Logo />
        <form onSubmit={handleRegister} className="mt-8 w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <h2 className="text-2xl font-bold text-center">Registro de Participante</h2>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nombre Completo</label>
            <input 
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={participant.name}
              onChange={e => setParticipant({...participant, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Edad</label>
            <input 
              required
              type="number"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={participant.age}
              onChange={e => setParticipant({...participant, age: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Sexo</label>
            <select 
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={participant.gender}
              onChange={e => setParticipant({...participant, gender: e.target.value})}
            >
              <option value="">Seleccionar...</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Otro">Otro</option>
              <option value="Prefiero no decirlo">Prefiero no decirlo</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95">
            Comenzar Registro
          </button>
        </form>
      </div>
    );
  }

  if (screen === 'instructions') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-2xl bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl">
          <h2 className="text-4xl font-black mb-6">Instrucciones</h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Se te presentarán <span className="text-blue-400 font-bold">4 objetos</span> en pantalla. <br/><br/>
            Tu tarea es identificar lo más rápido posible si los 4 son <span className="text-blue-400 font-bold">exactamente del mismo color</span> o si hay <span className="text-pink-500 font-bold">uno que sea diferente</span>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <span className="text-blue-400 font-bold block mb-1">Niveles 1-20:</span> Colores sólidos.
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <span className="text-pink-400 font-bold block mb-1">Niveles 21-30:</span> Gradientes de color.
            </div>
          </div>
          <button onClick={startExperiment} className="bg-white text-slate-950 font-black px-12 py-5 rounded-2xl text-xl hover:bg-blue-50 transition-all active:scale-95">
            ¡ENTENDIDO!
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'playing' && currentTrial) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-between p-6 text-white">
        <div className="w-full max-w-lg flex justify-between items-center bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800">
          <span className="text-slate-400 font-medium">Participante: <span className="text-white">{participant.name}</span></span>
          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold border border-blue-500/30">
            Ronda {round} / 30
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 md:gap-12 p-8 bg-slate-900/50 rounded-3xl border border-slate-800/50">
          {currentTrial.shapes.map((s, idx) => {
            const ShapeComp = shapes[s.type];
            return (
              <div key={idx} className="w-24 h-24 md:w-40 md:h-40 flex items-center justify-center">
                <ShapeComp className="w-full h-full drop-shadow-2xl" style={s.style} />
              </div>
            );
          })}
        </div>

        <div className="w-full max-w-2xl grid grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => handleResponse(true)}
            className="bg-emerald-600 hover:bg-emerald-500 p-6 rounded-2xl font-black text-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95 border-b-4 border-emerald-800"
          >
            TODOS IGUALES
          </button>
          <button 
            onClick={() => handleResponse(false)}
            className="bg-rose-600 hover:bg-rose-500 p-6 rounded-2xl font-black text-xl shadow-lg shadow-rose-900/20 transition-all active:scale-95 border-b-4 border-rose-800"
          >
            HAY UNO DIFERENTE
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'results') {
    const correctCount = results.filter(r => r.correct).length;
    const avgTime = results.reduce((acc, r) => acc + r.responseTime, 0) / results.length;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-xl w-full bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-4xl font-black mb-2">¡Completado!</h2>
          <p className="text-slate-400 mb-8">Gracias por participar en el experimento.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <span className="text-slate-400 block text-xs uppercase font-bold tracking-widest mb-1">Aciertos</span>
              <span className="text-3xl font-black text-emerald-400">{correctCount} / 30</span>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <span className="text-slate-400 block text-xs uppercase font-bold tracking-widest mb-1">Tiempo Promedio</span>
              <span className="text-3xl font-black text-blue-400">{(avgTime / 1000).toFixed(2)}s</span>
            </div>
          </div>

          <p className="text-slate-500 text-sm mb-8 italic">Los datos se están sincronizando con Google Sheets...</p>

          <button 
            onClick={() => setScreen('registration')}
            className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-xl font-bold transition-all"
          >
            Nuevo Participante
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
