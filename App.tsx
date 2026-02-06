
import React, { useState, useEffect } from 'react';
import { StudentLevel, DifficultyLevel, FeedbackType, AppState, QuizData } from './types';
import { generateQuiz } from './geminiService';
import { 
  BookOpenIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  RefreshIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  XIcon,
  AcademicCapIcon
} from './components/Icons';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: 'setup',
    level: StudentLevel.MIDDLE,
    difficulty: DifficultyLevel.BEGINNER,
    feedbackType: 'immediate',
    chapter: 1,
    sourceType: 'reference',
    content: '',
    images: [],
    quiz: null,
    score: 0,
    userAnswers: []
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleStartStudy = async (isRetry = false) => {
    setError(null);
    setState(prev => ({ ...prev, step: 'loading' }));

    try {
      const quiz = await generateQuiz(state.level, state.difficulty, state.chapter);
      setState(prev => ({ 
        ...prev, 
        step: 'quiz', 
        quiz,
        userAnswers: new Array(quiz.questions.length).fill(null),
        score: 0
      }));
      setCurrentQuestionIndex(0);
    } catch (err: any) {
      setError(err.message || "Failed to load study session.");
      setState(prev => ({ ...prev, step: 'setup' }));
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (state.userAnswers[currentQuestionIndex] !== null) return;

    const newUserAnswers = [...state.userAnswers];
    newUserAnswers[currentQuestionIndex] = optionIndex;
    
    const isCorrect = optionIndex === state.quiz?.questions[currentQuestionIndex].answerIndex;
    
    setState(prev => ({
      ...prev,
      userAnswers: newUserAnswers,
      score: isCorrect ? prev.score + 1 : prev.score
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (state.quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setState(prev => ({ ...prev, step: 'results' }));
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleEndQuizEarly = () => {
    if (window.confirm("Do you want to end this study session early and review your results so far?")) {
      setState(prev => ({ ...prev, step: 'results' }));
    }
  };

  const resetApp = () => {
    setState({
      step: 'setup',
      level: StudentLevel.MIDDLE,
      difficulty: DifficultyLevel.BEGINNER,
      feedbackType: 'immediate',
      chapter: 1,
      sourceType: 'reference',
      content: '',
      images: [],
      quiz: null,
      score: 0,
      userAnswers: []
    });
    setCurrentQuestionIndex(0);
    setError(null);
  };

  const isAnswered = state.userAnswers[currentQuestionIndex] !== null;

  return (
    <div className="min-h-screen bg-[#fdfcf7] text-slate-900 selection:bg-amber-100 font-sans pb-12">
      {/* Institutional Branding Header */}
      <header className="bg-white border-b-4 border-[#e6b800] sticky top-0 z-50 shadow-md h-28">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-5 cursor-pointer" onClick={resetApp}>
            <div className="w-16 h-16 bg-[#003366] rounded-2xl flex items-center justify-center shadow-lg">
              <AcademicCapIcon className="w-10 h-10 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black tracking-tight text-[#003366] leading-none uppercase">The Gospel of St. Luke</h1>
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#e6b800] mt-1.5">Bible Study Portal • NKJV Translation</p>
            </div>
          </div>

          {state.step === 'quiz' && (
            <div className="flex items-center space-x-6">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Goal</p>
                <p className="text-lg font-black text-[#003366]">{currentQuestionIndex + 1} / 10</p>
              </div>
              <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-[#003366] transition-all duration-500 ease-out" 
                  style={{ width: `${((currentQuestionIndex + 1) / 10) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-10">
        {state.step === 'setup' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center space-y-4 pt-4">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#003366] text-white text-xs font-black rounded-full uppercase tracking-widest shadow-xl">
                <AcademicCapIcon className="w-4 h-4" /> Official Student Curriculum
              </div>
              <h2 className="text-5xl sm:text-7xl font-black text-[#003366] tracking-tight">Learn the Word</h2>
              <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed italic">
                "For with God nothing will be impossible." — Luke 1:37 NKJV
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Chapter Card */}
              <div className="bg-white rounded-[2.5rem] p-8 border-b-[8px] border-slate-100 shadow-2xl hover:border-[#e6b800] transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-black">1</div>
                  <h3 className="text-xl font-black text-[#003366]">Select Chapter</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                    <button 
                      key={num}
                      onClick={() => setState(prev => ({ ...prev, chapter: num }))}
                      className={`aspect-square rounded-xl border-2 font-black transition-all text-lg ${
                        state.chapter === num 
                          ? 'bg-[#003366] text-white border-[#003366] shadow-lg scale-110' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-amber-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Card */}
              <div className="bg-white rounded-[2.5rem] p-8 border-b-[8px] border-slate-100 shadow-2xl hover:border-[#e6b800] transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-black">2</div>
                  <h3 className="text-xl font-black text-[#003366]">Grade Level</h3>
                </div>
                <div className="space-y-5">
                  <select 
                    value={state.level}
                    onChange={(e) => setState(prev => ({ ...prev, level: e.target.value as StudentLevel }))}
                    className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 font-black text-[#003366] outline-none shadow-inner"
                  >
                    {Object.values(StudentLevel).map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </select>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {Object.values(DifficultyLevel).map(diff => (
                      <button
                        key={diff}
                        onClick={() => setState(p => ({ ...p, difficulty: diff }))}
                        className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all ${
                          state.difficulty === diff ? 'bg-white text-[#003366] shadow-md' : 'text-slate-400'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="bg-white rounded-[2.5rem] p-8 border-b-[8px] border-slate-100 shadow-2xl hover:border-[#e6b800] transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-black">3</div>
                  <h3 className="text-xl font-black text-[#003366]">Study Style</h3>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => setState(p => ({ ...p, feedbackType: 'immediate' }))}
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all ${state.feedbackType === 'immediate' ? 'border-[#003366] bg-[#003366]/5 shadow-inner' : 'border-slate-50 opacity-60'}`}
                  >
                    <p className="text-[10px] font-black uppercase text-[#003366] tracking-widest">Active Learning</p>
                    <p className="text-xs font-bold text-slate-600">Correct me as I go</p>
                  </button>
                  <button 
                    onClick={() => setState(p => ({ ...p, feedbackType: 'end' }))}
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all ${state.feedbackType === 'end' ? 'border-[#003366] bg-[#003366]/5 shadow-inner' : 'border-slate-50 opacity-60'}`}
                  >
                    <p className="text-[10px] font-black uppercase text-[#003366] tracking-widest">Full Review</p>
                    <p className="text-xs font-bold text-slate-600">Show grade at the end</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center pt-4 pb-20">
              <button
                onClick={() => handleStartStudy()}
                className="w-full max-w-2xl py-9 bg-[#003366] text-white font-black text-3xl rounded-[3rem] hover:bg-[#002244] shadow-[0_20px_50px_rgba(0,51,102,0.3)] hover:-translate-y-2 transition-all flex items-center justify-center gap-5 active:scale-95"
              >
                <BookOpenIcon className="w-10 h-10" />
                <span>Begin Chapter {state.chapter} Quiz</span>
              </button>
              {error && <p className="text-rose-600 mt-8 font-black bg-rose-50 px-8 py-3 rounded-full border-2 border-rose-100 animate-bounce">{error}</p>}
            </div>
          </div>
        )}

        {state.step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-40 space-y-12">
            <div className="relative">
              <div className="w-56 h-56 border-[12px] border-slate-50 border-t-[#e6b800] rounded-full animate-spin shadow-2xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <BookOpenIcon className="w-24 h-24 text-[#003366] animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-4xl font-black text-[#003366] italic tracking-tight">"Thy Word is Truth"</h3>
              <p className="text-slate-400 text-xl font-bold uppercase tracking-widest">Generating NKJV Quiz for Ch. {state.chapter}...</p>
            </div>
          </div>
        )}

        {state.step === 'quiz' && state.quiz && (
          <div className="animate-in fade-in slide-in-from-right-10 duration-500 space-y-10">
            <div className="relative bg-white rounded-[4rem] p-12 sm:p-24 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border-b-8 border-slate-100 overflow-hidden min-h-[600px] flex flex-col justify-center">
              
              <div className="absolute top-10 left-10">
                 <button 
                  onClick={handleEndQuizEarly}
                  className="px-6 py-3 bg-white hover:bg-rose-50 text-rose-600 rounded-full border-2 border-rose-50 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md active:scale-95"
                 >
                   <XIcon className="w-4 h-4" /> End Study Early
                 </button>
              </div>

              <div className="relative space-y-14 max-w-4xl mx-auto">
                <div className="space-y-6 text-center">
                  <span className="text-[#003366] font-black tracking-[0.4em] text-xs uppercase bg-[#e6b800]/10 px-8 py-3 rounded-full border border-[#e6b800]/30 shadow-sm">
                    Saint Luke Ch. {state.chapter} • Lesson {currentQuestionIndex + 1}
                  </span>
                  <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                    {state.quiz.questions[currentQuestionIndex].question}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {state.quiz.questions[currentQuestionIndex].options.map((option, idx) => {
                    const userSelected = state.userAnswers[currentQuestionIndex] === idx;
                    const isCorrect = idx === state.quiz?.questions[currentQuestionIndex].answerIndex;
                    
                    let btnStyle = "bg-slate-50 hover:bg-white hover:border-[#e6b800] border-slate-100 hover:shadow-2xl";
                    let letterStyle = "bg-slate-200 text-slate-500";
                    
                    if (isAnswered) {
                      if (state.feedbackType === 'immediate') {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500 text-white border-emerald-600 shadow-2xl scale-105 z-10";
                          letterStyle = "bg-white text-emerald-600";
                        } else if (userSelected) {
                          btnStyle = "bg-rose-500 text-white border-rose-600 shadow-lg";
                          letterStyle = "bg-white text-rose-600";
                        } else {
                          btnStyle = "bg-slate-100 border-slate-100 opacity-40 grayscale pointer-events-none";
                        }
                      } else {
                        if (userSelected) {
                          btnStyle = "bg-[#003366] text-white border-[#003366] shadow-2xl scale-105 z-10";
                          letterStyle = "bg-white text-[#003366]";
                        } else {
                          btnStyle = "bg-white border-slate-100 opacity-60 pointer-events-none";
                        }
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleAnswerSelect(idx)}
                        className={`p-7 rounded-[2.5rem] border-4 text-2xl font-black text-left transition-all flex items-center gap-10 ${btnStyle} group`}
                      >
                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 text-3xl font-black transition-all ${letterStyle} group-hover:scale-110`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="flex-grow leading-tight">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {isAnswered && state.feedbackType === 'immediate' && (
              <div className="animate-in fade-in slide-in-from-top-10 duration-700 bg-white p-12 rounded-[3.5rem] border-l-[12px] border-l-[#e6b800] shadow-2xl flex gap-10">
                <div className="w-20 h-20 rounded-[2rem] bg-[#003366] flex items-center justify-center flex-shrink-0 text-white shadow-xl">
                  <InformationCircleIcon className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                  <h5 className="font-black text-[#e6b800] uppercase text-xs tracking-[0.5em]">Teacher's Insight (NKJV)</h5>
                  <p className="text-3xl text-slate-700 font-bold leading-relaxed italic">
                    "{state.quiz.questions[currentQuestionIndex].explanation}"
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center px-6 pb-20">
               <button 
                onClick={handleBack}
                disabled={currentQuestionIndex === 0}
                className={`px-12 py-6 rounded-[2rem] font-black text-base flex items-center gap-4 transition-all ${
                  currentQuestionIndex === 0 ? 'opacity-0 pointer-events-none' : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-[#003366] hover:text-[#003366] shadow-sm hover:scale-105'
                }`}
               >
                 <ChevronLeftIcon className="w-7 h-7" /> Previous
               </button>

               <button 
                onClick={handleNext}
                disabled={!isAnswered}
                className={`px-20 py-7 rounded-[2.5rem] font-black text-2xl flex items-center gap-5 transition-all ${
                  !isAnswered ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#003366] text-white hover:bg-[#002244] shadow-[0_20px_50px_rgba(0,51,102,0.3)] hover:scale-105 active:scale-95'
                }`}
               >
                 {currentQuestionIndex === 9 ? 'Show Results' : 'Continue Lesson'}
                 <ChevronRightIcon className="w-8 h-8" />
               </button>
            </div>
          </div>
        )}

        {state.step === 'results' && state.quiz && (
          <div className="max-w-4xl mx-auto space-y-16 animate-in zoom-in-95 duration-700 text-center pb-20">
             <div className="bg-white rounded-[5rem] p-20 sm:p-28 border-b-[15px] border-slate-100 shadow-[0_50px_100px_rgba(0,0,0,0.1)] space-y-14 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-6 bg-[#e6b800]"></div>
               <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-5">
                 <BookOpenIcon className="w-96 h-96 text-[#003366]" />
               </div>
               
               <div className="space-y-6 relative z-10">
                <h2 className="text-7xl font-black text-[#003366] leading-none tracking-tighter">Lesson Summary</h2>
                <p className="text-[#e6b800] font-black text-3xl uppercase tracking-[0.6em] italic underline decoration-4 underline-offset-[12px]">Gospel Chapter {state.chapter}</p>
               </div>

               <div className="flex flex-col sm:flex-row justify-center items-center gap-20 py-10 relative z-10">
                 <div className="space-y-4">
                   <p className="text-9xl font-black text-[#003366] leading-none">{Math.round((state.score / 10) * 100)}%</p>
                   <p className="text-base font-black uppercase text-slate-400 tracking-[0.4em]">Knowledge Mastery</p>
                 </div>
                 <div className="hidden sm:block w-px h-40 bg-slate-100"></div>
                 <div className="space-y-4">
                   <p className="text-9xl font-black text-[#e6b800] leading-none">{state.score}/10</p>
                   <p className="text-base font-black uppercase text-slate-400 tracking-[0.4em]">Verses Recalled</p>
                 </div>
               </div>

               <div className="space-y-10 relative z-10">
                 <p className="text-slate-500 font-bold text-2xl">Refine your knowledge or advance to the next study?</p>
                 <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                      onClick={() => handleStartStudy(true)}
                      className="flex-1 py-8 bg-white text-[#003366] font-black text-2xl rounded-[2.5rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-5 border-4 border-[#003366] shadow-xl hover:-translate-y-1 active:scale-95"
                    >
                      <RefreshIcon className="w-10 h-10" /> Retake Level
                    </button>
                    <button 
                      onClick={resetApp}
                      className="flex-1 py-8 bg-[#003366] text-white font-black text-2xl rounded-[2.5rem] hover:bg-[#002244] transition-all flex items-center justify-center gap-5 shadow-[0_25px_50px_rgba(0,51,102,0.3)] hover:-translate-y-1 active:scale-95"
                    >
                      <BookOpenIcon className="w-10 h-10" /> Next Lesson
                    </button>
                 </div>
                 <button onClick={() => window.print()} className="w-full py-5 bg-white border-2 border-slate-100 text-slate-400 font-black text-xs rounded-[1.5rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 tracking-widest uppercase">
                   <DocumentTextIcon className="w-6 h-6" /> Save Completion Certificate
                 </button>
               </div>
             </div>

             {/* Detailed Review */}
             <div className="space-y-12 text-left">
               <div className="flex items-center justify-center gap-10">
                  <div className="h-0.5 flex-grow bg-slate-100"></div>
                  <h4 className="text-5xl font-black text-[#003366] uppercase tracking-tighter">Scripture Review</h4>
                  <div className="h-0.5 flex-grow bg-slate-100"></div>
               </div>
               
               <div className="space-y-10">
                 {state.quiz.questions.map((q, i) => {
                   const userAnswer = state.userAnswers[i];
                   const isCorrect = userAnswer === q.answerIndex;
                   const isSkipped = userAnswer === null;
                   return (
                     <div key={i} className={`p-14 rounded-[4.5rem] border-4 transition-all relative overflow-hidden ${isCorrect ? 'bg-white border-emerald-100' : isSkipped ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-rose-50 border-rose-100'}`}>
                        <div className="flex justify-between items-start gap-12">
                          <div className="space-y-8 flex-grow">
                            <div className="flex items-center gap-6">
                               <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Gospel Lesson • {i+1}</span>
                               {!isCorrect && !isSkipped && <span className="bg-rose-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Requires Study</span>}
                               {isSkipped && <span className="bg-slate-400 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Incomplete</span>}
                            </div>
                            <p className="font-black text-slate-900 leading-[1.2] text-4xl tracking-tight">{q.question}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                               <div className="p-6 rounded-[1.5rem] border-4 bg-emerald-50 border-emerald-200 flex items-center gap-5">
                                  <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                                    <CheckCircleIcon className="w-7 h-7" />
                                  </div>
                                  <p className="text-lg font-black text-emerald-900 leading-tight">
                                    {q.options[q.answerIndex]} (Correct)
                                  </p>
                               </div>
                               {!isCorrect && !isSkipped && (
                                 <div className="p-6 rounded-[1.5rem] border-4 border-rose-200 bg-rose-100/50 flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                                      <XCircleIcon className="w-7 h-7" />
                                    </div>
                                    <p className="text-lg font-black text-rose-900 leading-tight">
                                      {q.options[userAnswer ?? 0]} (Your Answer)
                                    </p>
                                 </div>
                               )}
                            </div>
                            <div className="bg-slate-50 p-10 rounded-[2.5rem] border-2 border-slate-100 relative mt-4 shadow-inner">
                               <div className="absolute -top-4 left-10 px-6 py-1.5 bg-[#003366] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg">Scripture Wisdom • NKJV</div>
                               <p className="text-2xl text-slate-600 leading-relaxed font-bold italic">
                                 "{q.explanation}"
                               </p>
                            </div>
                          </div>
                          {isCorrect ? <CheckCircleIcon className="w-24 h-24 text-emerald-400 flex-shrink-0" /> : <XCircleIcon className="w-24 h-24 text-rose-200 flex-shrink-0" />}
                        </div>
                     </div>
                   );
                 })}
               </div>
             </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-24 bg-white border-t-4 border-[#e6b800] text-center space-y-12">
        <div className="flex items-center justify-center gap-8">
           <AcademicCapIcon className="w-12 h-12 text-[#003366]" />
           <div className="h-14 w-1 bg-slate-100 rounded-full"></div>
           <BookOpenIcon className="w-12 h-12 text-slate-200" />
        </div>
        <div className="max-w-3xl mx-auto px-8 space-y-4">
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.6em] mb-2">Curriculum Excellence by</p>
          <p className="text-slate-600 text-2xl font-black leading-tight uppercase tracking-tight">
            Theotokos Junior Academy & Holy Sophia University
            <br/>
            <span className="text-[10px] uppercase tracking-[0.8em] mt-6 block text-[#e6b800] font-black italic">Education for the Soul</span>
          </p>
        </div>
        <div className="pt-10 text-[9px] font-black text-slate-200 uppercase tracking-[0.5em]">
          © {new Date().getFullYear()} TJA-HSU Student Services • Digital Scripture Initiative
        </div>
      </footer>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @media print {
          header, footer, button { display: none !important; }
          main { width: 100% !important; max-width: none !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
