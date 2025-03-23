import React, { useState, useEffect, useCallback } from 'react';
import { 
  Heart, 
  Apple, 
  Fish, 
  Cake,
  Calculator,
  Trophy,
  Pause,
  Play,
  Home,
  Check,
  Delete,
  Star,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Howl } from 'howler';

type GameState = 'start' | 'playing' | 'paused';
type Problem = {
  a: number;
  b: number;
  operator: string;
  answer: number;
  explanation?: string;
};

type DragonMood = 'hungry' | 'happy' | 'sad' | 'super-happy';

const sounds = {
  correct: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'] }),
  wrong: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3'] }),
  levelUp: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3'] }),
  click: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'] })
};

function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [level, setLevel] = useState(() => Number(localStorage.getItem('level')) || 1);
  const [coins, setCoins] = useState(() => Number(localStorage.getItem('coins')) || 0);
  const [streak, setStreak] = useState(0);
  const [answer, setAnswer] = useState('');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [dragonMood, setDragonMood] = useState<DragonMood>('hungry');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showReward, setShowReward] = useState(false);

  const playSound = (soundName: keyof typeof sounds) => {
    if (soundEnabled) {
      sounds[soundName].play();
    }
  };

  const generateProblem = (level: number): Problem => {
    let a: number, b: number, operator: string, answer: number, explanation: string;

    const operations = {
      1: ['+'],
      2: ['+', '-'],
      3: ['+', '-', '×'],
      4: ['+', '-', '×', '÷']
    };

    const availableOps = operations[level as keyof typeof operations] || operations[1];
    operator = availableOps[Math.floor(Math.random() * availableOps.length)];

    switch (operator) {
      case '+':
        if (level === 1) {
          a = Math.floor(Math.random() * 8) + 1;
          b = Math.floor(Math.random() * (10 - a)) + 1;
        } else {
          a = Math.floor(Math.random() * 50) + 1;
          b = Math.floor(Math.random() * 50) + 1;
        }
        answer = a + b;
        explanation = `Add ${a} and ${b}`;
        break;
      case '-':
        if (level === 2) {
          a = Math.floor(Math.random() * 10) + 10;
          b = Math.floor(Math.random() * (a - 5)) + 5;
        } else {
          a = Math.floor(Math.random() * 100) + 1;
          b = Math.floor(Math.random() * a) + 1;
        }
        answer = a - b;
        explanation = `Subtract ${b} from ${a}`;
        break;
      case '×':
        if (level === 3) {
          a = Math.floor(Math.random() * 8) + 2;
          b = Math.floor(Math.random() * 8) + 2;
        } else {
          a = Math.floor(Math.random() * 12) + 1;
          b = Math.floor(Math.random() * 12) + 1;
        }
        answer = a * b;
        explanation = `Multiply ${a} by ${b}`;
        break;
      case '÷':
        b = Math.floor(Math.random() * 8) + 2;
        answer = Math.floor(Math.random() * 8) + 2;
        a = b * answer;
        explanation = `Divide ${a} by ${b}`;
        break;
      default:
        return generateProblem(1);
    }

    return { a, b, operator, answer, explanation };
  };

  useEffect(() => {
    localStorage.setItem('level', level.toString());
  }, [level]);

  useEffect(() => {
    localStorage.setItem('coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    if (gameState === 'playing' && !problem) {
      setProblem(generateProblem(level));
    }
  }, [gameState, level, problem]);

  const handleNumberClick = (num: number) => {
    playSound('click');
    if (answer.length < 3) {
      setAnswer(prev => prev + num);
    }
  };

  const handleDelete = () => {
    playSound('click');
    setAnswer(prev => prev.slice(0, -1));
  };

  const showSpecialReward = () => {
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);
  };

  const handleCheck = () => {
    if (!problem || !answer) return;

    const isAnswerCorrect = parseInt(answer) === problem.answer;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      playSound('correct');
      setDragonMood('happy');
      setCombo(prev => prev + 1);
      
      let reward = 1;
      if (combo >= 5) reward += 2;
      if (combo >= 10) {
        reward += 3;
        showSpecialReward();
        setDragonMood('super-happy');
      }
      
      setCoins(prev => prev + reward);
      setStreak(prev => prev + 1);
      
      if (streak === 2) {
        playSound('levelUp');
        setLevel(prev => Math.min(prev + 1, 4));
        setStreak(0);
      }
    } else {
      playSound('wrong');
      setDragonMood('sad');
      setStreak(0);
      setCombo(0);
      if (level > 1 && streak === 0) {
        setLevel(prev => prev - 1);
      }
    }

    setTimeout(() => {
      setAnswer('');
      setProblem(generateProblem(level));
      setIsCorrect(null);
      setDragonMood('hungry');
    }, 1500);
  };

  const renderDragon = () => {
    const baseClasses = "w-64 h-64 transition-transform duration-300";
    const moodClasses = {
      'hungry': "text-orange-500 animate-bounce",
      'happy': "text-green-500 scale-110 animate-pulse",
      'sad': "text-blue-500 scale-95",
      'super-happy': "text-yellow-500 scale-125 animate-bounce"
    };

    const dragonImages = {
      'hungry': "/dragon_math/images/Dragon.png",
      'happy': "/dragon_math/images/HappyDragon.png",
      'sad': "/dragon_math/images/SadDragon.png",
      'super-happy': "/dragon_math/images/SuperHappyDragon.png"
    };

    return (
      <div className={`${baseClasses} ${moodClasses[dragonMood]} relative group`}>
        <img 
          src={dragonImages[dragonMood]}
          alt="Cute Dragon"
          className="w-full h-full object-contain rounded-2xl shadow-xl transform transition-all duration-300 group-hover:scale-105"
        />
        <div className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg">
          {dragonMood === 'hungry' && <Apple className="w-5 h-5 text-red-500 animate-pulse" />}
          {dragonMood === 'happy' && <Heart className="w-5 h-5 text-pink-500 animate-bounce" />}
          {dragonMood === 'sad' && <Fish className="w-5 h-5 text-blue-500 animate-wiggle" />}
          {dragonMood === 'super-happy' && <Cake className="w-5 h-5 text-purple-500 animate-spin" />}
        </div>
      </div>
    );
  };

  const renderKeypad = () => (
    <div className="grid grid-cols-3 gap-1.5 w-full max-w-xs">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
        <button
          key={num}
          onClick={() => handleNumberClick(num)}
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
        >
          {num}
        </button>
      ))}
      <button
        onClick={handleDelete}
        className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center"
      >
        <Delete className="w-5 h-5" />
      </button>
      <button
        onClick={handleCheck}
        className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center"
      >
        <Check className="w-5 h-5" />
      </button>
    </div>
  );

  if (gameState === 'start') {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-sky-400 via-sky-300 to-sky-200 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-4 animate-fade-in">
          <h1 className="text-4xl font-bold text-blue-800 mb-2 drop-shadow-lg">Math Dragon</h1>
          <p className="text-lg text-blue-700">Help the hungry dragon solve math problems!</p>
        </div>
        <div className="transform hover:scale-105 transition-transform duration-300">
          {renderDragon()}
        </div>
        <div className="flex flex-col gap-3 items-center mt-4">
          <button
            onClick={() => {
              setSoundEnabled(true);
              setGameState('playing');
              playSound('click');
            }}
            className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95"
          >
            Start Game
          </button>
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-sm">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'paused') {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-sky-400 via-sky-300 to-sky-200 flex flex-col items-center justify-center p-4">
        <div className="bg-white/90 p-6 rounded-xl shadow-2xl backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Game Paused</h2>
          <div className="space-y-3">
            <button
              onClick={() => {
                setGameState('playing');
                playSound('click');
              }}
              className="w-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> Continue
            </button>
            <button
              onClick={() => {
                setGameState('start');
                playSound('click');
              }}
              className="w-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" /> Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-sky-400 via-sky-300 to-sky-200 flex flex-col items-center p-2">
      <div className="w-full max-w-6xl h-full flex flex-col">
        <div className="flex justify-between items-center mb-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 p-1.5 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-lg font-bold text-yellow-700">{coins}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <Calculator className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-lg font-bold text-blue-700">Level {level}</span>
            {combo >= 3 && (
              <div className="flex items-center gap-1 bg-orange-100 py-1 px-2 rounded-lg">
                <Star className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-700">x{combo}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setGameState('paused');
              playSound('click');
            }}
            className="bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-colors"
          >
            <Pause className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="flex-1 flex gap-4 items-center justify-center">
          <div className="flex-shrink-0">
            {renderDragon()}
          </div>

          <div className="flex flex-col items-center gap-4 bg-white/90 p-6 rounded-xl shadow-2xl backdrop-blur-sm">
            {problem && (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-800 mb-3">
                  {problem.a} {problem.operator} {problem.b} = ?
                </div>
                <input
                  type="text"
                  value={answer}
                  readOnly
                  className="w-28 text-3xl text-center bg-white rounded-lg py-1.5 px-3 shadow-lg mb-3"
                  placeholder="?"
                />
                {isCorrect !== null && (
                  <div className={`text-lg font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'} animate-fade-in`}>
                    {isCorrect ? 'Correct! 🎉' : `Oops! The answer is ${problem.answer}`}
                    <div className="text-sm mt-1 text-gray-600">{problem.explanation}</div>
                  </div>
                )}
              </div>
            )}

            {renderKeypad()}
          </div>
        </div>

        {showReward && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-bounce text-7xl filter drop-shadow-lg">🌟</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;