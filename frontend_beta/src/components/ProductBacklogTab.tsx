import { useState, useEffect } from 'react'
import { productBacklogApi } from '../api'
import { useToast } from '../App'
import Modal from './Modal'
import {
    Plus, Search, ArrowUpDown, Trash2, Edit3,
    Sparkles, Layers, Eye
} from 'lucide-react'

interface ProductBacklogTabProps {
    activePlanId: string
    onOpenAiAssistant: () => void
}

export default function ProductBacklogTab({ activePlanId, onOpenAiAssistant }: ProductBacklogTabProps) {
    const { addToast } = useToast()
    const [stories, setStories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Search, Filter & Sort state
    const [searchQuery, setSearchQuery] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('All')
    const [statusFilter, setStatusFilter] = useState('All')
    const [sortBy, setSortBy] = useState('created')

    // Modal state for Create / Edit Story
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingStory, setEditingStory] = useState<any | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Form inputs
    const [storyCode, setStoryCode] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('Media')
    const [effortEstimation, setEffortEstimation] = useState(3)
    const [origin, setOrigin] = useState('')
    const [status, setStatus] = useState('Backlog')
    const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>([])
    const [newCriterion, setNewCriterion] = useState('')

    // Traceability Modal
    const [traceabilityStory, setTraceabilityStory] = useState<any | null>(null)

    // Delete Confirmation
    const [storyToDelete, setStoryToDelete] = useState<any | null>(null)

    const fetchStories = async () => {
        if (!activePlanId) return
        setLoading(true)
        try {
            const res = await productBacklogApi.getByPlan(activePlanId, {
                search: searchQuery || undefined,
                priority: priorityFilter !== 'All' ? priorityFilter : undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                sortBy
            })
            setStories(res.data || [])
        } catch (err: any) {
            addToast('Error al cargar el Product Backlog', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStories()
    }, [activePlanId, searchQuery, priorityFilter, statusFilter, sortBy])

    const openCreateModal = () => {
        setEditingStory(null)
        setStoryCode(`US-${(stories.length + 1).toString().padStart(2, '0')}`)
        setTitle('')
        setDescription('Como [rol de usuario], quiero [funcionalidad de mejora], para [beneficio].')
        setPriority('Media')
        setEffortEstimation(3)
        setOrigin('')
        setStatus('Backlog')
        setAcceptanceCriteria([
            'El sistema debe validar correctamente la entrada del usuario.',
            'La interfaz debe proporcionar retroalimentación clara e inmediata.'
        ])
        setNewCriterion('')
        setIsFormOpen(true)
    }

    const openEditModal = (story: any) => {
        setEditingStory(story)
        setStoryCode(story.storyCode)
        setTitle(story.title)
        setDescription(story.description)
        setPriority(story.priority)
        setEffortEstimation(story.effortEstimation)
        setOrigin(story.origin || '')
        setStatus(story.status || 'Backlog')
        setAcceptanceCriteria(Array.isArray(story.acceptanceCriteria) ? [...story.acceptanceCriteria] : [])
        setNewCriterion('')
        setIsFormOpen(true)
    }

    const handleSaveStory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !description.trim()) {
            addToast('Título y descripción son obligatorios', 'error')
            return
        }

        setIsSaving(true)
        try {
            if (editingStory) {
                await productBacklogApi.update(editingStory.id, {
                    title,
                    description,
                    priority,
                    effortEstimation: Number(effortEstimation),
                    origin,
                    status,
                    acceptanceCriteria,
                    sprintId: editingStory.sprintId
                })
                addToast('Historia de usuario actualizada', 'success')
            } else {
                await productBacklogApi.create({
                    testPlanId: activePlanId,
                    storyCode,
                    title,
                    description,
                    priority,
                    effortEstimation: Number(effortEstimation),
                    origin,
                    acceptanceCriteria
                })
                addToast('Historia creada en el Product Backlog', 'success')
            }
            setIsFormOpen(false)
            fetchStories()
        } catch (err: any) {
            addToast(err.response?.data || err.message || 'Error al guardar historia', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteStory = async () => {
        if (!storyToDelete) return
        try {
            await productBacklogApi.delete(storyToDelete.id)
            addToast('Historia eliminada del backlog', 'success')
            setStoryToDelete(null)
            fetchStories()
        } catch {
            addToast('Error al eliminar la historia', 'error')
        }
    }

    const addCriterion = () => {
        if (!newCriterion.trim()) return
        setAcceptanceCriteria(prev => [...prev, newCriterion.trim()])
        setNewCriterion('')
    }

    const removeCriterion = (idx: number) => {
        setAcceptanceCriteria(prev => prev.filter((_, i) => i !== idx))
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Layers size={20} style={{ color: 'var(--color-primary)' }} />
                        Product Backlog de Mejoras de Usabilidad
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        Almacena las historias de usuario de las mejoras que se realizarán al sistema evaluado.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                        onClick={onOpenAiAssistant}
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontWeight: 600 }}
                    >
                        <Sparkles size={16} /> Analizar Usabilidad con IA
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        <Plus size={16} /> Crear Historia
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center', background: 'var(--surface-sunken)', padding: '10px 14px', borderRadius: 'var(--radius-lg)' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por código, título, descripción u origen..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: 30, fontSize: 12 }}
                    />
                </div>

                {/* Priority Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Prioridad:</span>
                    <select
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value)}
                        className="form-input"
                        style={{ width: 'auto', fontSize: 12, padding: '4px 8px' }}
                    >
                        <option value="All">Todas</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                    </select>
                </div>

                {/* Status Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Estado:</span>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="form-input"
                        style={{ width: 'auto', fontSize: 12, padding: '4px 8px' }}
                    >
                        <option value="All">Todos</option>
                        <option value="Backlog">En Backlog</option>
                        <option value="InSprint">En Sprint</option>
                        <option value="Done">Terminado</option>
                    </select>
                </div>

                {/* Sort By */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ArrowUpDown size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Ordenar:</span>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="form-input"
                        style={{ width: 'auto', fontSize: 12, padding: '4px 8px' }}
                    >
                        <option value="created">Más recientes</option>
                        <option value="priority">Prioridad (Alta a Baja)</option>
                        <option value="effort">Esfuerzo (Mayor a Menor)</option>
                        <option value="code">Código (US)</option>
                        <option value="title">Título</option>
                    </select>
                </div>
            </div>

            {/* Stories Grid / List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <div className="sprint-loading-spinner" style={{ width: 36, height: 36, margin: '0 auto' }} />
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>Cargando historias del Product Backlog...</p>
                </div>
            ) : stories.length === 0 ? (
                <div className="empty-state-card" style={{ padding: 'var(--space-10) var(--space-4)' }}>
                    <Layers size={40} className="empty-state-icon" />
                    <h4 className="empty-state-title">No hay elementos en el Product Backlog</h4>
                    <p className="empty-state-subtitle" style={{ maxWidth: 440, margin: '0 auto var(--space-4) auto' }}>
                        Crea una nueva historia manualmente o utiliza el Asistente de IA para transformar los hallazgos y observaciones directamente en mejoras.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}>
                        <button onClick={openCreateModal} className="btn btn-primary" style={{ fontSize: 12 }}>
                            <Plus size={14} /> Crear Historia Manual
                        </button>
                        <button onClick={onOpenAiAssistant} className="btn btn-secondary" style={{ fontSize: 12, color: 'var(--color-primary)' }}>
                            <Sparkles size={14} /> Analizar con IA
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {stories.map(story => {
                        const isHigh = story.priority === 'Alta'
                        const isMed = story.priority === 'Media'
                        const prioBg = isHigh ? 'rgba(239, 68, 68, 0.15)' : isMed ? 'rgba(59, 130, 246, 0.15)' : 'rgba(107, 114, 128, 0.15)'
                        const prioColor = isHigh ? '#ef4444' : isMed ? '#3b82f6' : '#6b7280'

                        return (
                            <div
                                key={story.id}
                                style={{
                                    padding: 'var(--space-4)',
                                    background: 'var(--surface-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: 'var(--shadow-sm)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: 'var(--surface-sunken)', color: 'var(--color-primary)' }}>
                                            {story.storyCode}
                                        </span>
                                        <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{story.title}</h4>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: prioBg, color: prioColor, fontWeight: 700 }}>
                                            {story.priority}
                                        </span>
                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--surface-sunken)', fontWeight: 600 }}>
                                            {story.effortEstimation} pts
                                        </span>
                                        <span style={{
                                            fontSize: 11,
                                            padding: '2px 8px',
                                            borderRadius: 999,
                                            background: story.status === 'InSprint' ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface-sunken)',
                                            color: story.status === 'InSprint' ? '#10b981' : 'var(--text-secondary)',
                                            fontWeight: 600
                                        }}>
                                            {story.status === 'InSprint' ? (story.sprintName ? `En ${story.sprintName}` : 'En Sprint') : 'En Backlog'}
                                        </span>
                                        <button
                                            onClick={() => openEditModal(story)}
                                            className="btn btn-secondary"
                                            style={{ padding: '4px 8px', height: 'auto', minHeight: 'unset', fontSize: 11 }}
                                            title="Editar historia"
                                        >
                                            <Edit3 size={12} />
                                        </button>
                                        <button
                                            onClick={() => setStoryToDelete(story)}
                                            className="btn btn-danger"
                                            style={{ padding: '4px 8px', height: 'auto', minHeight: 'unset', fontSize: 11 }}
                                            title="Eliminar historia"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>

                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                    {story.description}
                                </p>

                                {/* Origin and Acceptance Criteria summary */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingTop: 6, borderTop: '1px solid var(--border-color)', fontSize: 12 }}>
                                    {story.origin ? (
                                        <button
                                            onClick={() => setTraceabilityStory(story)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                padding: 0,
                                                fontSize: 11,
                                                color: 'var(--color-primary)',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                            title="Consultar origen y trazabilidad de este elemento"
                                        >
                                            <Eye size={12} /> Origen: {story.origin}
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: 11, color: 'var(--text-disabled)' }}>Sin origen vinculado</span>
                                    )}

                                    {Array.isArray(story.acceptanceCriteria) && story.acceptanceCriteria.length > 0 && (
                                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                            ✓ {story.acceptanceCriteria.length} criterio(s) de aceptación
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal Create / Edit Story */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingStory ? `Editar Historia [${storyCode}]` : 'Crear Elemento en el Product Backlog'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSaveStory} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 'var(--space-3)' }}>
                        <div>
                            <label className="form-label">Código <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <input
                                type="text"
                                className="form-input"
                                value={storyCode}
                                onChange={e => setStoryCode(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Título de la Mejora <span style={{ color: 'var(--color-error)' }}>*</span></label>
                            <input
                                type="text"
                                className="form-input"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ej: Rediseño accesible de campos de formulario..."
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Descripción (Historia de Usuario) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                        <textarea
                            className="form-input"
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Como [rol de usuario], quiero [mejora en el sistema evaluado], para [beneficio]."
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                        <div>
                            <label className="form-label">Prioridad</label>
                            <select
                                className="form-input"
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                            >
                                <option value="Alta">Alta</option>
                                <option value="Media">Media</option>
                                <option value="Baja">Baja</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Estimación (Esfuerzo)</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                className="form-input"
                                value={effortEstimation}
                                onChange={e => setEffortEstimation(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="form-label">Estado</label>
                            <select
                                className="form-input"
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                            >
                                <option value="Backlog">En Backlog</option>
                                <option value="InSprint">En Sprint</option>
                                <option value="Done">Terminado</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Origen de la Mejora (Trazabilidad con Usabilidad)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={origin}
                            onChange={e => setOrigin(e.target.value)}
                            placeholder="Ej: Hallazgo #2 - Falta de etiquetas accesibles o Tarea #1"
                        />
                    </div>

                    {/* Acceptance Criteria */}
                    <div>
                        <label className="form-label">Criterios de Aceptación</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                            {acceptanceCriteria.map((c, i) => (
                                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700 }}>{i + 1}.</span>
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ fontSize: 12 }}
                                        value={c}
                                        onChange={e => {
                                            const updated = [...acceptanceCriteria]
                                            updated[i] = e.target.value
                                            setAcceptanceCriteria(updated)
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeCriterion(i)}
                                        className="btn btn-danger"
                                        style={{ padding: '4px 8px', height: 'auto', minHeight: 'unset' }}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <input
                                type="text"
                                className="form-input"
                                style={{ fontSize: 12 }}
                                placeholder="Escribe un criterio de aceptación..."
                                value={newCriterion}
                                onChange={e => setNewCriterion(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCriterion() } }}
                            />
                            <button
                                type="button"
                                onClick={addCriterion}
                                className="btn btn-secondary"
                                style={{ fontSize: 12 }}
                            >
                                <Plus size={14} /> Añadir
                            </button>
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: 'var(--space-3)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : (editingStory ? 'Guardar Cambios' : 'Crear Historia')}
                        </button>
                        <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary" disabled={isSaving}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Traceability Modal */}
            {traceabilityStory && (
                <Modal
                    isOpen={true}
                    onClose={() => setTraceabilityStory(null)}
                    title={`Trazabilidad de Usabilidad: [${traceabilityStory.storyCode}]`}
                    maxWidth="max-w-2xl"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <div style={{ padding: 'var(--space-3)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: 14 }}>{traceabilityStory.title}</h4>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{traceabilityStory.description}</p>
                        </div>

                        <div style={{ padding: 'var(--space-4)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-lg)', background: 'rgba(99, 102, 241, 0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Eye size={18} style={{ color: 'var(--color-primary)' }} />
                                <strong style={{ fontSize: 13 }}>Origen de Usabilidad e Incidente:</strong>
                            </div>
                            <p style={{ fontSize: 13, margin: '0 0 6px 0', fontWeight: 600 }}>{traceabilityStory.origin}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                                Esta historia de usuario fue incorporada como una acción correctiva de diseño centrado en el usuario (DCU) derivada directamente de las pruebas de usabilidad del módulo.
                            </p>
                        </div>

                        <div>
                            <strong style={{ fontSize: 12 }}>Criterios de Aceptación para resolver el fallo:</strong>
                            <ul style={{ margin: '6px 0 0 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
                                {(traceabilityStory.acceptanceCriteria || []).map((c: string, idx: number) => (
                                    <li key={idx}>{c}</li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                            <button onClick={() => setTraceabilityStory(null)} className="btn btn-secondary">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {storyToDelete && (
                <Modal
                    isOpen={true}
                    onClose={() => setStoryToDelete(null)}
                    title="Confirmar Eliminación"
                    maxWidth="max-w-md"
                >
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        ¿Estás seguro de que deseas eliminar la historia <strong>[{storyToDelete.storyCode}] {storyToDelete.title}</strong>? Esta acción no se puede deshacer.
                    </p>
                    <div className="form-actions" style={{ marginTop: 'var(--space-4)' }}>
                        <button onClick={handleDeleteStory} className="btn btn-danger">
                            Eliminar
                        </button>
                        <button onClick={() => setStoryToDelete(null)} className="btn btn-secondary">
                            Cancelar
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    )
}
