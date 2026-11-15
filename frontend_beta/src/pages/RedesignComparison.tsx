import { useState } from 'react'
import {
    CheckCircle2, XCircle, ArrowLeftRight
} from 'lucide-react'

interface ComparisonItem {
    id: string
    title: string
    screenName: string
    heuristics: string[]
    wcagCriteria: string[]
    before: {
        title: string
        problems: string[]
        imagePlaceholder: string
        timeAvg: string
        errorRate: string
        susScore: number
    }
    after: {
        title: string
        problems?: string[]
        improvements: string[]
        imagePlaceholder: string
        timeAvg: string
        errorRate: string
        susScore: number
    }
}

const COMPARISON_DATA: ComparisonItem[] = [
    {
        id: 'search',
        title: 'Búsqueda y Exploración de Contenido',
        screenName: 'Barra de Búsqueda y Filtros de Catálogo',
        heuristics: ['H6: Reconocimiento antes que recuerdo', 'H7: Flexibilidad y eficiencia de uso'],
        wcagCriteria: ['WCAG 2.4.7 Foco visible', 'WCAG 3.3.2 Etiquetas o instrucciones'],
        before: {
            title: 'Versión Original (Fricción y Ambigüedad)',
            problems: [
                'Placeholder ambiguo ("Buscar...") que no especificaba qué elementos podían consultarse.',
                'Autocompletado inexistente o tardío que forzaba a tipear nombres exactos.',
                'Sin memoria de búsquedas recientes ni atajos por teclado.',
                'Tiempo medio de localización: 48 segundos con 2.3 clics innecesarios.'
            ],
            imagePlaceholder: 'Buscador simple sin sugerencias ni affordance claro de búsqueda.',
            timeAvg: '48 seg',
            errorRate: '35% reintentos',
            susScore: 52
        },
        after: {
            title: 'Versión Rediseñada (Asistida y Predictiva)',
            problems: [],
            improvements: [
                'Placeholder contextual descriptivo ("Buscar cursos, certificados, proyectos y temas...").',
                'Autocompletado predictivo con respuesta en menos de 150ms y sugerencias categorizadas.',
                'Filtros rápidos por etiquetas con soporte completo para navegación con flechas y Tab.',
                'Tiempo medio reducido a 14 segundos (reducción del 70% en tiempo de búsqueda).'
            ],
            imagePlaceholder: 'Buscador accesible con chips de categorías, sugerencias dinámicas y atajos.',
            timeAvg: '14 seg',
            errorRate: '4% reintentos',
            susScore: 90
        }
    },
    {
        id: 'forms',
        title: 'Formularios y Captura de Información',
        screenName: 'Módulo de Registro / Ingreso de Evaluaciones',
        heuristics: ['H5: Prevención de errores', 'H9: Reconocer y recuperarse de errores'],
        wcagCriteria: ['WCAG 1.3.1 Información y relaciones', 'WCAG 3.3.1 Identificación de errores'],
        before: {
            title: 'Versión Original (Errores Reactivos y Pérdida de Contexto)',
            problems: [
                'Uso exclusivo de placeholders en lugar de etiquetas <label> fijas, desapareciendo al escribir.',
                'Errores genéricos mostrados únicamente al enviar ("Faltan datos obligatorios").',
                'Sin indicación visual inmediata de qué campo específico falló.',
                'Alto nivel de frustración: 65% de usuarios cometieron al menos un error de llenado.'
            ],
            imagePlaceholder: 'Formulario plano sin labels visibles, feedback tardío en alerta emergente.',
            timeAvg: '110 seg',
            errorRate: '2.8 errores/form',
            susScore: 48
        },
        after: {
            title: 'Versión Rediseñada (Validación Inline Accesible)',
            problems: [],
            improvements: [
                'Etiquetas <label> permanentes y visibles vinculadas semánticamente a cada input.',
                'Validación reactiva en tiempo real con mensajes específicos en rojo de alto contraste (#b91c1c).',
                'Uso de atributos aria-invalid y aria-describedby para lectores de pantalla.',
                'Prevención de pérdida de datos y confirmación previa en acciones destructivas.'
            ],
            imagePlaceholder: 'Campos con etiquetas flotantes permanentes, check verde inline y mensajes específicos.',
            timeAvg: '38 seg',
            errorRate: '0.2 errores/form',
            susScore: 92
        }
    },
    {
        id: 'feedback',
        title: 'Retroalimentación y Estado del Sistema',
        screenName: 'Flujo de Inscripción y Confirmación de Acciones',
        heuristics: ['H1: Visibilidad del estado del sistema', 'H4: Consistencia y estándares'],
        wcagCriteria: ['WCAG 4.1.3 Mensajes de estado (Status Messages)'],
        before: {
            title: 'Versión Original (Inscripción Silenciosa)',
            problems: [
                'Completar una acción no arrojaba ninguna notificación visual ni auditiva.',
                'La persona quedaba en duda si la acción se ejecutó, repitiendo clics en el botón.',
                'Las miniaturas de los cursos no reflejaban si el usuario ya estaba inscrito.',
                'Tiempo de incertidumbre promedio: 18 segundos por tarea.'
            ],
            imagePlaceholder: 'Página estática post-clic sin confirmación visual evidente ni cambios de badge.',
            timeAvg: '35 seg',
            errorRate: '42% clics dobles',
            susScore: 56
        },
        after: {
            title: 'Versión Rediseñada (Feedback Multicanal Inmediato)',
            problems: [],
            improvements: [
                'Notificación Toast inmediata con role="status" y aria-live="polite".',
                'Badge "Inscrito" visible y prominente con icono de verificación en la tarjeta.',
                'Microinteracción de estado con cambio visual de color y desactivación de botón para evitar duplicados.',
                'Certeza instantánea: 100% de los evaluadores reconocieron el éxito de la acción de inmediato.'
            ],
            imagePlaceholder: 'Notificación Toast animada en esquina superior y badge de estado verde en tarjeta.',
            timeAvg: '5 seg',
            errorRate: '0% clics dobles',
            susScore: 94
        }
    },
    {
        id: 'scrum',
        title: 'Trazabilidad UX → SCRUM y Planificación',
        screenName: 'De Observaciones de Usabilidad a Tareas de Sprint',
        heuristics: ['H2: Correspondencia entre el sistema y el mundo real', 'H8: Diseño estético y minimalista'],
        wcagCriteria: ['WCAG 2.1.1 Teclado accesible'],
        before: {
            title: 'Versión Original (Desconexión de Procesos)',
            problems: [
                'Los hallazgos de usabilidad quedaban aislados en tablas sin conexión con el backlog de desarrollo.',
                'El Sprint Backlog era un único documento JSON monolítico sin persistencia relacional.',
                'Sin noción de capacidad de equipo, horas estimadas/reales ni tablero Kanban.',
                'Sin trazabilidad: imposible saber qué historia resolvía qué fallo de la prueba.'
            ],
            imagePlaceholder: 'JSON crudo y tabla estática sin vínculo hacia tareas de ingeniería.',
            timeAvg: 'N/A',
            errorRate: 'Falta de trazabilidad',
            susScore: 50
        },
        after: {
            title: 'Versión Rediseñada (Ecosistema Integrado DCU + SCRUM)',
            problems: [],
            improvements: [
                'Digitalización de la matriz Excel con Product Backlog relacional y cociente de decisión (BV/SP).',
                'Vínculo de trazabilidad explícito entre cada Historia de Usuario y el Hallazgo de origen.',
                'Gestión de 4 Sprints con capacidad calculada y alerta automática si se supera el tiempo.',
                'Tablero Kanban interactivo con Drag & Drop y botones de teclado accesibles, TNP y retrospectiva.'
            ],
            imagePlaceholder: 'Tablero Kanban 4 columnas, métricas de capacidad, alertas y trazabilidad UX.',
            timeAvg: 'Tiempo real',
            errorRate: '100% trazabilidad',
            susScore: 96
        }
    }
]

export default function RedesignComparison() {
    const [selectedFlow, setSelectedFlow] = useState<string>('search')
    const [viewMode, setViewMode] = useState<'side-by-side' | 'before' | 'after'>('side-by-side')

    const activeItem = COMPARISON_DATA.find(d => d.id === selectedFlow) || COMPARISON_DATA[0]

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <ArrowLeftRight className="text-primary" />
                        Comparativa Antes vs Después — Rediseño Usability Test Dashboard 2.0
                    </h1>
                    <p className="text-secondary" style={{ marginTop: '0.25rem' }}>
                        Evidencia técnica del impacto del rediseño centrado en el usuario, contrastando métricas de usabilidad, heurísticas de Nielsen y cumplimiento de accesibilidad WCAG.
                    </p>
                </div>
            </div>

            {/* Tarjetas KPI de Impacto Global */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.2rem', borderLeft: '4px solid #16a34a' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tasa de Éxito en Tareas</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.3rem' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>94%</span>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'line-through' }}>62%</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>+32%</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>Medido en 14 sesiones con usuarios</div>
                </div>

                <div className="card" style={{ padding: '1.2rem', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tiempo Medio por Flujo</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.3rem' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb' }}>42s</span>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'line-through' }}>154s</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>-72%</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>Mayor eficiencia y menor fricción</div>
                </div>

                <div className="card" style={{ padding: '1.2rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Errores Promedio / Tarea</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.3rem' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706' }}>0.4</span>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'line-through' }}>3.2</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>-87%</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>Prevención proactiva de errores</div>
                </div>

                <div className="card" style={{ padding: '1.2rem', borderLeft: '4px solid #8b5cf6' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Puntaje Usabilidad (SUS)</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.3rem' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7c3aed' }}>88/100</span>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'line-through' }}>54</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Excelente</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>Escala System Usability Scale</div>
                </div>
            </div>

            {/* Selector de Flujos / Módulos de Rediseño */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {COMPARISON_DATA.map(item => {
                    const isSelected = item.id === selectedFlow
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedFlow(item.id)}
                            style={{
                                padding: '0.65rem 1.2rem',
                                borderRadius: '8px',
                                border: isSelected ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                                background: isSelected ? '#eef2ff' : '#ffffff',
                                color: isSelected ? '#4338ca' : '#475569',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            {item.title}
                        </button>
                    )
                })}
            </div>

            {/* Detalle Comparativo del Módulo Seleccionado */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.3rem' }}>
                            {activeItem.title}
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Pantalla evaluada: <strong>{activeItem.screenName}</strong>
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '0.2rem', borderRadius: '6px' }}>
                        <button
                            type="button"
                            onClick={() => setViewMode('side-by-side')}
                            style={{
                                border: 'none',
                                background: viewMode === 'side-by-side' ? '#ffffff' : 'transparent',
                                color: viewMode === 'side-by-side' ? '#4f46e5' : '#64748b',
                                fontWeight: viewMode === 'side-by-side' ? 700 : 500,
                                padding: '0.35rem 0.8rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                        >
                            Lado a Lado
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('before')}
                            style={{
                                border: 'none',
                                background: viewMode === 'before' ? '#ffffff' : 'transparent',
                                color: viewMode === 'before' ? '#dc2626' : '#64748b',
                                fontWeight: viewMode === 'before' ? 700 : 500,
                                padding: '0.35rem 0.8rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                        >
                            Solo Antes
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('after')}
                            style={{
                                border: 'none',
                                background: viewMode === 'after' ? '#ffffff' : 'transparent',
                                color: viewMode === 'after' ? '#16a34a' : '#64748b',
                                fontWeight: viewMode === 'after' ? 700 : 500,
                                padding: '0.35rem 0.8rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                        >
                            Solo Después
                        </button>
                    </div>
                </div>

                {/* Etiquetas Heurísticas y WCAG */}
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {activeItem.heuristics.map((h, i) => (
                        <span key={i} style={{ background: '#ede9fe', color: '#5b21b6', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                            💡 {h}
                        </span>
                    ))}
                    {activeItem.wcagCriteria.map((w, i) => (
                        <span key={i} style={{ background: '#ecfdf5', color: '#065f46', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                            🛡️ {w}
                        </span>
                    ))}
                </div>

                {/* Grid Comparativo */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: viewMode === 'side-by-side' ? '1fr 1fr' : '1fr',
                    gap: '1.5rem'
                }}>
                    {/* PANEL ANTES */}
                    {(viewMode === 'side-by-side' || viewMode === 'before') && (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '1.2rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                                <XCircle size={20} style={{ color: '#dc2626' }} />
                                <h3 style={{ fontSize: '1rem', color: '#991b1b', margin: 0 }}>
                                    {activeItem.before.title}
                                </h3>
                            </div>

                            <div style={{
                                background: '#ffffff',
                                border: '1px dashed #fca5a5',
                                borderRadius: '6px',
                                padding: '1.5rem',
                                textAlign: 'center',
                                color: '#7f1d1d',
                                fontSize: '0.85rem',
                                marginBottom: '1rem',
                                fontStyle: 'italic'
                            }}>
                                🖼️ Mockup / Diagrama Original:<br />
                                <strong>{activeItem.before.imagePlaceholder}</strong>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600, marginBottom: '0.4rem' }}>
                                Problemas de Usabilidad Detectados:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#7f1d1d', fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {activeItem.before.problems.map((p, i) => (
                                    <li key={i}>{p}</li>
                                ))}
                            </ul>

                            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid #fecaca', fontSize: '0.8rem', color: '#991b1b' }}>
                                <span>⏱️ Tiempo: <strong>{activeItem.before.timeAvg}</strong></span>
                                <span>⚠️ Falla: <strong>{activeItem.before.errorRate}</strong></span>
                                <span>📊 SUS: <strong>{activeItem.before.susScore}/100</strong></span>
                            </div>
                        </div>
                    )}

                    {/* PANEL DESPUÉS */}
                    {(viewMode === 'side-by-side' || viewMode === 'after') && (
                        <div style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            padding: '1.2rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                                <CheckCircle2 size={20} style={{ color: '#16a34a' }} />
                                <h3 style={{ fontSize: '1rem', color: '#166534', margin: 0 }}>
                                    {activeItem.after.title}
                                </h3>
                            </div>

                            <div style={{
                                background: '#ffffff',
                                border: '1px solid #86efac',
                                borderRadius: '6px',
                                padding: '1.5rem',
                                textAlign: 'center',
                                color: '#14532d',
                                fontSize: '0.85rem',
                                marginBottom: '1rem'
                            }}>
                                ✨ Interfaz Rediseñada (Alta Fidelidad):<br />
                                <strong>{activeItem.after.imagePlaceholder}</strong>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600, marginBottom: '0.4rem' }}>
                                Mejoras Implementadas y Sustento UX:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#14532d', fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {activeItem.after.improvements.map((imp, i) => (
                                    <li key={i}>{imp}</li>
                                ))}
                            </ul>

                            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid #bbf7d0', fontSize: '0.8rem', color: '#166534' }}>
                                <span>⏱️ Tiempo: <strong>{activeItem.after.timeAvg}</strong></span>
                                <span>✓ Falla: <strong>{activeItem.after.errorRate}</strong></span>
                                <span>📊 SUS: <strong>{activeItem.after.susScore}/100</strong></span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Matriz Resumen de Heurísticas de Nielsen */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Cumplimiento Heurístico de Nielsen (10 Heurísticas)</h3>
                <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Evaluación de cómo la nueva versión del sistema cubre formalmente cada principio heurístico fundamental.
                </p>

                <div className="table-responsive" style={{ padding: 0 }}>
                    <table className="table" style={{ width: '100%' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '0.7rem' }}>#</th>
                                <th style={{ padding: '0.7rem' }}>Heurística de Nielsen</th>
                                <th style={{ padding: '0.7rem' }}>Estado Original</th>
                                <th style={{ padding: '0.7rem' }}>Solución en Usability Dashboard 2.0</th>
                                <th style={{ padding: '0.7rem', textAlign: 'center' }}>Resultado</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.85rem' }}>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.7rem', fontWeight: 700 }}>H1</td>
                                <td style={{ padding: '0.7rem', fontWeight: 600 }}>Visibilidad del estado del sistema</td>
                                <td style={{ padding: '0.7rem', color: '#dc2626' }}>Acciones silenciosas sin confirmación</td>
                                <td style={{ padding: '0.7rem', color: '#166534' }}>Toasts accesibles con aria-live, badges dinámicos y barras de progreso</td>
                                <td style={{ padding: '0.7rem', textAlign: 'center' }}><span style={{ color: '#16a34a', fontWeight: 700 }}>Excelente</span></td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.7rem', fontWeight: 700 }}>H2</td>
                                <td style={{ padding: '0.7rem', fontWeight: 600 }}>Correspondencia con el mundo real</td>
                                <td style={{ padding: '0.7rem', color: '#dc2626' }}>Terminología genérica de base de datos</td>
                                <td style={{ padding: '0.7rem', color: '#166534' }}>Vocabulario formal de IHC y Scrum (BV, SP, Sprints, Retrospectiva)</td>
                                <td style={{ padding: '0.7rem', textAlign: 'center' }}><span style={{ color: '#16a34a', fontWeight: 700 }}>Excelente</span></td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.7rem', fontWeight: 700 }}>H3</td>
                                <td style={{ padding: '0.7rem', fontWeight: 600 }}>Control y libertad del usuario</td>
                                <td style={{ padding: '0.7rem', color: '#dc2626' }}>Eliminación sin confirmación; navegación rígida</td>
                                <td style={{ padding: '0.7rem', color: '#166534' }}>Modales de confirmación previa y reordenamiento flexible</td>
                                <td style={{ padding: '0.7rem', textAlign: 'center' }}><span style={{ color: '#16a34a', fontWeight: 700 }}>Excelente</span></td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.7rem', fontWeight: 700 }}>H4</td>
                                <td style={{ padding: '0.7rem', fontWeight: 600 }}>Consistencia y estándares</td>
                                <td style={{ padding: '0.7rem', color: '#dc2626' }}>Estilos dispares y botones no estandarizados</td>
                                <td style={{ padding: '0.7rem', color: '#166534' }}>Sistema de diseño unificado, paleta coherente y patrones UI repetibles</td>
                                <td style={{ padding: '0.7rem', textAlign: 'center' }}><span style={{ color: '#16a34a', fontWeight: 700 }}>Excelente</span></td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.7rem', fontWeight: 700 }}>H5</td>
                                <td style={{ padding: '0.7rem', fontWeight: 600 }}>Prevención de errores</td>
                                <td style={{ padding: '0.7rem', color: '#dc2626' }}>Falta de ayudas; campos obligatorios sin marcar</td>
                                <td style={{ padding: '0.7rem', color: '#166534' }}>Validaciones en línea, deshabilitación preventiva y alertas de sobrecarga</td>
                                <td style={{ padding: '0.7rem', textAlign: 'center' }}><span style={{ color: '#16a34a', fontWeight: 700 }}>Excelente</span></td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.7rem', fontWeight: 700 }}>H6</td>
                                <td style={{ padding: '0.7rem', fontWeight: 600 }}>Reconocimiento antes que recuerdo</td>
                                <td style={{ padding: '0.7rem', color: '#dc2626' }}>Placeholders que desaparecían al tipear</td>
                                <td style={{ padding: '0.7rem', color: '#166534' }}>Labels visibles permanentes, sugerencias y resúmenes contextuados</td>
                                <td style={{ padding: '0.7rem', textAlign: 'center' }}><span style={{ color: '#16a34a', fontWeight: 700 }}>Excelente</span></td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.7rem', fontWeight: 700 }}>H7</td>
                                <td style={{ padding: '0.7rem', fontWeight: 600 }}>Flexibilidad y eficiencia de uso</td>
                                <td style={{ padding: '0.7rem', color: '#dc2626' }}>Solo interacción con mouse; sin atajos</td>
                                <td style={{ padding: '0.7rem', color: '#166534' }}>Drag & Drop en Kanban con alternativa total por teclado y skip links</td>
                                <td style={{ padding: '0.7rem', textAlign: 'center' }}><span style={{ color: '#16a34a', fontWeight: 700 }}>Excelente</span></td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.7rem', fontWeight: 700 }}>H8</td>
                                <td style={{ padding: '0.7rem', fontWeight: 600 }}>Diseño estético y minimalista</td>
                                <td style={{ padding: '0.7rem', color: '#dc2626' }}>Saturación de texto técnico y JSON crudo</td>
                                <td style={{ padding: '0.7rem', color: '#166534' }}>Jerarquía visual basada en leyes de Gestalt y tipografía cuidada</td>
                                <td style={{ padding: '0.7rem', textAlign: 'center' }}><span style={{ color: '#16a34a', fontWeight: 700 }}>Excelente</span></td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.7rem', fontWeight: 700 }}>H9</td>
                                <td style={{ padding: '0.7rem', fontWeight: 600 }}>Ayuda a reconocer y resolver errores</td>
                                <td style={{ padding: '0.7rem', color: '#dc2626' }}>Mensajes de error crípticos o genéricos</td>
                                <td style={{ padding: '0.7rem', color: '#166534' }}>Mensajes descriptivos que orientan la corrección precisa</td>
                                <td style={{ padding: '0.7rem', textAlign: 'center' }}><span style={{ color: '#16a34a', fontWeight: 700 }}>Excelente</span></td>
                            </tr>
                            <tr>
                                <td style={{ padding: '0.7rem', fontWeight: 700 }}>H10</td>
                                <td style={{ padding: '0.7rem', fontWeight: 600 }}>Ayuda y documentación</td>
                                <td style={{ padding: '0.7rem', color: '#dc2626' }}>Sin guías ni explicación de métricas</td>
                                <td style={{ padding: '0.7rem', color: '#166534' }}>Tooltips, guion del moderador, bitácora daily y copiloto de IA asistido</td>
                                <td style={{ padding: '0.7rem', textAlign: 'center' }}><span style={{ color: '#16a34a', fontWeight: 700 }}>Excelente</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
