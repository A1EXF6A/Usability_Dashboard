import { useState } from 'react'
import {
    Sparkles, AlertCircle, Copy, Download,
    Printer, RefreshCw, Send, CheckSquare, Square
} from 'lucide-react'
import { aiApi, scrumApi } from '../api'
import type { Guid } from '../api'
import { useToast } from '../App'
import Modal from './Modal'

interface AiObservationsModalProps {
    isOpen: boolean
    onClose: () => void
    planId: Guid
    projectName: string
}

export default function AiObservationsModal({
    isOpen,
    onClose,
    planId,
    projectName
}: AiObservationsModalProps) {
    const { addToast } = useToast()

    // Estados: 'idle' | 'loading' | 'success' | 'error'
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const [analysisData, setAnalysisData] = useState<any>(null)

    // Historias seleccionadas para enviar al Backlog
    const [selectedStories, setSelectedStories] = useState<Record<string, boolean>>({})

    // Confirmación para guardar en Backlog
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [savingToBacklog, setSavingToBacklog] = useState(false)

    // Ejecutar Análisis
    const handleRunAnalysis = async () => {
        setStatus('loading')
        setErrorMessage('')
        try {
            const res = await aiApi.analyzeObservations(planId)
            const data = res.data
            setAnalysisData(data)

            // Por defecto, marcar todas las historias sugeridas como seleccionadas
            const initialSelected: Record<string, boolean> = {}
            if (data.draftUserStories) {
                data.draftUserStories.forEach((s: any, idx: number) => {
                    initialSelected[s.tempId || idx] = true
                })
            }
            setSelectedStories(initialSelected)
            setStatus('success')
            addToast('Análisis heurístico completado exitosamente.', 'success')
        } catch (err: any) {
            console.error('Error en análisis IA:', err)
            setStatus('error')
            const msg = err.response?.data?.message || err.message || 'Error al conectar con el servicio de análisis de IA.'
            setErrorMessage(msg)
            addToast(msg, 'error')
        }
    }

    // Toggle Selección Historia
    const toggleStorySelection = (tempId: string) => {
        setSelectedStories(prev => ({
            ...prev,
            [tempId]: !prev[tempId]
        }))
    }

    // Edición campo por campo de historias sugeridas
    const handleUpdateStoryField = (index: number, field: string, value: any) => {
        if (!analysisData || !analysisData.draftUserStories) return
        const updated = [...analysisData.draftUserStories]
        updated[index] = { ...updated[index], [field]: value }

        // Si se cambia want, role o benefit, recalcular description
        if (field === 'role' || field === 'want' || field === 'benefit') {
            const s = updated[index]
            s.description = `Como ${s.role || 'usuario'}, quiero ${s.want || ''} para ${s.benefit || ''}.`
        }

        setAnalysisData({ ...analysisData, draftUserStories: updated })
    }

    // Edición de criterios de aceptación (línea por línea)
    const handleUpdateCriteria = (index: number, criteriaText: string) => {
        if (!analysisData || !analysisData.draftUserStories) return
        const updated = [...analysisData.draftUserStories]
        updated[index].acceptanceCriteria = criteriaText
            .split('\n')
            .map(c => c.replace(/^[•\-\*]\s*/, '').trim())
            .filter(Boolean)
        setAnalysisData({ ...analysisData, draftUserStories: updated })
    }

    // Enviar Historias Seleccionadas al Product Backlog
    const handleSendToBacklog = async () => {
        if (!analysisData || !analysisData.draftUserStories) return
        setSavingToBacklog(true)
        try {
            const storiesToSend = analysisData.draftUserStories.filter((s: any, idx: number) =>
                selectedStories[s.tempId || idx]
            )

            if (storiesToSend.length === 0) {
                addToast('No seleccionaste ninguna historia para agregar al backlog.', 'error')
                setSavingToBacklog(false)
                setConfirmModalOpen(false)
                return
            }

            for (const story of storiesToSend) {
                const criteriaString = Array.isArray(story.acceptanceCriteria)
                    ? story.acceptanceCriteria.map((c: string) => `• ${c}`).join('\n')
                    : story.acceptanceCriteria || ''

                await scrumApi.createStory({
                    testPlanId: planId,
                    code: story.code || 'HU-IA',
                    title: story.title,
                    description: story.description || `Como ${story.role}, quiero ${story.want} para ${story.benefit}.`,
                    module: story.module || 'UI',
                    businessValue: Number(story.suggestedBusinessValue || 8),
                    storyPoints: Number(story.suggestedStoryPoints || 3),
                    priority: story.priority || 'Alta',
                    status: 'Backlog',
                    acceptanceCriteria: criteriaString,
                    findingId: story.originFindingId || null,
                    sprintId: null
                })
            }

            addToast(`${storiesToSend.length} historia(s) agregadas al Product Backlog con trazabilidad.`, 'success')
            setConfirmModalOpen(false)
            onClose()
        } catch (err) {
            console.error(err)
            addToast('Error al enviar historias al backlog.', 'error')
        } finally {
            setSavingToBacklog(false)
        }
    }

    // Generar formato Markdown (listo para GitHub Issues)
    const generateMarkdownReport = () => {
        if (!analysisData) return ''
        let md = `# Reporte de Análisis Heurístico UX e IA — ${analysisData.planTitle || projectName}\n\n`
        md += `> **Fuente:** ${analysisData.source === 'ai' ? '🤖 Modelo Generativo Gemini' : '⚡ Motor Heurístico Determinista Local (Mock)'}\n`
        md += `> **Fecha:** ${new Date().toLocaleDateString('es-EC')}\n\n`

        md += `## Resumen Ejecutivo\n${analysisData.summary}\n\n`

        md += `## Clasificación Heurística de Usabilidad\n`
        analysisData.categories?.forEach((cat: any) => {
            md += `### ${cat.category} (${cat.findingCount} hallazgos)\n${cat.description}\n\n`
        })

        md += `## Severidad Priorizada con Justificación Técnica\n`
        analysisData.prioritizedSeverities?.forEach((sev: any) => {
            md += `- **[${sev.severity}] ${sev.issueTitle}**\n  *Justificación:* ${sev.justification}\n`
        })
        md += `\n`

        md += `## Recomendaciones por Pantalla y Componente\n`
        analysisData.screenRecommendations?.forEach((rec: any) => {
            md += `### ${rec.screenOrComponent}\n- **Problema detectado:** ${rec.detectedProblem}\n- **Recomendación:** ${rec.recommendation}\n- **Impacto esperado:** ${rec.expectedImpact}\n\n`
        })

        md += `## Historias de Usuario para el Product Backlog (SCRUM)\n`
        analysisData.draftUserStories?.forEach((st: any) => {
            md += `### ${st.code}: ${st.title}\n`
            md += `**Descripción:** ${st.description}\n\n`
            md += `**Prioridad:** ${st.priority} | **Módulo:** ${st.module} | **BV:** ${st.suggestedBusinessValue} | **SP:** ${st.suggestedStoryPoints}\n\n`
            if (st.originFindingTitle) {
                md += `*Trazabilidad con origen:* ${st.originFindingTitle}\n\n`
            }
            md += `#### Criterios de Aceptación (Checklist)\n`
            st.acceptanceCriteria?.forEach((c: string) => {
                md += `- [ ] ${c}\n`
            })
            md += `\n---\n\n`
        })

        return md
    }

    // Copiar Markdown
    const handleCopyMarkdown = () => {
        const md = generateMarkdownReport()
        navigator.clipboard.writeText(md)
        addToast('Reporte Markdown copiado al portapapeles (listo para GitHub Issues).', 'success')
    }

    // Descargar Markdown
    const handleDownloadMarkdown = () => {
        const md = generateMarkdownReport()
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Analisis_UX_IA_${projectName.replace(/\s+/g, '_')}.md`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        addToast('Archivo Markdown descargado.', 'success')
    }

    // Imprimir Reporte
    const handlePrint = () => {
        window.print()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Asistente IA de Observaciones y Refinamiento UX"
        >
            <div style={{ maxWidth: '850px', maxHeight: '78vh', overflowY: 'auto', paddingRight: '0.4rem' }}>
                {/* ── ESTADO 1: REPOSO (IDLE) ── */}
                {status === 'idle' && (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.2rem',
                            color: '#ffffff',
                            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                        }}>
                            <Sparkles size={32} />
                        </div>

                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Refinamiento Inteligente de Pruebas UX</h3>
                        <p className="text-secondary" style={{ maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                            El asistente analiza las observaciones registradas en las sesiones de prueba (tiempos, incidentes, fallas y comentarios) para estructurar un informe técnico con <strong>categorización heurística</strong>, <strong>priorización de severidad</strong>, <strong>recomendaciones por pantalla</strong> y <strong>borradores de Historias de Usuario</strong> para el Product Backlog.
                        </p>

                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', maxWidth: '540px', margin: '0 auto 1.8rem', textAlign: 'left', fontSize: '0.85rem' }}>
                            <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Garantías de Calidad y Gobernanza UX:</div>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <li><strong>Sin alucinaciones:</strong> Basado estrictamente en observaciones registradas.</li>
                                <li><strong>Trazabilidad:</strong> Cada historia generada se vincula a su hallazgo de origen.</li>
                                <li><strong>Control Humano:</strong> Todos los campos son editables y nada se guarda sin tu confirmación.</li>
                                <li><strong>Fallback Determinista:</strong> Funciona incluso si no hay conexión o API Key externa.</li>
                            </ul>
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleRunAnalysis}
                            style={{ padding: '0.75rem 1.8rem', fontSize: '1rem' }}
                        >
                            <Sparkles size={18} />
                            Iniciar Análisis de Observaciones con IA
                        </button>
                    </div>
                )}

                {/* ── ESTADO 2: LOADING CON ARIA-LIVE ── */}
                {status === 'loading' && (
                    <div
                        role="status"
                        aria-live="polite"
                        style={{ textAlign: 'center', padding: '3.5rem 1rem' }}
                    >
                        <div className="spinner" style={{ margin: '0 auto 1.2rem', width: '48px', height: '48px' }} />
                        <h4 style={{ color: '#4f46e5', marginBottom: '0.4rem' }}>Analizando observaciones de usabilidad...</h4>
                        <p className="text-secondary" style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                            Procesando incidentes, evaluando heurísticas de Nielsen y estructurando historias de usuario para el Product Backlog.
                        </p>
                    </div>
                )}

                {/* ── ESTADO 3: ERROR CON REINTENTO ── */}
                {status === 'error' && (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            <AlertCircle size={30} />
                        </div>
                        <h4 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>No se pudo completar el análisis</h4>
                        <p style={{ color: '#b91c1c', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                            {errorMessage}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setStatus('idle')}>
                                Volver al inicio
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleRunAnalysis}>
                                <RefreshCw size={16} />
                                Reintentar Análisis
                            </button>
                        </div>
                    </div>
                )}

                {/* ── ESTADO 4: RESOLUCIÓN CON RESULTADOS EDITABLES ── */}
                {status === 'success' && analysisData && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Barra Superior con Badge de Fuente y Exportaciones */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.3rem 0.7rem',
                                    borderRadius: '20px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    background: analysisData.source === 'ai' ? 'linear-gradient(135deg, #ede9fe 0%, #fbcfe8 100%)' : '#e2e8f0',
                                    color: analysisData.source === 'ai' ? '#6b21a8' : '#334155',
                                    border: analysisData.source === 'ai' ? '1px solid #c084fc' : '1px solid #cbd5e1'
                                }}>
                                    <Sparkles size={13} />
                                    {analysisData.source === 'ai' ? 'Sugerido por IA (Gemini)' : 'Motor Determinista (Mock Local)'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCopyMarkdown}
                                    title="Copiar formato Markdown con checklists para GitHub Issues"
                                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.7rem' }}
                                >
                                    <Copy size={14} />
                                    Copiar Markdown
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleDownloadMarkdown}
                                    title="Descargar archivo Markdown"
                                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.7rem' }}
                                >
                                    <Download size={14} />
                                    Descargar .md
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handlePrint}
                                    title="Imprimir o guardar como PDF"
                                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.7rem' }}
                                >
                                    <Printer size={14} />
                                    PDF
                                </button>
                            </div>
                        </div>

                        {/* Resumen Ejecutivo */}
                        <div className="card" style={{ padding: '1rem', background: '#f8fafc' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.3rem' }}>
                                Resumen de Hallazgos UX
                            </div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.5' }}>
                                {analysisData.summary}
                            </p>
                        </div>

                        {/* Clasificación por Categoría Heurística UX */}
                        <div>
                            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.6rem', color: '#334155' }}>
                                Clasificación por Categorías Heurísticas
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
                                {analysisData.categories?.map((cat: any, i: number) => (
                                    <div key={i} className="card" style={{ padding: '0.8rem', background: '#ffffff', borderLeft: '4px solid #4f46e5' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>{cat.category}</strong>
                                            <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '0.72rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                                                {cat.findingCount}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem', lineHeight: '1.3' }}>
                                            {cat.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Severidades Priorizadas */}
                        <div>
                            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.6rem', color: '#334155' }}>
                                Severidad Priorizada con Justificación Técnica
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {analysisData.prioritizedSeverities?.map((sev: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: '0.8rem', padding: '0.7rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', alignItems: 'flex-start' }}>
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            background: sev.severity === 'Critical' || sev.severity === 'High' ? '#fee2e2' : '#fef3c7',
                                            color: sev.severity === 'Critical' || sev.severity === 'High' ? '#991b1b' : '#92400e',
                                            flexShrink: 0
                                        }}>
                                            {sev.severity}
                                        </span>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{sev.issueTitle}</div>
                                            <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                                                <em>Justificación:</em> {sev.justification}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recomendaciones por Pantalla */}
                        <div>
                            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.6rem', color: '#334155' }}>
                                Recomendaciones de Rediseño por Pantalla
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.8rem' }}>
                                {analysisData.screenRecommendations?.map((rec: any, i: number) => (
                                    <div key={i} className="card" style={{ padding: '0.9rem' }}>
                                        <div style={{ fontWeight: 700, color: '#4f46e5', fontSize: '0.875rem', marginBottom: '0.3rem' }}>
                                            🖥️ {rec.screenOrComponent}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem' }}>
                                            <strong>Problema:</strong> {rec.detectedProblem}
                                        </div>
                                        <div style={{ fontSize: '0.825rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                                            <strong>Propuesta:</strong> {rec.recommendation}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                                            ✓ {rec.expectedImpact}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Borradores de Historias de Usuario (Editables y Seleccionables) */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem', margin: 0, color: '#1e293b' }}>
                                        Borradores de Historias de Usuario para el Product Backlog
                                    </h4>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        Edita cualquier campo si deseas refinarlo antes de confirmar su envío al backlog.
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setConfirmModalOpen(true)}
                                    title="Enviar historias seleccionadas al Product Backlog relacional de SCRUM"
                                >
                                    <Send size={15} />
                                    Enviar Aceptadas al Product Backlog
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {analysisData.draftUserStories?.map((story: any, idx: number) => {
                                    const tempKey = story.tempId || idx
                                    const isSelected = !!selectedStories[tempKey]

                                    return (
                                        <div
                                            key={tempKey}
                                            className="card"
                                            style={{
                                                padding: '1.1rem',
                                                border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                                background: isSelected ? '#faf5ff' : '#ffffff',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            {/* Cabecera de la historia sugerida */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleStorySelection(tempKey)}
                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                                                        title={isSelected ? 'Deseleccionar' : 'Seleccionar para backlog'}
                                                    >
                                                        {isSelected ? (
                                                            <CheckSquare size={20} className="text-primary" />
                                                        ) : (
                                                            <Square size={20} style={{ color: '#94a3b8' }} />
                                                        )}
                                                    </button>

                                                    <input
                                                        type="text"
                                                        value={story.code || `HU-IA-${idx + 1}`}
                                                        onChange={e => handleUpdateStoryField(idx, 'code', e.target.value)}
                                                        style={{ width: '85px', fontWeight: 700, color: '#4f46e5', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.2rem 0.4rem', fontSize: '0.85rem' }}
                                                    />

                                                    <input
                                                        type="text"
                                                        value={story.title}
                                                        onChange={e => handleUpdateStoryField(idx, 'title', e.target.value)}
                                                        style={{ fontWeight: 600, fontSize: '0.95rem', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.2rem 0.5rem', flex: 1, minWidth: '180px' }}
                                                    />
                                                </div>

                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '12px',
                                                    background: '#ede9fe',
                                                    color: '#6b21a8'
                                                }}>
                                                    <Sparkles size={11} />
                                                    Sugerido por IA
                                                </span>
                                            </div>

                                            {/* Formato Como... Quiero... Para... */}
                                            <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '0.6rem' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>Como (Rol):</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            style={{ fontSize: '0.8rem', padding: '0.3rem' }}
                                                            value={story.role || 'usuario'}
                                                            onChange={e => handleUpdateStoryField(idx, 'role', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>Quiero (Funcionalidad):</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            style={{ fontSize: '0.8rem', padding: '0.3rem' }}
                                                            value={story.want || ''}
                                                            onChange={e => handleUpdateStoryField(idx, 'want', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>Para (Propósito):</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            style={{ fontSize: '0.8rem', padding: '0.3rem' }}
                                                            value={story.benefit || ''}
                                                            onChange={e => handleUpdateStoryField(idx, 'benefit', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', marginTop: '0.2rem' }}>
                                                    "{story.description}"
                                                </div>
                                            </div>

                                            {/* Métricas BV, SP, Módulo y Prioridad */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.6rem', marginBottom: '0.8rem' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>Business Value:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        className="form-control"
                                                        style={{ fontSize: '0.8rem', padding: '0.3rem' }}
                                                        value={story.suggestedBusinessValue}
                                                        onChange={e => handleUpdateStoryField(idx, 'suggestedBusinessValue', Number(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>Story Points:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="21"
                                                        className="form-control"
                                                        style={{ fontSize: '0.8rem', padding: '0.3rem' }}
                                                        value={story.suggestedStoryPoints}
                                                        onChange={e => handleUpdateStoryField(idx, 'suggestedStoryPoints', Number(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>Prioridad:</label>
                                                    <select
                                                        className="form-control"
                                                        style={{ fontSize: '0.8rem', padding: '0.3rem' }}
                                                        value={story.priority}
                                                        onChange={e => handleUpdateStoryField(idx, 'priority', e.target.value)}
                                                    >
                                                        <option value="Alta">Alta</option>
                                                        <option value="Media">Media</option>
                                                        <option value="Baja">Baja</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>Módulo:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        style={{ fontSize: '0.8rem', padding: '0.3rem' }}
                                                        value={story.module}
                                                        onChange={e => handleUpdateStoryField(idx, 'module', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Criterios de Aceptación (Editable) */}
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                                                    Criterios de Aceptación (un criterio por línea):
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    rows={3}
                                                    style={{ fontSize: '0.8rem' }}
                                                    value={Array.isArray(story.acceptanceCriteria) ? story.acceptanceCriteria.map((c: string) => `• ${c}`).join('\n') : story.acceptanceCriteria}
                                                    onChange={e => handleUpdateCriteria(idx, e.target.value)}
                                                />
                                            </div>

                                            {/* Trazabilidad con Hallazgo de Origen */}
                                            {story.originFindingTitle && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#1e40af', marginTop: '0.6rem', background: '#eff6ff', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                                                    <AlertCircle size={13} />
                                                    <span>Trazabilidad vinculada: <strong>{story.originFindingTitle}</strong></span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Botón inferior de confirmación */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cerrar
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setConfirmModalOpen(true)}
                            >
                                <Send size={16} />
                                Aprobar y Enviar al Product Backlog
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Confirmación antes de Guardar en Backlog */}
            <Modal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                title="Confirmar Envío al Product Backlog"
            >
                <div>
                    <p style={{ fontSize: '0.925rem', lineHeight: '1.5' }}>
                        ¿Deseas enviar las historias de usuario seleccionadas al <strong>Product Backlog</strong> del proyecto?
                    </p>
                    <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        Se calculará automáticamente el cociente de decisión <code>BV / SP</code> para cada historia y se vincularán los hallazgos de usabilidad para mantener la trazabilidad completa requerida por la rúbrica docente.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setConfirmModalOpen(false)}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={savingToBacklog}
                            onClick={handleSendToBacklog}
                        >
                            {savingToBacklog ? 'Guardando...' : 'Sí, Enviar al Backlog'}
                        </button>
                    </div>
                </div>
            </Modal>
        </Modal>
    )
}
