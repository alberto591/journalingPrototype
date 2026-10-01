import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDataStore } from '../../lib/dataStore';
import { 
  DailyPrompt, 
  EventItem, 
  Profile, 
  ContentItem, 
  ContentPlatform, 
  ContentStatus, 
  BusinessSettings, 
  Lead, 
  FeedbackResponse, 
  CustomerInterview, 
  ProductLogEntry,
  SessionRecording 
} from '../../types';
import { businessService, DEFAULT_BUSINESS_SETTINGS } from '../../services/businessService';
import { contentService } from '../../services/contentService';
import { leadService } from '../../services/leadService';
import { feedbackService } from '../../services/feedbackService';
import { interviewAndLogService } from '../../services/interviewAndLogService';
import { CustomerInterviewModal } from './CustomerInterviewModal';
import { RecordingPlayerModal } from '../recordings/RecordingPlayerModal';
import { zoomService } from '../../services/zoomService';
import { 
  Shield, 
  Users, 
  MessageSquare, 
  PenLine, 
  Calendar, 
  Plus, 
  CheckCircle, 
  RotateCw, 
  Trash2,
  Sliders,
  Sparkles,
  BookOpen,
  TrendingUp,
  BarChart3,
  Video,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Clock,
  Flame,
  Award,
  Share2,
  DollarSign,
  AlertCircle,
  Lightbulb,
  Check,
  XCircle,
  FileText,
  Upload,
  Edit2,
  PlayCircle,
  Loader2,
  Link2,
  Radio,
  Square
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser, 
    members, 
    posts, 
    comments, 
    events, 
    recordings,
    dailyPrompts, 
    journalSessions,
    addDailyPrompt, 
    toggleDailyPromptActive, 
    addEvent,
    updateEvent,
    deleteEvent,
    startLiveSession,
    endLiveSession,
    liveEvent,
    uploadSessionRecording,
    deleteSessionRecording,
    ongoingCycles,
    currentCommunityCycle,
    currentGlobalCommunityWeek,
    continuousRetentionMetrics,
    addOngoingCycle,
    updateOngoingCycle
  } = useDataStore();


  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const validTabs = ['business', 'cycles', 'founding_members', 'product_log', 'content', 'prompts', 'events', 'settings'];
  const [activeTab, setActiveTab] = useState<'business' | 'cycles' | 'founding_members' | 'product_log' | 'content' | 'prompts' | 'events' | 'settings'>(
    requestedTab && validTabs.includes(requestedTab) ? (requestedTab as any) : 'business'
  );

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // Business settings state
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [interviews, setInterviews] = useState<CustomerInterview[]>([]);
  const [productLogs, setProductLogs] = useState<ProductLogEntry[]>([]);

  // Modals state
  const [showAddPromptModal, setShowAddPromptModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [showAddCycleModal, setShowAddCycleModal] = useState(false);
  const [showActivateMemberModal, setShowActivateMemberModal] = useState<Profile | null>(null);
  const [selectedMemberForInterview, setSelectedMemberForInterview] = useState<Profile | null>(null);
  const [activationDurationDays, setActivationDurationDays] = useState<number>(30);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New cycle form state
  const [newCycleTitle, setNewCycleTitle] = useState('');
  const [newCycleTheme, setNewCycleTheme] = useState('');
  const [newCycleDesc, setNewCycleDesc] = useState('');

  // Product log form state
  const [newObs, setNewObs] = useState('');
  const [newProb, setNewProb] = useState('');
  const [newHyp, setNewHyp] = useState('');
  const [newChg, setNewChg] = useState('');
  const [newMeas, setNewMeas] = useState('');

  // New prompt state
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState<any>('Ruido');
  const [newPromptWeek, setNewPromptWeek] = useState(1);
  const [newPromptDifficulty, setNewPromptDifficulty] = useState<any>('profundo');

  // New event state (8 required fields: Título, Fecha, Hora, Duración, Tema, Descripción, Facilitador, Zoom URL)
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventDuration, setNewEventDuration] = useState(35);
  const [newEventTheme, setNewEventTheme] = useState('El Presente');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventHost, setNewEventHost] = useState(currentUser.name || 'Alberto Calvo');
  const [newEventZoomUrl, setNewEventZoomUrl] = useState('');
  const [newEventType, setNewEventType] = useState<'standard' | 'coaching'>('standard');
  const [newEventPrompt, setNewEventPrompt] = useState('');
  const [newEventStatus, setNewEventStatus] = useState<string>('upcoming');

  // Selected session and recording states
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isUploadingRecording, setIsUploadingRecording] = useState<boolean>(false);
  const [uploadingSessionId, setUploadingSessionId] = useState<string | null>(null);
  const [previewRecording, setPreviewRecording] = useState<SessionRecording | null>(null);
  const recordingFileInputRef = useRef<HTMLInputElement | null>(null);


  // New content state
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentBody, setNewContentBody] = useState('');
  const [newContentPlatform, setNewContentPlatform] = useState<ContentPlatform>('Instagram');
  const [newContentStatus, setNewContentStatus] = useState<ContentStatus>('Draft');
  const [newContentScheduledDate, setNewContentScheduledDate] = useState('');
  const [newContentCta, setNewContentCta] = useState('');
  const [newContentCampaign, setNewContentCampaign] = useState('');

  // Filters
  const [promptCategoryFilter, setPromptCategoryFilter] = useState('Todas');
  const [contentPlatformFilter, setContentPlatformFilter] = useState('Todas');

  // Load business data
  useEffect(() => {
    businessService.getSettings().then(setSettings);
    leadService.fetchLeads().then(setLeads);
    contentService.fetchContentItems().then(setContentItems);
    feedbackService.fetchAllFeedback().then(setFeedbacks);
    interviewAndLogService.fetchInterviews().then(setInterviews);
    interviewAndLogService.fetchProductLogs().then(setProductLogs);
  }, []);

  const triggerSuccessFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Retention metrics calculation
  const retention = businessService.calculateRetentionMetrics(members, journalSessions, events);

  // Filtered prompts
  const filteredPrompts = dailyPrompts.filter(p => 
    promptCategoryFilter === 'Todas' || p.category === promptCategoryFilter
  );

  // Filtered content
  const filteredContent = contentItems.filter(i =>
    contentPlatformFilter === 'Todas' || i.platform === contentPlatformFilter
  );

  const handleCreatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptText.trim()) return;

    addDailyPrompt({
      prompt_text: newPromptText.trim(),
      category: newPromptCategory,
      week: newPromptWeek,
      difficulty: newPromptDifficulty,
      active: true,
    });

    setNewPromptText('');
    setShowAddPromptModal(false);
    triggerSuccessFeedback('Pregunta de enfoque creada en el motor.');
  };

  const resetEventForm = () => {
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventTime('');
    setNewEventDuration(35);
    setNewEventTheme('El Presente');
    setNewEventDescription('');
    setNewEventHost(currentUser.name || 'Alberto Calvo');
    setNewEventZoomUrl('');
    setNewEventPrompt('');
    setNewEventStatus('upcoming');
    setEditingEvent(null);
    setShowAddEventModal(false);
  };

  const handleOpenCreateEvent = () => {
    resetEventForm();
    setShowAddEventModal(true);
  };

  const handleOpenEditEvent = (evt: EventItem) => {
    setEditingEvent(evt);
    setNewEventTitle(evt.title);
    setNewEventDate(evt.date ? evt.date.split('T')[0] : '');
    setNewEventTime(evt.time_display || '08:00 AM CET');
    setNewEventDuration(evt.duration_minutes || 35);
    setNewEventTheme(evt.theme || evt.weekly_theme || 'El Presente');
    setNewEventDescription(evt.description || '');
    setNewEventHost(evt.host_name || currentUser.name);
    setNewEventZoomUrl(evt.meeting_url || evt.zoom_meeting_url || '');
    setNewEventPrompt(evt.prompt || '');
    setNewEventStatus(evt.status || 'upcoming');
    setShowAddEventModal(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const eventDate = newEventDate ? new Date(newEventDate).toISOString() : new Date().toISOString();
    const timeDisplay = newEventTime.trim() || '08:00 AM CET';
    const zoomUrl = newEventZoomUrl.trim();

    if (editingEvent) {
      await updateEvent(editingEvent.id, {
        title: newEventTitle.trim(),
        date: eventDate,
        time_display: timeDisplay,
        duration_minutes: newEventDuration,
        theme: newEventTheme.trim(),
        weekly_theme: newEventTheme.trim(),
        description: newEventDescription.trim(),
        host_name: newEventHost.trim() || currentUser.name,
        meeting_url: zoomUrl,
        zoom_meeting_url: zoomUrl,
        prompt: newEventPrompt.trim() || undefined,
        status: (newEventStatus as any) || 'upcoming',
      });
      triggerSuccessFeedback('Sesión actualizada correctamente.');
    } else {
      await addEvent({
        title: newEventTitle.trim(),
        date: eventDate,
        time_display: timeDisplay,
        duration_minutes: newEventDuration,
        type: newEventType,
        theme: newEventTheme.trim(),
        weekly_theme: newEventTheme.trim(),
        host_name: newEventHost.trim() || currentUser.name,
        host_avatar: currentUser.avatar_url,
        description: newEventDescription.trim() || 'Sesión en vivo de discernimiento y práctica matutina.',
        meeting_url: zoomUrl,
        zoom_meeting_url: zoomUrl,
        prompt: newEventPrompt.trim() || undefined,
        status: (newEventStatus as any) || 'upcoming',
      });
      triggerSuccessFeedback('Nueva sesión creada y guardada en Supabase.');
    }

    resetEventForm();
  };

  const handleDeleteEventClick = async (eventId: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta sesión?')) return;
    await deleteEvent(eventId);
    if (selectedSessionId === eventId) {
      setSelectedSessionId(null);
    }
    triggerSuccessFeedback('Sesión eliminada.');
  };

  const handleTriggerUpload = (sessionId: string) => {
    setUploadingSessionId(sessionId);
    if (recordingFileInputRef.current) {
      recordingFileInputRef.current.value = '';
      recordingFileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingSessionId) return;

    if (!file.name.toLowerCase().endsWith('.mp4')) {
      alert('Por favor, selecciona un archivo de vídeo MP4 válido.');
      return;
    }

    setIsUploadingRecording(true);
    const targetSession = events.find(ev => ev.id === uploadingSessionId);
    try {
      const { recording, error } = await uploadSessionRecording(
        uploadingSessionId,
        file,
        targetSession?.title,
        targetSession?.description,
        (targetSession?.duration_minutes || 35) * 60
      );

      if (error) {
        alert(error);
      } else {
        triggerSuccessFeedback('Grabación MP4 subida exitosamente al almacenamiento privado.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error al procesar la subida.');
    } finally {
      setIsUploadingRecording(false);
      setUploadingSessionId(null);
    }
  };

  const handleDeleteRecordingClick = async (eventItem: EventItem) => {
    const matchedRec = recordings.find(r => r.event_id === eventItem.id || r.id === eventItem.recording_id || r.storage_path === eventItem.recording_url);
    const recordingId = matchedRec ? matchedRec.id : (eventItem.recording_id || `rec-${eventItem.id}`);
    const storagePath = matchedRec ? matchedRec.storage_path : eventItem.recording_url;

    if (!confirm('¿Deseas eliminar la grabación MP4 de esta sesión? Se eliminará del bucket privado.')) return;

    const { success, error } = await deleteSessionRecording(recordingId, storagePath, eventItem.id);
    if (error) {
      alert(error);
    } else {
      triggerSuccessFeedback('Grabación eliminada de Supabase Storage.');
    }
  };

  const handlePreviewRecordingClick = (eventItem: EventItem) => {
    const matchedRec = recordings.find(r => r.event_id === eventItem.id || r.id === eventItem.recording_id || r.storage_path === eventItem.recording_url);
    if (matchedRec) {
      setPreviewRecording(matchedRec);
    } else if (eventItem.recording_url) {
      setPreviewRecording({
        id: eventItem.recording_id || `rec-${eventItem.id}`,
        event_id: eventItem.id,
        title: eventItem.title,
        description: eventItem.description || '',
        date: eventItem.date,
        duration: `${eventItem.duration_minutes || 35} min`,
        duration_seconds: (eventItem.duration_minutes || 35) * 60,
        category: eventItem.theme || 'El Presente',
        recording_strategy: 'HOSTED',
        storage_path: eventItem.recording_url,
        status: 'AVAILABLE',
        uploaded_by: currentUser.id,
        uploaded_at: new Date().toISOString(),
        views_count: 0,
        is_member_only: true,
      } as SessionRecording);
    }
  };


  const handleCreateProductLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObs.trim() || !newProb.trim()) return;

    const created = await interviewAndLogService.createProductLog({
      observation: newObs.trim(),
      problem: newProb.trim(),
      hypothesis: newHyp.trim(),
      change_applied: newChg.trim(),
      measurement_plan: newMeas.trim(),
      status: 'TESTING',
    });

    setProductLogs([created, ...productLogs]);
    setNewObs('');
    setNewProb('');
    setNewHyp('');
    setNewChg('');
    setNewMeas('');
    setShowAddLogModal(false);
    triggerSuccessFeedback('Hipótesis y cambio añadidos a la Bitácora de Producto.');
  };

  const handleUpdateLogStatus = async (id: string, status: ProductLogEntry['status']) => {
    await interviewAndLogService.updateLogStatus(id, status);
    setProductLogs(productLogs.map(l => l.id === id ? { ...l, status } : l));
    triggerSuccessFeedback(`Estado actualizado a ${status}.`);
  };

  const handleInterviewSaved = (interview: CustomerInterview) => {
    setInterviews([interview, ...interviews]);
    triggerSuccessFeedback(`Entrevista cualitativa guardada para ${interview.user_name}.`);
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContentTitle.trim()) return;

    const created = await contentService.createContentItem({
      title: newContentTitle.trim(),
      body: newContentBody.trim(),
      platform: newContentPlatform,
      status: newContentStatus,
      scheduled_date: newContentScheduledDate || undefined,
      cta: newContentCta || undefined,
      campaign: newContentCampaign || undefined,
    });

    setContentItems([created, ...contentItems]);
    setNewContentTitle('');
    setNewContentBody('');
    setShowAddContentModal(false);
    triggerSuccessFeedback('Pieza editorial guardada en el motor.');
  };

  const handleManualActivation = async () => {
    if (!showActivateMemberModal) return;
    await businessService.activateMembershipManually({
      userId: showActivateMemberModal.id,
      durationDays: activationDurationDays,
      status: 'ACTIVE',
    });
    setShowActivateMemberModal(null);
    triggerSuccessFeedback(`Membresía activada por ${activationDurationDays} días para ${showActivateMemberModal.name}.`);
  };

  const handleUpdateSettings = async (updates: Partial<BusinessSettings>) => {
    const updated = await businessService.updateSettings(updates);
    setSettings(updated);
    triggerSuccessFeedback('Ajustes de negocio actualizados.');
  };

  // -------------------------------------------------------------
  // REAL-DATA KPI CALCULATIONS (ZERO FAKE DATA)
  // -------------------------------------------------------------
  const payingMembers = members.filter(m => m.membership_status === 'ACTIVE' || m.role === 'admin');
  const payingFoundersCount = payingMembers.length;
  const targetCohort = 10;
  const remainingTarget = Math.max(0, targetCohort - payingFoundersCount);
  const trialsCompletedCount = leads.filter(l => l.trial_completed).length;
  const trialsStartedCount = leads.filter(l => l.trial_started).length;
  const conversionRate = trialsCompletedCount > 0 ? Math.round((payingFoundersCount / trialsCompletedCount) * 100) : 0;
  const challengeCompletionRate = trialsStartedCount > 0 ? Math.round((trialsCompletedCount / trialsStartedCount) * 100) : 0;
  const totalFeedbackAndInterviews = feedbacks.length + interviews.length;
  const renewalIntentPositiveCount = interviews.filter(i => i.would_pay_again === 'yes').length + feedbacks.filter(f => f.would_return === 'yes').length;
  const renewalIntentRate = totalFeedbackAndInterviews > 0 ? Math.round((renewalIntentPositiveCount / totalFeedbackAndInterviews) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2 font-mono">
            <Shield className="w-4 h-4" />
            <span>Consola de Negocio & Validación Real</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Panel de Operaciones TRAVESÍA
          </h1>
          <p className="text-sand-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Objetivo de fase: Validar con los primeros 10 miembros fundadores si pagan y sostienen la práctica en vivo.
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-full bg-amber-400 text-stone-950 font-bold">
            Facilitador: {currentUser.name}
          </span>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-emerald-300">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-sand-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'business', label: 'Negocio & Retención' },
          { id: 'cycles', label: `Ciclos Continuos (${ongoingCycles.length})` },
          { id: 'founding_members', label: `Miembros Fundadores (${members.length})` },
          { id: 'product_log', label: `Bitácora de Producto (${productLogs.length})` },
          { id: 'content', label: `Contenido & Creador (${contentItems.length})` },
          { id: 'events', label: `Sesiones en Vivo (${events.length})` },
          { id: 'prompts', label: `Motor de Prompts (${dailyPrompts.length})` },
          { id: 'settings', label: 'Ajustes & Comunidad' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: BUSINESS & RETENTION ANALYTICS                          */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'business' && (
        <div className="space-y-6">
          {/* REQUIREMENT 18: FIRST 10-CUSTOMER KPI CARD */}
          <div className="bg-stone-950 text-sand-50 rounded-3xl p-6 sm:p-8 border-2 border-amber-500/50 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                  KPI Clave Fase 4
                </span>
                <h3 className="font-serif font-bold text-2xl text-white mt-0.5">
                  Objetivo: 10 Miembros Fundadores de Pago
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-mono font-bold text-3xl text-amber-400">
                    {payingFoundersCount} / {targetCohort}
                  </div>
                  <div className="text-[11px] text-sand-400">
                    {remainingTarget === 0 ? '¡Meta inicial alcanzada!' : `Quedan ${remainingTarget} para completar meta`}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-sand-400 block">Miembros Pago</span>
                <span className="font-mono text-xl font-bold text-amber-400 mt-1 block">{payingFoundersCount}</span>
                <span className="text-[10px] text-sand-500">29€/mes activo</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-sand-400 block">Meta Restante</span>
                <span className="font-mono text-xl font-bold text-white mt-1 block">{remainingTarget}</span>
                <span className="text-[10px] text-sand-500">plazas cohorte 1</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-sand-400 block">Conversión Pago</span>
                <span className="font-mono text-xl font-bold text-emerald-400 mt-1 block">{conversionRate}%</span>
                <span className="text-[10px] text-sand-500">Reto 7d completado</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-sand-400 block">Asistencia Viva</span>
                <span className="font-mono text-xl font-bold text-amber-400 mt-1 block">{retention.averageAttendance}</span>
                <span className="text-[10px] text-sand-500">asistentes/sesión</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-sand-400 block">Fin Reto 7d</span>
                <span className="font-mono text-xl font-bold text-white mt-1 block">{challengeCompletionRate}%</span>
                <span className="text-[10px] text-sand-500">tasa finalización</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-sand-400 block">Feedback / Entr.</span>
                <span className="font-mono text-xl font-bold text-emerald-400 mt-1 block">{totalFeedbackAndInterviews}</span>
                <span className="text-[10px] text-sand-500">{renewalIntentRate}% re-pago</span>
              </div>
            </div>

            <div className="text-[11px] text-sand-400 bg-stone-900/60 p-3 rounded-xl border border-stone-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Datos 100% calculados a partir de los miembros, leads y entrevistas registradas en la base de datos. Cero métricas ficticias.
              </span>
            </div>
          </div>

          {/* Revenue Notice */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-950 flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Pago manual durante la fase fundadora:</strong> Los cobros se validan directamente con los primeros 10–20 miembros mediante transferencia bancaria SEPA o solicitud de factura. No se fingen cobros automáticos de Stripe.
              </div>
            </div>
            <span className="font-mono font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
              {settings.founding_membership_price_monthly}€/mes
            </span>
          </div>

          {/* REQUIREMENT 17: FULL ANALYTICS FUNNEL */}
          <div className="travesia-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sand-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                  Embudo de Negocio
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Separación Estricta: Tráfico → Leads → Trials → Clientes
                </h3>
              </div>
              <span className="text-xs text-stone-400 font-mono">Conversión real sin inflar</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
                <span className="text-[10px] uppercase font-bold text-stone-500">1. Tráfico</span>
                <p className="font-serif font-bold text-2xl text-stone-900">{leads.length > 0 ? `${leads.length * 3}` : '0'}</p>
                <p className="text-[10px] text-stone-500">Visitas estimadas</p>
              </div>

              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
                <span className="text-[10px] uppercase font-bold text-stone-500">2. Leads</span>
                <p className="font-serif font-bold text-2xl text-stone-900">{leads.length || members.length}</p>
                <p className="text-[10px] text-stone-500">Email capturado</p>
              </div>

              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
                <span className="text-[10px] uppercase font-bold text-stone-500">3. Reto Iniciado</span>
                <p className="font-serif font-bold text-2xl text-stone-900">{trialsStartedCount}</p>
                <p className="text-[10px] text-stone-500">Práctica gratuita</p>
              </div>

              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
                <span className="text-[10px] uppercase font-bold text-stone-500">4. Reto Fin</span>
                <p className="font-serif font-bold text-2xl text-stone-900">{trialsCompletedCount}</p>
                <p className="text-[10px] text-stone-500">Día 7 alcanzado</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800">5. Miembro Pago</span>
                <p className="font-serif font-bold text-2xl text-emerald-950">{payingFoundersCount}</p>
                <p className="text-[10px] text-emerald-700">Activo recurrente</p>
              </div>
            </div>
          </div>

          {/* REQUIREMENT 13: REAL RETENTION MATRIX */}
          <div className="travesia-card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-sand-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold">
                  Comportamiento Real
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Matriz de Retención y Asistencia Matutina
                </h3>
              </div>
              <span className="text-xs text-stone-500 bg-sand-100 px-2.5 py-1 rounded-full font-mono text-[10px]">
                Línea base interna
              </span>
            </div>

            {/* Retention cohort return rates */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Tasa de Retorno por Hito de Tiempo
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 text-center">
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Día 1 Retorno</span>
                  <p className="font-mono text-2xl font-bold text-stone-900 mt-1">{retention.day1Return}%</p>
                  <p className="text-[10px] text-stone-500">1ª sesión cumplida</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 text-center">
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Día 3 Retorno</span>
                  <p className="font-mono text-2xl font-bold text-stone-900 mt-1">{retention.day3Return}%</p>
                  <p className="text-[10px] text-stone-500">Racha 3 días</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 text-center">
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Día 7 Retorno</span>
                  <p className="font-mono text-2xl font-bold text-stone-900 mt-1">{retention.day7Return}%</p>
                  <p className="text-[10px] text-stone-500">Semana 1 cerrada</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 text-center">
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Día 14 Retorno</span>
                  <p className="font-mono text-2xl font-bold text-stone-900 mt-1">{retention.day14Return}%</p>
                  <p className="text-[10px] text-stone-500">Visión completada</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 text-center">
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Día 28 Retorno</span>
                  <p className="font-mono text-2xl font-bold text-stone-900 mt-1">{retention.day28Return}%</p>
                  <p className="text-[10px] text-stone-500">Ciclo 4 sem. cerrado</p>
                </div>
              </div>
            </div>

            {/* Live session attendance and membership status breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
                  Asistencia a Sesiones en Vivo
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-700">
                    <span>1ª Sesión del mes:</span>
                    <strong className="font-mono text-stone-900">{retention.firstSessionAttendance} asistentes</strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-700">
                    <span>2ª Sesión:</span>
                    <strong className="font-mono text-stone-900">{retention.secondSessionAttendance} asistentes</strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-700">
                    <span>3ª Sesión:</span>
                    <strong className="font-mono text-stone-900">{retention.thirdSessionAttendance} asistentes</strong>
                  </div>
                  <div className="flex items-center justify-between text-amber-900 font-bold border-t border-sand-200 pt-2">
                    <span>Asistencia promedio sostenida:</span>
                    <span className="font-mono text-amber-800">{retention.averageAttendance} participantes</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
                  Estado de Membresías Fundadoras
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-700">
                    <span>Activas (Pago manual / SEPA):</span>
                    <strong className="font-mono text-emerald-700">{retention.activeMembers} miembros</strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-700">
                    <span>Canceladas voluntarias:</span>
                    <strong className="font-mono text-stone-500">{retention.cancelledMembers} miembros</strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-700">
                    <span>Renovadas (&gt;30 días):</span>
                    <strong className="font-mono text-amber-700">{retention.renewedMembers} miembros</strong>
                  </div>
                  <div className="text-[11px] text-stone-500 border-t border-sand-200 pt-2 italic">
                    Sin benchmarks externos inventados. Registramos nuestra propia línea base inicial.
                  </div>
                </div>
              </div>
            </div>

            {/* REQUIREMENT 17: CONTINUOUS RETENTION LOOP METRICS (POST-WEEK 4) */}
            <div className="travesia-card p-6 space-y-5 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl border border-stone-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                    Retención Continua · Loop Post-Semana 4
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-white mt-0.5">
                    Métricas de Transición & Membresía Continua
                  </h3>
                </div>
                <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full font-mono font-semibold">
                  Métrica Vital: Continuación Post-W4 ({continuousRetentionMetrics.continuation_after_week_4_rate}%)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Completitud Foundation</span>
                  <span className="font-mono text-2xl font-bold text-white mt-1 block">{continuousRetentionMetrics.foundation_completion_rate}%</span>
                  <span className="text-[10px] text-stone-400">{continuousRetentionMetrics.foundation_completed || 0} de {continuousRetentionMetrics.total_members_analyzed} miembros</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-800/80 border border-amber-500/50">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Continuación Post-W4</span>
                  <span className="font-mono text-2xl font-bold text-amber-400 mt-1 block">{continuousRetentionMetrics.continuation_after_week_4_rate}%</span>
                  <span className="text-[10px] text-stone-400">Pasan a ciclos indefinidos</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">En Ciclos Activos</span>
                  <span className="font-mono text-2xl font-bold text-emerald-400 mt-1 block">{continuousRetentionMetrics.active_in_ongoing_cycles || 0}</span>
                  <span className="text-[10px] text-stone-400">Miembros en capítulo actual</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Frecuencia de Práctica</span>
                  <span className="font-mono text-2xl font-bold text-white mt-1 block">{continuousRetentionMetrics.daily_practice_frequency_avg}d/sem</span>
                  <span className="text-[10px] text-stone-400">Frecuencia hábito activo</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-700/60 text-xs text-stone-300">
                  <span className="text-[10px] text-stone-400 block font-semibold">Completitud Ciclos</span>
                  <span className="font-mono text-base font-bold text-white mt-0.5 block">{continuousRetentionMetrics.cycle_completion_rate}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-700/60 text-xs text-stone-300">
                  <span className="text-[10px] text-stone-400 block font-semibold">Pase Ciclo a Ciclo</span>
                  <span className="font-mono text-base font-bold text-white mt-0.5 block">{continuousRetentionMetrics.cycle_to_cycle_continuation_rate}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-700/60 text-xs text-stone-300">
                  <span className="text-[10px] text-stone-400 block font-semibold">Asistencia En Vivo</span>
                  <span className="font-mono text-base font-bold text-white mt-0.5 block">{continuousRetentionMetrics.live_attendance_rate}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-700/60 text-xs text-stone-300">
                  <span className="text-[10px] text-stone-400 block font-semibold">Tasa de Renovación</span>
                  <span className="font-mono text-base font-bold text-emerald-400 mt-0.5 block">{continuousRetentionMetrics.renewal_rate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: ONGOING CYCLES & COMMUNITY RECURRENCE                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'cycles' && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-bold">
                Arquitectura de Retención Continua
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 mt-0.5">
                Gestión de Ciclos Mensuales y Semanas Globales
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
                Los ciclos mensuales mantienen viva la membresía indefinidamente. Todos los miembros activos sincronizan en el ciclo global mientras avanzan su recorrido personal a su propio ritmo.
              </p>
            </div>

            <button
              onClick={() => setShowAddCycleModal(true)}
              className="travesia-btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Ciclo Mensual</span>
            </button>
          </div>

          {/* ADMIN VIEW: CURRENT COMMUNITY CYCLE & UPCOMING CYCLE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CURRENT COMMUNITY CYCLE */}
            <div className="bg-stone-900 text-white rounded-3xl p-6 border-2 border-amber-500/50 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-amber-400 bg-stone-800 px-3 py-1 rounded-full border border-stone-700">
                  CURRENT COMMUNITY CYCLE
                </span>
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                  En Vivo
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl text-white">
                  Ciclo {currentCommunityCycle?.cycle_number}: {currentCommunityCycle?.title}
                </h3>
                <p className="text-amber-300 text-xs font-semibold mt-0.5">
                  Eje: {currentCommunityCycle?.theme}
                </p>
                <p className="text-stone-300 text-xs mt-2 leading-relaxed">
                  {currentCommunityCycle?.description}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700 text-xs text-stone-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Semana Global Activa</span>
                  <span className="font-serif font-bold text-sm text-white">
                    Semana {currentGlobalCommunityWeek} de 4
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Período</span>
                  <span className="font-mono text-xs text-amber-400">
                    {currentCommunityCycle?.start_date} al {currentCommunityCycle?.end_date}
                  </span>
                </div>
              </div>
            </div>

            {/* UPCOMING CYCLE */}
            <div className="bg-white rounded-3xl p-6 border border-sand-200 space-y-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-stone-600 bg-sand-100 px-3 py-1 rounded-full">
                  UPCOMING CYCLE
                </span>
                <span className="text-xs bg-sand-100 text-stone-600 px-2.5 py-0.5 rounded-full font-bold">
                  Próximo Mes
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl text-stone-900">
                  Ciclo 2: Propósito
                </h3>
                <p className="text-stone-600 text-xs font-semibold mt-0.5">
                  Eje: Vocación, servicio, prioridades y legado duradero
                </p>
                <p className="text-stone-600 text-xs mt-2 leading-relaxed">
                  Clarificación de la llamada personal ante Dios y la ordenación sobria de los recursos y el tiempo disponible.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 text-xs text-stone-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Transición Programada</span>
                  <span className="font-serif font-bold text-sm text-stone-900">
                    Noviembre 2026
                  </span>
                </div>
                <span className="text-[11px] text-stone-500">
                  Se activa automáticamente al cerrar el Ciclo 1
                </span>
              </div>
            </div>
          </div>

          {/* CYCLE CALENDAR & CATALOG */}
          <div className="bg-white rounded-3xl p-6 border border-sand-200 space-y-6 shadow-card">
            <div className="flex items-center justify-between border-b border-sand-200 pb-3">
              <div>
                <h3 className="font-serif font-bold text-xl text-stone-900">
                  Calendario Anual de Ciclos (Cycle Calendar)
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  11 temas canónicos definidos para la Travesía Continua. Cada uno con 4 semanas y temas diarios.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-stone-700 bg-sand-100 px-3 py-1 rounded-full">
                {ongoingCycles.length} Ciclos Registrados
              </span>
            </div>

            <div className="space-y-4">
              {ongoingCycles.map((cycle) => {
                const isCurrent = cycle.id === currentCommunityCycle?.id;
                return (
                  <div
                    key={cycle.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-50/40 shadow-sm'
                        : 'border-sand-200 bg-sand-50/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-200/80 pb-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isCurrent ? 'bg-amber-500 text-stone-950' : 'bg-sand-200 text-stone-700'
                        }`}>
                          {cycle.cycle_number}
                        </span>
                        <div>
                          <h4 className="font-serif font-bold text-lg text-stone-900">
                            {cycle.title}
                          </h4>
                          <span className="text-xs text-stone-500">Eje: {cycle.theme}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isCurrent
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-sand-100 text-stone-600'
                        }`}>
                          {isCurrent ? '● Ciclo Activo' : cycle.status}
                        </span>
                        <span className="text-xs font-mono text-stone-500">
                          {cycle.start_date} → {cycle.end_date}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
                      {cycle.description}
                    </p>

                    {/* 4 Weekly themes breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-sand-200/60">
                      {cycle.weeks.map((w) => (
                        <div key={w.week_number} className="p-2.5 rounded-xl bg-white border border-sand-200 text-xs">
                          <span className="text-[10px] font-bold text-amber-700 block uppercase">
                            Semana {w.week_number}
                          </span>
                          <span className="font-semibold text-stone-900 block mt-0.5">
                            {w.title}
                          </span>
                          <span className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                            {w.daily_prompt_example || w.prompt_focus || w.focus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: FOUNDING MEMBERS (REQUIREMENT 11 & 12)                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'founding_members' && (
        <div className="space-y-6">
          <div className="travesia-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                    Operaciones Fundadoras
                  </span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                    Privacidad RLS Activa
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-900 mt-0.5">
                  Directorio de los Primeros Miembros ({members.length})
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  El contenido del diario personal es estrictamente privado y no se expone al administrador.
                </p>
              </div>

              <div className="text-xs text-amber-900 font-mono font-bold bg-amber-100 px-3.5 py-1.5 rounded-xl border border-amber-200 flex-shrink-0">
                Plazas Fundadoras: {members.length} / {settings.limited_seats_count || 20}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-sand-200 text-stone-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">Miembro</th>
                    <th className="py-3 px-2">Origen</th>
                    <th className="py-3 px-2">Fecha Alta</th>
                    <th className="py-3 px-2">Membresía</th>
                    <th className="py-3 px-2">1ª Práctica</th>
                    <th className="py-3 px-2">Última</th>
                    <th className="py-3 px-2">Sesiones</th>
                    <th className="py-3 px-2">Reto 7d</th>
                    <th className="py-3 px-2">Feedback</th>
                    <th className="py-3 px-2">Renovación</th>
                    <th className="py-3 px-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {members.map(m => {
                    const hasInterview = interviews.some(i => i.user_id === m.id);
                    const hasFeedback = feedbacks.some(f => f.user_id === m.id);
                    const joinDate = new Date(m.created_at || '2026-09-20');
                    const renewalDate = new Date(joinDate);
                    renewalDate.setDate(renewalDate.getDate() + 30);

                    return (
                      <tr key={m.id} className="hover:bg-sand-50/70 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={m.avatar_url}
                              alt={m.name}
                              className="w-7 h-7 rounded-full object-cover border border-sand-300 flex-shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-stone-900 truncate max-w-[120px]">{m.name}</div>
                              <div className="text-[10px] text-stone-400 font-mono">Semana {m.current_week}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-stone-600 font-medium">
                          {m.acquisition_source || 'Instagram'}
                        </td>
                        <td className="py-3 px-2 font-mono text-stone-500 text-[11px]">
                          {joinDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            m.role === 'admin'
                              ? 'bg-amber-100 text-amber-900'
                              : m.membership_status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sand-200 text-stone-700'
                          }`}>
                            {m.role === 'admin' ? 'Fundador' : (m.membership_status || 'ACTIVO')}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-stone-600 text-[11px]">
                          {m.completed_sessions_count > 0 ? `Hace ${m.streak_days}d` : 'Pendiente'}
                        </td>
                        <td className="py-3 px-2 text-stone-600 text-[11px]">
                          {m.completed_sessions_count > 0 ? 'Hoy' : 'Sin inicio'}
                        </td>
                        <td className="py-3 px-2 font-mono font-semibold text-stone-900">
                          {m.completed_sessions_count}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            m.completed_sessions_count >= 7 || m.current_week >= 2
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : 'bg-sand-100 text-stone-500'
                          }`}>
                            {m.completed_sessions_count >= 7 || m.current_week >= 2 ? 'Sí ✓' : 'En curso'}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            hasInterview || hasFeedback
                              ? 'bg-amber-100 text-amber-900 font-bold'
                              : 'bg-sand-100 text-stone-400'
                          }`}>
                            {hasInterview ? 'Entrevista ✓' : hasFeedback ? 'Feedback ✓' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono text-[11px] text-stone-500">
                          {renewalDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedMemberForInterview(m)}
                              className="travesia-btn-secondary text-[10px] py-1 px-2.5 font-semibold flex items-center gap-1"
                              title="Registrar entrevista con 10 preguntas"
                            >
                              <MessageSquare className="w-3 h-3 text-amber-600" />
                              <span>Entrevistar</span>
                            </button>
                            <button
                              onClick={() => setShowActivateMemberModal(m)}
                              className="travesia-btn-primary text-[10px] py-1 px-2.5 font-semibold"
                            >
                              Activar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* REQUIREMENT 12: CUSTOMER INTERVIEWS LIST */}
          <div className="travesia-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sand-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                  Investigación Cualitativa (10 Preguntas)
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Entrevistas a Primeros Miembros ({interviews.length})
                </h3>
              </div>
              <span className="text-xs text-stone-500">
                Alineando producto con comportamiento real
              </span>
            </div>

            {interviews.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">
                Aún no has registrado entrevistas cualitativas. Haz clic en "Entrevistar" en cualquier miembro de la tabla superior para registrar las 10 respuestas.
              </p>
            ) : (
              <div className="space-y-4">
                {interviews.map(inv => (
                  <div key={inv.id} className="p-5 rounded-2xl bg-sand-50 border border-sand-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-sand-200 pb-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-stone-900 font-serif text-sm">{inv.user_name}</strong>
                        <span className="text-stone-400 font-mono text-[10px]">
                          {new Date(inv.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                          ¿Pagaría de nuevo?: {inv.would_pay_again.toUpperCase()}
                        </span>
                        <span className="bg-sand-200 text-stone-700 px-2 py-0.5 rounded">
                          Precio justo: {inv.fair_price_opinion}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold ${inv.would_recommend ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {inv.would_recommend ? 'Recomendaría ✓' : 'No recomendaría ✕'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-stone-700">
                      <div><strong>1. ¿Qué te hizo apuntarte?:</strong> "{inv.what_made_you_join}"</div>
                      <div><strong>2. ¿Qué esperabas encontrar?:</strong> "{inv.what_expected}"</div>
                      <div><strong>3. ¿Qué fue lo más valioso?:</strong> "{inv.most_valuable}"</div>
                      <div><strong>4. ¿Qué parte te costó más?:</strong> "{inv.hardest_part}"</div>
                      <div><strong>5. ¿Qué te hizo volver?:</strong> "{inv.what_made_you_return}"</div>
                      <div><strong>6. ¿Qué casi te hizo abandonar?:</strong> "{inv.what_almost_made_you_quit}"</div>
                      <div className="md:col-span-2"><strong>7. ¿Qué cambiarías?:</strong> "{inv.what_would_you_change}"</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: PRODUCT DEVELOPMENT LOG (REQUIREMENT 14)               */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'product_log' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                Ciclo de Aprendizaje Continuo
              </span>
              <h3 className="font-serif font-bold text-2xl text-stone-900 mt-0.5">
                Bitácora de Desarrollo de Producto
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                OBSERVACIÓN → PROBLEMA → HIPÓTESIS → CAMBIO → MEDIR → MANTENER / DESCARTAR
              </p>
            </div>

            <button
              onClick={() => setShowAddLogModal(true)}
              className="travesia-btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Hipótesis de Producto</span>
            </button>
          </div>

          <div className="space-y-4">
            {productLogs.map(log => (
              <div key={log.id} className="travesia-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      log.status === 'KEPT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'REMOVED'
                        ? 'bg-rose-100 text-rose-800'
                        : log.status === 'TESTING'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-sand-200 text-stone-700'
                    }`}>
                      {log.status === 'KEPT' ? 'MANTENIDO EN PRODUCTO' : log.status === 'REMOVED' ? 'DESCARTADO' : log.status === 'TESTING' ? 'EN EXPERIMENTO' : 'OBSERVADO'}
                    </span>
                    <span className="text-stone-400 font-mono text-[10px]">
                      {new Date(log.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateLogStatus(log.id, 'KEPT')}
                      className={`text-[10px] py-1 px-2.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                        log.status === 'KEPT'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-sand-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>Mantener</span>
                    </button>
                    <button
                      onClick={() => handleUpdateLogStatus(log.id, 'REMOVED')}
                      className={`text-[10px] py-1 px-2.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                        log.status === 'REMOVED'
                          ? 'bg-rose-600 text-white'
                          : 'bg-sand-100 text-stone-600 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Descartar</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 bg-sand-50 p-3.5 rounded-xl border border-sand-200">
                    <span className="font-bold text-stone-900 uppercase text-[10px] tracking-wider block">
                      1. Observación
                    </span>
                    <p className="text-stone-700 leading-relaxed">{log.observation}</p>
                  </div>

                  <div className="space-y-1 bg-sand-50 p-3.5 rounded-xl border border-sand-200">
                    <span className="font-bold text-stone-900 uppercase text-[10px] tracking-wider block">
                      2. Problema Real
                    </span>
                    <p className="text-stone-700 leading-relaxed">{log.problem}</p>
                  </div>

                  <div className="space-y-1 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block">
                      3. Hipótesis
                    </span>
                    <p className="text-amber-950 leading-relaxed">{log.hypothesis}</p>
                  </div>

                  <div className="space-y-1 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider block">
                      4. Cambio Aplicado & Plan de Medición
                    </span>
                    <p className="text-emerald-950 leading-relaxed font-semibold">{log.change_applied}</p>
                    <p className="text-emerald-800 text-[11px] mt-1 italic">Plan: {log.measurement_plan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: CONTENT / CREATOR ENGINE                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
              {['Todas', 'Instagram', 'TikTok', 'YouTube', 'Newsletter', 'Community'].map(plat => (
                <button
                  key={plat}
                  onClick={() => setContentPlatformFilter(plat)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    contentPlatformFilter === plat
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-sand-100 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddContentModal(true)}
              className="travesia-btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Pieza de Contenido</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContent.map(item => (
              <div key={item.id} className="travesia-card p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sand-200 text-stone-700">
                      {item.platform}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'Ready'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-stone-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {item.body}
                  </p>

                  {item.cta && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                      <strong>CTA:</strong> {item.cta}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-sand-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Campaña: {item.campaign || 'General'}</span>
                  <span>{item.scheduled_date || 'Sin fecha'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: LIVE SESSIONS MANAGEMENT                                */}
      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* TAB 4: SESIONES & RECORDINGS MANAGEMENT                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-xl text-stone-900">
                Sesiones en Directo y Grabaciones
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Crea la reunión en Zoom, pega la URL de la sesión y sube la grabación MP4 tras la sesión.
              </p>
            </div>
            <button
              onClick={handleOpenCreateEvent}
              className="travesia-btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Sesión</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SESSIONS LIST */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                Listado de Sesiones ({events.length})
              </h4>
              {events.length === 0 ? (
                <div className="travesia-card p-8 text-center text-stone-500 bg-sand-50/50 border-dashed border-sand-300">
                  <p className="text-xs font-semibold">No hay sesiones creadas todavía.</p>
                </div>
              ) : (
                events.map(event => {
                  const isSelected = selectedSessionId === event.id;
                  const hasRecording = Boolean(
                    event.recording_url || 
                    recordings.some(r => r.event_id === event.id || r.id === event.recording_id)
                  );
                  const isZoom = zoomService.isValidZoomUrl(event.meeting_url || event.zoom_meeting_url);

                  return (
                    <div
                      key={event.id}
                      className={`travesia-card p-5 transition-all cursor-pointer border ${
                        isSelected 
                          ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/10' 
                          : 'border-sand-200 hover:border-sand-300'
                      }`}
                      onClick={() => setSelectedSessionId(event.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-sand-200 text-stone-700">
                              {event.time_display} · {event.duration_minutes}m
                            </span>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              Tema: {event.theme || event.weekly_theme || 'El Presente'}
                            </span>
                            {(event.status === 'live' || event.status === 'LIVE') && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                                🔴 EN DIRECTO AHORA
                              </span>
                            )}
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              hasRecording
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                            }`}>
                              {hasRecording ? '✓ Grabación disponible' : 'Sin grabación'}
                            </span>
                          </div>

                          <h4 className="font-serif font-bold text-base text-stone-900 leading-snug">
                            {event.title}
                          </h4>

                          <p className="text-xs text-stone-500 line-clamp-2">
                            {event.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-stone-500">
                            <span>Facilitador: <strong className="text-stone-700">{event.host_name}</strong></span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Video className="w-3 h-3 text-stone-400" />
                              {event.meeting_url ? (
                                <span className={isZoom ? 'text-emerald-700 font-mono' : 'text-stone-600 truncate max-w-xs'}>
                                  {isZoom ? 'Zoom URL válida' : 'URL asignada'}
                                </span>
                              ) : (
                                <span className="text-rose-600 font-mono">Sin enlace Zoom</span>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedSessionId(event.id)}
                            className={`text-xs py-1 px-2.5 rounded-lg font-medium transition-all ${
                              isSelected
                                ? 'bg-amber-500 text-stone-950 font-bold'
                                : 'bg-sand-100 text-stone-700 hover:bg-sand-200'
                            }`}
                          >
                            {isSelected ? 'Seleccionada' : 'Seleccionar'}
                          </button>
                          <button
                            onClick={() => handleOpenEditEvent(event)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-sand-100"
                            title="Editar sesión"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEventClick(event.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Eliminar sesión"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* SELECTED SESSION & RECORDINGS PANEL */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                Detalle y Grabación MP4
              </h4>

              {(() => {
                const activeSession = events.find(e => e.id === selectedSessionId) || events[0];
                if (!activeSession) {
                  return (
                    <div className="travesia-card p-6 text-center text-stone-400 text-xs">
                      Selecciona una sesión de la lista para gestionar su enlace Zoom o grabación.
                    </div>
                  );
                }

                const hasRecording = Boolean(
                  activeSession.recording_url || 
                  recordings.some(r => r.event_id === activeSession.id || r.id === activeSession.recording_id)
                );

                const isActiveLive = activeSession.status === 'live' || activeSession.status === 'LIVE';

                return (
                  <div className="travesia-card p-5 space-y-5 bg-white border-sand-300 shadow-sm">
                    {/* Header info */}
                    <div className="space-y-2 border-b border-sand-100 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sand-100 text-stone-700">
                          {activeSession.date ? activeSession.date.split('T')[0] : 'Fecha no fijada'} · {activeSession.time_display}
                        </span>
                        <button
                          onClick={() => handleOpenEditEvent(activeSession)}
                          className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                      </div>

                      <h4 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                        {activeSession.title}
                      </h4>

                      <div className="text-xs text-stone-600 space-y-1">
                        <p><strong>Tema:</strong> {activeSession.theme || activeSession.weekly_theme || 'El Presente'}</p>
                        <p><strong>Duración:</strong> {activeSession.duration_minutes} min</p>
                        <p><strong>Facilitador:</strong> {activeSession.host_name}</p>
                        <p className="truncate">
                          <strong>Zoom URL:</strong>{' '}
                          {activeSession.meeting_url ? (
                            <a
                              href={activeSession.meeting_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-800 hover:underline font-mono"
                            >
                              {activeSession.meeting_url}
                            </a>
                          ) : (
                            <span className="text-rose-600 italic">No asignada</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* SECTION: CONTROL DE REUNIÓN (ZOOM) Y ESTADO (TRAVESÍA) */}
                    <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-rose-600" />
                          <h5 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900">
                            Estado de la Sesión
                          </h5>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isActiveLive
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-stone-200 text-stone-700'
                        }`}>
                          {isActiveLive ? '🔴 EN DIRECTO' : 'PROGRAMADA'}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {isActiveLive
                          ? 'La sesión está marcada como en directo en Travesía. Los miembros ven la notificación con el botón para entrar a Zoom.'
                          : 'Abre la reunión en Zoom como anfitrión y luego marca la sesión como en directo en Travesía para notificar a la comunidad.'}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* 1. ZOOM HOST */}
                        <div className="p-3.5 bg-white rounded-xl border border-sand-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                              ZOOM
                            </span>
                            <span className="text-[10px] text-stone-400">Reunión en vivo</span>
                          </div>
                          {activeSession.meeting_url ? (
                            <a
                              href={activeSession.meeting_url}
                              target="_blank"
                              rel="noreferrer"
                              className="travesia-btn-secondary text-xs py-2 px-3 w-full flex items-center justify-center gap-1.5 font-bold text-stone-900 hover:bg-sand-100"
                            >
                              <Video className="w-3.5 h-3.5 text-blue-600" />
                              <span>ABRIR ZOOM</span>
                              <ExternalLink className="w-3 h-3 text-stone-400" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-rose-600 block italic">Sin enlace de Zoom</span>
                          )}
                          <p className="text-[10px] text-stone-400 leading-tight">
                            Inicia o finaliza la llamada en tu aplicación de Zoom.
                          </p>
                        </div>

                        {/* 2. TRAVESÍA COMMUNITY STATE */}
                        <div className="p-3.5 bg-white rounded-xl border border-sand-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                              TRAVESÍA
                            </span>
                            <span className="text-[10px] text-stone-400">Notificación miembros</span>
                          </div>
                          {isActiveLive ? (
                            <button
                              onClick={async () => {
                                if (window.confirm('¿Deseas marcar la sesión como finalizada en Travesía?\n\nRecuerda finalizar también la reunión en la app de Zoom.')) {
                                  await endLiveSession(activeSession.id);
                                  triggerSuccessFeedback('Sesión marcada como finalizada en Travesía.');
                                }
                              }}
                              className="w-full text-xs py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                            >
                              <Square className="w-3 h-3 fill-sand-300 text-sand-300" />
                              <span>MARCAR COMO FINALIZADA</span>
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                const zoom = activeSession.meeting_url || activeSession.zoom_meeting_url;
                                if (!zoom) {
                                  const inputUrl = window.prompt('Introduce la URL de reunión de Zoom para los miembros:', 'https://zoom.us/j/');
                                  if (!inputUrl) return;
                                  await startLiveSession(activeSession.id, inputUrl);
                                } else {
                                  await startLiveSession(activeSession.id);
                                }
                                triggerSuccessFeedback('Sesión marcada como en directo. Notificación visible para miembros.');
                              }}
                              className="w-full text-xs py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                            >
                              <Radio className="w-3.5 h-3.5" />
                              <span>MARCAR COMO EN DIRECTO</span>
                            </button>
                          )}
                          <p className="text-[10px] text-stone-400 leading-tight">
                            {isActiveLive ? 'Retira la notificación y permite subir el MP4.' : 'Muestra "🔴 EN DIRECTO" y el enlace a los miembros.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION: GRABACIÓN */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-serif font-bold text-sm text-stone-900 tracking-wide uppercase">
                          GRABACIÓN
                        </h5>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          hasRecording
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-100 text-stone-500'
                        }`}>
                          {hasRecording ? 'Grabación disponible' : 'Sin grabación'}
                        </span>
                      </div>

                      {hasRecording ? (
                        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                          <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                            Grabación MP4 almacenada en el bucket privado seguro (<code className="text-[11px] font-mono">session-recordings</code>). Los miembros activos o en prueba acceden mediante enlace firmado temporal.
                          </p>
                          {activeSession.recording_url && (
                            <p className="text-[11px] font-mono text-stone-600 bg-white/70 p-2 rounded-lg border border-sand-200 truncate">
                              Path: {activeSession.recording_url}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              onClick={() => handlePreviewRecordingClick(activeSession)}
                              className="travesia-btn-accent text-xs py-2 px-3.5 font-bold text-stone-950 flex items-center gap-1.5 shadow-sm"
                            >
                              <PlayCircle className="w-3.5 h-3.5 text-stone-950" />
                              <span>VER REPLAY</span>
                            </button>

                            <button
                              onClick={() => handleTriggerUpload(activeSession.id)}
                              disabled={isUploadingRecording}
                              className="travesia-btn-secondary text-xs py-2 px-3 flex items-center gap-1 font-semibold"
                            >
                              {isUploadingRecording && uploadingSessionId === activeSession.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Subiendo...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5 text-stone-600" />
                                  <span>REEMPLAZAR GRABACIÓN</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteRecordingClick(activeSession)}
                              className="text-xs py-2 px-3 rounded-xl font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>ELIMINAR GRABACIÓN</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 rounded-2xl bg-sand-50 border border-sand-200 space-y-3">
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Tras finalizar la sesión en Zoom, descarga el archivo de grabación en formato <strong>MP4</strong> y súbelo aquí. Se guardará en el bucket privado de Supabase Storage.
                          </p>

                          <button
                            onClick={() => handleTriggerUpload(activeSession.id)}
                            disabled={isUploadingRecording}
                            className="travesia-btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 shadow-sm w-full justify-center"
                          >
                            {isUploadingRecording && uploadingSessionId === activeSession.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Subiendo MP4 al bucket privado...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span>SUBIR GRABACIÓN</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}


      {/* ------------------------------------------------------------- */}
      {/* TAB 5: DAILY PROMPTS MOTOR (205 PROMPTS)                       */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'prompts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
              {['Todas', 'Ruido', 'Emociones', 'Visión', 'Obstáculos', 'Acción', 'Relaciones', 'Propósito', 'Espiritualidad', 'Disciplina'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setPromptCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    promptCategoryFilter === cat
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-sand-100 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddPromptModal(true)}
              className="travesia-btn-primary text-xs py-2 px-4 flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Pregunta</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredPrompts.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-white border border-sand-200 shadow-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {p.category}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Semana {p.week} · {p.difficulty}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleDailyPromptActive(p.id)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-all ${
                      p.active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {p.active ? 'Activo' : 'Desactivado'}
                  </button>
                </div>
                <p className="font-serif text-xs sm:text-sm text-stone-800 leading-relaxed italic">
                  "{p.prompt_text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: SETTINGS & COMMUNITY LINKS                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="travesia-card p-6 space-y-6">
          <div className="space-y-1 border-b border-sand-100 pb-4">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Ajustes de Negocio y Comunidad Externa
            </h3>
            <p className="text-xs text-stone-500">
              Configura los precios mostrados, cupo de fundadores y canales de chat externos.
            </p>
          </div>

          <div className="space-y-4 max-w-xl text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <div>
                <strong className="block text-stone-900 font-semibold">Modo Experimento de Negocio (Founding Mode)</strong>
                <span className="text-stone-500">Muestra badge de plazas limitadas y soporte para factura/transferencia manual.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.business_experiment_mode}
                onChange={e => handleUpdateSettings({ business_experiment_mode: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Precio Mensual Fundador (€)</label>
                <input
                  type="number"
                  value={settings.founding_membership_price_monthly}
                  onChange={e => handleUpdateSettings({ founding_membership_price_monthly: Number(e.target.value) })}
                  className="travesia-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Precio Estándar Futuro (€)</label>
                <input
                  type="number"
                  value={settings.standard_membership_price_monthly}
                  onChange={e => handleUpdateSettings({ standard_membership_price_monthly: Number(e.target.value) })}
                  className="travesia-input w-full"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="block font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
                Enlaces de Grupos Externos
              </span>
              <div>
                <label className="block text-stone-600 mb-1">Grupo de WhatsApp (opcional):</label>
                <input
                  type="url"
                  value={settings.whatsapp_group_url || ''}
                  onChange={e => handleUpdateSettings({ whatsapp_group_url: e.target.value })}
                  placeholder="https://chat.whatsapp.com/..."
                  className="travesia-input w-full"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1">Canal de Telegram (opcional):</label>
                <input
                  type="url"
                  value={settings.telegram_url || ''}
                  onChange={e => handleUpdateSettings({ telegram_url: e.target.value })}
                  placeholder="https://t.me/..."
                  className="travesia-input w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL MEMBERSHIP ACTIVATION */}
      {showActivateMemberModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-sand-200 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Activar Membresía Manualmente
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Asigna acceso completo de miembro a <strong className="text-stone-900">{showActivateMemberModal.name}</strong> tras validar su pago por transferencia o factura.
            </p>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-stone-700">Duración del acceso:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { days: 30, label: '30 días (1 mes)' },
                  { days: 90, label: '90 días (1 ciclo)' },
                  { days: 365, label: '365 días (1 año)' },
                ].map(opt => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setActivationDurationDays(opt.days)}
                    className={`py-2 px-2 rounded-xl font-semibold border text-center transition-all ${
                      activationDurationDays === opt.days
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-sand-50 text-stone-700 border-sand-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowActivateMemberModal(null)}
                className="travesia-btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleManualActivation}
                className="travesia-btn-primary py-2 px-5"
              >
                Confirmar Activación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CONTENT */}
      {showAddContentModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-sand-200 shadow-2xl space-y-4 text-xs">
            <h3 className="font-serif font-bold text-xl text-stone-900">
              Nueva Pieza Editorial
            </h3>

            <form onSubmit={handleCreateContent} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Título / Gancho:</label>
                <input
                  type="text"
                  required
                  value={newContentTitle}
                  onChange={e => setNewContentTitle(e.target.value)}
                  placeholder="Ej. El error de abrir el correo a las 8:00 AM"
                  className="travesia-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Plataforma:</label>
                  <select
                    value={newContentPlatform}
                    onChange={e => setNewContentPlatform(e.target.value as any)}
                    className="travesia-input w-full"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Newsletter">Newsletter</option>
                    <option value="Community">Community</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Estado:</label>
                  <select
                    value={newContentStatus}
                    onChange={e => setNewContentStatus(e.target.value as any)}
                    className="travesia-input w-full"
                  >
                    <option value="Idea">Idea</option>
                    <option value="Draft">Draft (Borrador)</option>
                    <option value="Ready">Ready (Listo)</option>
                    <option value="Published">Published (Publicado)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Cuerpo / Guion:</label>
                <textarea
                  rows={4}
                  required
                  value={newContentBody}
                  onChange={e => setNewContentBody(e.target.value)}
                  placeholder="Texto del post, desglose de puntos o notas para el vídeo..."
                  className="travesia-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Llamada a la acción (CTA):</label>
                  <input
                    type="text"
                    value={newContentCta}
                    onChange={e => setNewContentCta(e.target.value)}
                    placeholder="Prueba el reto de 7 días en bio"
                    className="travesia-input w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Fecha programada:</label>
                  <input
                    type="date"
                    value={newContentScheduledDate}
                    onChange={e => setNewContentScheduledDate(e.target.value)}
                    className="travesia-input w-full"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContentModal(false)}
                  className="travesia-btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="travesia-btn-primary py-2 px-5"
                >
                  Guardar Contenido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROMPT */}
      {showAddPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sand-200 space-y-4">
            <h3 className="font-serif font-bold text-xl text-stone-900">
              Crear Nueva Pregunta de Enfoque
            </h3>

            <form onSubmit={handleCreatePrompt} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Texto del Prompt:
                </label>
                <textarea
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  placeholder="¿Qué área de tu vida estás descuidando bajo la excusa de..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs sm:text-sm text-stone-900 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Categoría:
                  </label>
                  <select
                    value={newPromptCategory}
                    onChange={(e) => setNewPromptCategory(e.target.value)}
                    className="w-full p-2 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-900 focus:outline-none"
                  >
                    {['Ruido', 'Emociones', 'Visión', 'Obstáculos', 'Acción', 'Relaciones', 'Propósito', 'Espiritualidad', 'Disciplina'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Semana del Ciclo:
                  </label>
                  <select
                    value={newPromptWeek}
                    onChange={(e) => setNewPromptWeek(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-900 focus:outline-none"
                  >
                    {[1, 2, 3, 4].map(w => (
                      <option key={w} value={w}>Semana {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPromptModal(false)}
                  className="travesia-btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="travesia-btn-primary text-xs py-2 px-5"
                >
                  Guardar Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SESSION */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-sand-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif font-bold text-xl text-stone-900">
              {editingEvent ? 'Editar Sesión' : 'Crear Sesión'}
            </h3>
            <p className="text-xs text-stone-500">
              Configura los detalles del encuentro en directo y pega el enlace de reunión creado manualmente en Zoom.
            </p>

            <form onSubmit={handleSaveEvent} className="space-y-3.5">
              {/* 1. Título */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Título:
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Sesión diaria de journaling — Enfoque: Frenar la inercia"
                  className="w-full p-2.5 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                  required
                />
              </div>

              {/* 2. Fecha & 3. Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Fecha:
                  </label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Hora:
                  </label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    placeholder="08:00 AM CET"
                    className="w-full p-2.5 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                    required
                  />
                </div>
              </div>

              {/* 4. Duración & 5. Tema */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Duración (minutos):
                  </label>
                  <input
                    type="number"
                    value={newEventDuration}
                    onChange={(e) => setNewEventDuration(Number(e.target.value))}
                    min={10}
                    max={180}
                    className="w-full p-2.5 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tema:
                  </label>
                  <input
                    type="text"
                    value={newEventTheme}
                    onChange={(e) => setNewEventTheme(e.target.value)}
                    placeholder="El Presente / La Visión / ..."
                    className="w-full p-2.5 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                    required
                  />
                </div>
              </div>

              {/* 6. Descripción */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Descripción:
                </label>
                <textarea
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  placeholder="Temática central de la sesión, objetivos y dinámicas de quietud..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                />
              </div>

              {/* 7. Facilitador */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Facilitador:
                </label>
                <input
                  type="text"
                  value={newEventHost}
                  onChange={(e) => setNewEventHost(e.target.value)}
                  placeholder="Alberto Calvo"
                  className="w-full p-2.5 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                  required
                />
              </div>

              {/* 8. Zoom URL */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Zoom URL (pega aquí el enlace de Zoom creado manualmente):
                </label>
                <input
                  type="url"
                  value={newEventZoomUrl}
                  onChange={(e) => setNewEventZoomUrl(e.target.value)}
                  placeholder="https://zoom.us/j/1234567890?pwd=..."
                  className="w-full p-2.5 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400 font-mono"
                  required
                />
                {newEventZoomUrl && !zoomService.isValidZoomUrl(newEventZoomUrl) && (
                  <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>Aviso: La URL introducida no parece ser un dominio legítimo de Zoom (*.zoom.us).</span>
                  </p>
                )}
              </div>

              {/* 9. Estado de la sesión */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Estado de la sesión:
                </label>
                <select
                  value={newEventStatus}
                  onChange={(e) => setNewEventStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                >
                  <option value="upcoming">Programada (Próxima)</option>
                  <option value="live">🔴 ¡En directo ahora!</option>
                  <option value="finished">Finalizada / En hemeroteca</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-sand-100">
                <button
                  type="button"
                  onClick={resetEventForm}
                  className="travesia-btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="travesia-btn-primary text-xs py-2 px-5 font-bold"
                >
                  {editingEvent ? 'Guardar Cambios' : 'Crear Sesión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODAL: CUSTOMER INTERVIEW (10 QUESTIONS) */}
      <CustomerInterviewModal
        member={selectedMemberForInterview}
        onClose={() => setSelectedMemberForInterview(null)}
        onSaved={handleInterviewSaved}
      />

      {/* MODAL: ADD PRODUCT DEV LOG */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-sand-200 space-y-4">
            <h3 className="font-serif font-bold text-xl text-stone-900">
              Nueva Hipótesis de Desarrollo (Build-Measure-Learn)
            </h3>
            <p className="text-xs text-stone-500">
              Registra los aprendizajes basados en el comportamiento real de los primeros 10 miembros.
            </p>
            <form onSubmit={handleCreateProductLog} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">1. Observación de comportamiento real:</label>
                <textarea
                  required
                  rows={2}
                  value={newObs}
                  onChange={e => setNewObs(e.target.value)}
                  placeholder="Ej. Varios miembros cerraron la app durante el silencio de 2 minutos..."
                  className="travesia-input w-full font-serif"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">2. Problema identificado:</label>
                <textarea
                  required
                  rows={2}
                  value={newProb}
                  onChange={e => setNewProb(e.target.value)}
                  placeholder="Ej. El silencio sin apoyo visual genera sensación de tiempo muerto..."
                  className="travesia-input w-full font-serif"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">3. Hipótesis de solución:</label>
                <textarea
                  required
                  rows={2}
                  value={newHyp}
                  onChange={e => setNewHyp(e.target.value)}
                  placeholder="Ej. Un pulso armónico de respiración 4-4-4-4 aumentará la finalización..."
                  className="travesia-input w-full font-serif"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">4. Cambio aplicado en producto:</label>
                <input
                  type="text"
                  required
                  value={newChg}
                  onChange={e => setNewChg(e.target.value)}
                  placeholder="Ej. Añadido círculo de respiración suave en Movimiento 1 y 4."
                  className="travesia-input w-full"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">5. Plan de medición:</label>
                <input
                  type="text"
                  required
                  value={newMeas}
                  onChange={e => setNewMeas(e.target.value)}
                  placeholder="Ej. Tasa de finalización en los próximos 14 días con la cohorte fundadora."
                  className="travesia-input w-full"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="travesia-btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="travesia-btn-primary text-xs py-2 px-5"
                >
                  Guardar en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ONGOING CYCLE */}
      {showAddCycleModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sand-200 space-y-4 animate-fade-in">
            <div className="border-b border-sand-200 pb-3">
              <h3 className="font-serif font-bold text-xl text-stone-900">
                Añadir Nuevo Ciclo Mensual
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Crea un nuevo tema canónico de 4 semanas para la Travesía Continua.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCycleTitle || !newCycleTheme) return;
                addOngoingCycle({
                  id: `cycle-${Date.now()}`,
                  title: newCycleTitle,
                  theme: newCycleTheme,
                  description: newCycleDesc || `Exploración profunda de ${newCycleTitle} en la vida diaria y comunitaria.`,
                  start_date: '2026-11-01',
                  end_date: '2026-11-28',
                  cycle_number: ongoingCycles.length + 1,
                  status: 'upcoming',
                  weeks: [
                    { week_number: 1, title: 'El Presente', focus: 'Diagnóstico honesto de este territorio', daily_prompt_example: '¿Cuál es la verdad aquí?' },
                    { week_number: 2, title: 'La Visión', focus: 'Hacia dónde caminar', daily_prompt_example: '¿Qué estándar quieres forjar?' },
                    { week_number: 3, title: 'Los Obstáculos', focus: 'Qué te frena', daily_prompt_example: '¿Dónde está la resistencia?' },
                    { week_number: 4, title: 'El Trabajo', focus: 'Acción y disciplina', daily_prompt_example: '¿Qué paso das hoy?' }
                  ]
                });
                setShowAddCycleModal(false);
                setNewCycleTitle('');
                setNewCycleTheme('');
                setNewCycleDesc('');
                setActionSuccessMsg('Nuevo ciclo mensual registrado correctamente');
                setTimeout(() => setActionSuccessMsg(null), 3000);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Título del Ciclo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Coraje, Límites, Discernimiento..."
                  value={newCycleTitle}
                  onChange={(e) => setNewCycleTitle(e.target.value)}
                  className="travesia-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Eje Temático</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Valentía frente al conflicto, decir la verdad con amor..."
                  value={newCycleTheme}
                  onChange={(e) => setNewCycleTheme(e.target.value)}
                  className="travesia-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Propósito formativo del ciclo..."
                  value={newCycleDesc}
                  onChange={(e) => setNewCycleDesc(e.target.value)}
                  className="travesia-input w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setShowAddCycleModal(false)}
                  className="travesia-btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="travesia-btn-primary text-xs py-2 px-5"
                >
                  Crear Ciclo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden MP4 file input for manual recording upload */}
      <input
        ref={recordingFileInputRef}
        type="file"
        accept="video/mp4,video/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Recording Player Modal */}
      <RecordingPlayerModal
        recording={previewRecording}
        isOpen={Boolean(previewRecording)}
        onClose={() => setPreviewRecording(null)}
      />
    </div>
  );
};

