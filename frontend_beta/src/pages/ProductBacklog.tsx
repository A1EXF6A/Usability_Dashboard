import { useState, useEffect, useMemo } from 'react'
import {
    Plus, ArrowUpDown, Filter, Edit2, Trash2,
    AlertCircle, ArrowUp, ArrowDown,
    HelpCircle, Layers, BookmarkCheck, Search
} from 'lucide-react'
import { usePlan } from '../context/PlanContext'
import { useToast } from '../App'
import { scrumApi, findingsApi } from '../api'
import type { Guid } from '../api'
import Modal from '../components/Modal'

interface UserStory {
    id: Guid
    testPlanId: Guid
    code: string
    title: string
    description: string
    module: string
    businessValue: number
    storyPoints: number
    decisionQuotient: number
    priorityOrder: number
    priority: string
    status: string
    acceptanceCriteria: string
    findingId?: Guid
    findingDescription?: string
    sprintId?: Guid
    sprintName?: string
    taskCount: number
}

export default function ProductBacklog() {
    const { activePlanId, activePlan } = usePlan()
    const { addToast } = useToast()

    const [stories, setStories] = useState<UserStory[]>([])
    const [findings, setFindings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filtros
    const [filterModule, setFilterModule] = useState('ALL')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [searchQuery, setSearchQuery] = useState('')

    // Modal Crear/Editar
    const [modalOpen, setModalOpen] = useState(false)
    const [editingStory, setEditingStory] = useState<UserStory | null>(null)
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        role: 'usuario',
        want: '',
        benefit: '',
        module: 'UI',
        businessValue: 8,
        storyPoints: 3,
        priority: 'Alta',
        status: 'Backlog',
        acceptanceCriteria: '',
        findingId: ''
    })

    // Modal Eliminar
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [storyToDelete, setStoryToDelete] = useState<UserStory | null>(null)

    // Cargar historias y hallazgos
    const loadData = async () => {
        if (!activePlanId) return
        setLoading(true)
        try {
            const [storiesRes, findingsRes] = await Promise.all([
                scrumApi.getBacklog(activePlanId),
                findingsApi.getByPlan(activePlanId)
            ])
            setStories(storiesRes.data)
            setFindings(findingsRes.data)
        } catch (err) {
            console.error('Error al cargar backlog:', err)
            addToast('Error al cargar el Product Backlog.', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [activePlanId])

    // Historias filtradas
    const filteredStories = useMemo(() => {
        return stories.filter(s => {
            const matchModule = filterModule === 'ALL' || s.module === filterModule
            const matchStatus = filterStatus === 'ALL' || s.status === filterStatus
            const matchSearch = !searchQuery ||
                s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.description.toLowerCase().includes(searchQuery.toLowerCase())
            return matchModule && matchStatus && matchSearch
        })
    }, [stories, filterModule, filterStatus, searchQuery])

    // Apertura modal nuevo
    const handleOpenCreate = () => {
        setEditingStory(null)
        const nextNum = stories.length + 1
        setFormData({
            code: `HU-${nextNum < 10 ? '0' + nextNum : nextNum}`,
            title: '',
            role: activePlan?.userProfile || 'usuario',
            want: '',
            benefit: '',
            module: 'UI',
            businessValue: 8,
            storyPoints: 3,
            priority: 'Alta',
            status: 'Backlog',
            acceptanceCriteria: '• El usuario completa la acción sin errores.\n• Cumple con WCAG AA.',
            findingId: ''
        })
        setModalOpen(true)
    }

    // Apertura modal editar
    const handleOpenEdit = (story: UserStory) => {
        setEditingStory(story)
        // Intentar descomponer "Como [rol], quiero [want] para [benefit]"
        const match = story.description.match(/^Como (.*?), quiero (.*?) para (.*)$/i)
        setFormData({
            code: story.code,
            title: story.title,
            role: match ? match[1] : (activePlan?.userProfile || 'usuario'),
            want: match ? match[2] : story.description,
            benefit: match ? match[3] : '',
            module: story.module || 'UI',
            businessValue: story.businessValue,
            storyPoints: story.storyPoints,
            priority: story.priority,
            status: story.status,
            acceptanceCriteria: story.acceptanceCriteria || '',
            findingId: story.findingId || ''
        })
        setModalOpen(true)
    }

    // Guardar
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activePlanId) return

        if (!formData.title.trim()) {
            addToast('El título del requisito es obligatorio.', 'error')
            return
        }

        const fullDescription = formData.benefit
            ? `Como ${formData.role}, quiero ${formData.want} para ${formData.benefit}.`
            : formData.want

        try {
            if (editingStory) {
                await scrumApi.updateStory(editingStory.id, {
                    code: formData.code,
                    title: formData.title,
                    description: fullDescription,
                    module: formData.module,
                    businessValue: Number(formData.businessValue),
                    storyPoints: Number(formData.storyPoints),
                    priorityOrder: editingStory.priorityOrder,
                    priority: formData.priority,
                    status: formData.status,
                    acceptanceCriteria: formData.acceptanceCriteria,
                    findingId: formData.findingId ? formData.findingId : null,
                    sprintId: editingStory.sprintId || null
                })
                addToast('Historia de usuario actualizada.', 'success')
            } else {
                await scrumApi.createStory({
                    testPlanId: activePlanId,
                    code: formData.code,
                    title: formData.title,
                    description: fullDescription,
                    module: formData.module,
                    businessValue: Number(formData.businessValue),
                    storyPoints: Number(formData.storyPoints),
                    priorityOrder: stories.length + 1,
                    priority: formData.priority,
                    status: formData.status,
                    acceptanceCriteria: formData.acceptanceCriteria,
                    findingId: formData.findingId ? formData.findingId : null,
                    sprintId: null
                })
                addToast('Historia de usuario agregada al Product Backlog.', 'success')
            }
            setModalOpen(false)
            loadData()
        } catch (err) {
            console.error(err)
            addToast('Error al guardar la historia.', 'error')
        }
    }

    // Eliminar
    const handleDeleteConfirm = async () => {
        if (!storyToDelete) return
        try {
            await scrumApi.deleteStory(storyToDelete.id)
            addToast(`Historia ${storyToDelete.code} eliminada.`, 'success')
            setDeleteModalOpen(false)
            setStoryToDelete(null)
            loadData()
        } catch (err) {
            addToast('Error al eliminar historia.', 'error')
        }
    }

    // Ordenar automáticamente por cociente BV / SP
    const handleSortByQuotient = async () => {
        if (!activePlanId) return
        try {
            const res = await scrumApi.sortByQuotient(activePlanId)
            setStories(res.data)
            addToast('Product Backlog ordenado por cociente de decisión (BV / SP).', 'success')
        } catch (err) {
            addToast('Error al ordenar historias.', 'error')
        }
    }

    // Reordenar manualmente (Subir / Bajar)
    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (!activePlanId) return
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= stories.length) return

        const reordered = [...stories]
        const temp = reordered[index]
        reordered[index] = reordered[targetIndex]
        reordered[targetIndex] = temp

        const storyIds = reordered.map(s => s.id)
        try {
            const res = await scrumApi.reorderStories(activePlanId, storyIds)
            setStories(res.data)
            addToast('Orden actualizado.', 'success')
        } catch (err) {
            addToast('Error al reordenar historias.', 'error')
        }
    }

    // Cargar historias del enunciado (HU-01 a HU-10)
    const handleSeedEnunciado = async () => {
        if (!activePlanId) return
        try {
            await scrumApi.seed(activePlanId)
            addToast('Historias iniciales HU-01 a HU-10 y 4 Sprints cargados correctamente.', 'success')
            loadData()
        } catch (err) {
            addToast('Error al cargar datos iniciales.', 'error')
        }
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Layers className="text-primary" />
                        Product Backlog — Historias de Usuario
                    </h1>
                    <p className="text-secondary" style={{ marginTop: '0.25rem', maxWidth: '750px' }}>
                        Matriz de planificación y priorización ágil con <strong>Business Value (BV)</strong>, <strong>Story Points (SP)</strong> y <strong>Cociente de Decisión (BV / SP)</strong>, vinculada a los hallazgos y observaciones UX.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleSortByQuotient}
                        title="Ordenar automáticamente según el cociente de decisión (BV / SP) descendente"
                    >
                        <ArrowUpDown size={16} />
                        Ordenar por Cociente (BV/SP)
                    </button>
                    {stories.length === 0 && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleSeedEnunciado}
                            title="Cargar las 10 historias HU-01..HU-10 del enunciado con 4 Sprints"
                        >
                            <BookmarkCheck size={16} />
                            Cargar Historias Enunciado (HU-01 a HU-10)
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleOpenCreate}
                    >
                        <Plus size={16} />
                        Nueva Historia de Usuario
                    </button>
                </div>
            </div>

            {/* Insumos & Reglas UX */}
            <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(238, 242, 255, 0.6)', borderColor: '#c7d2fe' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                    <HelpCircle size={20} className="text-primary" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
                        <strong>Criterio de Priorización Ágil (IHC / DCU):</strong> El <em>Cociente de Decisión</em> se calcula mediante la fórmula <code>BV / SP</code>. Aquellas historias que generan alto valor de negocio con menor esfuerzo técnico se sitúan prioritariamente al inicio del backlog para abordarse en los primeros sprints.
                    </div>
                </div>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#6b7280' }} />
                        <input
                            type="text"
                            className="form-control"
                            style={{ paddingLeft: '2.2rem' }}
                            placeholder="Buscar por código (HU-01), título o descripción..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={16} className="text-secondary" />
                        <label htmlFor="filter-module" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Módulo:</label>
                        <select
                            id="filter-module"
                            className="form-control"
                            style={{ width: 'auto' }}
                            value={filterModule}
                            onChange={e => setFilterModule(e.target.value)}
                        >
                            <option value="ALL">Todos los módulos</option>
                            <option value="Eval.">Eval. (Evaluación)</option>
                            <option value="Dash.">Dash. (Dashboard)</option>
                            <option value="IA">IA (Asistente UX)</option>
                            <option value="SCRUM">SCRUM</option>
                            <option value="UI">UI (Interfaz y Accesibilidad)</option>
                            <option value="Búsqueda">Búsqueda</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label htmlFor="filter-status" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Estado:</label>
                        <select
                            id="filter-status"
                            className="form-control"
                            style={{ width: 'auto' }}
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">Todos los estados</option>
                            <option value="Backlog">Backlog (Sin asignar)</option>
                            <option value="Asignada">Asignada a Sprint</option>
                            <option value="EnProgreso">En Progreso</option>
                            <option value="Terminada">Terminada</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla de Historias */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                    <p className="text-secondary">Cargando Product Backlog...</p>
                </div>
            ) : filteredStories.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Layers size={48} className="text-secondary" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3>No se encontraron historias de usuario</h3>
                    <p className="text-secondary" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                        {stories.length === 0
                            ? 'El backlog está vacío. Puedes cargar las 10 historias del enunciado o crear una nueva.'
                            : 'Ninguna historia coincide con los filtros aplicados.'}
                    </p>
                    {stories.length === 0 && (
                        <button type="button" className="btn btn-primary" onClick={handleSeedEnunciado}>
                            <BookmarkCheck size={16} />
                            Cargar Historias del Enunciado (HU-01 a HU-10)
                        </button>
                    )}
                </div>
            ) : (
                <div className="table-responsive card" style={{ padding: 0 }}>
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ width: '60px', padding: '0.8rem', textAlign: 'center' }}>Orden</th>
                                <th style={{ width: '90px', padding: '0.8rem' }}>Código</th>
                                <th style={{ padding: '0.8rem' }}>Requisito / Historia de Usuario</th>
                                <th style={{ width: '90px', padding: '0.8rem' }}>Módulo</th>
                                <th style={{ width: '70px', padding: '0.8rem', textAlign: 'center' }} title="Business Value (Valor de Negocio)">BV</th>
                                <th style={{ width: '70px', padding: '0.8rem', textAlign: 'center' }} title="Story Points (Esfuerzo estimado)">SP</th>
                                <th style={{ width: '100px', padding: '0.8rem', textAlign: 'center' }} title="Cociente de Decisión = BV / SP">Cociente</th>
                                <th style={{ width: '110px', padding: '0.8rem' }}>Estado</th>
                                <th style={{ width: '120px', padding: '0.8rem' }}>Sprint</th>
                                <th style={{ width: '100px', padding: '0.8rem', textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStories.map((story, index) => {
                                const isFirst = index === 0
                                const isLast = index === filteredStories.length - 1

                                return (
                                    <tr key={story.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        {/* Orden y controles de mover */}
                                        <td style={{ textAlign: 'center', padding: '0.6rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                <button
                                                    type="button"
                                                    disabled={isFirst}
                                                    onClick={() => handleMove(index, 'up')}
                                                    style={{ border: 'none', background: 'none', cursor: isFirst ? 'not-allowed' : 'pointer', opacity: isFirst ? 0.3 : 1, padding: '1px' }}
                                                    title="Mover arriba"
                                                    aria-label={`Subir historia ${story.code}`}
                                                >
                                                    <ArrowUp size={13} />
                                                </button>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{story.priorityOrder}</span>
                                                <button
                                                    type="button"
                                                    disabled={isLast}
                                                    onClick={() => handleMove(index, 'down')}
                                                    style={{ border: 'none', background: 'none', cursor: isLast ? 'not-allowed' : 'pointer', opacity: isLast ? 0.3 : 1, padding: '1px' }}
                                                    title="Mover abajo"
                                                    aria-label={`Bajar historia ${story.code}`}
                                                >
                                                    <ArrowDown size={13} />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Código */}
                                        <td style={{ padding: '0.8rem', fontWeight: 700, color: '#4f46e5' }}>
                                            {story.code}
                                        </td>

                                        {/* Título y descripción */}
                                        <td style={{ padding: '0.8rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{story.title}</div>
                                            <div style={{ fontSize: '0.825rem', color: '#4b5563', marginTop: '0.2rem' }}>{story.description}</div>
                                            {story.findingDescription && (
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#eff6ff', color: '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                                                    <AlertCircle size={12} />
                                                    <span>Origen: {story.findingDescription}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Módulo */}
                                        <td style={{ padding: '0.8rem' }}>
                                            <span style={{ background: '#f3f4f6', color: '#374151', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {story.module}
                                            </span>
                                        </td>

                                        {/* BV */}
                                        <td style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 600 }}>
                                            {story.businessValue}
                                        </td>

                                        {/* SP */}
                                        <td style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 600 }}>
                                            {story.storyPoints}
                                        </td>

                                        {/* Cociente BV / SP */}
                                        <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                                            <span style={{
                                                fontWeight: 700,
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                background: story.decisionQuotient >= 3 ? '#dcfce7' : story.decisionQuotient >= 2 ? '#fef3c7' : '#f3f4f6',
                                                color: story.decisionQuotient >= 3 ? '#166534' : story.decisionQuotient >= 2 ? '#92400e' : '#374151'
                                            }}>
                                                {story.decisionQuotient.toFixed(2)}
                                            </span>
                                        </td>

                                        {/* Estado */}
                                        <td style={{ padding: '0.8rem' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                background: story.status === 'Terminada' ? '#dcfce7' : story.status === 'EnProgreso' ? '#e0e7ff' : story.status === 'Asignada' ? '#fef3c7' : '#f3f4f6',
                                                color: story.status === 'Terminada' ? '#166534' : story.status === 'EnProgreso' ? '#3730a3' : story.status === 'Asignada' ? '#92400e' : '#4b5563'
                                            }}>
                                                {story.status}
                                            </span>
                                        </td>

                                        {/* Sprint */}
                                        <td style={{ padding: '0.8rem', fontSize: '0.85rem', color: story.sprintName ? '#1e40af' : '#9ca3af' }}>
                                            {story.sprintName || '— Sin asignar —'}
                                        </td>

                                        {/* Acciones */}
                                        <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                                                <button
                                                    type="button"
                                                    className="btn-icon"
                                                    onClick={() => handleOpenEdit(story)}
                                                    title="Editar historia"
                                                    aria-label={`Editar historia ${story.code}`}
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-icon text-danger"
                                                    onClick={() => {
                                                        setStoryToDelete(story)
                                                        setDeleteModalOpen(true)
                                                    }}
                                                    title="Eliminar historia"
                                                    aria-label={`Eliminar historia ${story.code}`}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Crear / Editar */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingStory ? `Editar Historia de Usuario (${editingStory.code})` : 'Nueva Historia de Usuario'}
            >
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 140px', gap: '0.8rem' }}>
                        <div>
                            <label htmlFor="story-code" className="form-label" style={{ fontWeight: 600 }}>Código *</label>
                            <input
                                id="story-code"
                                type="text"
                                className="form-control"
                                required
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="story-title" className="form-label" style={{ fontWeight: 600 }}>Nombre del Requisito *</label>
                            <input
                                id="story-title"
                                type="text"
                                className="form-control"
                                required
                                placeholder="Ej: Registro de prueba de usabilidad"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="story-module" className="form-label" style={{ fontWeight: 600 }}>Módulo</label>
                            <select
                                id="story-module"
                                className="form-control"
                                value={formData.module}
                                onChange={e => setFormData({ ...formData, module: e.target.value })}
                            >
                                <option value="Eval.">Eval.</option>
                                <option value="Dash.">Dash.</option>
                                <option value="IA">IA</option>
                                <option value="SCRUM">SCRUM</option>
                                <option value="UI">UI</option>
                                <option value="Búsqueda">Búsqueda</option>
                            </select>
                        </div>
                    </div>

                    {/* Estructura Como... Quiero... Para... */}
                    <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Formato Estándar de Historia de Usuario:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                            <div>
                                <label htmlFor="story-role" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Como (Perfil):</label>
                                <input
                                    id="story-role"
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej: evaluador de usabilidad"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="story-want" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Quiero (Funcionalidad / Necesidad):</label>
                                <textarea
                                    id="story-want"
                                    className="form-control"
                                    rows={2}
                                    placeholder="Ej: registrar una prueba con tareas, tiempos y observaciones"
                                    value={formData.want}
                                    onChange={e => setFormData({ ...formData, want: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="story-benefit" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Para (Beneficio obtenido):</label>
                                <input
                                    id="story-benefit"
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej: analizar el desempeño de una interfaz"
                                    value={formData.benefit}
                                    onChange={e => setFormData({ ...formData, benefit: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* BV, SP y Prioridad */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                        <div>
                            <label htmlFor="story-bv" className="form-label" style={{ fontWeight: 600 }}>Business Value (BV) *</label>
                            <input
                                id="story-bv"
                                type="number"
                                min="1"
                                max="10"
                                className="form-control"
                                value={formData.businessValue}
                                onChange={e => setFormData({ ...formData, businessValue: Number(e.target.value) })}
                                required
                            />
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Valor 1 a 10</span>
                        </div>
                        <div>
                            <label htmlFor="story-sp" className="form-label" style={{ fontWeight: 600 }}>Story Points (SP) *</label>
                            <input
                                id="story-sp"
                                type="number"
                                min="1"
                                max="21"
                                className="form-control"
                                value={formData.storyPoints}
                                onChange={e => setFormData({ ...formData, storyPoints: Number(e.target.value) })}
                                required
                            />
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Fibonacci (1, 2, 3, 5, 8...)</span>
                        </div>
                        <div>
                            <label htmlFor="story-priority" className="form-label" style={{ fontWeight: 600 }}>Prioridad</label>
                            <select
                                id="story-priority"
                                className="form-control"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="Alta">Alta</option>
                                <option value="Media">Media</option>
                                <option value="Baja">Baja</option>
                            </select>
                        </div>
                    </div>

                    {/* Vínculo de trazabilidad con Hallazgo de Origen */}
                    <div>
                        <label htmlFor="story-finding" className="form-label" style={{ fontWeight: 600 }}>
                            Vínculo de Trazabilidad (Hallazgo de usabilidad de origen):
                        </label>
                        <select
                            id="story-finding"
                            className="form-control"
                            value={formData.findingId}
                            onChange={e => setFormData({ ...formData, findingId: e.target.value })}
                        >
                            <option value="">— Ninguno (Requisito general o del enunciado) —</option>
                            {findings.map(f => (
                                <option key={f.id} value={f.id}>
                                    [{f.severity}] {f.description.substring(0, 75)}...
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Criterios de Aceptación */}
                    <div>
                        <label htmlFor="story-criteria" className="form-label" style={{ fontWeight: 600 }}>Criterios de Aceptación</label>
                        <textarea
                            id="story-criteria"
                            className="form-control"
                            rows={3}
                            placeholder="Criterios verificables que definen cuándo la historia se considera terminada..."
                            value={formData.acceptanceCriteria}
                            onChange={e => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingStory ? 'Guardar Cambios' : 'Crear Historia'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Confirmar Eliminar */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirmar Eliminación"
            >
                <p>¿Estás seguro de que deseas eliminar la historia de usuario <strong>{storyToDelete?.code}: {storyToDelete?.title}</strong> del Product Backlog?</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>
                        Cancelar
                    </button>
                    <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>
                        Eliminar
                    </button>
                </div>
            </Modal>
        </div>
    )
}
