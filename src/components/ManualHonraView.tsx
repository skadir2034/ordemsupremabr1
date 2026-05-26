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
      title: 'Proteção de Caravanas e Caixotes',
      prio: 'Crítico',
      prioColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      description: 'É terminantemente proibido roubar caravanas e caixotes de jogadores do nosso próprio servidor (176). No entanto, para a Grande Final SVS, saques contra o Servidor adversário 175 estão totalmente autorizados e incentivados!',
      consequence: 'Banimento sumário e definitivo de todos os acessos e cooperação do clã.',
      icon: ShieldAlert
    },
    {
      id: 'regra_respeito',
      title: 'Diplomacia e Acordos de Paz',
      prio: 'Alto',
      prioColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'Respeite rigorosamente as decisões do Líder de Clã (Skadir) e das instâncias diplomáticas sobre tréguas estruturadas de servidores e acordos coletivos assinados.',
      consequence: 'Rebaixamento imediato a cargo padrão e suspensão de regalias coletivas da aliança.',
      icon: Scale
    },
    {
      id: 'regra_combate',
      title: 'Aliciamento e Sabotagens',
      prio: 'Alto',
      prioColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'Qualquer tentativa de aliciar membros de nossa corporação para grupos inimigos, realizar difamação pública no chat geral ou cometer atos de espionagem tática.',
      consequence: 'Expulsão definitiva e inclusão automática na Lista Negra de Servidores.',
      icon: AlertTriangle
    },
    {
      id: 'regra_coexistencia',
      title: 'Auxílio Mútuo em Invasões',
      prio: 'Desejável',
      prioColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: 'Ajudar ativamente aliados e companheiros de servidor sob ataque inimigo durante as caravanas é considerado o escalão mais alto de bravura e nobreza militar.',
      consequence: 'Nomeação direta para condecorações, postos de comando prioritários e bônus de prestígio.',
      icon: ShieldCheck
    }
  ];

  // Quiz Questions for Oath
  const quizQuestions = [
    {
      id: 1,
      question: 'É permitido saquear caixotes ou roubar caravanas de outros jogadores? Qual é a diretriz oficial para o adversário Servidor 175?',
      options: [
        { text: 'Sim, se eu precisar de recursos para evoluir, todos os reinos se tornam alvos válidos.', isCorrect: false },
        { text: 'Apenas saques contra o Servidor adversário 175 (incluindo Caixotes) estão liberados. No nosso próprio servidor (176), furtos internos são terminantemente proibidos.', isCorrect: true },
        { text: 'Não! Não é permitido realizar saques em nenhuma caravana do jogo inteiro, independentemente do servidor.', isCorrect: false }
      ]
    },
    {
      id: 2,
      question: 'Qual é a punição prevista para membros flagrados roubando caravanas de alianças aliadas no Servidor 176?',
      options: [
        { text: 'Eles perdem apenas uma pequena taxa simbólica de moedas de ouro.', isCorrect: false },
        { text: 'Banimento imediato de todas as estruturas do clã e inclusão na lista negra estratégica.', isCorrect: true },
        { text: 'Eles recebem um lembrete no mural de notícias e continuam jogando sem alterações.', isCorrect: false }
      ]
    },
    {
      id: 3,
      question: 'Como proceder ao registrar evidências reais ou flagrar atos de sabotagem e furtos internos no reino?',
      options: [
        { text: 'Ignorar o ocorrido para evitar problemas com outros jogadores.', isCorrect: false },
        { text: 'Denunciar discretamente no Canal de Ouvidoria com provas válidas para análise rápida do conselho militar.', isCorrect: true },
        { text: 'Discutir ou acusar publicamente no chat do servidor causando discussões sem provas técnicas.', isCorrect: false }
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
      default: return 'Caravana / Carga Geral';
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 text-white text-left font-sans">
      {/* Header Panel */}
      <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            <Scale size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gaming-gold tracking-widest block">
              Estatuto Coletivo & Diretrizes da Guilda
            </span>
            <h2 className="text-xl font-bold uppercase text-white tracking-wide leading-none mt-1">
              Manual de <span className="text-gaming-gold">Honra</span>
            </h2>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          Nossas leis invioláveis de cooperação interna. O Manual de Honra dita as regras de trégua de servidores, proteção mútua de caravanas e o canal formal de ouvidoria para controle de furtos no Servidor 176.
        </p>
      </div>

      {/* Main Single-Screen Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Rules list & Juramento Exam */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Rules Card */}
          <div className="bg-gaming-card/40 border border-gaming-border rounded-3xl p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden backdrop-blur-sm">
            <h3 className="font-display font-bold text-xs text-white uppercase tracking-widest border-b border-zinc-800/80 pb-3 flex items-center gap-2">
              <FileText className="text-gaming-gold" size={16} />
              CÓDIGO DE CONDUTA DE GUERRA
            </h3>

            <div className="flex flex-col gap-4">
              {honorGuidelines.map((item) => (
                <div 
                  key={item.id}
                  className="border border-zinc-800/80 bg-black/20 rounded-2xl p-4.5 flex gap-4 transition-all hover:bg-white/[0.01]"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center shrink-0 text-gaming-gold border border-white/5 shadow-inner">
                    <item.icon size={20} className={item.prio === 'Crítico' ? 'text-red-500 animate-pulse' : 'text-gaming-gold'} />
                  </div>
                  <div className="flex-1 flex flex-col text-left">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white tracking-wider font-mono">
                        {item.title}
                      </h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border shrink-0 ${item.prioColor}`}>
                        {item.prio}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed mt-2.5 select-none font-sans">
                      {item.description}
                    </p>
                    <div className="mt-3.5 text-[10px] text-zinc-350 bg-red-950/15 border border-red-900/30 rounded-xl p-3 flex items-start gap-1.5 font-sans leading-relaxed">
                      <span className="text-rose-400 font-bold uppercase tracking-wider text-[9px] shrink-0 mt-0.5">❗ PUNIÇÃO:</span>
                      <span>{item.consequence}</span>
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
                  <h3 className="font-display font-bold uppercase text-sm sm:text-base tracking-wide text-white">
                    EXAME DE LEALDADE MILITAR
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-md leading-relaxed mt-1 font-sans">
                    Responda às perguntas sobre o estatuto militar e de conduta para oficializar seu compromisso, receber recompensas do clã e o título honorífico de elite!
                  </p>
                </div>

                {myMember?.completedMissions?.includes('manual_honra_passed') ? (
                  <div className="w-full mt-2 bg-gaming-purple/15 border border-gaming-purple/35 rounded-2xl p-5 flex flex-col items-center max-w-md">
                    <ShieldCheck className="text-gaming-purple mb-1.5 animate-bounce" size={26} />
                    <span className="text-xs font-bold uppercase text-gaming-gold tracking-wider">
                      JURAMENTO OFICIAL ASSINADO!
                    </span>
                    <p className="text-xs text-zinc-300 mt-2 max-w-xs leading-relaxed font-sans">
                      Você é reconhecido como protetor oficial da Suprema Aliança. Seu perfil foi condecorado com o cargo honorário <strong className="text-gaming-gold">Guardião da Honra</strong>.
                    </p>
                    <button
                      onClick={resetQuiz}
                      className="mt-4 flex items-center gap-1.5 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
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
                <div className="flex items-center justify-between border-b border-zinc-805 pb-2.5">
                  <span className="text-[10px] font-mono font-bold text-gaming-gold uppercase tracking-wider">
                    JURAMENTO DE RECRUTAS • QUESTÃO {quizStep} DE {quizQuestions.length}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    VALIDAÇÃO DE DIRETRIZES
                  </span>
                </div>

                <h4 className="text-sm font-semibold leading-relaxed text-white mt-1">
                  {quizQuestions[quizStep - 1].question}
                </h4>

                <div className="flex flex-col gap-2.5 mt-2">
                  {quizQuestions[quizStep - 1].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[quizStep - 1] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleAnswerSelect(quizStep - 1, oIdx)}
                        className={`w-full text-left p-4 rounded-xl border text-xs font-normal transition-all cursor-pointer leading-relaxed ${
                          isSelected 
                            ? 'bg-gaming-gold/10 border-gaming-gold text-white' 
                            : 'bg-black/30 border-zinc-800 hover:bg-zinc-850 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] shrink-0 mt-0.5 ${
                            isSelected ? 'bg-gaming-gold text-black border-gaming-gold' : 'border-zinc-700'
                          }`}>
                            {isSelected && '✓'}
                          </div>
                          <span className="flex-1">{opt.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {quizError && (
                  <div className="bg-red-500/15 border border-red-500/20 rounded-xl p-3 text-red-400 font-mono text-[10px] font-bold tracking-wider flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0 animate-bounce text-red-500" />
                    <span>Divergência detectada! Revise as regras do Manual de Honra e responda com integridade militar.</span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-3 border-t border-zinc-800 pt-4">
                  <button
                    onClick={resetQuiz}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded-xl font-mono text-[9px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleNextQuizStep}
                    disabled={selectedAnswers[quizStep - 1] === undefined}
                    className="px-6 py-2 bg-gaming-gold hover:bg-white text-black font-display font-bold uppercase text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Confirmar & Avançar
                  </button>
                </div>
              </div>
            )}

            {quizStep === 4 && (
              <div className="flex flex-col items-center gap-4 text-center w-full py-4">
                <div className="w-16 h-16 bg-gradient-to-tr from-gaming-purple/20 to-indigo-500/20 rounded-full border border-gaming-purple/30 flex items-center justify-center text-gaming-gold shadow-xl shadow-gaming-purple/10">
                  <Medal size={28} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="font-display font-bold uppercase text-sm sm:text-base tracking-wide text-gaming-gold">
                    JURAMENTO PROTOCOLADO COM SUCESSO!
                  </h3>
                  <p className="text-xs text-zinc-300 max-w-sm leading-relaxed mt-1">
                    Você agora é um <span className="text-gaming-gold font-bold">Guardião da Honra</span> oficial. Seu perfil foi atualizado com o cargo, e +25 pontos de prestígio de XP foram aplicados!
                  </p>
                </div>

                <div className="bg-gaming-purple/10 border border-gaming-purple/25 rounded-2xl p-4 max-w-md w-full font-mono text-left space-y-2 mt-2">
                  <div className="text-[9px] text-gaming-purple font-bold tracking-widest">NOME DO MILITAR:</div>
                  <div className="text-xs font-bold text-white uppercase">{myMember?.name || 'Guerreiro Ativo'}</div>
                  <div className="text-[9px] text-gaming-purple font-bold tracking-widest mt-3">INSÍGNIA ATRIBUÍDA:</div>
                  <div className="text-xs font-bold text-gaming-gold uppercase">⚔️ GUARDIÃO DA HONRA</div>
                </div>

                <button
                  onClick={resetQuiz}
                  className="mt-2 text-zinc-500 hover:text-white font-mono text-[10px] font-bold uppercase hover:underline cursor-pointer"
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
            <h4 className="font-display font-bold text-xs text-red-500 uppercase tracking-widest border-b border-zinc-800 pb-2.5 flex items-center gap-1.5">
              <ShieldAlert size={15} /> CANAL DE OUVIDORIA: DENÚNCIA DE ROUBO
            </h4>
            
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Testemunhou ou tem provas materiais de saques internos indevidos ou quebras de tratados internacionais? Seu envio é criptografado e revisado sigilosamente.
            </p>

            <form onSubmit={handleSubmitReport} className="flex flex-col gap-3.5 mt-1">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">NICK DO INFRATOR</label>
                <input 
                  type="text" 
                  placeholder="Ex: JogadorInfrator" 
                  required
                  value={accusedName}
                  onChange={(e) => setAccusedName(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-805 focus:border-red-550/40 text-white rounded-xl p-3 py-2 text-xs placeholder-zinc-650 outline-hidden transition-all font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">RECURSO SAQUEADO</label>
                <select
                  value={caravanType}
                  onChange={(e) => setCaravanType(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-805 focus:border-red-550/40 text-white rounded-xl p-3 py-2 text-xs outline-hidden cursor-pointer font-sans"
                >
                  <option className="bg-zinc-900" value="caravana_ur">Caravana Suprema (UR)</option>
                  <option className="bg-zinc-900" value="caravana_legendary">Caravana Lendária</option>
                  <option className="bg-zinc-900" value="caravana_epic">Caravana Épica</option>
                  <option className="bg-zinc-900" value="caixotes_gerais">Caixotes de Recursos (Crates)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">PROVAS, HORÁRIO E CANAL</label>
                <textarea 
                  placeholder="Detalhamento do ocorrido. Horário do ataque militar e links para evidências/prints de logs das corporações."
                  required
                  rows={3}
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-805 focus:border-red-550/40 text-white rounded-xl p-3 text-xs placeholder-zinc-650 outline-hidden transition-all resize-none font-sans leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-650 hover:bg-white text-black font-display font-black uppercase text-xs tracking-widest py-3 rounded-xl transition-all cursor-pointer font-bold flex items-center justify-center gap-2 mt-1 shadow-lg shadow-red-950/20"
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
                  className="bg-gaming-purple/15 border border-gaming-purple/35 rounded-2xl p-4 flex items-start gap-2.5 text-gaming-gold font-bold text-xs uppercase text-left leading-relaxed"
                >
                  <span className="text-gaming-gold mt-0.5">✓</span>
                  <div>
                    Caso protocolado sob código de sigilo! Generais Suprema Ordem irão cruzar as hashes de logs em breve.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Audit View List */}
          <div className="bg-gaming-card/40 border border-gaming-border rounded-3xl p-5 flex flex-col gap-4 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
              🛡️ CASOS SOB RASTREAMENTO DE LOGS ({theftReports?.length || 0})
            </span>

            <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto no-scrollbar">
              {theftReports && theftReports.length > 0 ? (
                theftReports.map((item: any, idx: number) => (
                  <div 
                    key={item.id || idx}
                    className="bg-black/20 border border-zinc-800 hover:border-red-500/15 rounded-2xl p-4 flex flex-col gap-2.5 transition-all"
                  >
                    <div className="flex justify-between items-center border-b border-zinc-805/40 pb-2">
                      <span className="text-[9px] font-mono font-bold text-red-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Apuração Ativa
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recente'}
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs flex-col text-zinc-300 text-left">
                      <div className="flex justify-between border-b border-zinc-850 pb-1">
                        <span className="text-zinc-500 font-medium">Denunciante:</span>{' '}
                        <span className="text-zinc-255 font-semibold">{item.reporterName || 'Sigiloso'}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-850 pb-1">
                        <span className="text-zinc-500 font-medium">Infrator Original:</span>{' '}
                        <span className="text-red-400 font-bold font-mono">{item.accusedName}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-850 pb-1">
                        <span className="text-zinc-500 font-medium">Carga Alvo:</span>{' '}
                        <span className="text-amber-400 font-medium text-[11px]">{translateCaravan(item.caravanType)}</span>
                      </div>
                      <div className="text-xs text-zinc-400 bg-black/45 border border-zinc-800/80 rounded-xl p-2.5 mt-1.5">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-1 font-bold">Detalhamento dos Logs:</span>
                        <p className="normal-case italic text-zinc-300">"{item.evidence}"</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                        EM INVESTIGAÇÃO DE LOGS
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center bg-black/10 border border-zinc-800 rounded-2xl border-dashed py-8">
                  <span className="text-2xl mb-1.5">🕊️</span>
                  <h5 className="text-[10px] font-bold uppercase text-white tracking-widest">Paz no Servidor</h5>
                  <p className="text-xs text-zinc-550 mt-1 max-w-xs leading-relaxed font-sans">
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
