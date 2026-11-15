import { useState, useEffect } from 'react'
import { sprintsApi, productBacklogApi } from '../api'
import { useToast } from '../App'
import Modal from './Modal'
import {
    CalendarRange, Plus, Edit3, Trash2, Layers
} from 'lucide-react'

interface SprintsTabProps {
    activePlanId: string
    onSprintSelected?: (sprintId: string) => void
    onOpenAiAssistant?: () => void
}

export default function SprintsTab({ activePlanId, onSprintSelected }: SprintsTabProps) {
    const { addToast } = useToast()
    const [sprints, setSprints] = useState<any[]>([])
    const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Create / Edit Sprint Modal
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingSprint, setEditingSprint] = useState<any | null>(null)
    const [name, setName] = useState('')
    const [goal, setGoal] = useState('')
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0])
    const [status, setStatus] = useState('Planificado')
    const [isSaving, setIsSaving] = useState(false)

    // Add Stories from Backlog Modal
    const [isAddStoriesOpen, setIsAddStoriesOpen] = useState(false)
    const [backlogStories, setBacklogStories] = useState<any[]>([])
    const [selectedStoryToAssign, setSelectedStoryToAssign] = useState<string>('')
    const [assigning, setAssigning] = useState(false)

    // Delete Sprint Modal
    const [sprintToDelete, setSprintToDelete] = useState<any | null>(null)

    const fetchSprints = async () => {
        if (!activePlanId) return
        setLoading(true)
        try {
            const res = await sprintsApi.getByPlan(activePlanId)
            const list = res.data || []
            setSprints(list)
            if (list.length > 0 && !selectedSprintId) {
                // Select active sprint or first sprint by default
                const active = list.find((s: any) => s.status === 'Activo') || list[0]
                setSelectedSprintId(active.id)
                if (onSprintSelected) onSprintSelected(active.id)
            }
        } catch {
            addToast('Error al cargar la lista de Sprints', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSprints()
    }, [activePlanId])

    const currentSprint = sprints.find(s => s.id === selectedSprintId) || sprints[0]

    const openCreateModal = () => {
        setEditingSprint(null)
        setName(`Sprint ${(sprints.length + 1)} - Optimización de Usabilidad`)
        setGoal('Resolver problemas prioritarios de accesibilidad, flujo e interacción identificados.')
        setStartDate(new Date().toISOString().split('T')[0])
        setEndDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0])
        setStatus('Planificado')
        setIsFormOpen(true)
    }

    const openEditModal = (sprint: any) => {
        setEditingSprint(sprint)
        setName(sprint.name)
        setGoal(sprint.goal)
        setStartDate(sprint.startDate ? sprint.startDate.split('T')[0] : '')
        setEndDate(sprint.endDate ? sprint.endDate.split('T')[0] : '')
        setStatus(sprint.status || 'Planificado')
        setIsFormOpen(true)
    }

    const handleSaveSprint = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            addToast('El nombre del sprint es obligatorio', 'error')
            return
        }

        setIsSaving(true)
        try {
            if (editingSprint) {
                await sprintsApi.update(editingSprint.id, {
                    name,
                    goal,
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDate).toISOString(),
                    status
                })
                addToast('Sprint actualizado con éxito', 'success')
            } else {
                const created = await sprintsApi.create({
                    testPlanId: activePlanId,
                    name,
                    goal,
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDate).toISOString(),
                    status
                })
                addToast('Sprint creado con éxito', 'success')
                setSelectedSprintId(created.data.id)
            }
            setIsFormOpen(false)
            fetchSprints()
        } catch (err: any) {
            addToast(err.response?.data || err.message || 'Error al guardar el sprint', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteSprint = async () => {
        if (!sprintToDelete) return
        try {
            await sprintsApi.delete(sprintToDelete.id)
            addToast('Sprint eliminado. Sus historias retornaron al Backlog.', 'success')
            setSprintToDelete(null)
            setSelectedSprintId(null)
            fetchSprints()
        } catch {
            addToast('Error al eliminar el sprint', 'error')
        }
    }

    const openAddStoriesModal = async () => {
        if (!activePlanId || !selectedSprintId) return
        try {
            const res = await productBacklogApi.getByPlan(activePlanId, { status: 'Backlog' })
            setBacklogStories(res.data || [])
            if (res.data && res.data.length > 0) {
                setSelectedStoryToAssign(res.data[0].id)
            }
            setIsAddStoriesOpen(true)
        } catch {
            addToast('Error al cargar historias del backlog', 'error')
        }
    }

    const handleAssignStory = async () => {
        if (!selectedSprintId || !selectedStoryToAssign) return
        setAssigning(true)
        try {
            await sprintsApi.assignStory(selectedSprintId, selectedStoryToAssign)
            addToast('Historia incorporada al Sprint con éxito', 'success')
            setIsAddStoriesOpen(false)
            fetchSprints()
        } catch {
            addToast('Error al incorporar la historia', 'error')
        } finally {
            setAssigning(false)
        }
    }

    const handleRemoveStory = async (storyId: string) => {
        try {
            await sprintsApi.removeStory(storyId)
            addToast('Historia removida del sprint y devuelta al Backlog', 'success')
            fetchSprints()
        } catch {
            addToast('Error al remover historia', 'error')
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Header and Sprint Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CalendarRange size={20} style={{ color: 'var(--color-primary)' }} />
                        Gestión de Sprints y Ciclos de Mejora
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        Administra sprints, define metas de usabilidad e incorpora historias del Product Backlog.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                        onClick={openCreateModal}
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        <Plus size={16} /> Crear Sprint
                    </button>
                </div>
            </div>

            {/* Sprints Navigation Bar */}
            {sprints.length > 0 && (
                <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-color)' }}>
                    {sprints.map(s => {
                        const isSelected = s.id === currentSprint?.id
                        const isActivo = s.status === 'Activo'
                        const isCompleted = s.status === 'Completado'
                        return (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setSelectedSprintId(s.id)
                                    if (onSprintSelected) onSprintSelected(s.id)
                                }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 14px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: isSelected ? 'var(--color-primary)' : 'var(--surface-card)',
                                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                                    border: isSelected ? 'none' : '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: isSelected ? 700 : 500,
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: isActivo ? '#10b981' : isCompleted ? '#3b82f6' : '#f59e0b'
                                }} />
                                {s.name}
                                <span style={{
                                    fontSize: 10,
                                    padding: '2px 6px',
                                    borderRadius: 999,
                                    background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--surface-sunken)',
                                    color: isSelected ? '#fff' : 'var(--text-secondary)'
                                }}>
                                    {s.status}
                                </span>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Current Sprint Overview Card */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <div className="sprint-loading-spinner" style={{ width: 36, height: 36, margin: '0 auto' }} />
                </div>
            ) : !currentSprint ? (
                <div className="empty-state-card" style={{ padding: 'var(--space-10) var(--space-4)' }}>
                    <CalendarRange size={40} className="empty-state-icon" />
                    <h4 className="empty-state-title">No hay ningún Sprint registrado</h4>
                    <p className="empty-state-subtitle" style={{ maxWidth: 440, margin: '0 auto var(--space-4) auto' }}>
                        Crea tu primer Sprint para planificar las tareas de desarrollo e incorporar las historias del Product Backlog.
                    </p>
                    <button onClick={openCreateModal} className="btn btn-primary" style={{ fontSize: 13 }}>
                        <Plus size={14} /> Crear Primer Sprint
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {/* Sprint Header details */}
                    <div style={{ padding: 'var(--space-5)', background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{currentSprint.name}</h3>
                                    <span style={{
                                        fontSize: 11,
                                        padding: '3px 10px',
                                        borderRadius: 999,
                                        background: currentSprint.status === 'Activo' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                        color: currentSprint.status === 'Activo' ? '#10b981' : '#3b82f6',
                                        fontWeight: 700
                                    }}>
                                        {currentSprint.status}
                                    </span>
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0 0 0', fontStyle: 'italic' }}>
                                    "{currentSprint.goal || 'Sin meta definida'}"
                                </p>
                                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                                    <span>📅 <strong>Inicio:</strong> {new Date(currentSprint.startDate).toLocaleDateString()}</span>
                                    <span>🏁 <strong>Fin:</strong> {new Date(currentSprint.endDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                    onClick={() => openEditModal(currentSprint)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                >
                                    <Edit3 size={13} /> Editar Sprint
                                </button>
                                <button
                                    onClick={() => setSprintToDelete(currentSprint)}
                                    className="btn btn-danger"
                                    style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                >
                                    <Trash2 size={13} /> Eliminar
                                </button>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                                <span>
                                    <strong>Progreso del Sprint:</strong> {currentSprint.completedTasksCount || 0} de {currentSprint.totalTasksCount || 0} tareas terminadas
                                </span>
                                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                                    {currentSprint.progressPercentage || 0}% ({currentSprint.completedHours || 0}h / {currentSprint.totalEstimatedHours || 0}h)
                                </span>
                            </div>
                            <div style={{ height: 8, background: 'var(--surface-sunken)', borderRadius: 999, overflow: 'hidden' }}>
                                <div
                                    style={{
                                        height: '100%',
                                        width: `${currentSprint.progressPercentage || 0}%`,
                                        background: 'linear-gradient(90deg, var(--color-primary), #10b981)',
                                        borderRadius: 999,
                                        transition: 'width 0.3s'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stories in this Sprint */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Layers size={16} style={{ color: 'var(--color-primary)' }} />
                            Historias de Usuario Asignadas al Sprint ({currentSprint.userStories?.length || 0})
                        </h4>
                        <button
                            onClick={openAddStoriesModal}
                            className="btn btn-secondary"
                            style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                            <Plus size={14} /> Incorporar Historia del Backlog
                        </button>
                    </div>

                    {(!currentSprint.userStories || currentSprint.userStories.length === 0) ? (
                        <div className="empty-state-card" style={{ padding: 'var(--space-6) var(--space-4)' }}>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                                Este Sprint no tiene historias de usuario asignadas todavía. Incorpora historias desde el Product Backlog.
                            </p>
                            <button onClick={openAddStoriesModal} className="btn btn-primary" style={{ marginTop: 10, fontSize: 12 }}>
                                <Plus size={13} /> Incorporar Historias Ahora
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {currentSprint.userStories.map((story: any) => (
                                <div
                                    key={story.id}
                                    style={{
                                        padding: 'var(--space-4)',
                                        background: 'var(--surface-card)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: 'var(--surface-sunken)', color: 'var(--color-primary)' }}>
                                                {story.storyCode}
                                            </span>
                                            <h5 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{story.title}</h5>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--surface-sunken)', fontWeight: 600 }}>
                                                {story.effortEstimation} pts
                                            </span>
                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: story.priority === 'Alta' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: story.priority === 'Alta' ? '#ef4444' : '#3b82f6', fontWeight: 700 }}>
                                                {story.priority}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveStory(story.id)}
                                                className="btn btn-secondary"
                                                style={{ fontSize: 11, padding: '3px 8px', height: 'auto', minHeight: 'unset', color: 'var(--color-error)' }}
                                                title="Remover del Sprint y regresar al Product Backlog"
                                            >
                                                Remover del Sprint
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                                        {story.description}
                                    </p>
                                    {story.origin && (
                                        <span style={{ fontSize: 11, color: 'var(--neutral-500)' }}>
                                            🔍 Origen: {story.origin}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create / Edit Sprint Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingSprint ? `Editar ${editingSprint.name}` : 'Crear Nuevo Sprint'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSaveSprint} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div>
                        <label className="form-label">Nombre del Sprint <span style={{ color: 'var(--color-error)' }}>*</span></label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ej: Sprint 1 - Optimización de Usabilidad e IHC"
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">Objetivo del Sprint (Sprint Goal)</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            placeholder="Meta concreta que alcanzará el equipo al completar este sprint..."
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                        <div>
                            <label className="form-label">Fecha de Inicio <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <input
                                type="date"
                                className="form-input"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Fecha de Finalización <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <input
                                type="date"
                                className="form-input"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Estado del Sprint</label>
                        <select
                            className="form-input"
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="Planificado">Planificado</option>
                            <option value="Activo">Activo</option>
                            <option value="Completado">Completado</option>
                        </select>
                    </div>

                    <div className="form-actions" style={{ marginTop: 'var(--space-3)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : (editingSprint ? 'Guardar Cambios' : 'Crear Sprint')}
                        </button>
                        <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary" disabled={isSaving}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Incorporate Stories from Backlog Modal */}
            <Modal
                isOpen={isAddStoriesOpen}
                onClose={() => setIsAddStoriesOpen(false)}
                title="Incorporar Historia del Product Backlog al Sprint"
                maxWidth="max-w-2xl"
            >
                {backlogStories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                            No hay historias disponibles en el Product Backlog con estado "En Backlog". Crea nuevas historias primero.
                        </p>
                        <button onClick={() => setIsAddStoriesOpen(false)} className="btn btn-secondary" style={{ marginTop: 10 }}>
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                            Selecciona la historia de usuario que deseas incorporar a <strong>{currentSprint?.name}</strong>:
                        </p>
                        <select
                            className="form-input"
                            value={selectedStoryToAssign}
                            onChange={e => setSelectedStoryToAssign(e.target.value)}
                        >
                            {backlogStories.map((story: any) => (
                                <option key={story.id} value={story.id}>
                                    [{story.storyCode}] {story.title} ({story.effortEstimation} pts - Prioridad: {story.priority})
                                </option>
                            ))}
                        </select>

                        <div className="form-actions" style={{ marginTop: 'var(--space-4)' }}>
                            <button
                                onClick={handleAssignStory}
                                disabled={assigning || !selectedStoryToAssign}
                                className="btn btn-primary"
                            >
                                {assigning ? 'Incorporando...' : 'Incorporar al Sprint'}
                            </button>
                            <button
                                onClick={() => setIsAddStoriesOpen(false)}
                                className="btn btn-secondary"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Sprint Modal */}
            {sprintToDelete && (
                <Modal
                    isOpen={true}
                    onClose={() => setSprintToDelete(null)}
                    title="Confirmar Eliminación de Sprint"
                    maxWidth="max-w-md"
                >
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        ¿Estás seguro de que deseas eliminar <strong>{sprintToDelete.name}</strong>? Las historias asociadas se conservarán y volverán automáticamente al Product Backlog.
                    </p>
                    <div className="form-actions" style={{ marginTop: 'var(--space-4)' }}>
                        <button onClick={handleDeleteSprint} className="btn btn-danger">
                            Eliminar Sprint
                        </button>
                        <button onClick={() => setSprintToDelete(null)} className="btn btn-secondary">
                            Cancelar
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    )
}
