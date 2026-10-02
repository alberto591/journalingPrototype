import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../lib/dataStore';
import { DailyPrompt, EmotionSelection, JournalSession } from '../../types';
import { MovementSlowDown } from './MovementSlowDown';
import { MovementClearNoise } from './MovementClearNoise';
import { MovementFeelEmotions } from './MovementFeelEmotions';
import { MovementListen } from './MovementListen';
import { MovementAct } from './MovementAct';
import { JournalSummaryView } from './JournalSummaryView';
import { Lock, RotateCcw, ShieldCheck, Video } from 'lucide-react';
import { VideoPracticeModal } from './VideoPracticeModal';

export const JournalWizard: React.FC = () => {
  const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { 
    todayPrompt, 
    todayJournalSession, 
    journalDraft,
    saveJournalDraft,
    saveJournalSession 
  } = useDataStore();

  // If already completed today and user hasn't explicitly clicked "Repetir / Editar práctica", show summary
  const [viewingSummary, setViewingSummary] = useState<boolean>(Boolean(todayJournalSession));
  const [completedSession, setCompletedSession] = useState<JournalSession | null>(todayJournalSession);

  // Synchronize state if todayJournalSession loads asynchronously
  useEffect(() => {
    if (todayJournalSession) {
      setCompletedSession(todayJournalSession);
      setViewingSummary(true);
    }
  }, [todayJournalSession]);

  // Restore step from draft if available, otherwise 1
  const [currentMovement, setCurrentMovement] = useState<1 | 2 | 3 | 4 | 5>(() => {
    if (journalDraft?.currentMovementStep && !todayJournalSession) {
      return (journalDraft.currentMovementStep as any) || 1;
    }
    return 1;
  });

  // Movement 1 State
  const [breathingDone, setBreathingDone] = useState(false);
  const [silenceDuration, setSilenceDuration] = useState(
    journalDraft?.silence_duration_seconds || 60
  );
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(
    todayJournalSession?.gratitude_items || journalDraft?.gratitude_items || []
  );

  // Movement 2 State
  const [freeWriting, setFreeWriting] = useState(
    todayJournalSession?.free_writing_1m || journalDraft?.free_writing_1m || ''
  );
  const [deepWriting, setDeepWriting] = useState(
    todayJournalSession?.deep_writing_10m || journalDraft?.deep_writing_10m || ''
  );
  const [focusPrompt, setFocusPrompt] = useState<DailyPrompt>(todayPrompt);
  const [focusAnswer, setFocusAnswer] = useState(
    todayJournalSession?.focus_prompt_answer || journalDraft?.focus_prompt_answer || ''
  );

  // Movement 3 State
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionSelection[]>(
    todayJournalSession?.emotions || journalDraft?.emotions || []
  );

  // Movement 4 State
  const [listeningNotes, setListeningNotes] = useState(
    todayJournalSession?.listening_notes || journalDraft?.listening_notes || ''
  );
  const [listeningDuration, setListeningDuration] = useState(
    journalDraft?.listening_duration_seconds || 90
  );

  // Movement 5 State
  const [visionSentence, setVisionSentence] = useState(
    todayJournalSession?.vision_sentence || journalDraft?.vision_sentence || ''
  );
  const [identityWords, setIdentityWords] = useState<string>(() => {
    const raw = todayJournalSession?.identity_words || journalDraft?.identity_words;
    if (Array.isArray(raw)) return raw.join(', ');
    return raw || '';
  });
  const [actionType, setActionType] = useState<'action' | 'release'>(
    todayJournalSession?.action_type || journalDraft?.action_type || 'action'
  );
  const [actionCommitment, setActionCommitment] = useState(
    todayJournalSession?.action_commitment || journalDraft?.action_commitment || ''
  );
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save draft on changes if session not yet finalized
  useEffect(() => {
    if (viewingSummary) return;

    saveJournalDraft({
      currentMovementStep: currentMovement,
      silence_duration_seconds: silenceDuration,
      gratitude_items: gratitudeItems,
      free_writing_1m: freeWriting,
      deep_writing_10m: deepWriting,
      focus_prompt_id: focusPrompt.id,
      focus_prompt_text: focusPrompt.prompt_text,
      focus_prompt_answer: focusAnswer,
      emotions: selectedEmotions,
      listening_notes: listeningNotes,
      listening_duration_seconds: listeningDuration,
      vision_sentence: visionSentence,
      identity_words: identityWords,
      action_type: actionType,
      action_commitment: actionCommitment,
    });
  }, [
    currentMovement,
    silenceDuration,
    gratitudeItems,
    freeWriting,
    deepWriting,
    focusPrompt,
    focusAnswer,
    selectedEmotions,
    listeningNotes,
    listeningDuration,
    visionSentence,
    identityWords,
    actionType,
    actionCommitment,
    viewingSummary,
  ]);


  const handleFinishSession = async () => {
    setIsSaving(true);
    try {
      const newSession = await saveJournalSession({
        date: new Date().toISOString().split('T')[0],
        breathing_completed: true,
        silence_duration_seconds: silenceDuration,
        gratitude_items: gratitudeItems,
        free_writing_1m: freeWriting,
        deep_writing_10m: deepWriting,
        focus_prompt_id: focusPrompt.id,
        focus_prompt_text: focusPrompt.prompt_text,
        focus_prompt_answer: focusAnswer,
        emotions: selectedEmotions,
        listening_notes: listeningNotes,
        listening_duration_seconds: listeningDuration,
        vision_sentence: visionSentence,
        identity_words: identityWords,
        action_type: actionType,
        action_commitment: actionCommitment,
        total_duration_minutes: 30,
        status: 'completed'
      });

      if (newSession) {
        setCompletedSession(newSession);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error saving journal session from wizard:', err);
      alert(err?.message || 'Ha ocurrido un error al guardar la sesión. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestartPractice = () => {
    setViewingSummary(false);
    setCurrentMovement(1);
  };

  const sessionToShow = completedSession || todayJournalSession;

  if (viewingSummary && sessionToShow) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end max-w-3xl mx-auto px-4">
          <button
            onClick={handleRestartPractice}
            className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-sand-200/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Editar o repetir sesión de hoy</span>
          </button>
        </div>
        <JournalSummaryView session={sessionToShow} onNewSession={handleRestartPractice} />
      </div>
    );
  }

  const movementsLabels = [
    { num: 1, name: 'Frenar' },
    { num: 2, name: 'Limpiar el Ruido' },
    { num: 3, name: 'Sentir' },
    { num: 4, name: 'Escuchar' },
    { num: 5, name: 'Actuar' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Movement Stepper Bar */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl p-3 border border-sand-200 shadow-subtle flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            {movementsLabels.map((m) => {
              const isPast = m.num < currentMovement;
              const isCurrent = m.num === currentMovement;
              return (
                <button
                  key={m.num}
                  onClick={() => setCurrentMovement(m.num as any)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isCurrent
                      ? 'bg-stone-900 text-white font-semibold shadow-sm'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent ? 'bg-amber-400 text-stone-900' : isPast ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-stone-600'
                  }`}>
                    {isPast ? '✓' : m.num}
                  </span>
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 pl-3 border-l border-sand-200">
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(true)}
              className="text-[11px] font-bold text-bronze-800 hover:text-stone-950 bg-sand-100 hover:bg-sand-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap border border-sand-300/80"
              title="Si hiciste la práctica en video, márcala aquí directamente"
            >
              <Video className="w-3.5 h-3.5 text-bronze-600" />
              <span>Práctica por video</span>
            </button>
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-stone-500 pl-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Privado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Movement View */}
      {currentMovement === 1 && (
        <MovementSlowDown
          gratitudeItems={gratitudeItems}
          setGratitudeItems={setGratitudeItems}
          onComplete={() => {
            setBreathingDone(true);
            setCurrentMovement(2);
          }}
        />
      )}

      {currentMovement === 2 && (
        <MovementClearNoise
          freeWriting={freeWriting}
          setFreeWriting={setFreeWriting}
          deepWriting={deepWriting}
          setDeepWriting={setDeepWriting}
          focusPrompt={focusPrompt}
          setFocusPrompt={setFocusPrompt}
          focusAnswer={focusAnswer}
          setFocusAnswer={setFocusAnswer}
          onComplete={() => setCurrentMovement(3)}
        />
      )}

      {currentMovement === 3 && (
        <MovementFeelEmotions
          selectedEmotions={selectedEmotions}
          setSelectedEmotions={setSelectedEmotions}
          onBack={() => setCurrentMovement(2)}
          onComplete={() => setCurrentMovement(4)}
        />
      )}

      {currentMovement === 4 && (
        <MovementListen
          listeningNotes={listeningNotes}
          setListeningNotes={setListeningNotes}
          onBack={() => setCurrentMovement(3)}
          onComplete={() => setCurrentMovement(5)}
        />
      )}

      {currentMovement === 5 && (
        <MovementAct
          visionSentence={visionSentence}
          setVisionSentence={setVisionSentence}
          identityWords={identityWords}
          setIdentityWords={setIdentityWords}
          actionType={actionType}
          setActionType={setActionType}
          actionCommitment={actionCommitment}
          setActionCommitment={setActionCommitment}
          onBack={() => setCurrentMovement(4)}
          onSave={handleFinishSession}
          isSaving={isSaving}
        />
      )}

      <VideoPracticeModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSuccess={() => navigate('/dashboard')}
      />
    </div>
  );
};
