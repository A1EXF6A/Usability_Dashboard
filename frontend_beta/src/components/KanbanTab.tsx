import { useState, useEffect, type FormEvent, type DragEvent } from 'react'
import { kanbanApi, sprintsApi, productBacklogApi } from '../api'
import { useToast } from '../App'
import Modal from './Modal'
import {
    Plus, Clock, Trash2, Edit3, MoveRight, Layers,
    RefreshCw, ChevronDown, CheckSquare,
    Search, Filter
} from 'lucide-react'

interface KanbanTabProps {
    activePlanId: string
    onOpenAiAssistant?: () => void
}

interface SprintItem {
    id: string
    name: string
    goal: string
    status: string
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

interface UserStoryOption {
    id: string
    storyCode: string
    title: string
}

const COLUMNS = [
    { id: 'Pendiente', label: 'Pendiente', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', borderTop: 'border-slate-400' },
    { id: 'En progreso', label: 'En Progreso', badgeClass: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800', borderTop: 'border-blue-500' },
    { id: 'En revisión', label: 'En Revisión', badgeClass: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800', borderTop: 'border-amber-500' },
    { id: 'Terminado', label: 'Terminado', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800', borderTop: 'border-emerald-500' }
]

export default function KanbanTab({ activePlanId }: KanbanTabProps) {
    const { addToast } = useToast()

    // Sprints list & selection
    const [sprints, setSprints] = useState<SprintItem[]>([])
    const [selectedSprintId, setSelectedSprintId] = useState<string>('')
    const [tasks, setTasks] = useState<TaskItem[]>([])
    const [userStories, setUserStories] = useState<UserStoryOption[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [refreshing, setRefreshing] = useState<boolean>(false)

    // Filters inside Kanban
    const [searchFilter, setSearchFilter] = useState('')
    const [assigneeFilter, setAssigneeFilter] = useState('All')

    // Drag & Drop State
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

    // Task Create / Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<TaskItem | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Task Form Inputs
    const [formTaskCode, setFormTaskCode] = useState('')
    const [formTitle, setFormTitle] = useState('')
    const [formDescription, setFormDescription] = useState('')
    const [formEstimatedHours, setFormEstimatedHours] = useState(4)
    const [formStatus, setFormStatus] = useState('Pendiente')
    const [formAssignee, setFormAssignee] = useState('')
    const [formUserStoryId, setFormUserStoryId] = useState<string>('')

    // Detail modal
    const [detailTask, setDetailTask] = useState<TaskItem | null>(null)

    // Load Sprints for this Plan
    useEffect(() => {
        if (!activePlanId) return
        loadSprints()
    }, [activePlanId])

    // Load Tasks & Stories when selected sprint changes
    useEffect(() => {
        if (selectedSprintId) {
            loadTasks(selectedSprintId)
            loadUserStories(selectedSprintId)
        } else {
            setTasks([])
            setUserStories([])
        }
    }, [selectedSprintId])

    const loadSprints = async () => {
        setLoading(true)
        try {
            const res = await sprintsApi.getByPlan(activePlanId)
            const list: SprintItem[] = res.data || []
            setSprints(list)
            if (list.length > 0) {
                // Default to first active sprint or the first sprint
                const active = list.find(s => s.status === 'En progreso' || s.status === 'Planificado') || list[0]
                setSelectedSprintId(active.id)
            } else {
                setSelectedSprintId('')
            }
        } catch (err: any) {
            console.error('Error cargando sprints para Kanban:', err)
            addToast('Error al cargar sprints', 'error')
        } finally {
            setLoading(false)
        }
    }

    const loadTasks = async (sprintId: string) => {
        setRefreshing(true)
        try {
            const res = await kanbanApi.getTasksBySprint(sprintId)
            setTasks(res.data || [])
        } catch (err: any) {
            console.error('Error cargando tareas del sprint:', err)
            addToast('Error al cargar tareas de Kanban', 'error')
        } finally {
            setRefreshing(false)
        }
    }

    const loadUserStories = async (sprintId: string) => {
        try {
            // Load stories assigned to this plan/sprint
            const res = await productBacklogApi.getByPlan(activePlanId)
            const allStories: any[] = res.data || []
            // Filter to stories in this sprint or all
            const sprintStories = allStories.filter(s => s.sprintId === sprintId || !s.sprintId)
            setUserStories(sprintStories.map(s => ({
                id: s.id,
                storyCode: s.storyCode || 'HU',
                title: s.title
            })))
        } catch (err) {
            console.error('Error cargando historias de usuario:', err)
        }
    }

    // Drag & Drop handlers
    const handleDragStart = (e: DragEvent, taskId: string) => {
        e.dataTransfer.setData('text/plain', taskId)
        setDraggedTaskId(taskId)
    }

    const handleDragOver = (e: DragEvent, colId: string) => {
        e.preventDefault()
        if (dragOverColumn !== colId) {
            setDragOverColumn(colId)
        }
    }

    const handleDragLeave = () => {
        setDragOverColumn(null)
    }

    const handleDrop = async (e: DragEvent, targetStatus: string) => {
        e.preventDefault()
        setDragOverColumn(null)
        const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId
        if (!taskId) return

        const currentTask = tasks.find(t => t.id === taskId)
        if (!currentTask || currentTask.status === targetStatus) {
            setDraggedTaskId(null)
            return
        }

        // Optimistic UI update
        const previousTasks = [...tasks]
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t))
        setDraggedTaskId(null)

        try {
            await kanbanApi.updateStatus(taskId, targetStatus)
            addToast(`Tarea movida a "${targetStatus}"`, 'success')
        } catch (err: any) {
            console.error('Error al actualizar estado:', err)
            setTasks(previousTasks)
            addToast('No se pudo guardar el cambio de estado en la base de datos', 'error')
        }
    }

    // Accessible manual status change (keyboard/select)
    const handleStatusChangeAccessible = async (taskId: string, targetStatus: string) => {
        const currentTask = tasks.find(t => t.id === taskId)
        if (!currentTask || currentTask.status === targetStatus) return

        const previousTasks = [...tasks]
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t))

        try {
            await kanbanApi.updateStatus(taskId, targetStatus)
            addToast(`Tarea movida a "${targetStatus}"`, 'success')
        } catch (err: any) {
            console.error('Error al actualizar estado:', err)
            setTasks(previousTasks)
            addToast('Error al actualizar estado en el servidor', 'error')
        }
    }

    // Open Modal for Create
    const handleOpenCreateModal = (defaultStatus = 'Pendiente') => {
        if (!selectedSprintId) {
            addToast('Primero debe crear o seleccionar un Sprint', 'error')
            return
        }
        setEditingTask(null)
        setFormTaskCode(`TK-${tasks.length + 1}`)
        setFormTitle('')
        setFormDescription('')
        setFormEstimatedHours(4)
        setFormStatus(defaultStatus)
        setFormAssignee('')
        setFormUserStoryId('')
        setIsModalOpen(true)
    }

    // Open Modal for Edit
    const handleOpenEditModal = (task: TaskItem) => {
        setEditingTask(task)
        setFormTaskCode(task.taskCode)
        setFormTitle(task.title)
        setFormDescription(task.description || '')
        setFormEstimatedHours(task.estimatedHours)
        setFormStatus(task.status)
        setFormAssignee(task.assignee || '')
        setFormUserStoryId(task.userStoryId || '')
        setIsModalOpen(true)
    }

    // Save Task (Create or Update)
    const handleSaveTask = async (e: FormEvent) => {
        e.preventDefault()
        if (!formTitle.trim()) {
            addToast('El título de la tarea es obligatorio', 'error')
            return
        }
        if (!selectedSprintId) {
            addToast('Seleccione un Sprint válido', 'error')
            return
        }

        setIsSaving(true)
        try {
            if (editingTask) {
                // Update
                const payload = {
                    title: formTitle.trim(),
                    description: formDescription.trim(),
                    estimatedHours: Number(formEstimatedHours) || 1,
                    status: formStatus,
                    assignee: formAssignee.trim() || 'Sin asignar',
                    order: editingTask.order,
                    userStoryId: formUserStoryId || null
                }
                const res = await kanbanApi.updateTask(editingTask.id, payload)
                addToast('Tarea actualizada correctamente', 'success')
                setTasks(prev => prev.map(t => t.id === editingTask.id ? res.data : t))
                if (detailTask?.id === editingTask.id) {
                    setDetailTask(res.data)
                }
            } else {
                // Create
                const payload = {
                    sprintId: selectedSprintId,
                    userStoryId: formUserStoryId || null,
                    taskCode: formTaskCode.trim() || `TK-${tasks.length + 1}`,
                    title: formTitle.trim(),
                    description: formDescription.trim(),
                    estimatedHours: Number(formEstimatedHours) || 1,
                    status: formStatus,
                    assignee: formAssignee.trim() || 'Sin asignar',
                    order: tasks.length
                }
                const res = await kanbanApi.createTask(payload)
                addToast('Tarea técnica creada y añadida al tablero', 'success')
                setTasks(prev => [...prev, res.data])
            }
            setIsModalOpen(false)
        } catch (err: any) {
            console.error('Error guardando tarea:', err)
            addToast('Error al guardar la tarea en la base de datos', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    // Delete Task
    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm('¿Está seguro de eliminar esta tarea técnica del tablero?')) return
        try {
            await kanbanApi.deleteTask(taskId)
            setTasks(prev => prev.filter(t => t.id !== taskId))
            if (detailTask?.id === taskId) setDetailTask(null)
            addToast('Tarea eliminada del tablero', 'success')
        } catch (err: any) {
            console.error('Error al eliminar tarea:', err)
            addToast('Error al eliminar la tarea', 'error')
        }
    }

    // Unique list of assignees for filtering
    const assignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean)))

    // Filtered tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = !searchFilter.trim() ||
            task.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
            task.taskCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
            (task.userStoryTitle && task.userStoryTitle.toLowerCase().includes(searchFilter.toLowerCase()))
        const matchesAssignee = assigneeFilter === 'All' || task.assignee === assigneeFilter
        return matchesSearch && matchesAssignee
    })

    const selectedSprint = sprints.find(s => s.id === selectedSprintId)

    return (
        <div className="space-y-6">
            {/* Top Bar: Sprint Selection & Quick Stats */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Layers className="text-primary-600 dark:text-primary-400" size={20} />
                        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Sprint Activo:</span>
                    </div>

                    {sprints.length === 0 ? (
                        <span className="text-sm text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900">
                            No hay Sprints creados aún. Cree uno en la pestaña "Gestión de Sprints".
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

                    {selectedSprint && (
                        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="font-medium text-slate-700 dark:text-slate-300">Meta:</span>
                            <span className="truncate max-w-xs">{selectedSprint.goal || 'Sin meta especificada'}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => selectedSprintId && loadTasks(selectedSprintId)}
                        disabled={refreshing || !selectedSprintId}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                        title="Refrescar tablero"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={() => handleOpenCreateModal()}
                        disabled={!selectedSprintId}
                        className="btn btn-primary flex items-center gap-2 text-sm shadow-sm"
                    >
                        <Plus size={16} />
                        Nueva Tarea
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchFilter}
                            onChange={e => setSearchFilter(e.target.value)}
                            placeholder="Buscar en tareas o historias..."
                            className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs focus:ring-1 focus:ring-primary-500 w-52"
                        />
                    </div>

                    {/* Filter by Assignee */}
                    <div className="flex items-center gap-1.5">
                        <Filter size={13} className="text-slate-400" />
                        <span className="text-slate-500 dark:text-slate-400">Responsable:</span>
                        <select
                            value={assigneeFilter}
                            onChange={e => setAssigneeFilter(e.target.value)}
                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-700 dark:text-slate-200"
                        >
                            <option value="All">Todos ({tasks.length})</option>
                            {assignees.map(a => (
                                <option key={a} value={a}>
                                    {a} ({tasks.filter(t => t.assignee === a).length})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-3">
                    <span>Total Tareas: <strong>{tasks.length}</strong></span>
                    <span>•</span>
                    <span>Total Horas: <strong>{tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)}h</strong></span>
                </div>
            </div>

            {/* KANBAN BOARD COLUMNS */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                    <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary-600 mb-3"></div>
                    <p className="text-sm">Cargando tablero Kanban...</p>
                </div>
            ) : !selectedSprintId ? (
                <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center">
                    <Layers className="mx-auto text-slate-400 mb-3" size={40} />
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        No hay ningún Sprint seleccionado
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                        Cree un nuevo Sprint en la pestaña "Gestión de Sprints" para comenzar a planificar y organizar tareas en el Tablero Kanban.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                    {COLUMNS.map(column => {
                        const colTasks = filteredTasks.filter(t => t.status === column.id)
                        const totalHours = colTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)
                        const isOver = dragOverColumn === column.id

                        return (
                            <div
                                key={column.id}
                                onDragOver={e => handleDragOver(e, column.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={e => handleDrop(e, column.id)}
                                className={`flex flex-col bg-slate-100/70 dark:bg-slate-900/60 rounded-xl border-t-4 ${column.borderTop} border-x border-b border-slate-200/90 dark:border-slate-800/90 shadow-sm transition-colors duration-150 min-h-[500px] ${
                                    isOver ? 'ring-2 ring-primary-500 bg-primary-50/20 dark:bg-primary-950/20' : ''
                                }`}
                            >
                                {/* Column Header */}
                                <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                            {column.label}
                                        </h3>
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${column.badgeClass}`}>
                                            {colTasks.length}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium" title="Horas estimadas">
                                            {totalHours}h
                                        </span>
                                        <button
                                            onClick={() => handleOpenCreateModal(column.id)}
                                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded transition"
                                            title={`Añadir tarea a ${column.label}`}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Cards List Drop Area */}
                                <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-320px)]">
                                    {colTasks.length === 0 ? (
                                        <div className="h-28 border border-dashed border-slate-300/80 dark:border-slate-700/60 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs text-center p-3">
                                            <span>Arrastre tareas aquí</span>
                                            <span className="text-[10px] text-slate-400 mt-1">o use el botón '+' para crear</span>
                                        </div>
                                    ) : (
                                        colTasks.map(task => (
                                            <div
                                                key={task.id}
                                                draggable
                                                onDragStart={e => handleDragStart(e, task.id)}
                                                className={`bg-white dark:bg-slate-800/90 rounded-lg p-3.5 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition cursor-grab active:cursor-grabbing group ${
                                                    draggedTaskId === task.id ? 'opacity-40 scale-95' : ''
                                                }`}
                                            >
                                                {/* Card Header: Code & Actions */}
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <span className="text-[11px] font-mono font-bold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded border border-primary-200 dark:border-primary-900">
                                                        {task.taskCode || 'TK'}
                                                    </span>

                                                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                                                        <button
                                                            onClick={() => setDetailTask(task)}
                                                            className="p-1 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                                                            title="Ver detalles de la tarea"
                                                        >
                                                            <CheckSquare size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenEditModal(task)}
                                                            className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                                                            title="Editar tarea"
                                                        >
                                                            <Edit3 size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                                                            title="Eliminar tarea"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Linked User Story pill if available */}
                                                {task.userStoryTitle && (
                                                    <div className="mb-2 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 px-2 py-1 rounded border border-slate-150 dark:border-slate-800 truncate flex items-center gap-1.5" title={`Historia: ${task.userStoryTitle}`}>
                                                        <Layers size={11} className="text-slate-400 shrink-0" />
                                                        <span className="truncate">{task.userStoryTitle}</span>
                                                    </div>
                                                )}

                                                {/* Task Title */}
                                                <h4
                                                    onClick={() => setDetailTask(task)}
                                                    className="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-2.5 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
                                                >
                                                    {task.title}
                                                </h4>

                                                {/* Card Footer: Assignee & Hours */}
                                                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]" title={`Responsable: ${task.assignee || 'Sin asignar'}`}>
                                                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase">
                                                            {(task.assignee || 'U')[0]}
                                                        </div>
                                                        <span className="truncate">{task.assignee || 'Sin asignar'}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                                                        <Clock size={11} />
                                                        <span>{task.estimatedHours}h</span>
                                                    </div>
                                                </div>

                                                {/* Accessible status changer (WCAG requirement) */}
                                                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/40 flex items-center justify-between gap-1 text-[10px]">
                                                    <span className="text-slate-400 flex items-center gap-1">
                                                        <MoveRight size={11} /> Mover:
                                                    </span>
                                                    <select
                                                        value={task.status}
                                                        onChange={e => handleStatusChangeAccessible(task.id, e.target.value)}
                                                        className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-700 dark:text-slate-300 focus:outline-none"
                                                        aria-label={`Cambiar estado de ${task.title}`}
                                                    >
                                                        {COLUMNS.map(c => (
                                                            <option key={c.id} value={c.id}>{c.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* MODAL: CREATE / EDIT TASK */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTask ? `Editar Tarea Técnica [${editingTask.taskCode}]` : 'Nueva Tarea Técnica'}
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSaveTask} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Código de Tarea *
                            </label>
                            <input
                                type="text"
                                required
                                value={formTaskCode}
                                onChange={e => setFormTaskCode(e.target.value)}
                                placeholder="TK-01"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Horas Estimadas *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="100"
                                value={formEstimatedHours}
                                onChange={e => setFormEstimatedHours(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Estado Inicial
                            </label>
                            <select
                                value={formStatus}
                                onChange={e => setFormStatus(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                            >
                                {COLUMNS.map(col => (
                                    <option key={col.id} value={col.id}>{col.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Título de la Tarea *
                        </label>
                        <input
                            type="text"
                            required
                            value={formTitle}
                            onChange={e => setFormTitle(e.target.value)}
                            placeholder="Ej: Reestructurar el menú de navegación para cumplir con WCAG 2.2"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Historia de Usuario Vinculada (Opcional)
                        </label>
                        <select
                            value={formUserStoryId}
                            onChange={e => setFormUserStoryId(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                        >
                            <option value="">-- Sin vincular a Historia específica --</option>
                            {userStories.map(story => (
                                <option key={story.id} value={story.id}>
                                    [{story.storyCode}] {story.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Responsable Asignado
                        </label>
                        <input
                            type="text"
                            value={formAssignee}
                            onChange={e => setFormAssignee(e.target.value)}
                            placeholder="Ej: Alex Flores (Desarrollador Frontend)"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Descripción / Detalles Técnicos
                        </label>
                        <textarea
                            rows={3}
                            value={formDescription}
                            onChange={e => setFormDescription(e.target.value)}
                            placeholder="Detalles sobre la implementación técnica, archivos a modificar o requisitos..."
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn btn-secondary text-xs"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn btn-primary text-xs flex items-center gap-2"
                        >
                            {isSaving ? 'Guardando...' : (editingTask ? 'Actualizar Tarea' : 'Crear Tarea')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL: TASK DETAIL VIEW */}
            <Modal
                isOpen={!!detailTask}
                onClose={() => setDetailTask(null)}
                title={detailTask ? `Detalle de Tarea: ${detailTask.taskCode}` : ''}
                maxWidth="max-w-lg"
            >
                {detailTask && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-1 rounded border border-primary-200 dark:border-primary-900">
                                {detailTask.taskCode}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                Estado: {detailTask.status}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                                {detailTask.title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 whitespace-pre-wrap">
                                {detailTask.description || 'Sin descripción detallada.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
                                <span className="text-slate-400 block text-[11px] mb-0.5">Responsable:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {detailTask.assignee || 'Sin asignar'}
                                </span>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
                                <span className="text-slate-400 block text-[11px] mb-0.5">Esfuerzo Estimado:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {detailTask.estimatedHours} horas
                                </span>
                            </div>
                        </div>

                        {detailTask.userStoryTitle && (
                            <div className="bg-primary-50/50 dark:bg-primary-950/30 p-2.5 rounded-lg border border-primary-100 dark:border-primary-900/50 text-xs">
                                <span className="text-primary-600 dark:text-primary-400 block text-[11px] font-semibold mb-0.5">
                                    Historia de Usuario Asociada:
                                </span>
                                <span className="text-slate-700 dark:text-slate-300">
                                    {detailTask.userStoryTitle}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => {
                                    const t = detailTask
                                    setDetailTask(null)
                                    handleDeleteTask(t.id)
                                }}
                                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5"
                            >
                                <Trash2 size={14} /> Eliminar Tarea
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const t = detailTask
                                        setDetailTask(null)
                                        handleOpenEditModal(t)
                                    }}
                                    className="btn btn-secondary text-xs flex items-center gap-1.5"
                                >
                                    <Edit3 size={14} /> Editar
                                </button>
                                <button
                                    onClick={() => setDetailTask(null)}
                                    className="btn btn-primary text-xs"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
