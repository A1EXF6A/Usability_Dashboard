import { useState, useEffect } from 'react'
import { kanbanApi, sprintsApi } from '../api'
import { useToast } from '../App'
import {
    Users, UserCheck, Clock, Layers,
    RefreshCw, Edit3, ChevronDown, Search
} from 'lucide-react'

interface TaskAssignmentTabProps {
    activePlanId: string
    onOpenAiAssistant?: () => void
}

interface SprintItem {
    id: string
    name: string
    goal: string
    status: string
}

interface TeamMemberProgress {
    assignee: string
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    pendingTasks: number
    totalEstimatedHours: number
    completedHours: number
}

interface TaskItem {
    id: string
    sprintId: string
    userStoryId: string | null
    userStoryTitle: string | null
    taskCode: string
    title: string
    description: string
    estimatedHours: number
    status: string
    assignee: string
    order: number
    createdAt: string
}

const STATUS_OPTIONS = ['Pendiente', 'En progreso', 'En revisión', 'Terminado']

export default function TaskAssignmentTab({ activePlanId }: TaskAssignmentTabProps) {
    const { addToast } = useToast()

    // Sprints list & selection
    const [sprints, setSprints] = useState<SprintItem[]>([])
    const [selectedSprintId, setSelectedSprintId] = useState<string>('')

    // Data
    const [tasks, setTasks] = useState<TaskItem[]>([])
    const [teamProgress, setTeamProgress] = useState<TeamMemberProgress[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [refreshing, setRefreshing] = useState<boolean>(false)

    // Filters
    const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('All')
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All')
    const [searchQuery, setSearchQuery] = useState<string>('')

    // Inline editing assignee state
    const [editingAssigneeId, setEditingAssigneeId] = useState<string | null>(null)
    const [newAssigneeValue, setNewAssigneeValue] = useState<string>('')

    // Load Sprints on mount or plan change
    useEffect(() => {
        if (!activePlanId) return
        loadSprints()
    }, [activePlanId])

    // Load Tasks & Team Progress when selected sprint changes
    useEffect(() => {
        if (selectedSprintId) {
            loadSprintData(selectedSprintId)
        } else {
            setTasks([])
            setTeamProgress([])
        }
    }, [selectedSprintId])

    const loadSprints = async () => {
        setLoading(true)
        try {
            const res = await sprintsApi.getByPlan(activePlanId)
            const list: SprintItem[] = res.data || []
            setSprints(list)
            if (list.length > 0) {
                const active = list.find(s => s.status === 'En progreso' || s.status === 'Planificado') || list[0]
                setSelectedSprintId(active.id)
            } else {
                setSelectedSprintId('')
            }
        } catch (err: any) {
            console.error('Error cargando sprints:', err)
            addToast('Error al cargar sprints', 'error')
        } finally {
            setLoading(false)
        }
    }

    const loadSprintData = async (sprintId: string) => {
        setRefreshing(true)
        try {
            const [tasksRes, progressRes] = await Promise.all([
                kanbanApi.getTasksBySprint(sprintId),
                kanbanApi.getTeamProgress(sprintId)
            ])
            setTasks(tasksRes.data || [])
            setTeamProgress(progressRes.data || [])
        } catch (err: any) {
            console.error('Error cargando datos de asignación de tareas:', err)
            addToast('Error al cargar las tareas del equipo', 'error')
        } finally {
            setRefreshing(false)
        }
    }

    // Update Status with DB persistence
    const handleUpdateStatus = async (taskId: string, newStatus: string) => {
        const currentTask = tasks.find(t => t.id === taskId)
        if (!currentTask || currentTask.status === newStatus) return

        const prevTasks = [...tasks]
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

        try {
            await kanbanApi.updateStatus(taskId, newStatus)
            addToast(`Estado de la tarea actualizado a "${newStatus}"`, 'success')
            // Refresh team metrics
            if (selectedSprintId) {
                const progressRes = await kanbanApi.getTeamProgress(selectedSprintId)
                setTeamProgress(progressRes.data || [])
            }
        } catch (err: any) {
            console.error('Error actualizando estado:', err)
            setTasks(prevTasks)
            addToast('No se pudo guardar el cambio de estado', 'error')
        }
    }

    // Update Assignee with DB persistence
    const handleSaveAssignee = async (taskId: string) => {
        if (!newAssigneeValue.trim()) {
            setEditingAssigneeId(null)
            return
        }

        const prevTasks = [...tasks]
        const updatedAssignee = newAssigneeValue.trim()
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignee: updatedAssignee } : t))
        setEditingAssigneeId(null)

        try {
            await kanbanApi.updateAssignee(taskId, updatedAssignee)
            addToast(`Responsable actualizado a "${updatedAssignee}"`, 'success')
            // Refresh team progress
            if (selectedSprintId) {
                const progressRes = await kanbanApi.getTeamProgress(selectedSprintId)
                setTeamProgress(progressRes.data || [])
            }
        } catch (err: any) {
            console.error('Error actualizando responsable:', err)
            setTasks(prevTasks)
            addToast('Error al guardar el nuevo responsable en BD', 'error')
        }
    }

    // Quick select from existing members
    const handleQuickAssign = async (taskId: string, memberName: string) => {
        if (!memberName) return
        const prevTasks = [...tasks]
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignee: memberName } : t))

        try {
            await kanbanApi.updateAssignee(taskId, memberName)
            addToast(`Tarea reasignada a "${memberName}"`, 'success')
            if (selectedSprintId) {
                const progressRes = await kanbanApi.getTeamProgress(selectedSprintId)
                setTeamProgress(progressRes.data || [])
            }
        } catch (err: any) {
            console.error('Error reasignando tarea:', err)
            setTasks(prevTasks)
            addToast('Error al guardar reasignación', 'error')
        }
    }

    // Filtering tasks
    const filteredTasks = tasks.filter(task => {
        const matchesMember = selectedMemberFilter === 'All' || task.assignee === selectedMemberFilter
        const matchesStatus = selectedStatusFilter === 'All' || task.status === selectedStatusFilter
        const matchesSearch = !searchQuery.trim() ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.taskCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.userStoryTitle && task.userStoryTitle.toLowerCase().includes(searchQuery.toLowerCase()))

        return matchesMember && matchesStatus && matchesSearch
    })

    // Overall metrics
    const totalSprintTasks = tasks.length
    const completedSprintTasks = tasks.filter(t => t.status === 'Terminado').length
    const sprintCompletionPercent = totalSprintTasks > 0 ? Math.round((completedSprintTasks / totalSprintTasks) * 100) : 0
    const totalSprintHours = tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)
    const completedSprintHours = tasks.filter(t => t.status === 'Terminado').reduce((acc, t) => acc + (t.estimatedHours || 0), 0)

    // Distinct known member names
    const distinctMembers = Array.from(new Set([
        ...teamProgress.map(m => m.assignee),
        ...tasks.map(t => t.assignee)
    ])).filter(m => Boolean(m) && m !== 'Sin asignar')

    return (
        <div className="space-y-6">
            {/* Top Bar: Sprint Selection */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Users className="text-primary-600 dark:text-primary-400" size={20} />
                        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Sprint para Asignación:</span>
                    </div>

                    {sprints.length === 0 ? (
                        <span className="text-sm text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900">
                            No hay Sprints registrados aún.
                        </span>
                    ) : (
                        <div className="relative">
                            <select
                                value={selectedSprintId}
                                onChange={e => setSelectedSprintId(e.target.value)}
                                className="appearance-none pl-3.5 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                            >
                                {sprints.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.status})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => selectedSprintId && loadSprintData(selectedSprintId)}
                        disabled={refreshing || !selectedSprintId}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                        title="Refrescar asignaciones y métricas"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Overall Sprint Progress Banner */}
            {selectedSprintId && (
                <div className="bg-gradient-to-r from-primary-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                        <div>
                            <span className="text-xs uppercase tracking-wider text-primary-200 font-medium">Progreso Global del Sprint</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-extrabold">{sprintCompletionPercent}%</span>
                                <span className="text-xs text-primary-200">completado</span>
                            </div>
                            <div className="w-full bg-primary-950/60 rounded-full h-2.5 mt-2 overflow-hidden border border-primary-700/50">
                                <div
                                    className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${sprintCompletionPercent}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-xs border border-white/10">
                            <span className="text-xs text-primary-200 block mb-0.5">Tareas Completadas</span>
                            <span className="text-xl font-bold">{completedSprintTasks} / {totalSprintTasks}</span>
                            <span className="text-[11px] text-primary-300 block mt-0.5">
                                {totalSprintTasks - completedSprintTasks} tareas restantes
                            </span>
                        </div>

                        <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-xs border border-white/10">
                            <span className="text-xs text-primary-200 block mb-0.5">Horas de Esfuerzo</span>
                            <span className="text-xl font-bold">{completedSprintHours}h / {totalSprintHours}h</span>
                            <span className="text-[11px] text-primary-300 block mt-0.5">
                                {totalSprintHours - completedSprintHours}h por ejecutar
                            </span>
                        </div>

                        <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-xs border border-white/10">
                            <span className="text-xs text-primary-200 block mb-0.5">Miembros Asignados</span>
                            <span className="text-xl font-bold">{teamProgress.filter(m => m.assignee !== 'Sin asignar').length}</span>
                            <span className="text-[11px] text-primary-300 block mt-0.5">
                                {teamProgress.some(m => m.assignee === 'Sin asignar') ? 'Hay tareas sin asignar' : 'Todas asignadas'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* TEAM MEMBERS SUMMARY CARDS */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <UserCheck size={18} className="text-primary-600 dark:text-primary-400" />
                        Avance por Integrante del Equipo
                    </h3>
                    {selectedMemberFilter !== 'All' && (
                        <button
                            onClick={() => setSelectedMemberFilter('All')}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Quitar filtro de integrante (Ver todos)
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="py-12 text-center text-slate-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
                        <p className="text-xs">Cargando métricas de integrantes...</p>
                    </div>
                ) : teamProgress.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-6 text-center text-slate-500 text-xs">
                        No hay integrantes con tareas en este sprint aún.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {teamProgress.map((member, index) => {
                            const isUnassigned = member.assignee === 'Sin asignar'
                            const isSelected = selectedMemberFilter === member.assignee
                            const percent = member.totalTasks > 0 ? Math.round((member.completedTasks / member.totalTasks) * 100) : 0

                            return (
                                <div
                                    key={index}
                                    onClick={() => setSelectedMemberFilter(isSelected ? 'All' : member.assignee)}
                                    className={`bg-white dark:bg-slate-900 rounded-xl p-4 border transition cursor-pointer hover:shadow-md ${
                                        isSelected
                                            ? 'border-primary-500 ring-2 ring-primary-500/30 dark:ring-primary-400/20 shadow-md'
                                            : 'border-slate-200 dark:border-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                                            isUnassigned
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                                                : 'bg-primary-100 text-primary-700 dark:bg-primary-950/70 dark:text-primary-400 border border-primary-300 dark:border-primary-800'
                                        }`}>
                                            {isUnassigned ? '?' : member.assignee.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                                {member.assignee}
                                            </h4>
                                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                {member.totalTasks} {member.totalTasks === 1 ? 'tarea' : 'tareas'} • {member.totalEstimatedHours}h
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500 dark:text-slate-400">Avance:</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{percent}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-2 rounded-full ${percent === 100 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Task breakdown chips */}
                                    <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-center">
                                        <div className="bg-slate-50 dark:bg-slate-800/60 p-1 rounded border border-slate-200/60 dark:border-slate-700/60">
                                            <span className="block font-bold text-slate-700 dark:text-slate-200">{member.pendingTasks}</span>
                                            <span className="text-slate-400 text-[9px]">Pendientes</span>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-950/40 p-1 rounded border border-blue-200/60 dark:border-blue-800/60">
                                            <span className="block font-bold text-blue-700 dark:text-blue-300">{member.inProgressTasks}</span>
                                            <span className="text-blue-500 text-[9px]">En curso</span>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                                            <span className="block font-bold text-emerald-700 dark:text-emerald-300">{member.completedTasks}</span>
                                            <span className="text-emerald-500 text-[9px]">Completadas</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* TASKS ASSIGNMENT & STATUS MANAGEMENT TABLE */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Table Filters */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Buscar tarea o código..."
                                className="pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs w-56"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-500">Filtrar Integrante:</span>
                            <select
                                value={selectedMemberFilter}
                                onChange={e => setSelectedMemberFilter(e.target.value)}
                                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-medium"
                            >
                                <option value="All">Todos los integrantes</option>
                                {teamProgress.map(m => (
                                    <option key={m.assignee} value={m.assignee}>{m.assignee}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-500">Estado:</span>
                            <select
                                value={selectedStatusFilter}
                                onChange={e => setSelectedStatusFilter(e.target.value)}
                                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-medium"
                            >
                                <option value="All">Todos los estados</option>
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Mostrando {filteredTasks.length} de {tasks.length} tareas
                    </div>
                </div>

                {/* Interactive Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="py-3 px-4 w-24">Código</th>
                                <th className="py-3 px-4 min-w-[240px]">Tarea Técnica</th>
                                <th className="py-3 px-4 min-w-[180px]">Historia de Usuario</th>
                                <th className="py-3 px-4 w-28 text-center">Esfuerzo</th>
                                <th className="py-3 px-4 min-w-[200px]">Responsable Asignado</th>
                                <th className="py-3 px-4 min-w-[160px]">Estado Actual</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        No se encontraron tareas con los filtros seleccionados.
                                    </td>
                                </tr>
                            ) : (
                                filteredTasks.map(task => {
                                    const isEditingAssignee = editingAssigneeId === task.id

                                    return (
                                        <tr key={task.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                                            {/* Code */}
                                            <td className="py-3 px-4 font-mono font-bold text-primary-700 dark:text-primary-400">
                                                {task.taskCode}
                                            </td>

                                            {/* Title & Desc */}
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                                    {task.title}
                                                </div>
                                                {task.description && (
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                                        {task.description}
                                                    </div>
                                                )}
                                            </td>

                                            {/* User Story */}
                                            <td className="py-3 px-4">
                                                {task.userStoryTitle ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium max-w-[200px] truncate" title={task.userStoryTitle}>
                                                        <Layers size={11} className="shrink-0 text-slate-400" />
                                                        <span className="truncate">{task.userStoryTitle}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">- General -</span>
                                                )}
                                            </td>

                                            {/* Estimated Hours */}
                                            <td className="py-3 px-4 text-center font-mono">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                                                    <Clock size={11} /> {task.estimatedHours}h
                                                </span>
                                            </td>

                                            {/* Assignee (Editable & Fast Selector) */}
                                            <td className="py-3 px-4">
                                                {isEditingAssignee ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="text"
                                                            value={newAssigneeValue}
                                                            onChange={e => setNewAssigneeValue(e.target.value)}
                                                            placeholder="Nombre del integrante..."
                                                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-primary-500 rounded text-xs w-40"
                                                            autoFocus
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') handleSaveAssignee(task.id)
                                                                if (e.key === 'Escape') setEditingAssigneeId(null)
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => handleSaveAssignee(task.id)}
                                                            className="px-2 py-1 bg-primary-600 text-white rounded text-xs font-medium hover:bg-primary-700"
                                                        >
                                                            OK
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingAssigneeId(null)}
                                                            className="text-slate-400 hover:text-slate-600 text-xs px-1"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1.5 min-w-[130px]">
                                                            <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 flex items-center justify-center text-[10px] font-bold">
                                                                {(task.assignee || 'U')[0].toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                                                {task.assignee || 'Sin asignar'}
                                                            </span>
                                                        </div>

                                                        {/* Quick reassign dropdown */}
                                                        {distinctMembers.length > 0 && (
                                                            <select
                                                                value=""
                                                                onChange={e => handleQuickAssign(task.id, e.target.value)}
                                                                className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-500"
                                                                title="Reasignar rápidamente"
                                                            >
                                                                <option value="" disabled>Reasignar a...</option>
                                                                {distinctMembers.map(m => (
                                                                    <option key={m} value={m}>{m}</option>
                                                                ))}
                                                                <option value="Sin asignar">Sin asignar</option>
                                                            </select>
                                                        )}

                                                        <button
                                                            onClick={() => {
                                                                setEditingAssigneeId(task.id)
                                                                setNewAssigneeValue(task.assignee || '')
                                                            }}
                                                            className="p-1 text-slate-400 hover:text-primary-600 rounded"
                                                            title="Escribir nuevo integrante"
                                                        >
                                                            <Edit3 size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status Dropdown */}
                                            <td className="py-3 px-4">
                                                <select
                                                    value={task.status}
                                                    onChange={e => handleUpdateStatus(task.id, e.target.value)}
                                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border focus:outline-none ${
                                                        task.status === 'Terminado'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                                            : task.status === 'En progreso'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                                            : task.status === 'En revisión'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                                            : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                    }`}
                                                >
                                                    {STATUS_OPTIONS.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
