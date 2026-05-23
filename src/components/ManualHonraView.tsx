import React, { useState } from 'react';
import { 
  Scale, 
  ShieldAlert, 
  Award, 
  Send, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  RotateCcw, 
  Medal, 
  BookOpen, 
  Clock, 
  Heart, 
  Users,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useClan } from '../context/ClanContext';
import { db } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export default function ManualHonraView() {
  const { 
    user, 
    myMember, 
    isEcoMode, 
    completeMission, 
    updateMemberData, 
    theftReports, 
    reportTheft,
    isGuest
  } = useClan();

  // Reporting Form State
  const [accusedName, setAccusedName] = useState('');
  const [caravanType, setCaravanType] = useState('caravana_ur');
  const [evidence, setEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Quiz State
  const [quizStep, setQuizStep] = useState(0); 
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizError, setQuizError] = useState(false);

  // Guidelines (Código de Conduta)
  const honorGuidelines = [
    {
      id: 'regra_caravana',
      title: 'TOLERÂNCIA ZERO PARA FURTOS DE CARAVANAS',
      prio: 'CRÍTICO',
      prioColor: 'text-red-500 bg-red-500/10 border-red-500/20',
      description: 'É terminantemente PROIBIDO roubar caravanas e caixotes de jogadores do nosso próprio servidor. Esta é a regra de ouro e pilar de sustentação da nossa boa vizinhança diplomática.',
      consequence: 'Banimento sumário e imediato de todas as contas vinculadas do infrator nas diretrizes da guilda.',
      icon: ShieldAlert
    },
    {
      id: 'regra_respeito',
      title: 'DIPLOMACIA & PACIFISMO INTERNO',
      prio: 'ALTO',
      prioColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      description: 'Sempre respeite as ordens e decisões do Líder de Clã (Skadir) e das instâncias diplomáticas sobre tréguas de servidores e acordos de paz assinados.',
      consequence: 'Regressão de cargo de oficial ou cabo a guerreiro padrão com suspensão de regalias coletivas.',
      icon: Scale
    },
    {
      id: 'regra_combate',
      title: 'ALICIAMENTO & SABOTAGENS',
      prio: 'ALTO',
      prioColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      description: 'Qualquer tentativa de aliciar membros para reinos inimigos, difamações públicas da aliança no chat geral do servidor, ou sabotagens planejadas de torneios.',
      consequence: 'Expulsão do clã com cadastro instantâneo na Lista Negra de Servidores.',
      icon: AlertTriangle
    },
    {
      id: 'regra_coexistencia',
      title: 'AJUDA MÚTUA NAS INVASÕES',
      prio: 'DESEJÁVEL',
      prioColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      description: 'Auxiliar ativamente parceiros sob ataque de outros servidores na proteção de suas mercadorias é considerado ato de extrema honra e dignidade militar.',
      consequence: 'Indicação direta para cargos de liderança, condecorações e bônus de prestígio.',
      icon: ShieldCheck
    }
  ];

  // Quiz Questions for Oath
  const quizQuestions = [
    {
      id: 1,
      question: 'É permitido saquear caixotes ou roubar caravanas de membros da Suprema Ordem ou de guildas parceiras do servidor?',
      options: [
        { text: 'Sim, se eu precisar de recursos rapidamente para minha evolução.', isCorrect: false },
        { text: 'Apenas caixotes de menor raridade que estejam abandonados na estrada.', isCorrect: false },
        { text: 'NÃO! É terminantemente proibido jogar contra o próprio servidor sob pena de exclusão.', isCorrect: true }
      ]
    },
    {
      id: 2,
      question: 'Qual é a consequência prioritária decretada aos combatentes que forem flagrados roubando caravanas aliadas?',
      options: [
        { text: 'Eles perdem apenas 10 moedas de ouro da conta temporariamente.', isCorrect: false },
        { text: 'Banimento imediato e definitivo de todas as estruturas e listas de acesso da guilda.', isCorrect: true },
        { text: 'Os oficiais dão apenas um aviso verbal e os deixam continuar sem punição.', isCorrect: false }
      ]
    },
    {
      id: 3,
      question: 'O que você deve fazer ao presenciar um ato de furto ou sabotagem contra nosso clã ou aliados?',
      options: [
        { text: 'Ignorar e fingir que não vi para não gerar desconfortos no grupo.', isCorrect: false },
        { text: 'Denunciar discretamente na Ouvidoria de Furtos com provas objetivas para apuração rápida.', isCorrect: true },
        { text: 'Começar a criar discussões e boatos nos canais públicos do servidor.', isCorrect: false }
      ]
    }
  ];

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accusedName || !evidence) return;
    setSubmitting(true);

    try {
      const timestampStr = new Date().toISOString();
      const reportId = 'report_' + Date.now();

      if (isGuest) {
        const savedReports = localStorage.getItem('local_theft_reports');
        const reports = savedReports ? JSON.parse(savedReports) : [];
        const newReport = {
          id: reportId,
          reporterId: user?.uid || 'guest_user',
          reporterName: myMember?.name || 'Guerreiro Convidado',
          accusedName,
          caravanType,
          evidence,
          timestamp: timestampStr
        };
        const updated = [newReport, ...reports];
        localStorage.setItem('local_theft_reports', JSON.stringify(updated));
      } else {
        const reportRef = doc(collection(db, 'clans', 'main-clan', 'theft_reports'), reportId);
        await setDoc(reportRef, {
          id: reportId,
          reporterId: user?.uid || 'anon',
          reporterName: myMember?.name || 'Guerreiro anônimo',
          accusedName,
          caravanType,
          evidence,
          timestamp: timestampStr
        });
      }

      setReportSuccess(true);
      setAccusedName('');
      setEvidence('');
      await reportTheft(); 
    } catch (err) {
      console.error('Falha ao salvar denúncia no Manual de Honra:', err);
    } finally {
      setSubmitting(false);
      setTimeout(() => setReportSuccess(false), 5000);
    }
  };

  const handleAnswerSelect = (qIdx: number, oIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
    setQuizError(false);
  };

  const handleNextQuizStep = () => {
    const currentQuestionIdx = quizStep - 1;
    const currentQuestion = quizQuestions[currentQuestionIdx];
    const chosenOptionIdx = selectedAnswers[currentQuestionIdx];

    if (chosenOptionIdx === undefined) return;

    if (currentQuestion.options[chosenOptionIdx].isCorrect) {
      if (quizStep === quizQuestions.length) {
        handlePassedOath();
      } else {
        setQuizStep(prev => prev + 1);
      }
    } else {
      setQuizError(true);
    }
  };

  const handlePassedOath = async () => {
    try {
      const alreadyHas = myMember?.completedMissions?.includes('manual_honra_passed');
      if (!alreadyHas) {
        const unlocked = [...(myMember?.unlockedTitles || [])];
        if (!unlocked.includes('Guardião da Honra')) {
          unlocked.push('Guardião da Honra');
        }
        
        await completeMission('manual_honra_passed', 25);
        await updateMemberData({
          unlockedTitles: unlocked,
          title: 'Guardião da Honra'
        });
      }
      setQuizStep(4);
    } catch (err) {
      console.error('Failed to complete Honor Oath:', err);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setSelectedAnswers({});
    setQuizError(false);
  };

  const translateCaravan = (id: string) => {
    switch (id) {
      case 'caravana_ur': return 'Caravana Suprema (UR)';
      case 'caravana_legendary': return 'Caravana Lendária';
      case 'caravana_epic': return 'Caravana Épica';
      case 'caixotes_gerais': return 'Caixotes de Recursos';
      default: return 'Caravana / Carga Gerais';
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 text-white text-left font-sans">
      {/* Header Panel */}
      <div className="flex flex-col gap-1 border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl">
            <Scale size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gaming-gold tracking-widest block">
              Estatuto Coletivo & Diretrizes da Guilda
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-tight leading-none">
              MANUAL DE <span className="text-gaming-gold">HONRA</span>
            </h2>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          Nossas leis invioláveis de cooperação interna. O Manual de Honra dita as regras de trégua de servidores, proteção cruzada de caravanas e o canal formal de ouvidoria para controle de furtos.
        </p>
      </div>

      {/* Main Single-Screen Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Rules list & Juramento Exam */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Rules Card */}
          <div className="bg-gaming-card/40 border border-gaming-border rounded-3xl p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden backdrop-blur-sm">
            <h3 className="font-display font-black text-xs text-white uppercase tracking-widest border-b border-zinc-800 pb-3 flex items-center gap-2">
              <FileText className="text-gaming-gold" size={16} />
              CÓDIGO DE CONDUTA DE GUERRA
            </h3>

            <div className="flex flex-col gap-4">
              {honorGuidelines.map((item) => (
                <div 
                  key={item.id}
                  className="border border-zinc-800/80 bg-black/20 rounded-2xl p-4 flex gap-4 transition-all hover:bg-white/[0.01]"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center shrink-0 text-gaming-gold border border-white/5 shadow-inner">
                    <item.icon size={20} className={item.prio === 'CRÍTICO' ? 'text-red-500 animate-pulse' : 'text-gaming-gold'} />
                  </div>
                  <div className="flex-1 flex flex-col text-left">
                    <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                      <h4 className="text-xs font-black uppercase text-white tracking-wider font-mono">
                        {item.title}
                      </h4>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border shrink-0 ${item.prioColor}`}>
                        {item.prio}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-medium uppercase tracking-wide leading-relaxed mt-1 select-none">
                      {item.description}
                    </p>
                    <div className="mt-2 text-[9px] text-red-400 bg-red-950/25 border border-red-900/35 rounded-lg p-2.5 flex items-start gap-1 font-mono uppercase font-semibold">
                      <span>❗ PUNIÇÃO:</span>
                      <span className="text-zinc-200">{item.consequence}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam & Title Unlock */}
          <div className="bg-gaming-card/40 border border-gaming-border rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm flex flex-col items-center justify-center text-center">
            
            {quizStep === 0 && (
              <div className="flex flex-col items-center gap-4 text-center w-full">
                <div className="w-14 h-14 bg-gaming-gold/10 border border-gaming-gold/25 rounded-full flex items-center justify-center text-gaming-gold shadow-lg animate-pulse">
                  <Award size={28} />
                </div>
                <div>
                  <h3 className="font-display font-black uppercase text-sm sm:text-base tracking-wide text-white">
                    EXAME DE LEALDADE (TESTE SEUS CONHECIMENTOS)
                  </h3>
                  <p className="text-[10px] uppercase font-bold text-zinc-400 max-w-md leading-relaxed mt-1">
                    Complete as perguntas do estatuto militar para assinar o compromisso com o reino, ganhar recompensas oficiais e o título de elite!
                  </p>
                </div>

                {myMember?.completedMissions?.includes('manual_honra_passed') ? (
                  <div className="w-full mt-2 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 flex flex-col items-center max-w-md">
                    <ShieldCheck className="text-emerald-400 mb-1.5 animate-bounce" size={26} />
                    <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                      JURAMENTO OFICIAL ASSINADO!
                    </span>
                    <p className="text-[10px] uppercase font-semibold text-zinc-300 mt-1 max-w-xs leading-normal">
                      Você é um protetor oficial da Suprema Aliança. Seu nome possui o título de <strong className="text-gaming-gold">Guardião da Honra</strong>.
                    </p>
                    <button
                      onClick={resetQuiz}
                      className="mt-4 flex items-center gap-1.5 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[9px] font-black uppercase tracking-wider rounded-lg transition-all"
                    >
                      <RotateCcw size={10} /> Refazer Teste
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setQuizStep(1)}
                    className="mt-2 bg-gaming-gold hover:bg-white text-black font-display font-black uppercase text-xs tracking-widest py-3 px-8 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    INICIAR JURAMENTO MILITAR (+25 XP)
                  </button>
                )}
              </div>
            )}

            {quizStep > 0 && quizStep <= quizQuestions.length && (
              <div className="w-full flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <span className="text-[9px] font-mono font-black text-gaming-gold uppercase tracking-widest">
                    RECRUTAMENTO PROTETOR • QUESTÃO {quizStep} DE {quizQuestions.length}
                  </span>
                  <span className="text-[9.5px] font-bold text-zinc-500">
                    SINCERIDADE MÁXIMA
                  </span>
                </div>

                <h4 className="text-sm font-bold uppercase tracking-wide text-white leading-relaxed">
                  {quizQuestions[quizStep - 1].question}
                </h4>

                <div className="flex flex-col gap-2.5 mt-2">
                  {quizQuestions[quizStep - 1].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[quizStep - 1] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleAnswerSelect(quizStep - 1, oIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border font-bold text-xs uppercase tracking-wide transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-gaming-gold/10 border-gaming-gold text-white' 
                            : 'bg-black/40 border-zinc-800 hover:bg-zinc-850 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] shrink-0 ${
                            isSelected ? 'bg-gaming-gold text-black border-gaming-gold' : 'border-zinc-700'
                          }`}>
                            {isSelected && '✓'}
                          </div>
                          <span>{opt.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {quizError && (
                  <div className="bg-red-500/15 border border-red-500/20 rounded-xl p-3 text-red-400 font-mono text-[9.5px] font-black uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0 animate-bounce text-red-500" />
                    <span>OPÇÃO INCORRETA! Releia as leis de conduta e tente novamente.</span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-3 border-t border-zinc-800 pt-4">
                  <button
                    onClick={resetQuiz}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded-xl font-mono text-[9px] font-black uppercase"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleNextQuizStep}
                    disabled={selectedAnswers[quizStep - 1] === undefined}
                    className="px-6 py-2 bg-gaming-gold hover:bg-white text-black font-display font-black uppercase text-xs rounded-xl transition-all disabled:opacity-50"
                  >
                    Confirmar & Avançar
                  </button>
                </div>
              </div>
            )}

            {quizStep === 4 && (
              <div className="flex flex-col items-center gap-4 text-center w-full py-4">
                <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                  <Medal size={30} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="font-display font-black uppercase text-base tracking-wide text-emerald-400">
                    JURAMENTO PROTOCOLADO COM SUCESSO!
                  </h3>
                  <p className="text-[10px] uppercase font-bold text-zinc-300 max-w-sm leading-relaxed mt-1">
                    Você agora é um <span className="text-gaming-gold">Guardião da Honra</span>. Seu cargo foi condecorado e +25 pontos de prestígio de XP do Passe foram aplicados à sua conta!
                  </p>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-2xl p-4.5 max-w-md w-full font-mono text-left space-y-2 mt-2">
                  <div className="text-[8px] text-emerald-500 font-extrabold tracking-widest">NOME DO JURADOR:</div>
                  <div className="text-xs font-black text-white uppercase">{myMember?.name || 'Guerreiro Ativo'}</div>
                  <div className="text-[8px] text-emerald-500 font-extrabold tracking-widest mt-3">TÍTULO DESBLOQUEADO:</div>
                  <div className="text-xs font-black text-gaming-gold uppercase">⚔️ GUARDIÃO DA HONRA</div>
                </div>

                <button
                  onClick={resetQuiz}
                  className="mt-2 text-zinc-500 hover:text-white font-mono text-[9px] font-black uppercase hover:underline"
                >
                  Fechar Certificado
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Right Side: Form to Complaint & Recent incidents */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Form wrapper */}
          <div className="bg-gaming-card/40 border border-gaming-border rounded-3xl p-5 sm:p-6 flex flex-col gap-5 relative overflow-hidden backdrop-blur-sm">
            <h4 className="font-display font-black text-xs text-red-500 uppercase tracking-widest border-b border-zinc-800 pb-2.5 flex items-center gap-1.5">
              <ShieldAlert size={15} /> CANAL DE OUVIDORIA: DENÚNCIA DE ROUBO
            </h4>
            
            <p className="text-[10.5px] text-zinc-400 font-bold uppercase leading-relaxed font-sans">
              Flagrou algum infrator do servidor roubando ou quebrando os acordos diplomáticos? Protocolize sua denúncia discreta para os oficiais de logs.
            </p>

            <form onSubmit={handleSubmitReport} className="flex flex-col gap-3.5 mt-1">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[8.5px] font-black uppercase tracking-widest text-zinc-500">NICK DO INFRATOR</label>
                <input 
                  type="text" 
                  placeholder="Ex: JogadorInfrator" 
                  required
                  value={accusedName}
                  onChange={(e) => setAccusedName(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 focus:border-red-500/50 text-white rounded-xl p-3 py-2 text-xs placeholder-zinc-650 outline-hidden transition-all font-mono font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[8.5px] font-black uppercase tracking-widest text-zinc-500">RECURSO SAQUEADO</label>
                <select
                  value={caravanType}
                  onChange={(e) => setCaravanType(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 focus:border-red-500/50 text-white rounded-xl p-3 py-2 text-xs outline-hidden cursor-pointer font-bold uppercase"
                >
                  <option value="caravana_ur">Caravana Suprema (UR)</option>
                  <option value="caravana_legendary">Caravana Lendária</option>
                  <option value="caravana_epic">Caravana Épica</option>
                  <option value="caixotes_gerais">Caixotes de Recursos (Crates)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[8.5px] font-black uppercase tracking-widest text-zinc-500">PROVA / HORÁRIO / CANAL</label>
                <textarea 
                  placeholder="Fale o horário aproximado do ataque ou links para prints que permitam apurar os logs."
                  required
                  rows={3}
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 focus:border-red-500/50 text-white rounded-xl p-3 text-xs placeholder-zinc-650 outline-hidden transition-all resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-white text-black font-display font-black uppercase text-xs tracking-widest py-3 rounded-xl transition-all cursor-pointer font-bold flex items-center justify-center gap-2 mt-1 shadow-lg shadow-red-950/20"
              >
                <Send size={13} />
                {submitting ? 'ENVIANDO RELATÓRIO...' : 'PROTOCOLAR CASO'}
              </button>
            </form>

            <AnimatePresence>
              {reportSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-2.5 text-emerald-400 font-bold text-[10.5px] uppercase text-left"
                >
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <div>
                    Caso protocolado sob código de sigilo! Generais Suprema Ordem irão cruzar as hashes de logs em breve.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Audit View List */}
          <div className="bg-gaming-card/40 border border-gaming-border rounded-3xl p-5 flex flex-col gap-4 backdrop-blur-sm">
            <span className="text-[9.5px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
              🛡️ CASOS SOB RASTREAMENTO DE LOGS ({theftReports?.length || 0})
            </span>

            <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto no-scrollbar">
              {theftReports && theftReports.length > 0 ? (
                theftReports.map((item: any, idx: number) => (
                  <div 
                    key={item.id || idx}
                    className="bg-black/25 border border-zinc-805 rounded-2xl p-3.5 flex flex-col gap-2 scale-98 hover:border-red-500/10"
                  >
                    <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                      <span className="text-[8px] font-mono font-black text-red-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        DENÚNCIA SIGILOSA
                      </span>
                      <span className="text-[8px] font-mono text-zinc-500 font-bold">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                    <div className="flex gap-1.5 text-[9.5px] flex-col text-zinc-400 font-bold uppercase text-left">
                      <div>
                        <span className="text-zinc-500">Denunciante:</span>{' '}
                        <span className="text-white">{item.reporterName || 'Sigiloso'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Nick Infrator:</span>{' '}
                        <span className="text-red-400 font-black">{item.accusedName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Recurso:</span>{' '}
                        <span className="text-amber-500">{translateCaravan(item.caravanType)}</span>
                      </div>
                      <div className="text-[9px] text-zinc-500 normal-case italic border-t border-zinc-850 pt-1.5 mt-0.5 max-w-sm truncate">
                        "{item.evidence}"
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 font-mono">
                      <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">
                        EM APURAÇÃO JURÍDICA
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center bg-black/10 border border-zinc-805 rounded-2xl border-dashed py-8">
                  <span className="text-2xl mb-1.5">🕊️</span>
                  <h5 className="text-[9.5px] font-black uppercase text-white tracking-widest">Paz no Servidor</h5>
                  <p className="text-[8.5px] text-zinc-500 uppercase font-bold mt-0.5 max-w-xs leading-relaxed">
                    Nenhuma quebra de tratado registrada nas últimas 24 horas. Servidor jogando de forma limpa!
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
