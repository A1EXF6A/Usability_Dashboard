import { useState, useEffect, useMemo } from 'react'
import {
    Calendar, CheckCircle2, AlertTriangle,
    Plus, MoveRight, MoveLeft, Edit2, Trash2,
    Filter, Download
} from 'lucide-react'
import { usePlan } from '../context/PlanContext'
import { useToast } from '../App'
import { scrumApi } from '../api'
import type { Guid } from '../api'
import Modal from '../components/Modal'

interface SprintTask {
    id: Guid
    sprintId: Guid
    userStoryId?: Guid
    userStoryCode?: string
    userStoryTitle?: string
    title: string
    developer: string
    phase: string
    type: string
    estimatedHours: number
    realHours: number
    status: string
    comment: string
}

interface UnplannedTask {
    id: Guid
    sprintId: Guid
    date: string
    developer: string
    taskDescription: string
    durationHours: number
}

interface DailyLog {
    id: Guid
    sprintId: Guid
    date: string
    teamMember: string
    progress: string
    nextStep: string
    impediments: string
}

interface SprintRetrospective {
    id: Guid
    sprintId: Guid
    whatWentWell: string
    whatWentWrong: string
    completedSummary: string
    pendingSummary: string
    agreements: string
}

interface SprintDetail {
    id: Guid
    testPlanId: Guid
    sprintNumber: number
    name: string
    goal: string
    weeks: string
    startDate: string
    endDate: string
    productOwner: string
    scrumMaster: string
    dailyHoursPerMember: number
    weeklyHoursPerMember: number
    sprintWeeksCount: number
    totalCapacityHours: number
    teamMembersJson: string
    status: string
    totalEstimatedHours: number
    totalRealHours: number
    isOverCapacity: boolean
    capacityUsagePercentage: number
    storyCount: number
    taskCount: number
    unplannedTaskCount: number
    totalUnplannedHours: number
    userStories: any[]
    tasks: SprintTask[]
    unplannedTasks: UnplannedTask[]
    dailyLogs: DailyLog[]
    retrospective?: SprintRetrospective
}

const KANBAN_COLUMNS = [
    { key: 'Pendiente', label: 'Pendiente', color: '#64748b' },
    { key: 'En progreso', label: 'En progreso', color: '#3b82f6' },
    { key: 'En revisión', label: 'En revisión', color: '#f59e0b' },
    { key: 'Terminado', label: 'Terminado', color: '#10b981' }
]

export default function ScrumModule() {
    const { activePlanId } = usePlan()
    const { addToast } = useToast()

    const [sprints, setSprints] = useState<any[]>([])
    const [selectedSprintId, setSelectedSprintId] = useState<Guid | null>(null)
    const [sprintDetail, setSprintDetail] = useState<SprintDetail | null>(null)
    const [activeTab, setActiveTab] = useState<'plan' | 'kanban' | 'tnp' | 'daily' | 'retro'>('kanban')
    const [loading, setLoading] = useState(true)

    // Kanban Filtros
    const [kanbanDevFilter, setKanbanDevFilter] = useState('ALL')

    // Modal Tarea
    const [taskModalOpen, setTaskModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<SprintTask | null>(null)
    const [taskForm, setTaskForm] = useState({
        userStoryId: '',
        title: '',
        developer: 'Miembro 1 (UX/UI Dev)',
        phase: 'Análisis',
        type: 'Nuevo',
        estimatedHours: 4,
        realHours: 0,
        status: 'Pendiente',
        comment: ''
    })

    // Modal TNP
    const [tnpModalOpen, setTnpModalOpen] = useState(false)
    const [tnpForm, setTnpForm] = useState({
        date: new Date().toISOString().substring(0, 10),
        developer: 'Miembro 1 (UX/UI Dev)',
        taskDescription: '',
        durationHours: 2
    })

    // Modal Daily
    const [dailyModalOpen, setDailyModalOpen] = useState(false)
    const [dailyForm, setDailyForm] = useState({
        date: new Date().toISOString().substring(0, 10),
        teamMember: 'Miembro 1 (UX/UI Dev)',
        progress: '',
        nextStep: '',
        impediments: 'Ninguno'
    })

    // Modal Asignar Historias a Sprint
    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [allBacklogStories, setAllBacklogStories] = useState<any[]>([])
    const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([])

    // Retrospectiva Form
    const [retroForm, setRetroForm] = useState({
        whatWentWell: '',
        whatWentWrong: '',
        completedSummary: '',
        pendingSummary: '',
        agreements: ''
    })

    // Cargar lista de sprints
    const loadSprints = async (targetSprintId?: Guid) => {
        if (!activePlanId) return
        setLoading(true)
        try {
            const res = await scrumApi.getSprints(activePlanId)
            const list = res.data
            setSprints(list)
            if (list.length > 0) {
                const toSelect = targetSprintId || selectedSprintId || list[0].id
                setSelectedSprintId(toSelect)
                await loadSprintDetail(toSelect)
            } else {
                setSprintDetail(null)
            }
        } catch (err) {
            console.error(err)
            addToast('Error al cargar sprints.', 'error')
        } finally {
            setLoading(false)
        }
    }

    // Cargar detalle del sprint activo
    const loadSprintDetail = async (sprintId: Guid) => {
        try {
            const res = await scrumApi.getSprintDetail(sprintId)
            const d = res.data
            setSprintDetail(d)
            if (d.retrospective) {
                setRetroForm({
                    whatWentWell: d.retrospective.whatWentWell || '',
                    whatWentWrong: d.retrospective.whatWentWrong || '',
                    completedSummary: d.retrospective.completedSummary || '',
                    pendingSummary: d.retrospective.pendingSummary || '',
                    agreements: d.retrospective.agreements || ''
                })
            } else {
                setRetroForm({
                    whatWentWell: '',
                    whatWentWrong: '',
                    completedSummary: '',
                    pendingSummary: '',
                    agreements: ''
                })
            }
        } catch (err) {
            console.error(err)
            addToast('Error al cargar detalle del sprint.', 'error')
        }
    }

    useEffect(() => {
        loadSprints()
    }, [activePlanId])

    const handleSelectSprint = async (id: Guid) => {
        setSelectedSprintId(id)
        await loadSprintDetail(id)
    }

    // Guardar Retrospectiva
    const handleSaveRetro = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSprintId) return
        try {
            await scrumApi.saveRetrospective(selectedSprintId, retroForm)
            addToast('Retrospectiva del Sprint guardada exitosamente.', 'success')
            loadSprintDetail(selectedSprintId)
        } catch (err) {
            addToast('Error al guardar retrospectiva.', 'error')
        }
    }

    // Tareas Kanban Drag & Drop
    const handleDragStart = (e: React.DragEvent, taskId: Guid) => {
        e.dataTransfer.setData('text/plain', taskId)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault()
        const taskId = e.dataTransfer.getData('text/plain')
        if (!taskId) return
        await handleUpdateTaskStatus(taskId, newStatus)
    }

    // Actualizar Estado de Tarea (accesible vía botón o drag)
    const handleUpdateTaskStatus = async (taskId: Guid, newStatus: string) => {
        try {
            await scrumApi.updateTaskStatus(taskId, newStatus)
            if (selectedSprintId) loadSprintDetail(selectedSprintId)
            addToast(`Tarea movida a "${newStatus}".`, 'success')
        } catch (err) {
            addToast('Error al actualizar estado de la tarea.', 'error')
        }
    }

    // Guardar Tarea (Crear / Editar)
    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSprintId) return

        try {
            if (editingTask) {
                await scrumApi.updateTask(editingTask.id, {
                    userStoryId: taskForm.userStoryId ? taskForm.userStoryId : null,
                    title: taskForm.title,
                    developer: taskForm.developer,
                    phase: taskForm.phase,
                    type: taskForm.type,
                    estimatedHours: Number(taskForm.estimatedHours),
                    realHours: Number(taskForm.realHours),
                    status: taskForm.status,
                    comment: taskForm.comment
                })
                addToast('Tarea actualizada.', 'success')
            } else {
                await scrumApi.createTask({
                    sprintId: selectedSprintId,
                    userStoryId: taskForm.userStoryId ? taskForm.userStoryId : null,
                    title: taskForm.title,
                    developer: taskForm.developer,
                    phase: taskForm.phase,
                    type: taskForm.type,
                    estimatedHours: Number(taskForm.estimatedHours),
                    realHours: Number(taskForm.realHours),
                    status: taskForm.status,
                    comment: taskForm.comment
                })
                addToast('Tarea agregada al sprint.', 'success')
            }
            setTaskModalOpen(false)
            loadSprintDetail(selectedSprintId)
        } catch (err) {
            addToast('Error al guardar tarea.', 'error')
        }
    }

    // Guardar TNP
    const handleSaveTnp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSprintId) return
        try {
            await scrumApi.createUnplanned({
                sprintId: selectedSprintId,
                date: tnpForm.date,
                developer: tnpForm.developer,
                taskDescription: tnpForm.taskDescription,
                durationHours: Number(tnpForm.durationHours)
            })
            addToast('Tarea no planificada registrada.', 'success')
            setTnpModalOpen(false)
            setTnpForm({ ...tnpForm, taskDescription: '', durationHours: 2 })
            loadSprintDetail(selectedSprintId)
        } catch (err) {
            addToast('Error al guardar TNP.', 'error')
        }
    }

    // Guardar Daily
    const handleSaveDaily = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSprintId) return
        try {
            await scrumApi.createDaily({
                sprintId: selectedSprintId,
                date: dailyForm.date,
                teamMember: dailyForm.teamMember,
                progress: dailyForm.progress,
                nextStep: dailyForm.nextStep,
                impediments: dailyForm.impediments
            })
            addToast('Daily check-in registrado.', 'success')
            setDailyModalOpen(false)
            setDailyForm({ ...dailyForm, progress: '', nextStep: '', impediments: 'Ninguno' })
            loadSprintDetail(selectedSprintId)
        } catch (err) {
            addToast('Error al registrar daily log.', 'error')
        }
    }

    // Abrir Modal de Asignar Historias
    const handleOpenAssignStories = async () => {
        if (!activePlanId || !sprintDetail) return
        try {
            const res = await scrumApi.getBacklog(activePlanId)
            setAllBacklogStories(res.data)
            const currentAssigned = sprintDetail.userStories.map(s => s.id)
            setSelectedStoryIds(currentAssigned)
            setAssignModalOpen(true)
        } catch (err) {
            addToast('Error al obtener historias del backlog.', 'error')
        }
    }

    // Confirmar Asignación de Historias
    const handleConfirmAssignStories = async () => {
        if (!selectedSprintId) return
        try {
            await scrumApi.assignStories(selectedSprintId, selectedStoryIds)
            addToast('Historias asignadas al sprint.', 'success')
            setAssignModalOpen(false)
            loadSprintDetail(selectedSprintId)
        } catch (err) {
            addToast('Error al asignar historias.', 'error')
        }
    }

    // Filtrar desarrolladores para el Kanban
    const developersList = useMemo(() => {
        if (!sprintDetail) return []
        const devs = new Set<string>()
        sprintDetail.tasks.forEach(t => { if (t.developer) devs.add(t.developer) })
        return Array.from(devs)
    }, [sprintDetail])

    const filteredTasks = useMemo(() => {
        if (!sprintDetail) return []
        return sprintDetail.tasks.filter(t => {
            return kanbanDevFilter === 'ALL' || t.developer === kanbanDevFilter
        })
    }, [sprintDetail, kanbanDevFilter])

    return (
        <div className="page-container" aria-busy={loading}>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Calendar className="text-primary" />
                        Módulo SCRUM — Planificación & Tablero Kanban
                    </h1>
                    <p className="text-secondary" style={{ marginTop: '0.25rem' }}>
                        Digitalización completa de la matriz Excel de planificación: Capacidad, Tareas por Fase, Tablero Kanban, TNP y Retrospectiva.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {selectedSprintId && (
                        <a
                            href={scrumApi.exportMatrixUrl(selectedSprintId)}
                            className="btn btn-secondary"
                            download
                            title="Descargar matriz de planificación completa en formato compatible con Microsoft Excel"
                        >
                            <Download size={16} />
                            Exportar Matriz Excel (.xlsx / CSV)
                        </a>
                    )}
                </div>
            </div>

            {/* Selector de Sprints (S1 sem 10-11, S2 sem 12-13, S3 sem 14-15, S4 sem 16) */}
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {sprints.map(s => {
                    const isSelected = s.id === selectedSprintId
                    return (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => handleSelectSprint(s.id)}
                            style={{
                                padding: '0.65rem 1.2rem',
                                borderRadius: '8px',
                                border: isSelected ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                                background: isSelected ? '#eef2ff' : '#ffffff',
                                color: isSelected ? '#4338ca' : '#334155',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: isSelected ? '0 1px 3px rgba(79, 70, 229, 0.2)' : 'none',
                                transition: 'all 0.15s'
                            }}
                        >
                            <span>{s.name} ({s.weeks})</span>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                background: s.status === 'Completed' ? '#dcfce7' : s.status === 'Active' ? '#fef3c7' : '#f1f5f9',
                                color: s.status === 'Completed' ? '#166534' : s.status === 'Active' ? '#92400e' : '#64748b'
                            }}>
                                {s.status}
                            </span>
                        </button>
                    )
                })}
            </div>

            {sprintDetail && (
                <>
                    {/* Alerta de Capacidad si Estimado > Capacidad */}
                    {sprintDetail.isOverCapacity && (
                        <div className="card" style={{ background: '#fef2f2', borderColor: '#fca5a5', marginBottom: '1.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <AlertTriangle size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
                                <div>
                                    <strong style={{ color: '#991b1b' }}>¡Alerta de Sobrecarga de Capacidad en el Sprint!</strong>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#b91c1c' }}>
                                        El total de horas estimadas (<strong>{sprintDetail.totalEstimatedHours}h</strong>) supera la capacidad planificada del equipo (<strong>{sprintDetail.totalCapacityHours}h</strong>) en un <strong>{sprintDetail.capacityUsagePercentage}%</strong>. Se recomienda reasignar historias o dividir tareas complejas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resumen Superior de Métricas del Sprint */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="card" style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Objetivo del Sprint</div>
                            <div style={{ fontSize: '0.925rem', fontWeight: 600, marginTop: '0.3rem', color: '#1e293b' }}>{sprintDetail.goal}</div>
                        </div>

                        <div className="card" style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Capacidad del Equipo</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.2rem', color: '#4f46e5' }}>
                                {sprintDetail.totalCapacityHours} h
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                                {sprintDetail.dailyHoursPerMember}h/día · {sprintDetail.weeklyHoursPerMember}h/sem (4 integrantes)
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Horas Estimadas vs Reales</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.2rem', color: sprintDetail.isOverCapacity ? '#dc2626' : '#16a34a' }}>
                                {sprintDetail.totalEstimatedHours}h / {sprintDetail.totalRealHours}h
                            </div>
                            {/* Barra de progreso de capacidad */}
                            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${Math.min(sprintDetail.capacityUsagePercentage, 100)}%`,
                                    height: '100%',
                                    background: sprintDetail.isOverCapacity ? '#dc2626' : '#4f46e5'
                                }} />
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Historias y Tareas</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.2rem', color: '#0f172a' }}>
                                {sprintDetail.storyCount} HU · {sprintDetail.taskCount} Tareas
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                                {sprintDetail.unplannedTaskCount} TNP ({sprintDetail.totalUnplannedHours}h no planificadas)
                            </div>
                        </div>
                    </div>

                    {/* Barra de Pestañas */}
                    <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => setActiveTab('kanban')}
                            style={{
                                padding: '0.6rem 1.2rem',
                                border: 'none',
                                borderBottom: activeTab === 'kanban' ? '3px solid #4f46e5' : '3px solid transparent',
                                background: 'none',
                                color: activeTab === 'kanban' ? '#4f46e5' : '#64748b',
                                fontWeight: activeTab === 'kanban' ? 700 : 500,
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            Tablero Kanban ({sprintDetail.tasks.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('plan')}
                            style={{
                                padding: '0.6rem 1.2rem',
                                border: 'none',
                                borderBottom: activeTab === 'plan' ? '3px solid #4f46e5' : '3px solid transparent',
                                background: 'none',
                                color: activeTab === 'plan' ? '#4f46e5' : '#64748b',
                                fontWeight: activeTab === 'plan' ? 700 : 500,
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            Planificación & Historias ({sprintDetail.userStories.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('tnp')}
                            style={{
                                padding: '0.6rem 1.2rem',
                                border: 'none',
                                borderBottom: activeTab === 'tnp' ? '3px solid #4f46e5' : '3px solid transparent',
                                background: 'none',
                                color: activeTab === 'tnp' ? '#4f46e5' : '#64748b',
                                fontWeight: activeTab === 'tnp' ? 700 : 500,
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            Tareas No Planificadas (TNP) ({sprintDetail.unplannedTasks.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('daily')}
                            style={{
                                padding: '0.6rem 1.2rem',
                                border: 'none',
                                borderBottom: activeTab === 'daily' ? '3px solid #4f46e5' : '3px solid transparent',
                                background: 'none',
                                color: activeTab === 'daily' ? '#4f46e5' : '#64748b',
                                fontWeight: activeTab === 'daily' ? 700 : 500,
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            Daily Log ({sprintDetail.dailyLogs.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('retro')}
                            style={{
                                padding: '0.6rem 1.2rem',
                                border: 'none',
                                borderBottom: activeTab === 'retro' ? '3px solid #4f46e5' : '3px solid transparent',
                                background: 'none',
                                color: activeTab === 'retro' ? '#4f46e5' : '#64748b',
                                fontWeight: activeTab === 'retro' ? 700 : 500,
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            Review & Retrospectiva
                        </button>
                    </div>

                    {/* ── PESTAÑA 1: TABLERO KANBAN ── */}
                    {activeTab === 'kanban' && (
                        <div>
                            {/* Barra de Filtros Kanban y Acción Añadir Tarea */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <Filter size={16} className="text-secondary" />
                                    <label htmlFor="kanban-dev" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filtrar por Responsable:</label>
                                    <select
                                        id="kanban-dev"
                                        className="form-control"
                                        style={{ width: 'auto' }}
                                        value={kanbanDevFilter}
                                        onChange={e => setKanbanDevFilter(e.target.value)}
                                    >
                                        <option value="ALL">Todos los integrantes</option>
                                        {developersList.map(dev => (
                                            <option key={dev} value={dev}>{dev}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setEditingTask(null)
                                        setTaskForm({
                                            userStoryId: sprintDetail.userStories.length > 0 ? sprintDetail.userStories[0].id : '',
                                            title: '',
                                            developer: 'Miembro 1 (UX/UI Dev)',
                                            phase: 'Análisis',
                                            type: 'Nuevo',
                                            estimatedHours: 4,
                                            realHours: 0,
                                            status: 'Pendiente',
                                            comment: ''
                                        })
                                        setTaskModalOpen(true)
                                    }}
                                >
                                    <Plus size={16} />
                                    Nueva Tarea de Sprint
                                </button>
                            </div>

                            {/* Columnas Kanban */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', alignItems: 'flex-start' }}>
                                {KANBAN_COLUMNS.map((col, colIdx) => {
                                    const colTasks = filteredTasks.filter(t => t.status === col.key)

                                    return (
                                        <div
                                            key={col.key}
                                            style={{
                                                background: '#f8fafc',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                padding: '0.8rem',
                                                minHeight: '400px'
                                            }}
                                            onDragOver={handleDragOver}
                                            onDrop={e => handleDrop(e, col.key)}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', paddingBottom: '0.4rem', borderBottom: `2px solid ${col.color}` }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: col.color }}>{col.label}</span>
                                                <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '0.75rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '10px' }}>
                                                    {colTasks.length}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                {colTasks.length === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.8rem', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                                                        Arrastra o añade tareas aquí
                                                    </div>
                                                ) : (
                                                    colTasks.map(task => (
                                                        <div
                                                            key={task.id}
                                                            draggable
                                                            onDragStart={e => handleDragStart(e, task.id)}
                                                            className="card"
                                                            style={{
                                                                padding: '0.8rem',
                                                                cursor: 'grab',
                                                                borderLeft: `4px solid ${col.color}`,
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                                                            }}
                                                        >
                                                            {/* Story Code & Badges */}
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5' }}>
                                                                    {task.userStoryCode || 'General'}
                                                                </span>
                                                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                                    <span style={{
                                                                        fontSize: '0.68rem',
                                                                        fontWeight: 600,
                                                                        padding: '0.1rem 0.4rem',
                                                                        borderRadius: '4px',
                                                                        background: task.type === 'Error' ? '#fee2e2' : '#e0e7ff',
                                                                        color: task.type === 'Error' ? '#991b1b' : '#3730a3'
                                                                    }}>
                                                                        {task.type}
                                                                    </span>
                                                                    <span style={{
                                                                        fontSize: '0.68rem',
                                                                        fontWeight: 600,
                                                                        padding: '0.1rem 0.4rem',
                                                                        borderRadius: '4px',
                                                                        background: '#f1f5f9',
                                                                        color: '#475569'
                                                                    }}>
                                                                        {task.phase}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Título de la tarea */}
                                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                                                                {task.title}
                                                            </div>

                                                            {/* Responsable & Horas */}
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                                                                <span>👤 {task.developer}</span>
                                                                <span title="Horas Estimadas / Horas Reales">⏱️ {task.estimatedHours}h est / {task.realHours}h real</span>
                                                            </div>

                                                            {/* Controles de Accesibilidad por Teclado (WCAG) */}
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                                                                <div style={{ display: 'flex', gap: '0.2rem' }}>
                                                                    {colIdx > 0 && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn-icon"
                                                                            onClick={() => handleUpdateTaskStatus(task.id, KANBAN_COLUMNS[colIdx - 1].key)}
                                                                            title={`Mover a ${KANBAN_COLUMNS[colIdx - 1].label}`}
                                                                            aria-label={`Mover tarea ${task.title} a ${KANBAN_COLUMNS[colIdx - 1].label}`}
                                                                        >
                                                                            <MoveLeft size={13} />
                                                                        </button>
                                                                    )}
                                                                    {colIdx < KANBAN_COLUMNS.length - 1 && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn-icon"
                                                                            onClick={() => handleUpdateTaskStatus(task.id, KANBAN_COLUMNS[colIdx + 1].key)}
                                                                            title={`Mover a ${KANBAN_COLUMNS[colIdx + 1].label}`}
                                                                            aria-label={`Mover tarea ${task.title} a ${KANBAN_COLUMNS[colIdx + 1].label}`}
                                                                        >
                                                                            <MoveRight size={13} />
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div style={{ display: 'flex', gap: '0.2rem' }}>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-icon"
                                                                        onClick={() => {
                                                                            setEditingTask(task)
                                                                            setTaskForm({
                                                                                userStoryId: task.userStoryId || '',
                                                                                title: task.title,
                                                                                developer: task.developer,
                                                                                phase: task.phase,
                                                                                type: task.type,
                                                                                estimatedHours: task.estimatedHours,
                                                                                realHours: task.realHours,
                                                                                status: task.status,
                                                                                comment: task.comment || ''
                                                                            })
                                                                            setTaskModalOpen(true)
                                                                        }}
                                                                        title="Editar tarea"
                                                                    >
                                                                        <Edit2 size={13} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-icon text-danger"
                                                                        onClick={async () => {
                                                                            if (confirm(`¿Eliminar la tarea "${task.title}"?`)) {
                                                                                await scrumApi.deleteTask(task.id)
                                                                                addToast('Tarea eliminada.', 'success')
                                                                                if (selectedSprintId) loadSprintDetail(selectedSprintId)
                                                                            }
                                                                        }}
                                                                        title="Eliminar tarea"
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── PESTAÑA 2: PLANIFICACIÓN & HISTORIAS ── */}
                    {activeTab === 'plan' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                                <h3>Historias de Usuario Asignadas al Sprint ({sprintDetail.userStories.length})</h3>
                                <button type="button" className="btn btn-primary" onClick={handleOpenAssignStories}>
                                    <Plus size={16} />
                                    Gestionar Historias del Sprint
                                </button>
                            </div>

                            {sprintDetail.userStories.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p className="text-secondary">No hay historias de usuario asignadas a este sprint.</p>
                                    <button type="button" className="btn btn-secondary" onClick={handleOpenAssignStories} style={{ marginTop: '0.8rem' }}>
                                        Asignar historias del Product Backlog
                                    </button>
                                </div>
                            ) : (
                                <div className="table-responsive card" style={{ padding: 0 }}>
                                    <table className="table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                                <th style={{ padding: '0.8rem' }}>Código</th>
                                                <th style={{ padding: '0.8rem' }}>Requisito</th>
                                                <th style={{ padding: '0.8rem', textAlign: 'center' }}>BV</th>
                                                <th style={{ padding: '0.8rem', textAlign: 'center' }}>SP</th>
                                                <th style={{ padding: '0.8rem', textAlign: 'center' }}>Cociente</th>
                                                <th style={{ padding: '0.8rem' }}>Estado</th>
                                                <th style={{ padding: '0.8rem' }}>Criterios de Aceptación</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sprintDetail.userStories.map(s => (
                                                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.8rem', fontWeight: 700, color: '#4f46e5' }}>{s.code}</td>
                                                    <td style={{ padding: '0.8rem' }}>
                                                        <div style={{ fontWeight: 600 }}>{s.title}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.description}</div>
                                                    </td>
                                                    <td style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 600 }}>{s.businessValue}</td>
                                                    <td style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 600 }}>{s.storyPoints}</td>
                                                    <td style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 700 }}>{s.decisionQuotient.toFixed(2)}</td>
                                                    <td style={{ padding: '0.8rem' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#e0e7ff', color: '#3730a3' }}>
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.8rem', fontSize: '0.8rem', color: '#334155' }}>
                                                        {s.acceptanceCriteria || '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── PESTAÑA 3: TAREAS NO PLANIFICADAS (TNP) ── */}
                    {activeTab === 'tnp' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                                <div>
                                    <h3>Detalle de Tareas No Planificadas (TNP)</h3>
                                    <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                                        Interrupciones, ajustes de infraestructura o incidencias emergentes durante el sprint. Total: <strong>{sprintDetail.totalUnplannedHours} horas</strong>.
                                    </p>
                                </div>
                                <button type="button" className="btn btn-primary" onClick={() => setTnpModalOpen(true)}>
                                    <Plus size={16} />
                                    Registrar Tarea No Planificada
                                </button>
                            </div>

                            {sprintDetail.unplannedTasks.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p className="text-secondary">No se registraron tareas no planificadas en este sprint.</p>
                                </div>
                            ) : (
                                <div className="table-responsive card" style={{ padding: 0 }}>
                                    <table className="table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                                <th style={{ padding: '0.8rem' }}>Fecha</th>
                                                <th style={{ padding: '0.8rem' }}>Desarrollador</th>
                                                <th style={{ padding: '0.8rem' }}>Tarea / Incidencia</th>
                                                <th style={{ padding: '0.8rem', textAlign: 'center' }}>Duración (Horas)</th>
                                                <th style={{ padding: '0.8rem', textAlign: 'center' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sprintDetail.unplannedTasks.map(ut => (
                                                <tr key={ut.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.8rem', fontSize: '0.85rem' }}>{ut.date.substring(0, 10)}</td>
                                                    <td style={{ padding: '0.8rem', fontWeight: 600 }}>{ut.developer}</td>
                                                    <td style={{ padding: '0.8rem' }}>{ut.taskDescription}</td>
                                                    <td style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>{ut.durationHours} h</td>
                                                    <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                                                        <button
                                                            type="button"
                                                            className="btn-icon text-danger"
                                                            onClick={async () => {
                                                                if (confirm('¿Eliminar esta TNP?')) {
                                                                    await scrumApi.deleteUnplanned(ut.id)
                                                                    addToast('TNP eliminada.', 'success')
                                                                    if (selectedSprintId) loadSprintDetail(selectedSprintId)
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── PESTAÑA 4: DAILY LOG ── */}
                    {activeTab === 'daily' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                                <div>
                                    <h3>Daily Scrum Log (Bitácora Diaria)</h3>
                                    <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                                        Avance, siguientes pasos e impedimentos por integrante del equipo.
                                    </p>
                                </div>
                                <button type="button" className="btn btn-primary" onClick={() => setDailyModalOpen(true)}>
                                    <Plus size={16} />
                                    Nuevo Registro de Daily
                                </button>
                            </div>

                            {sprintDetail.dailyLogs.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p className="text-secondary">No hay registros de daily standup en este sprint.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {sprintDetail.dailyLogs.map(log => (
                                        <div key={log.id} className="card" style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
                                                <div style={{ fontWeight: 700, color: '#1e293b' }}>
                                                    👤 {log.teamMember} — <span style={{ color: '#64748b', fontWeight: 500 }}>{log.date.substring(0, 10)}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-icon text-danger"
                                                    onClick={async () => {
                                                        if (confirm('¿Eliminar registro?')) {
                                                            await scrumApi.deleteDaily(log.id)
                                                            addToast('Registro eliminado.', 'success')
                                                            if (selectedSprintId) loadSprintDetail(selectedSprintId)
                                                        }
                                                    }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem', fontSize: '0.85rem' }}>
                                                <div>
                                                    <strong style={{ color: '#16a34a' }}>✓ ¿Qué hice hoy?</strong>
                                                    <p style={{ margin: '0.2rem 0 0 0', color: '#334155' }}>{log.progress}</p>
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#2563eb' }}>→ ¿Qué haré mañana?</strong>
                                                    <p style={{ margin: '0.2rem 0 0 0', color: '#334155' }}>{log.nextStep}</p>
                                                </div>
                                                <div>
                                                    <strong style={{ color: '#dc2626' }}>⚠️ Impedimentos:</strong>
                                                    <p style={{ margin: '0.2rem 0 0 0', color: '#334155' }}>{log.impediments || 'Ninguno'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── PESTAÑA 5: SPRINT REVIEW Y RETROSPECTIVA ── */}
                    {activeTab === 'retro' && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>Sprint Review & Retrospectiva — {sprintDetail.name}</h3>
                            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                Evaluación formal del cierre del sprint: qué se entregó, qué quedó pendiente, qué funcionó bien y los acuerdos de mejora para la siguiente iteración.
                            </p>

                            <form onSubmit={handleSaveRetro} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label htmlFor="retro-completed" className="form-label" style={{ fontWeight: 600, color: '#166534' }}>
                                            ✓ ¿Qué se completó con éxito en este Sprint?
                                        </label>
                                        <textarea
                                            id="retro-completed"
                                            className="form-control"
                                            rows={3}
                                            placeholder="Detalla las historias de usuario y tareas terminadas..."
                                            value={retroForm.completedSummary}
                                            onChange={e => setRetroForm({ ...retroForm, completedSummary: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="retro-pending" className="form-label" style={{ fontWeight: 600, color: '#991b1b' }}>
                                            ✗ ¿Qué quedó pendiente o con deuda técnica?
                                        </label>
                                        <textarea
                                            id="retro-pending"
                                            className="form-control"
                                            rows={3}
                                            placeholder="Detalla cualquier historia o corrección pendiente..."
                                            value={retroForm.pendingSummary}
                                            onChange={e => setRetroForm({ ...retroForm, pendingSummary: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label htmlFor="retro-well" className="form-label" style={{ fontWeight: 600, color: '#1e40af' }}>
                                            👍 ¿Qué salió bien en el equipo y en el proceso?
                                        </label>
                                        <textarea
                                            id="retro-well"
                                            className="form-control"
                                            rows={3}
                                            placeholder="Dinámica de trabajo, prototipado, comunicación..."
                                            value={retroForm.whatWentWell}
                                            onChange={e => setRetroForm({ ...retroForm, whatWentWell: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="retro-wrong" className="form-label" style={{ fontWeight: 600, color: '#9a3412' }}>
                                            👎 ¿Qué salió mal o generó fricción?
                                        </label>
                                        <textarea
                                            id="retro-wrong"
                                            className="form-control"
                                            rows={3}
                                            placeholder="Dificultades técnicas, retrasos, herramientas..."
                                            value={retroForm.whatWentWrong}
                                            onChange={e => setRetroForm({ ...retroForm, whatWentWrong: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="retro-agreements" className="form-label" style={{ fontWeight: 600, color: '#4338ca' }}>
                                        🤝 Acuerdos y Compromisos de Mejora para el Siguiente Sprint:
                                    </label>
                                    <textarea
                                        id="retro-agreements"
                                        className="form-control"
                                        rows={3}
                                        placeholder="Acciones concretas que el equipo implementará para optimizar el siguiente ciclo..."
                                        value={retroForm.agreements}
                                        onChange={e => setRetroForm({ ...retroForm, agreements: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                    <button type="submit" className="btn btn-primary">
                                        <CheckCircle2 size={16} />
                                        Guardar Retrospectiva del Sprint
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </>
            )}

            {/* Modal Crear / Editar Tarea */}
            <Modal
                isOpen={taskModalOpen}
                onClose={() => setTaskModalOpen(false)}
                title={editingTask ? 'Editar Tarea de Sprint' : 'Nueva Tarea de Sprint'}
            >
                <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label htmlFor="task-story" className="form-label" style={{ fontWeight: 600 }}>Historia de Usuario Asociada</label>
                        <select
                            id="task-story"
                            className="form-control"
                            value={taskForm.userStoryId}
                            onChange={e => setTaskForm({ ...taskForm, userStoryId: e.target.value })}
                        >
                            <option value="">— Ninguna (Tarea técnica general) —</option>
                            {sprintDetail?.userStories.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.code}: {s.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="task-title" className="form-label" style={{ fontWeight: 600 }}>Descripción de la TAREA *</label>
                        <input
                            id="task-title"
                            type="text"
                            className="form-control"
                            required
                            placeholder="Ej: Construir componente KanbanBoard con drag & drop"
                            value={taskForm.title}
                            onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div>
                            <label htmlFor="task-dev" className="form-label" style={{ fontWeight: 600 }}>Desarrollador / Responsable *</label>
                            <input
                                id="task-dev"
                                type="text"
                                className="form-control"
                                required
                                value={taskForm.developer}
                                onChange={e => setTaskForm({ ...taskForm, developer: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="task-phase" className="form-label" style={{ fontWeight: 600 }}>Fase Desarrollo</label>
                            <select
                                id="task-phase"
                                className="form-control"
                                value={taskForm.phase}
                                onChange={e => setTaskForm({ ...taskForm, phase: e.target.value })}
                            >
                                <option value="Análisis">Análisis</option>
                                <option value="Diseño">Diseño</option>
                                <option value="Implementación">Implementación</option>
                                <option value="Pruebas">Pruebas</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                        <div>
                            <label htmlFor="task-type" className="form-label" style={{ fontWeight: 600 }}>Tipo</label>
                            <select
                                id="task-type"
                                className="form-control"
                                value={taskForm.type}
                                onChange={e => setTaskForm({ ...taskForm, type: e.target.value })}
                            >
                                <option value="Nuevo">Nuevo</option>
                                <option value="Error">Error</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="task-esthours" className="form-label" style={{ fontWeight: 600 }}>t(Horas Estimadas)</label>
                            <input
                                id="task-esthours"
                                type="number"
                                step="0.5"
                                min="0.5"
                                className="form-control"
                                value={taskForm.estimatedHours}
                                onChange={e => setTaskForm({ ...taskForm, estimatedHours: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="task-realhours" className="form-label" style={{ fontWeight: 600 }}>t(Horas Reales)</label>
                            <input
                                id="task-realhours"
                                type="number"
                                step="0.5"
                                min="0"
                                className="form-control"
                                value={taskForm.realHours}
                                onChange={e => setTaskForm({ ...taskForm, realHours: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div>
                            <label htmlFor="task-status" className="form-label" style={{ fontWeight: 600 }}>Estado</label>
                            <select
                                id="task-status"
                                className="form-control"
                                value={taskForm.status}
                                onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="En progreso">En progreso</option>
                                <option value="En revisión">En revisión</option>
                                <option value="Terminado">Terminado</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="task-comment" className="form-label" style={{ fontWeight: 600 }}>Comentario</label>
                            <input
                                id="task-comment"
                                type="text"
                                className="form-control"
                                placeholder="Notas o detalles..."
                                value={taskForm.comment}
                                onChange={e => setTaskForm({ ...taskForm, comment: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setTaskModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar Tarea</button>
                    </div>
                </form>
            </Modal>

            {/* Modal TNP */}
            <Modal
                isOpen={tnpModalOpen}
                onClose={() => setTnpModalOpen(false)}
                title="Registrar Tarea No Planificada (TNP)"
            >
                <form onSubmit={handleSaveTnp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div>
                            <label htmlFor="tnp-date" className="form-label" style={{ fontWeight: 600 }}>Fecha *</label>
                            <input
                                id="tnp-date"
                                type="date"
                                className="form-control"
                                required
                                value={tnpForm.date}
                                onChange={e => setTnpForm({ ...tnpForm, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="tnp-dev" className="form-label" style={{ fontWeight: 600 }}>Desarrollador *</label>
                            <input
                                id="tnp-dev"
                                type="text"
                                className="form-control"
                                required
                                value={tnpForm.developer}
                                onChange={e => setTnpForm({ ...tnpForm, developer: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="tnp-desc" className="form-label" style={{ fontWeight: 600 }}>Descripción de la Tarea / Incidencia *</label>
                        <textarea
                            id="tnp-desc"
                            className="form-control"
                            rows={3}
                            required
                            placeholder="Describa el problema o ajuste emergente..."
                            value={tnpForm.taskDescription}
                            onChange={e => setTnpForm({ ...tnpForm, taskDescription: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="tnp-dur" className="form-label" style={{ fontWeight: 600 }}>Duración (Horas) *</label>
                        <input
                            id="tnp-dur"
                            type="number"
                            step="0.5"
                            min="0.5"
                            className="form-control"
                            required
                            value={tnpForm.durationHours}
                            onChange={e => setTnpForm({ ...tnpForm, durationHours: Number(e.target.value) })}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setTnpModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Registrar TNP</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Daily */}
            <Modal
                isOpen={dailyModalOpen}
                onClose={() => setDailyModalOpen(false)}
                title="Registrar Daily Check-in"
            >
                <form onSubmit={handleSaveDaily} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div>
                            <label htmlFor="daily-date" className="form-label" style={{ fontWeight: 600 }}>Fecha *</label>
                            <input
                                id="daily-date"
                                type="date"
                                className="form-control"
                                required
                                value={dailyForm.date}
                                onChange={e => setDailyForm({ ...dailyForm, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="daily-member" className="form-label" style={{ fontWeight: 600 }}>Integrante *</label>
                            <input
                                id="daily-member"
                                type="text"
                                className="form-control"
                                required
                                value={dailyForm.teamMember}
                                onChange={e => setDailyForm({ ...dailyForm, teamMember: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="daily-prog" className="form-label" style={{ fontWeight: 600 }}>¿Qué hice hoy? *</label>
                        <textarea
                            id="daily-prog"
                            className="form-control"
                            rows={2}
                            required
                            placeholder="Avance completado hoy..."
                            value={dailyForm.progress}
                            onChange={e => setDailyForm({ ...dailyForm, progress: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="daily-next" className="form-label" style={{ fontWeight: 600 }}>¿Qué haré mañana? *</label>
                        <textarea
                            id="daily-next"
                            className="form-control"
                            rows={2}
                            required
                            placeholder="Siguiente paso a abordar..."
                            value={dailyForm.nextStep}
                            onChange={e => setDailyForm({ ...dailyForm, nextStep: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="daily-imp" className="form-label" style={{ fontWeight: 600 }}>Impedimentos o bloqueos</label>
                        <input
                            id="daily-imp"
                            type="text"
                            className="form-control"
                            placeholder="Ej: Ninguno, o falta definir criterios de aceptación..."
                            value={dailyForm.impediments}
                            onChange={e => setDailyForm({ ...dailyForm, impediments: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setDailyModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar Daily</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Asignar Historias al Sprint */}
            <Modal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                title={`Gestionar Historias de Usuario en ${sprintDetail?.name}`}
            >
                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Selecciona las historias del Product Backlog que formarán parte de este sprint.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '350px', overflowY: 'auto' }}>
                    {allBacklogStories.map(s => {
                        const isChecked = selectedStoryIds.includes(s.id)
                        return (
                            <label
                                key={s.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.8rem',
                                    padding: '0.6rem',
                                    borderRadius: '6px',
                                    border: isChecked ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                                    background: isChecked ? '#f5f3ff' : '#ffffff',
                                    cursor: 'pointer'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={e => {
                                        if (e.target.checked) {
                                            setSelectedStoryIds([...selectedStoryIds, s.id])
                                        } else {
                                            setSelectedStoryIds(selectedStoryIds.filter(id => id !== s.id))
                                        }
                                    }}
                                    style={{ marginTop: '3px' }}
                                />
                                <div style={{ flex: 1, fontSize: '0.875rem' }}>
                                    <div style={{ fontWeight: 700, color: '#4f46e5' }}>{s.code}: {s.title}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{s.description}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.2rem' }}>
                                        BV: <strong>{s.businessValue}</strong> | SP: <strong>{s.storyPoints}</strong> | Cociente: <strong>{s.decisionQuotient.toFixed(2)}</strong> | Módulo: <strong>{s.module}</strong>
                                    </div>
                                </div>
                            </label>
                        )
                    })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.2rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setAssignModalOpen(false)}>Cancelar</button>
                    <button type="button" className="btn btn-primary" onClick={handleConfirmAssignStories}>Guardar Asignación</button>
                </div>
            </Modal>
        </div>
    )
}
