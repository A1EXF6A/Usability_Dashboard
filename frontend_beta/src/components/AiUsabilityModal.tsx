import { useState } from 'react'
import Modal from './Modal'
import { aiAssistantApi, productBacklogApi } from '../api'
import { useToast } from '../App'
import {
    Sparkles, Edit3, Check, Trash2, Plus,
    Compass, Eye, Palette, MessageSquare, MousePointer
} from 'lucide-react'

interface AiUsabilityModalProps {
    isOpen: boolean
    onClose: () => void
    activePlanId: string
    onStoriesImported: () => void
}

export default function AiUsabilityModal({
    isOpen,
    onClose,
    activePlanId,
    onStoriesImported
}: AiUsabilityModalProps) {
    const { addToast } = useToast()
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<any | null>(null)
    const [activeSection, setActiveSection] = useState<'summary' | 'issues' | 'stories'>('stories')
    const [selectedStoryCodes, setSelectedStoryCodes] = useState<Record<string, boolean>>({})
    const [editingStoryIndex, setEditingStoryIndex] = useState<number | null>(null)
    const [importing, setImporting] = useState(false)

    // Form state for editing a proposed story
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        priority: 'Alta',
        effortEstimation: 5,
        origin: '',
        acceptanceCriteria: [] as string[],
        newCriteriaText: '',
        technicalTasks: [] as { title: string; estimatedHours: number }[],
        newTaskTitle: '',
        newTaskHours: 4
    })

    const handleStartAnalysis = async () => {
        if (!activePlanId) return
        setAnalyzing(true)
        setResult(null)
        try {
            const res = await aiAssistantApi.analyzeUsability(activePlanId)
            setResult(res.data)
            // By default select all proposed stories for approval
            const initialSelected: Record<string, boolean> = {}
            res.data.proposedStories.forEach((s: any) => {
                initialSelected[s.storyCode] = true
            })
            setSelectedStoryCodes(initialSelected)
            setActiveSection('stories')
            addToast('¡Análisis completado con éxito!', 'success')
        } catch (err: any) {
            addToast(err.response?.data || err.message || 'Error al analizar usabilidad', 'error')
        } finally {
            setAnalyzing(false)
        }
    }

    const openEditStory = (index: number) => {
        if (!result) return
        const story = result.proposedStories[index]
        setEditingStoryIndex(index)
        setEditForm({
            title: story.title,
            description: story.description,
            priority: story.priority,
            effortEstimation: story.effortEstimation,
            origin: story.origin,
            acceptanceCriteria: [...story.acceptanceCriteria],
            newCriteriaText: '',
            technicalTasks: [...story.technicalTasks],
            newTaskTitle: '',
            newTaskHours: 4
        })
    }

    const saveEditStory = () => {
        if (editingStoryIndex === null || !result) return
        const updated = [...result.proposedStories]
        updated[editingStoryIndex] = {
            ...updated[editingStoryIndex],
            title: editForm.title,
            description: editForm.description,
            priority: editForm.priority,
            effortEstimation: editForm.effortEstimation,
            origin: editForm.origin,
            acceptanceCriteria: editForm.acceptanceCriteria,
            technicalTasks: editForm.technicalTasks
        }
        setResult({ ...result, proposedStories: updated })
        setEditingStoryIndex(null)
        addToast('Propuesta editada con éxito', 'success')
    }

    const toggleStoryApproval = (code: string) => {
        setSelectedStoryCodes(prev => ({
            ...prev,
            [code]: !prev[code]
        }))
    }

    const handleImportApproved = async () => {
        if (!result || !activePlanId) return
        const approved = result.proposedStories.filter((s: any) => selectedStoryCodes[s.storyCode])
        if (approved.length === 0) {
            addToast('Selecciona al menos una historia aprobada para incorporar', 'error')
            return
        }

        setImporting(true)
        try {
            await productBacklogApi.importApproved(activePlanId, {
                stories: approved.map((s: any) => ({
                    testPlanId: activePlanId,
                    storyCode: s.storyCode,
                    title: s.title,
                    description: s.description,
                    priority: s.priority,
                    effortEstimation: s.effortEstimation,
                    origin: s.origin,
                    acceptanceCriteria: s.acceptanceCriteria
                }))
            })

            addToast(`¡${approved.length} historias aprobadas se incorporaron al Product Backlog!`, 'success')
            onStoriesImported()
            onClose()
        } catch (err: any) {
            addToast(err.response?.data || err.message || 'Error al incorporar historias', 'error')
        } finally {
            setImporting(false)
        }
    }

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'Navegación': return <Compass size={14} style={{ color: '#3b82f6' }} />
            case 'Accesibilidad': return <Eye size={14} style={{ color: '#10b981' }} />
            case 'Diseño Visual': return <Palette size={14} style={{ color: '#8b5cf6' }} />
            case 'Comprensión del Contenido': return <MessageSquare size={14} style={{ color: '#f59e0b' }} />
            default: return <MousePointer size={14} style={{ color: '#6366f1' }} />
        }
    }

    const getSeverityBadge = (sev: string) => {
        const isCrit = sev === 'Critical' || sev === 'Crítico' || sev === 'Alta'
        const isHigh = sev === 'High' || sev === 'Alta'
        const color = isCrit ? '#ef4444' : isHigh ? '#f97316' : '#3b82f6'
        const bg = isCrit ? 'rgba(239, 68, 68, 0.15)' : isHigh ? 'rgba(249, 115, 22, 0.15)' : 'rgba(59, 130, 246, 0.15)'
        return (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: bg, color, fontWeight: 700 }}>
                {sev}
            </span>
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Asistente de IA: Análisis de Usabilidad y Propuestas de Backlog"
            maxWidth="max-w-4xl"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {!result && !analyzing && (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                            <Sparkles size={32} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                            Análisis Inteligente de Observaciones y Hallazgos
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto var(--space-6) auto', fontSize: 13, lineHeight: 1.6 }}>
                            El asistente de IA consolidará las observaciones registradas durante las sesiones de prueba y hallazgos sintetizados, clasificará los problemas de interacción humano-computador y generará historias de usuario con criterios de aceptación y tareas técnicas.
                        </p>
                        <button
                            onClick={handleStartAnalysis}
                            className="btn btn-primary"
                            style={{ padding: '10px 24px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        >
                            <Sparkles size={16} /> Analizar Pruebas y Generar Propuestas
                        </button>
                    </div>
                )}

                {analyzing && (
                    <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)' }}>
                        <div className="sprint-loading-spinner" style={{ width: 48, height: 48, margin: '0 auto var(--space-4) auto', borderBottomColor: 'var(--color-primary)' }} />
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Analizando datos de usabilidad...</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                            Extrayendo métricas de incidentes, severidad de problemas y recomendaciones ergonómicas.
                        </p>
                    </div>
                )}

                {result && !editingStoryIndex && (
                    <>
                        {/* Section tabs */}
                        <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-2)' }}>
                            <button
                                onClick={() => setActiveSection('stories')}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: activeSection === 'stories' ? 700 : 500,
                                    background: activeSection === 'stories' ? 'var(--color-primary)' : 'transparent',
                                    color: activeSection === 'stories' ? '#fff' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 13
                                }}
                            >
                                📋 Historias Propuestas ({result.proposedStories.length})
                            </button>
                            <button
                                onClick={() => setActiveSection('issues')}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: activeSection === 'issues' ? 700 : 500,
                                    background: activeSection === 'issues' ? 'var(--color-primary)' : 'transparent',
                                    color: activeSection === 'issues' ? '#fff' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 13
                                }}
                            >
                                🔍 Problemas Clasificados ({result.classifiedIssues.length})
                            </button>
                            <button
                                onClick={() => setActiveSection('summary')}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: activeSection === 'summary' ? 700 : 500,
                                    background: activeSection === 'summary' ? 'var(--color-primary)' : 'transparent',
                                    color: activeSection === 'summary' ? '#fff' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 13
                                }}
                            >
                                📝 Resumen Ejecutivo
                            </button>
                        </div>

                        {/* Stories view */}
                        {activeSection === 'stories' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: '420px', overflowY: 'auto', paddingRight: 'var(--space-2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-sunken)', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
                                    <span>
                                        Revisa y selecciona las propuestas generadas. Puedes editar cualquier historia antes de aprobarla.
                                    </span>
                                    <button
                                        onClick={() => {
                                            const allChecked = Object.values(selectedStoryCodes).every(v => v)
                                            const next: Record<string, boolean> = {}
                                            result.proposedStories.forEach((s: any) => { next[s.storyCode] = !allChecked })
                                            setSelectedStoryCodes(next)
                                        }}
                                        className="btn btn-secondary"
                                        style={{ fontSize: 11, padding: '3px 8px', height: 'auto', minHeight: 'unset' }}
                                    >
                                        Alternar selección
                                    </button>
                                </div>

                                {result.proposedStories.map((story: any, idx: number) => {
                                    const isApproved = !!selectedStoryCodes[story.storyCode]
                                    return (
                                        <div
                                            key={story.storyCode}
                                            style={{
                                                padding: 'var(--space-4)',
                                                borderRadius: 'var(--radius-lg)',
                                                border: `1px solid ${isApproved ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                                background: isApproved ? 'rgba(99, 102, 241, 0.04)' : 'var(--surface-card)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isApproved}
                                                        onChange={() => toggleStoryApproval(story.storyCode)}
                                                        style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                                                        id={`chk-${story.storyCode}`}
                                                    />
                                                    <label htmlFor={`chk-${story.storyCode}`} style={{ fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                                                        <span style={{ color: 'var(--color-primary)', marginRight: 6 }}>[{story.storyCode}]</span>
                                                        {story.title}
                                                    </label>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--surface-sunken)', fontWeight: 600 }}>
                                                        {story.effortEstimation} pts
                                                    </span>
                                                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: story.priority === 'Alta' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: story.priority === 'Alta' ? '#ef4444' : '#3b82f6', fontWeight: 700 }}>
                                                        {story.priority}
                                                    </span>
                                                    <button
                                                        onClick={() => openEditStory(idx)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '4px 8px', fontSize: 11, height: 'auto', minHeight: 'unset', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                                        title="Editar propuesta"
                                                    >
                                                        <Edit3 size={12} /> Editar
                                                    </button>
                                                </div>
                                            </div>

                                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, fontStyle: 'italic', background: 'var(--surface-sunken)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                                                "{story.description}"
                                            </p>

                                            {story.origin && (
                                                <div style={{ fontSize: 11, color: 'var(--neutral-500)', marginTop: 6 }}>
                                                    <strong>Origen de usabilidad:</strong> 🔍 {story.origin}
                                                </div>
                                            )}

                                            <div style={{ marginTop: 8 }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Criterios de aceptación:</span>
                                                <ul style={{ margin: '4px 0 0 16px', fontSize: 11, color: 'var(--text-secondary)' }}>
                                                    {story.acceptanceCriteria.map((ac: string, acIdx: number) => (
                                                        <li key={acIdx}>{ac}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {story.technicalTasks && story.technicalTasks.length > 0 && (
                                                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                    {story.technicalTasks.map((tt: any, ttIdx: number) => (
                                                        <span key={ttIdx} style={{ fontSize: 10, background: 'var(--surface-sunken)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-secondary)' }}>
                                                            ⚙️ {tt.title} ({tt.estimatedHours}h)
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Classified issues view */}
                        {activeSection === 'issues' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: '420px', overflowY: 'auto' }}>
                                {result.classifiedIssues.map((issue: any, iIdx: number) => (
                                    <div key={iIdx} style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--surface-card)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {getCategoryIcon(issue.category)}
                                                <span style={{ fontWeight: 700, fontSize: 13 }}>{issue.category}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {getSeverityBadge(issue.severity)}
                                                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--surface-sunken)', fontWeight: 600 }}>
                                                    Prioridad: {issue.priority}
                                                </span>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: 12, fontWeight: 500, margin: '4px 0' }}>{issue.description}</p>
                                        <p style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 4 }}>
                                            <strong>Recomendación IHC:</strong> {issue.recommendation}
                                        </p>
                                        <div style={{ fontSize: 10, color: 'var(--text-disabled)', marginTop: 4 }}>
                                            Fuente: {issue.source}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Executive Summary view */}
                        {activeSection === 'summary' && (
                            <div style={{ padding: 'var(--space-4)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)', maxHeight: '420px', overflowY: 'auto', lineHeight: 1.7, fontSize: 13 }}>
                                <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
                                    Resumen Ejecutivo de Evaluación de Usabilidad
                                </h4>
                                <p style={{ whiteSpace: 'pre-line' }}>{result.summary}</p>
                            </div>
                        )}

                        {/* Actions bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-color)' }}>
                            <button
                                onClick={handleStartAnalysis}
                                className="btn btn-secondary"
                                style={{ fontSize: 12 }}
                            >
                                🔄 Reanalizar
                            </button>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button
                                    onClick={onClose}
                                    className="btn btn-secondary"
                                    style={{ fontSize: 12 }}
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={handleImportApproved}
                                    disabled={importing}
                                    className="btn btn-primary"
                                    style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                >
                                    <Check size={14} />
                                    {importing ? 'Incorporando...' : 'Aprobar e Incorporar al Product Backlog'}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Edit single story form */}
                {result && editingStoryIndex !== null && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: '460px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ fontWeight: 700, fontSize: 14 }}>
                                Editar Propuesta de Historia de Usuario [{result.proposedStories[editingStoryIndex].storyCode}]
                            </h4>
                            <button
                                onClick={() => setEditingStoryIndex(null)}
                                className="btn btn-secondary"
                                style={{ fontSize: 11, padding: '2px 8px' }}
                            >
                                Volver a la lista
                            </button>
                        </div>

                        <div>
                            <label className="form-label" style={{ fontSize: 12 }}>Título de la Historia</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editForm.title}
                                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="form-label" style={{ fontSize: 12 }}>Descripción (Formato Scrum)</label>
                            <textarea
                                className="form-input"
                                rows={2}
                                value={editForm.description}
                                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                            <div>
                                <label className="form-label" style={{ fontSize: 12 }}>Prioridad</label>
                                <select
                                    className="form-input"
                                    value={editForm.priority}
                                    onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}
                                >
                                    <option value="Alta">Alta</option>
                                    <option value="Media">Media</option>
                                    <option value="Baja">Baja</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label" style={{ fontSize: 12 }}>Estimación de Esfuerzo (pts)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-input"
                                    value={editForm.effortEstimation}
                                    onChange={e => setEditForm(f => ({ ...f, effortEstimation: Number(e.target.value) }))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label" style={{ fontSize: 12 }}>Origen de Usabilidad</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editForm.origin}
                                onChange={e => setEditForm(f => ({ ...f, origin: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="form-label" style={{ fontSize: 12 }}>Criterios de Aceptación</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                                {editForm.acceptanceCriteria.map((crit, cIdx) => (
                                    <div key={cIdx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ fontSize: 12 }}
                                            value={crit}
                                            onChange={e => {
                                                const updated = [...editForm.acceptanceCriteria]
                                                updated[cIdx] = e.target.value
                                                setEditForm(f => ({ ...f, acceptanceCriteria: updated }))
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setEditForm(f => ({ ...f, acceptanceCriteria: f.acceptanceCriteria.filter((_, i) => i !== cIdx) }))}
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
                                    placeholder="Nuevo criterio de aceptación..."
                                    value={editForm.newCriteriaText}
                                    onChange={e => setEditForm(f => ({ ...f, newCriteriaText: e.target.value }))}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && editForm.newCriteriaText.trim()) {
                                            e.preventDefault()
                                            setEditForm(f => ({
                                                ...f,
                                                acceptanceCriteria: [...f.acceptanceCriteria, f.newCriteriaText.trim()],
                                                newCriteriaText: ''
                                            }))
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (editForm.newCriteriaText.trim()) {
                                            setEditForm(f => ({
                                                ...f,
                                                acceptanceCriteria: [...f.acceptanceCriteria, f.newCriteriaText.trim()],
                                                newCriteriaText: ''
                                            }))
                                        }
                                    }}
                                    className="btn btn-secondary"
                                    style={{ fontSize: 12 }}
                                >
                                    <Plus size={14} /> Añadir
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                            <button
                                type="button"
                                onClick={() => setEditingStoryIndex(null)}
                                className="btn btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={saveEditStory}
                                className="btn btn-primary"
                            >
                                <Check size={14} /> Guardar Cambios en Propuesta
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}
