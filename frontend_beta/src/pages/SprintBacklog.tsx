import { useState, useEffect } from 'react'
import { usePlan } from '../context/PlanContext'
import { productBacklogApi, sprintsApi } from '../api'
import ProductBacklogTab from '../components/ProductBacklogTab'
import SprintsTab from '../components/SprintsTab'
import KanbanTab from '../components/KanbanTab'
import TaskAssignmentTab from '../components/TaskAssignmentTab'
import RetrospectivesTab from '../components/RetrospectivesTab'
import AiUsabilityModal from '../components/AiUsabilityModal'
import {
    ClipboardList, Layers, Kanban, Users, RotateCcw,
    Sparkles, Printer
} from 'lucide-react'

type AgileTab = 'backlog' | 'sprints' | 'kanban' | 'assignment' | 'retrospectives'

export default function SprintBacklog() {
    const { activePlanId, activePlan } = usePlan()

    const [activeTab, setActiveTab] = useState<AgileTab>('backlog')
    const [isAiModalOpen, setIsAiModalOpen] = useState(false)

    // Data for print report preview
    const [printStories, setPrintStories] = useState<any[]>([])
    const [printSprints, setPrintSprints] = useState<any[]>([])

    // Load data for print preview when plan changes
    useEffect(() => {
        if (!activePlanId) return
        loadPrintData()
    }, [activePlanId])

    const loadPrintData = async () => {
        try {
            const [storiesRes, sprintsRes] = await Promise.all([
                productBacklogApi.getByPlan(activePlanId),
                sprintsApi.getByPlan(activePlanId)
            ])
            setPrintStories(storiesRes.data || [])
            setPrintSprints(sprintsRes.data || [])
        } catch (err) {
            console.error('Error cargando datos para informe imprimible:', err)
        }
    }

    const handlePrint = () => {
        loadPrintData()
        setTimeout(() => {
            window.print()
        }, 200)
    }

    const handleStoriesImported = () => {
        // Refresh print data and switch to backlog tab so user sees newly imported stories
        loadPrintData()
        setActiveTab('backlog')
    }

    if (!activePlanId) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto my-8 shadow-xs">
                <Layers className="mx-auto text-slate-400 mb-3" size={44} />
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                    Seleccione un Plan de Pruebas
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Para gestionar el Backlog de Mejoras, Sprints, Tablero Kanban y Retrospectivas, seleccione un plan de pruebas en el menú superior.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* PRINT-ONLY VIEWPORT: Academic and professional printable report */}
            <div className="hidden print:block sprint-print-preview text-black bg-white p-6">
                <div className="border-b-2 border-black pb-4 mb-6">
                    <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold">
                        Universidad - Ingeniería de Software | Interacción Humano-Computador (IHC)
                    </p>
                    <h1 className="text-2xl font-bold mt-1">
                        Reporte de Gestión Ágil & Sprint Backlog de Usabilidad
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Proyecto: {activePlan?.projectName || 'Evaluación de Usabilidad'} | Producto: {activePlan?.product || 'N/A'} | Módulo: {activePlan?.evaluatedModule || 'General'}
                    </p>
                    <p className="text-xs text-gray-500">
                        Fecha de Emisión: {new Date().toLocaleDateString('es-ES', { dateStyle: 'full' })}
                    </p>
                </div>

                {/* Print Sprints summary */}
                <div className="mb-6">
                    <h2 className="text-base font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">
                        1. Sprints Planificados ({printSprints.length})
                    </h2>
                    {printSprints.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">No hay Sprints registrados.</p>
                    ) : (
                        <div className="space-y-3">
                            {printSprints.map(s => (
                                <div key={s.id} className="border border-gray-300 rounded p-3 text-xs">
                                    <div className="flex justify-between font-bold">
                                        <span>{s.name} [{s.status}]</span>
                                        <span>{s.startDate?.substring(0, 10)} al {s.endDate?.substring(0, 10)}</span>
                                    </div>
                                    <p className="mt-1 text-gray-700 italic">"{s.goal}"</p>
                                    <p className="mt-1 font-semibold text-gray-600">
                                        Historias asignadas: {s.userStories?.length || 0} | Esfuerzo total: {s.totalHours || 0} horas
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Print Product Backlog Stories */}
                <div>
                    <h2 className="text-base font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">
                        2. Product Backlog de Mejoras de Usabilidad ({printStories.length})
                    </h2>
                    {printStories.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">No hay historias registradas en el Product Backlog.</p>
                    ) : (
                        <div className="space-y-4">
                            {printStories.map(story => (
                                <div key={story.id} className="border border-gray-300 rounded p-3 text-xs">
                                    <div className="flex justify-between font-bold text-sm">
                                        <span>[{story.storyCode}] {story.title}</span>
                                        <span>Prioridad: {story.priority} | Esfuerzo: {story.effortEstimation} pts</span>
                                    </div>
                                    <p className="mt-1 text-gray-800">{story.description}</p>
                                    {story.origin && (
                                        <p className="mt-1 text-[11px] text-gray-600 italic">
                                            <strong>Origen:</strong> {story.origin}
                                        </p>
                                    )}
                                    {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                                        <div className="mt-2">
                                            <span className="font-semibold block text-[11px]">Criterios de Aceptación:</span>
                                            <ul className="list-disc list-inside ml-2 text-[11px] text-gray-700">
                                                {story.acceptanceCriteria.map((c: string, idx: number) => (
                                                    <li key={idx}>{c}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* SCREEN VIEWPORT: HEADER & TABS NAVIGATION */}
            <div className="print:hidden space-y-6">
                {/* Header Banner */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-50 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-900">
                                Módulo de Desarrollo Ágil (IHC)
                            </span>
                            <span className="text-xs text-slate-400">
                                • {activePlan?.projectName}
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                            Gestión Ágil y Sprint Backlog
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                            Administre las mejoras de usabilidad identificadas en las pruebas, planifique Sprints, ejecute tareas técnicas en el Tablero Kanban y documente las Retrospectivas del equipo.
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 self-start md:self-auto">
                        {/* AI Usability Assistant Button */}
                        <button
                            onClick={() => setIsAiModalOpen(true)}
                            className="px-4 py-2 bg-gradient-to-r from-violet-600 via-primary-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-500/20 hover:shadow-lg transition flex items-center gap-2 group"
                            title="Analizar observaciones y generar historias con IA"
                        >
                            <Sparkles size={16} className="text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
                            <span>Asistente IA de Usabilidad</span>
                        </button>

                        {/* Print Report */}
                        <button
                            onClick={handlePrint}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition"
                            title="Exportar informe imprimible / PDF"
                        >
                            <Printer size={18} />
                        </button>
                    </div>
                </div>

                {/* 5 NAVIGATION TABS */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1.5 shadow-xs flex flex-wrap gap-1">
                    <button
                        onClick={() => setActiveTab('backlog')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                            activeTab === 'backlog'
                                ? 'bg-primary-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <ClipboardList size={16} />
                        <span>Product Backlog</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('sprints')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                            activeTab === 'sprints'
                                ? 'bg-primary-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Layers size={16} />
                        <span>Gestión de Sprints</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('kanban')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                            activeTab === 'kanban'
                                ? 'bg-primary-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Kanban size={16} />
                        <span>Tablero Kanban</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('assignment')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                            activeTab === 'assignment'
                                ? 'bg-primary-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Users size={16} />
                        <span>Asignación de Tareas</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('retrospectives')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition ${
                            activeTab === 'retrospectives'
                                ? 'bg-primary-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <RotateCcw size={16} />
                        <span>Retrospectivas</span>
                    </button>
                </div>

                {/* TAB CONTENT AREA */}
                <div className="pt-2">
                    {activeTab === 'backlog' && (
                        <ProductBacklogTab
                            activePlanId={activePlanId}
                            onOpenAiAssistant={() => setIsAiModalOpen(true)}
                        />
                    )}

                    {activeTab === 'sprints' && (
                        <SprintsTab
                            activePlanId={activePlanId}
                            onOpenAiAssistant={() => setIsAiModalOpen(true)}
                        />
                    )}

                    {activeTab === 'kanban' && (
                        <KanbanTab
                            activePlanId={activePlanId}
                            onOpenAiAssistant={() => setIsAiModalOpen(true)}
                        />
                    )}

                    {activeTab === 'assignment' && (
                        <TaskAssignmentTab
                            activePlanId={activePlanId}
                            onOpenAiAssistant={() => setIsAiModalOpen(true)}
                        />
                    )}

                    {activeTab === 'retrospectives' && (
                        <RetrospectivesTab
                            activePlanId={activePlanId}
                            onOpenAiAssistant={() => setIsAiModalOpen(true)}
                        />
                    )}
                </div>
            </div>

            {/* AI USABILITY ASSISTANT MODAL */}
            <AiUsabilityModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                activePlanId={activePlanId}
                onStoriesImported={handleStoriesImported}
            />
        </div>
    )
}
