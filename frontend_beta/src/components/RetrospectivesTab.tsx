import { useState, useEffect, type FormEvent } from 'react'
import { retrospectivesApi, sprintsApi } from '../api'
import { useToast } from '../App'
import Modal from './Modal'
import {
    Smile, Frown, Lightbulb, Plus,
    Trash2, Edit3, Save, Layers, ChevronDown,
    Clock, User, RefreshCw, CheckSquare
} from 'lucide-react'

interface RetrospectivesTabProps {
    activePlanId: string
    onOpenAiAssistant?: () => void
}

interface SprintItem {
    id: string
    name: string
    goal: string
    status: string
}

interface ActionItem {
    id: string
    description: string
    assignee: string
    status: string // 'Pendiente' | 'En progreso' | 'Completado'
}

interface RetrospectiveData {
    id?: string
    sprintId: string
    whatWentWell: string
    whatWentWrong: string
    whatCanBeImproved: string
    actionItems: ActionItem[]
    createdAt?: string
    updatedAt?: string | null
}

const ACTION_STATUSES = ['Pendiente', 'En progreso', 'Completado']

export default function RetrospectivesTab({ activePlanId }: RetrospectivesTabProps) {
    const { addToast } = useToast()

    // Sprints list & selection
    const [sprints, setSprints] = useState<SprintItem[]>([])
    const [selectedSprintId, setSelectedSprintId] = useState<string>('')

    // Retrospective content state
    const [whatWentWell, setWhatWentWell] = useState('')
    const [whatWentWrong, setWhatWentWrong] = useState('')
    const [whatCanBeImproved, setWhatCanBeImproved] = useState('')
    const [actionItems, setActionItems] = useState<ActionItem[]>([])
    const [updatedAt, setUpdatedAt] = useState<string | null>(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Action item creation form inside modal or inline
    const [isActionModalOpen, setIsActionModalOpen] = useState(false)
    const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null)
    const [actionDescription, setActionDescription] = useState('')
    const [actionAssignee, setActionAssignee] = useState('')
    const [actionStatus, setActionStatus] = useState('Pendiente')

    // Load Sprints
    useEffect(() => {
        if (!activePlanId) return
        loadSprints()
    }, [activePlanId])

    // Load Retrospective for Selected Sprint
    useEffect(() => {
        if (selectedSprintId) {
            loadRetrospective(selectedSprintId)
        } else {
            resetForm()
        }
    }, [selectedSprintId])

    const resetForm = () => {
        setWhatWentWell('')
        setWhatWentWrong('')
        setWhatCanBeImproved('')
        setActionItems([])
        setUpdatedAt(null)
    }

    const loadSprints = async () => {
        setLoading(true)
        try {
            const res = await sprintsApi.getByPlan(activePlanId)
            const list: SprintItem[] = res.data || []
            setSprints(list)
            if (list.length > 0) {
                // Prefer latest completed or in-progress sprint
                const candidate = list.find(s => s.status === 'Terminado' || s.status === 'En progreso') || list[0]
                setSelectedSprintId(candidate.id)
            } else {
                setSelectedSprintId('')
            }
        } catch (err: any) {
            console.error('Error cargando sprints para retrospectivas:', err)
            addToast('Error al cargar la lista de Sprints', 'error')
        } finally {
            setLoading(false)
        }
    }

    const loadRetrospective = async (sprintId: string) => {
        setLoading(true)
        try {
            const res = await retrospectivesApi.getBySprint(sprintId)
            if (res.data) {
                const data: RetrospectiveData = res.data
                setWhatWentWell(data.whatWentWell || '')
                setWhatWentWrong(data.whatWentWrong || '')
                setWhatCanBeImproved(data.whatCanBeImproved || '')
                setActionItems(data.actionItems || [])
                setUpdatedAt(data.updatedAt || null)
            } else {
                resetForm()
            }
        } catch (err: any) {
            console.error('Error cargando retrospectiva:', err)
            resetForm()
        } finally {
            setLoading(false)
        }
    }

    // Save Retrospective
    const handleSaveRetrospective = async () => {
        if (!selectedSprintId) {
            addToast('Debe seleccionar un Sprint', 'error')
            return
        }

        setSaving(true)
        try {
            const payload = {
                sprintId: selectedSprintId,
                whatWentWell: whatWentWell.trim(),
                whatWentWrong: whatWentWrong.trim(),
                whatCanBeImproved: whatCanBeImproved.trim(),
                actionItems: actionItems
            }
            const res = await retrospectivesApi.save(payload)
            if (res.data) {
                setUpdatedAt(res.data.updatedAt)
            }
            addToast('¡Retrospectiva del Sprint guardada exitosamente!', 'success')
        } catch (err: any) {
            console.error('Error guardando retrospectiva:', err)
            addToast('Error al guardar la retrospectiva en la base de datos', 'error')
        } finally {
            setSaving(false)
        }
    }

    // Action Items handlers
    const handleOpenAddAction = () => {
        setEditingActionIndex(null)
        setActionDescription('')
        setActionAssignee('')
        setActionStatus('Pendiente')
        setIsActionModalOpen(true)
    }

    const handleOpenEditAction = (index: number) => {
        const item = actionItems[index]
        setEditingActionIndex(index)
        setActionDescription(item.description)
        setActionAssignee(item.assignee)
        setActionStatus(item.status)
        setIsActionModalOpen(true)
    }

    const handleSaveActionModal = (e: FormEvent) => {
        e.preventDefault()
        if (!actionDescription.trim()) {
            addToast('La descripción del ítem de acción es obligatoria', 'error')
            return
        }

        const item: ActionItem = {
            id: editingActionIndex !== null ? actionItems[editingActionIndex].id : `act-${Date.now()}`,
            description: actionDescription.trim(),
            assignee: actionAssignee.trim() || 'Sin asignar',
            status: actionStatus
        }

        if (editingActionIndex !== null) {
            const updated = [...actionItems]
            updated[editingActionIndex] = item
            setActionItems(updated)
            addToast('Acción actualizada (recuerde Guardar Retrospectiva)', 'success')
        } else {
            setActionItems(prev => [...prev, item])
            addToast('Acción añadida a la lista', 'success')
        }
        setIsActionModalOpen(false)
    }

    const handleDeleteAction = (index: number) => {
        setActionItems(prev => prev.filter((_, i) => i !== index))
        addToast('Acción eliminada de la lista', 'success')
    }

    const handleToggleActionStatus = (index: number, newStatus: string) => {
        const updated = [...actionItems]
        updated[index] = { ...updated[index], status: newStatus }
        setActionItems(updated)
    }

    const selectedSprint = sprints.find(s => s.id === selectedSprintId)

    return (
        <div className="space-y-6">
            {/* Top Bar: Sprint Selection & Save Action */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Layers className="text-primary-600 dark:text-primary-400" size={20} />
                        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Sprint a Evaluar:</span>
                    </div>

                    {sprints.length === 0 ? (
                        <span className="text-sm text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900">
                            No hay Sprints disponibles.
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

                    {updatedAt && (
                        <span className="text-xs text-slate-400 flex items-center gap-1.5">
                            <Clock size={12} />
                            Última actualización: {new Date(updatedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => selectedSprintId && loadRetrospective(selectedSprintId)}
                        disabled={loading || !selectedSprintId}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                        title="Recargar datos"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={handleSaveRetrospective}
                        disabled={saving || !selectedSprintId}
                        className="btn btn-primary flex items-center gap-2 text-sm shadow-sm"
                    >
                        <Save size={16} />
                        {saving ? 'Guardando...' : 'Guardar Retrospectiva'}
                    </button>
                </div>
            </div>

            {/* Empty Sprint check */}
            {!selectedSprintId ? (
                <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center">
                    <Layers className="mx-auto text-slate-400 mb-3" size={40} />
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        Seleccione un Sprint para gestionar su Retrospectiva
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Las retrospectivas permiten reflexionar en equipo sobre el trabajo realizado, identificar cuellos de botella y definir acciones concretas de mejora para el siguiente ciclo.
                    </p>
                </div>
            ) : loading ? (
                <div className="py-20 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
                    <p className="text-sm">Cargando retrospectiva...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Sprint Header Badge */}
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <span className="text-xs uppercase tracking-wider font-bold text-primary-600 dark:text-primary-400">
                                Retrospectiva Ágil
                            </span>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {selectedSprint?.name}
                            </h2>
                            {selectedSprint?.goal && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Objetivo: {selectedSprint.goal}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 3 Reflection Quadrants */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* 1. ¿Qué funcionó bien? */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-950/80 p-5 shadow-sm flex flex-col">
                            <div className="flex items-center gap-2.5 mb-3 text-emerald-700 dark:text-emerald-400">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg">
                                    <Smile size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider">
                                        ¿Qué funcionó bien?
                                    </h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Aspectos positivos y fortalezas</p>
                                </div>
                            </div>

                            <textarea
                                rows={7}
                                value={whatWentWell}
                                onChange={e => setWhatWentWell(e.target.value)}
                                placeholder="Ejemplo: La comunicación durante las pruebas con usuarios fue fluida. Se redujo el tiempo de la tarea de pago gracias a las correcciones de diseño..."
                                className="w-full flex-1 p-3 bg-emerald-50/20 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 resize-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>

                        {/* 2. ¿Qué problemas se presentaron? */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-950/80 p-5 shadow-sm flex flex-col">
                            <div className="flex items-center gap-2.5 mb-3 text-rose-700 dark:text-rose-400">
                                <div className="p-2 bg-rose-50 dark:bg-rose-950/60 rounded-lg">
                                    <Frown size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider">
                                        ¿Qué problemas se presentaron?
                                    </h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Dificultades y cuellos de botella</p>
                                </div>
                            </div>

                            <textarea
                                rows={7}
                                value={whatWentWrong}
                                onChange={e => setWhatWentWrong(e.target.value)}
                                placeholder="Ejemplo: Algunos hallazgos críticos de usabilidad no tenían suficiente detalle de reproducción. Faltaron pruebas de contraste de color antes del despliegue..."
                                className="w-full flex-1 p-3 bg-rose-50/20 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 resize-none focus:ring-1 focus:ring-rose-500"
                            />
                        </div>

                        {/* 3. ¿Qué aspectos se pueden mejorar? */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-950/80 p-5 shadow-sm flex flex-col">
                            <div className="flex items-center gap-2.5 mb-3 text-amber-700 dark:text-amber-400">
                                <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-lg">
                                    <Lightbulb size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider">
                                        ¿Qué se puede mejorar?
                                    </h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Oportunidades para el equipo</p>
                                </div>
                            </div>

                            <textarea
                                rows={7}
                                value={whatCanBeImproved}
                                onChange={e => setWhatCanBeImproved(e.target.value)}
                                placeholder="Ejemplo: Implementar checklist de accesibilidad WCAG en cada historia de usuario. Automatizar validaciones de formularios..."
                                className="w-full flex-1 p-3 bg-amber-50/20 dark:bg-slate-800 border border-amber-100 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 resize-none focus:ring-1 focus:ring-amber-500"
                            />
                        </div>
                    </div>

                    {/* ACTION ITEMS FOR NEXT SPRINT */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <CheckSquare size={18} className="text-primary-600 dark:text-primary-400" />
                                    Acciones de Mejora para el Siguiente Sprint
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Compromisos concretos asignados a integrantes del equipo para resolver las dificultades identificadas.
                                </p>
                            </div>

                            <button
                                onClick={handleOpenAddAction}
                                className="btn btn-secondary text-xs flex items-center gap-2 self-start sm:self-auto"
                            >
                                <Plus size={15} />
                                Nueva Acción
                            </button>
                        </div>

                        {/* Action items list */}
                        <div className="mt-4 space-y-3">
                            {actionItems.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                                    <CheckSquare className="mx-auto mb-2 opacity-50" size={32} />
                                    <p className="text-xs">No hay acciones de mejora registradas aún para este Sprint.</p>
                                    <button
                                        onClick={handleOpenAddAction}
                                        className="mt-2 text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                                    >
                                        + Agregar la primera acción
                                    </button>
                                </div>
                            ) : (
                                actionItems.map((item, index) => (
                                    <div
                                        key={item.id || index}
                                        className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3"
                                    >
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
                                                    {item.description}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                                                        <User size={12} className="text-slate-400" />
                                                        {item.assignee || 'Sin asignar'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 self-end md:self-auto">
                                            {/* Status Selector */}
                                            <select
                                                value={item.status}
                                                onChange={e => handleToggleActionStatus(index, e.target.value)}
                                                className={`px-2.5 py-1 rounded-md text-xs font-semibold border focus:outline-none ${
                                                    item.status === 'Completado'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                                        : item.status === 'En progreso'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                                        : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                }`}
                                            >
                                                {ACTION_STATUSES.map(st => (
                                                    <option key={st} value={st}>{st}</option>
                                                ))}
                                            </select>

                                            <button
                                                onClick={() => handleOpenEditAction(index)}
                                                className="p-1.5 text-slate-400 hover:text-primary-600 rounded"
                                                title="Editar acción"
                                            >
                                                <Edit3 size={14} />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteAction(index)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                                                title="Eliminar acción"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: ADD / EDIT ACTION ITEM */}
            <Modal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                title={editingActionIndex !== null ? 'Editar Acción de Mejora' : 'Nueva Acción de Mejora'}
                maxWidth="max-w-lg"
            >
                <form onSubmit={handleSaveActionModal} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Descripción de la Acción *
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={actionDescription}
                            onChange={e => setActionDescription(e.target.value)}
                            placeholder="Describa la acción de mejora que se implementará en el siguiente ciclo..."
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Responsable
                            </label>
                            <input
                                type="text"
                                value={actionAssignee}
                                onChange={e => setActionAssignee(e.target.value)}
                                placeholder="Nombre del integrante"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Estado Inicial
                            </label>
                            <select
                                value={actionStatus}
                                onChange={e => setActionStatus(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                            >
                                {ACTION_STATUSES.map(st => (
                                    <option key={st} value={st}>{st}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsActionModalOpen(false)}
                            className="btn btn-secondary text-xs"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary text-xs"
                        >
                            {editingActionIndex !== null ? 'Guardar Cambios' : 'Añadir Acción'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
