import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi, findingsApi } from '../api'
import { usePlan } from '../context/PlanContext'
import { BarChart2, CheckCircle2, Clock, AlertCircle, AlertTriangle, Info, Lightbulb, TrendingUp, TrendingDown, Flame, PieChart as PieChartIcon, Users, MessageSquareText, ListChecks, CalendarRange, Eye, Search, ArrowRight, Lock, Check, Zap, Printer, Sparkles, Award } from 'lucide-react'
import { PieChart } from '../components/PieChart'

interface Stats {
    totalObservations: number
    successRate: number
    averageTimeSeconds: number
    totalErrors: number
    totalFindings: number
    criticalFindings: number
    moderateFindings: number
    totalActions: number
    completedActions: number
    pendingActions: number
    inProgressActions: number
    closedActions?: number
    errorsBySeverity: { severity: string; count: number }[]
    successByTask: { taskId: string; total: number; successes: number; avgTime: number }[]
}

interface KPICardProps {
    icon: React.ReactNode
    value: string | number
    label: string
    iconBg: string
    valueColor?: string
    delay?: string
}

function KPICard({ icon, value, label, iconBg, valueColor = '', delay = '' }: KPICardProps) {
    return (
        <div className={`kpi-card ${delay}`} role="group" aria-label={`Métrica: ${label}`}>
            <div className="kpi-card-icon-container" style={{ background: iconBg }}>
                {icon}
            </div>
            <div className="kpi-card-content">
                <div className="kpi-card-value" style={{ color: valueColor }}>{value}</div>
                <div className="kpi-card-label">{label}</div>
            </div>
        </div>
    )
}

/* ── Phase Stepper Component ── */
function PhaseStepper({ sectionDone, canAccessPhase2, canAccessPhase3 }: {
    sectionDone: Record<string, boolean>
    canAccessPhase2: boolean
    canAccessPhase3: boolean
}) {
    const phase1Done = sectionDone.guion && sectionDone.participantes
    const phase1Count = (sectionDone.guion ? 1 : 0) + (sectionDone.participantes ? 1 : 0)
    const phase2Done = sectionDone.tareas && sectionDone.sesiones && sectionDone.observaciones
    const phase2Count = (sectionDone.tareas ? 1 : 0) + (sectionDone.sesiones ? 1 : 0) + (sectionDone.observaciones ? 1 : 0)
    const phase3Done = sectionDone.hallazgos && sectionDone.mejoras
    const phase3Count = (sectionDone.hallazgos ? 1 : 0) + (sectionDone.mejoras ? 1 : 0)

    const steps = [
        { label: 'Preparación', subtitle: `${phase1Count}/2 secciones`, done: phase1Done, active: !phase1Done, locked: false },
        { label: 'Ejecución', subtitle: `${phase2Count}/3 secciones`, done: phase2Done, active: phase1Done && !phase2Done && canAccessPhase2, locked: !canAccessPhase2 },
        { label: 'Análisis', subtitle: `${phase3Count}/2 secciones`, done: phase3Done, active: phase2Done && !phase3Done && canAccessPhase3, locked: !canAccessPhase3 },
    ]

    return (
        <div className="phase-stepper" role="list" aria-label="Progreso por fases">
            {steps.map((step, i) => {
                const stepState = step.done ? 'is-done' : step.active ? 'is-active' : 'is-locked'
                return (
                    <div key={i} className="phase-stepper-item" role="listitem">
                        {i > 0 && (
                            <div className={`phase-stepper-line ${steps[i - 1].done ? 'is-done' : ''}`} aria-hidden="true" />
                        )}
                        <div className={`phase-stepper-circle ${stepState}`}>
                            {step.done ? (
                                <Check size={16} strokeWidth={3} />
                            ) : step.locked ? (
                                <Lock size={14} />
                            ) : (
                                <span className="phase-stepper-dot" />
                            )}
                        </div>
                        <div className="phase-stepper-label">
                            <span className={`phase-stepper-label-title ${stepState}`}>{step.label}</span>
                            <span className={`phase-stepper-label-subtitle ${stepState}`}>{step.subtitle}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

/* ── Quick Actions Component ── */
function QuickActions({ sectionDone, canAccessPhase2, canAccessPhase3 }: {
    sectionDone: Record<string, boolean>
    canAccessPhase2: boolean
    canAccessPhase3: boolean
}) {
    const navigate = useNavigate()

    const actions = [
        { key: 'plan_de_prueba', label: 'Crear Plan de Prueba', desc: 'Define objetivos, alcance y metodología', icon: Zap, to: '/planes', phase: 0 },
        { key: 'guion', label: 'Guión del Moderador', desc: 'Prepara las instrucciones para las sesiones', icon: MessageSquareText, to: '/guion', phase: 1 },
        { key: 'participantes', label: 'Registrar Participantes', desc: 'Agrega usuarios para las pruebas', icon: Users, to: '/participantes', phase: 1 },
        { key: 'tareas', label: 'Definir Tareas', desc: 'Crea escenarios y criterios de éxito', icon: ListChecks, to: '/tareas', phase: 2, locked: !canAccessPhase2 },
        { key: 'sesiones', label: 'Programar Sesiones', desc: 'Agenda las sesiones de prueba', icon: CalendarRange, to: '/sesiones', phase: 2, locked: !canAccessPhase2 },
        { key: 'observaciones', label: 'Registrar Observaciones', desc: 'Documenta resultados de las sesiones', icon: Eye, to: '/observaciones', phase: 2, locked: !canAccessPhase2 },
        { key: 'hallazgos', label: 'Documentar Hallazgos', desc: 'Sintetiza los problemas encontrados', icon: Search, to: '/hallazgos', phase: 3, locked: !canAccessPhase3 },
        { key: 'mejoras', label: 'Acciones de Mejora', desc: 'Define el plan de mejoras', icon: Lightbulb, to: '/mejoras', phase: 3, locked: !canAccessPhase3 },
    ]

    const pending = actions.filter(a => !sectionDone[a.key] && !a.locked).slice(0, 3)

    if (pending.length === 0) return null

    return (
        <section className="dashboard-quick-actions">
            <div className="dashboard-quick-actions-header">
                <Zap size={18} className="text-amber-500" aria-hidden="true" />
                <h3 className="dashboard-quick-actions-title">Acciones Rápidas</h3>
                <span className="dashboard-quick-actions-subtitle">Siguientes pasos sugeridos</span>
            </div>
            <div className="dashboard-quick-actions-grid">
                {pending.map(action => (
                    <button
                        key={action.key}
                        onClick={() => navigate(action.to)}
                        className="quick-action group"
                        aria-label={`Ir a ${action.label}`}
                    >
                        <div className="quick-action-icon">
                            <action.icon size={20} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                            <div className="nav-item-label" style={{ fontWeight: 600 }}>{action.label}</div>
                            <div className="nav-item-detail" style={{ marginTop: 'var(--space-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{action.desc}</div>
                        </div>
                        <ArrowRight size={16} style={{ color: 'var(--neutral-400)', transition: 'transform 0.2s' }} className="group-hover-arrow" aria-hidden="true" />
                    </button>
                ))}
            </div>
        </section>
    )
}

export default function Dashboard() {
    const { plans, activePlanId, sectionDone, canAccessPhase2, canAccessPhase3 } = usePlan()

    const [activeTab, setActiveTab] = useState<'general' | 'comparativa'>('general')
    const [comparison, setComparison] = useState<any | null>(null)
    const [stats, setStats] = useState<Stats | null>(null)
    const [findings, setFindings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchDashboardData = async (planId: string) => {
        setStats(null)
        setFindings([])
        setComparison(null)
        setLoading(true)
        try {
            const statsRes = await dashboardApi.getStats(planId || undefined)

            let allFindings: any[] = []
            if (planId) {
                const [findingsRes, compRes] = await Promise.allSettled([
                    findingsApi.getByPlan(planId),
                    dashboardApi.getEvaluationComparison(planId)
                ])
                if (findingsRes.status === 'fulfilled') {
                    allFindings = findingsRes.value.data ?? []
                }
                if (compRes.status === 'fulfilled') {
                    setComparison(compRes.value.data)
                }
            } else {
                const findingsPromises = plans.map(p => findingsApi.getByPlan(p.id))
                const responses = await Promise.all(findingsPromises)
                allFindings = responses.flatMap(r => r.data ?? [])
            }

            setStats(statsRes.data)
            setFindings(allFindings)
        } catch {
            setStats(null)
            setFindings([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (plans.length > 0 || activePlanId !== '__UNSET__') {
            fetchDashboardData(activePlanId && activePlanId !== '__UNSET__' ? activePlanId : '')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePlanId, plans])

    if (loading) {
        return (
            <div className="dashboard-loader-container">
                <div className="dashboard-spinner" />
                <p className="dashboard-loader-text">Cargando dashboard...</p>
            </div>
        )
    }

    if (!stats) return null

    // DASH-01: Map "closed" as "completed" in progress bar
    const effectiveCompleted = stats.completedActions + (stats.closedActions ?? 0)
    const effectiveTotal = stats.totalActions

    // Global progress calculation
    const totalSections = 7 // guion, participantes, tareas, sesiones, observaciones, hallazgos, mejoras
    const completedSections = ['guion', 'participantes', 'tareas', 'sesiones', 'observaciones', 'hallazgos', 'mejoras'].filter(k => sectionDone[k]).length
    const globalProgress = Math.round((completedSections / totalSections) * 100)

    const getSeverityBadge = (severity: string) => {
        const iconStyle = { marginRight: '4px', flexShrink: 0 }
        switch (severity) {
            case 'Alta':
            case 'Critical':
                return (
                    <span className="dashboard-finding-severity dashboard-finding-severity--critical" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <AlertCircle size={10} aria-hidden="true" style={iconStyle} />
                        {severity}
                    </span>
                )
            case 'High':
                return (
                    <span className="dashboard-finding-severity dashboard-finding-severity--high" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <AlertTriangle size={10} aria-hidden="true" style={iconStyle} />
                        {severity}
                    </span>
                )
            default: // 'Moderate' / other
                return (
                    <span className="dashboard-finding-severity dashboard-finding-severity--moderate" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <Info size={10} aria-hidden="true" style={iconStyle} />
                        {severity}
                    </span>
                )
        }
    }

    return (
        <div className="dashboard-container">
            {/* Phase Stepper Card */}
            <section className="dashboard-stepper-card">
                <div className="dashboard-stepper-header">
                    <h3 className="dashboard-stepper-title">Progreso del Plan de Usabilidad</h3>
                    <span className="dashboard-stepper-badge">{globalProgress}% completado</span>
                </div>
                <PhaseStepper sectionDone={sectionDone} canAccessPhase2={canAccessPhase2} canAccessPhase3={canAccessPhase3} />
                {/* Global Progress Bar */}
                <div style={{ marginTop: 'var(--space-5)' }}>
                    <div className="dashboard-progress-track">
                        <div
                            className="dashboard-progress-fill"
                            style={{ width: `${globalProgress}%` }}
                        />
                    </div>
                    <div className="dashboard-progress-footer">
                        <span>{completedSections} de {totalSections} secciones</span>
                        <span>{globalProgress === 100 ? '🎉 ¡Plan completado!' : 'En progreso...'}</span>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <QuickActions sectionDone={sectionDone} canAccessPhase2={canAccessPhase2} canAccessPhase3={canAccessPhase3} />

            {/* Sub-view Navigation Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button
                    onClick={() => setActiveTab('general')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 18px',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: activeTab === 'general' ? 700 : 500,
                        background: activeTab === 'general' ? 'var(--color-primary)' : 'var(--surface-card)',
                        color: activeTab === 'general' ? '#fff' : 'var(--text-secondary)',
                        border: activeTab === 'general' ? 'none' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <BarChart2 size={16} /> Métricas Generales del Plan
                </button>
                <button
                    onClick={() => setActiveTab('comparativa')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 18px',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: activeTab === 'comparativa' ? 700 : 500,
                        background: activeTab === 'comparativa' ? 'var(--color-primary)' : 'var(--surface-card)',
                        color: activeTab === 'comparativa' ? '#fff' : 'var(--text-secondary)',
                        border: activeTab === 'comparativa' ? 'none' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <Award size={16} /> Comparativa Inicial vs. Final & Informe
                </button>
            </div>

            {activeTab === 'general' ? (
                <>
                    {/* Hero Banner */}
                    <section className="dashboard-hero">
                <div className="dashboard-hero-deco" aria-hidden="true" />
                <div className="dashboard-hero-content">
                    <div className="dashboard-hero-tags">
                        <span className="dashboard-hero-badge">
                            <Flame size={14} className="text-blue-300" aria-hidden="true" />
                            Panel de Control
                        </span>
                        <span className="dashboard-hero-badge dashboard-hero-badge--success">
                            {stats.totalObservations} observaciones
                        </span>
                    </div>
                    <h2 className="dashboard-hero-title">
                        Resumen General del Plan de Usabilidad
                    </h2>
                    <p className="dashboard-hero-subtitle">
                        Indicadores clave de rendimiento, hallazgos documentados y estado de las acciones de mejora para la evaluación de usabilidad.
                    </p>
                </div>
            </section>

            {/* KPI Cards - Row 1 */}
            <div className="dashboard-kpi-row">
                <KPICard
                    icon={<BarChart2 size={22} className="text-blue-600" />}
                    value={stats.totalObservations}
                    label="Observaciones totales"
                    iconBg="var(--color-primary-light)"
                    valueColor="var(--color-primary)"
                />
                <KPICard
                    icon={<CheckCircle2 size={22} className="text-emerald-500" />}
                    value={`${stats.successRate}%`}
                    label="Tasa de éxito"
                    iconBg="var(--color-success-light)"
                    valueColor="var(--color-success)"
                    delay="delay-100"
                />
                <KPICard
                    icon={<Clock size={22} className="text-amber-500" />}
                    value={`${Math.round(stats.averageTimeSeconds)}s`}
                    label="Tiempo promedio"
                    iconBg="var(--color-warning-light)"
                    valueColor="var(--color-warning)"
                    delay="delay-200"
                />
                <KPICard
                    icon={<AlertCircle size={22} className="text-red-500" />}
                    value={stats.totalErrors}
                    label="Errores totales"
                    iconBg="var(--color-error-light)"
                    valueColor="var(--color-error)"
                    delay="delay-300"
                />
            </div>

            {/* KPI Cards - Row 2 */}
            <div className="dashboard-kpi-row">
                <KPICard
                    icon={<AlertTriangle size={22} className="text-red-500" />}
                    value={stats.criticalFindings}
                    label="Hallazgos críticos"
                    iconBg="var(--color-error-light)"
                    valueColor="var(--color-error)"
                />
                <KPICard
                    icon={<AlertTriangle size={22} className="text-blue-500" />}
                    value={stats.moderateFindings}
                    label="Hallazgos moderados"
                    iconBg="var(--color-primary-light)"
                    valueColor="var(--color-primary)"
                    delay="delay-100"
                />
                <KPICard
                    icon={<Lightbulb size={22} className="text-emerald-500" />}
                    value={effectiveCompleted}
                    label="Mejoras completadas"
                    iconBg="var(--color-success-light)"
                    valueColor="var(--color-success)"
                    delay="delay-200"
                />
                <KPICard
                    icon={<TrendingUp size={22} className="text-indigo-500" />}
                    value={stats.pendingActions + stats.inProgressActions}
                    label="Mejoras pendientes"
                    iconBg="linear-gradient(135deg, #e0e7ff, #eff6ff)"
                    valueColor="#4f46e5"
                    delay="delay-300"
                />
            </div>

            {/* Three Column Grid: Task Performance, Findings, and Statistics */}
            <div className="dashboard-panels-grid">
                {/* Task Performance */}
                <div className="dashboard-panel-card">
                    <div className="dashboard-panel-header dashboard-panel-header--blue">
                        <h3 className="dashboard-panel-title">Rendimiento por Tarea</h3>
                    </div>
                    <div className="dashboard-panel-body">
                        <div className="dashboard-task-list">
                            {stats.successByTask.map(task => {
                                const rate = task.total > 0 ? Math.round((task.successes / task.total) * 100) : 0
                                const rateClass = rate >= 70 ? 'success' : rate >= 40 ? 'warning' : 'error'
                                return (
                                    <div key={task.taskId} className="dashboard-task-item">
                                        <div className="dashboard-task-id">T{String(task.taskId).slice(0, 4)}</div>
                                        <div className="dashboard-task-progress-track">
                                            <div
                                                className={`dashboard-task-progress-fill dashboard-task-progress-fill--${rateClass}`}
                                                style={{ width: `${rate}%` }}
                                            />
                                        </div>
                                        <div className="dashboard-task-rate">{rate}%</div>
                                        <div className="dashboard-task-time">{Math.round(task.avgTime)}s</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Statistics Pie Chart */}
                <div className="dashboard-panel-card">
                    <div className="dashboard-panel-header dashboard-panel-header--emerald">
                        <div className="dashboard-panel-header-inner" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <PieChartIcon size={18} className="text-emerald-600" />
                                <h3 className="dashboard-panel-title">Distribución de Hallazgos</h3>
                            </div>
                        </div>
                    </div>
                    <div className="dashboard-panel-body">
                        <div className="dashboard-pie-container">
                            <PieChart
                                size={180}
                                data={[
                                    { label: 'Críticos', value: stats.criticalFindings, color: '#ef4444' },
                                    { label: 'Moderados', value: stats.moderateFindings, color: '#3b82f6' },
                                    { label: 'Otros', value: Math.max(0, stats.totalFindings - stats.criticalFindings - stats.moderateFindings), color: '#10b981' },
                                ]}
                            />
                            <div className="dashboard-pie-legend">
                                <div className="dashboard-pie-legend-item">
                                    <div className="dashboard-pie-legend-label">
                                        <div className="dashboard-pie-legend-dot" style={{ backgroundColor: '#ef4444' }} />
                                        <span>Críticos</span>
                                    </div>
                                    <span className="dashboard-pie-legend-value dashboard-pie-legend-value--critical">{stats.criticalFindings}</span>
                                </div>
                                <div className="dashboard-pie-legend-item">
                                    <div className="dashboard-pie-legend-label">
                                        <div className="dashboard-pie-legend-dot" style={{ backgroundColor: '#3b82f6' }} />
                                        <span>Moderados</span>
                                    </div>
                                    <span className="dashboard-pie-legend-value dashboard-pie-legend-value--moderate">{stats.moderateFindings}</span>
                                </div>
                                <div className="dashboard-pie-legend-item">
                                    <div className="dashboard-pie-legend-label">
                                        <div className="dashboard-pie-legend-dot" style={{ backgroundColor: '#10b981' }} />
                                        <span>Otros</span>
                                    </div>
                                    <span className="dashboard-pie-legend-value dashboard-pie-legend-value--other">{Math.max(0, stats.totalFindings - stats.criticalFindings - stats.moderateFindings)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Findings */}
                <div className="dashboard-panel-card">
                    <div className="dashboard-panel-header dashboard-panel-header--purple">
                        <div className="dashboard-panel-header-inner" style={{ width: '100%' }}>
                            <h3 className="dashboard-panel-title">Hallazgos Recientes</h3>
                            <span className="dashboard-panel-badge">{findings.length}</span>
                        </div>
                    </div>
                    <div className="dashboard-panel-body" style={{ padding: 'var(--space-4)' }}>
                        <div className="dashboard-findings-list soft-scrollbar">
                            {findings.slice(0, 6).map((f: any) => {
                                const sevClass = (f.severity === 'Alta' || f.severity === 'Critical')
                                    ? 'critical'
                                    : f.severity === 'High'
                                        ? 'high'
                                        : 'moderate'
                                return (
                                    <div key={f.id} className={`dashboard-finding-card dashboard-finding-card--${sevClass}`}>
                                        <div className="dashboard-finding-header">
                                            <p className="dashboard-finding-desc">{f.description}</p>
                                            {getSeverityBadge(f.severity)}
                                        </div>
                                        <div className="dashboard-finding-meta">
                                            {f.category && <span className="dashboard-finding-meta-badge">{f.category}</span>}
                                            {f.tool && <span className="dashboard-finding-meta-badge">{f.tool}</span>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Status */}
            <section className="dashboard-improvements-card">
                <div className="dashboard-improvements-header">
                    <h3 className="dashboard-panel-title">Estado de Acciones de Mejora</h3>
                </div>
                <div className="dashboard-improvements-body">
                    <div className="dashboard-improvements-layout">
                        <div className="dashboard-improvements-stats">
                            <div className="dashboard-improvements-stat-item">
                                <div className="dashboard-improvements-stat-val dashboard-improvements-stat-val--completed">{effectiveCompleted}</div>
                                <div className="dashboard-improvements-stat-label">Completadas</div>
                            </div>
                            <div className="dashboard-improvements-stat-item">
                                <div className="dashboard-improvements-stat-val dashboard-improvements-stat-val--progress">{stats.inProgressActions}</div>
                                <div className="dashboard-improvements-stat-label">En Progreso</div>
                            </div>
                            <div className="dashboard-improvements-stat-item">
                                <div className="dashboard-improvements-stat-val dashboard-improvements-stat-val--pending">{stats.pendingActions}</div>
                                <div className="dashboard-improvements-stat-label">Pendientes</div>
                            </div>
                        </div>
                        <div className="dashboard-improvements-progress-container">
                            <div className="dashboard-improvements-progress-track">
                                {effectiveTotal > 0 && (
                                    <>
                                        <div className="dashboard-improvements-progress-fill--completed" style={{ width: `${(effectiveCompleted / effectiveTotal) * 100}%` }} />
                                        <div className="dashboard-improvements-progress-fill--progress" style={{ width: `${(stats.inProgressActions / effectiveTotal) * 100}%` }} />
                                    </>
                                )}
                            </div>
                            <div className="dashboard-improvements-progress-label">
                                {effectiveTotal > 0 ? Math.round((effectiveCompleted / effectiveTotal) * 100) : 0}% completado • {effectiveTotal} total
                            </div>
                        </div>
                    </div>
                </div>
            </section>
                </>
            ) : (
                /* ── COMPARATIVA DE EVALUACIONES INICIAL VS. FINAL & INFORME ── */
                <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {/* Header Banner */}
                    <div className="sprint-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Award size={22} style={{ color: 'var(--color-primary)' }} />
                                <h2 className="sprint-header-title">Comparativa de Evaluaciones: Inicial vs. Final</h2>
                            </div>
                            <p className="sprint-header-subtitle">
                                Análisis comparativo con métricas reales de tiempos, errores, tasa de éxito y satisfacción del usuario (SUS).
                            </p>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="btn btn-secondary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            aria-label="Exportar e Imprimir Informe de Resultados"
                        >
                            <Printer size={16} /> Imprimir / Exportar Informe PDF
                        </button>
                    </div>

                    {comparison ? (
                        <>
                            {/* Summary Delta Cards */}
                            <div className="dashboard-kpi-row">
                                <div className="kpi-card" role="group" aria-label="Comparativa de Tiempo">
                                    <div className="kpi-card-icon-container" style={{ background: 'var(--color-primary-light)' }}>
                                        <Clock size={20} className="text-blue-600" />
                                    </div>
                                    <div className="kpi-card-content">
                                        <div className="kpi-card-value" style={{ color: 'var(--color-primary)' }}>
                                            {comparison.finalEvaluation.averageTimeSeconds}s
                                        </div>
                                        <div className="kpi-card-label">Tiempo Promedio Final</div>
                                        <div style={{ fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, color: comparison.delta.deltaTimeSeconds <= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                            {comparison.delta.deltaTimeSeconds <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                            <span>
                                                {comparison.delta.timeReductionPercentage}% {comparison.delta.deltaTimeSeconds <= 0 ? 'más rápido' : 'más lento'}
                                                <span style={{ color: 'var(--text-disabled)', marginLeft: 4 }}>(Base: {comparison.initialEvaluation.averageTimeSeconds}s)</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="kpi-card" role="group" aria-label="Comparativa de Errores">
                                    <div className="kpi-card-icon-container" style={{ background: 'var(--color-error-light)' }}>
                                        <AlertCircle size={20} className="text-red-500" />
                                    </div>
                                    <div className="kpi-card-content">
                                        <div className="kpi-card-value" style={{ color: 'var(--color-error)' }}>
                                            {comparison.finalEvaluation.totalErrors}
                                        </div>
                                        <div className="kpi-card-label">Errores Totales Final</div>
                                        <div style={{ fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, color: comparison.delta.deltaErrors <= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                            {comparison.delta.deltaErrors <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                            <span>
                                                {comparison.delta.errorReductionPercentage}% reducción
                                                <span style={{ color: 'var(--text-disabled)', marginLeft: 4 }}>(Base: {comparison.initialEvaluation.totalErrors})</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="kpi-card" role="group" aria-label="Comparativa de Tasa de Éxito">
                                    <div className="kpi-card-icon-container" style={{ background: 'var(--color-success-light)' }}>
                                        <CheckCircle2 size={20} className="text-emerald-500" />
                                    </div>
                                    <div className="kpi-card-content">
                                        <div className="kpi-card-value" style={{ color: 'var(--color-success)' }}>
                                            {comparison.finalEvaluation.successRate}%
                                        </div>
                                        <div className="kpi-card-label">Tasa de Éxito Final</div>
                                        <div style={{ fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, color: comparison.delta.deltaSuccessRate >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                            <TrendingUp size={14} />
                                            <span>
                                                {comparison.delta.deltaSuccessRate >= 0 ? `+${comparison.delta.deltaSuccessRate}%` : `${comparison.delta.deltaSuccessRate}%`} incremento
                                                <span style={{ color: 'var(--text-disabled)', marginLeft: 4 }}>(Base: {comparison.initialEvaluation.successRate}%)</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="kpi-card" role="group" aria-label="Comparativa de Satisfacción">
                                    <div className="kpi-card-icon-container" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                                        <Sparkles size={20} style={{ color: '#d97706' }} />
                                    </div>
                                    <div className="kpi-card-content">
                                        <div className="kpi-card-value" style={{ color: '#d97706' }}>
                                            {comparison.finalEvaluation.averageSatisfaction}
                                        </div>
                                        <div className="kpi-card-label">Satisfacción SUS Final</div>
                                        <div style={{ fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, color: comparison.delta.deltaSatisfaction >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                            <TrendingUp size={14} />
                                            <span>
                                                {comparison.delta.deltaSatisfaction >= 0 ? `+${comparison.delta.deltaSatisfaction}` : comparison.delta.deltaSatisfaction} pts
                                                <span style={{ color: 'var(--text-disabled)', marginLeft: 4 }}>(Base: {comparison.initialEvaluation.averageSatisfaction})</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Side by side comparison cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                                <div className="dashboard-panel-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                                    <div className="dashboard-panel-header dashboard-panel-header--blue">
                                        <h3 className="dashboard-panel-title">Fase 1: Evaluación Inicial (Línea Base)</h3>
                                        <span className="dashboard-panel-badge">{comparison.initialEvaluation.sessionCount} sesiones</span>
                                    </div>
                                    <div className="dashboard-panel-body" style={{ padding: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Observaciones registradas:</span>
                                                <strong>{comparison.initialEvaluation.totalObservations}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Tasa de éxito de tareas:</span>
                                                <strong style={{ color: 'var(--color-primary)' }}>{comparison.initialEvaluation.successRate}%</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Tiempo promedio por tarea:</span>
                                                <strong>{comparison.initialEvaluation.averageTimeSeconds} segundos</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Errores e incidentes observados:</span>
                                                <strong style={{ color: 'var(--color-error)' }}>{comparison.initialEvaluation.totalErrors}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Puntuación de satisfacción (SUS):</span>
                                                <strong style={{ color: '#d97706' }}>{comparison.initialEvaluation.averageSatisfaction} / 100</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="dashboard-panel-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
                                    <div className="dashboard-panel-header dashboard-panel-header--emerald">
                                        <h3 className="dashboard-panel-title">Fase 2: Evaluación Final (Post-Mejoras)</h3>
                                        <span className="dashboard-panel-badge">{comparison.finalEvaluation.sessionCount} sesiones</span>
                                    </div>
                                    <div className="dashboard-panel-body" style={{ padding: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Observaciones registradas:</span>
                                                <strong>{comparison.finalEvaluation.totalObservations}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Tasa de éxito de tareas:</span>
                                                <strong style={{ color: 'var(--color-success)' }}>{comparison.finalEvaluation.successRate}%</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Tiempo promedio por tarea:</span>
                                                <strong>{comparison.finalEvaluation.averageTimeSeconds} segundos</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Errores e incidentes observados:</span>
                                                <strong style={{ color: 'var(--color-success)' }}>{comparison.finalEvaluation.totalErrors}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Puntuación de satisfacción (SUS):</span>
                                                <strong style={{ color: '#d97706' }}>{comparison.finalEvaluation.averageSatisfaction} / 100</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Task Breakdown Table */}
                            <div className="dashboard-panel-card">
                                <div className="dashboard-panel-header dashboard-panel-header--blue">
                                    <h3 className="dashboard-panel-title">Rendimiento Comparativo por Tarea de Usabilidad</h3>
                                </div>
                                <div className="dashboard-panel-body" style={{ padding: 0 }}>
                                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                        <thead>
                                            <tr style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                                <th style={{ padding: '12px 16px' }}>Tarea</th>
                                                <th style={{ padding: '12px 16px' }}>Escenario</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Tasa Éxito (Ini vs Fin)</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Tiempo Promedio (s)</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Errores (Ini vs Fin)</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Mejora Neta</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparison.initialEvaluation.taskMetrics.map((task: any, idx: number) => {
                                                const finalTask = comparison.finalEvaluation.taskMetrics[idx] || task;
                                                const timeDelta = Math.round(finalTask.finalAvgTimeSeconds - task.initialAvgTimeSeconds);
                                                const successDelta = Math.round(finalTask.finalSuccessRate - task.initialSuccessRate);
                                                return (
                                                    <tr key={task.taskId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>T{task.taskNumber}</td>
                                                        <td style={{ padding: '12px 16px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {task.scenario}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                            <span>{task.initialSuccessRate}%</span>
                                                            <span style={{ color: 'var(--text-disabled)', margin: '0 4px' }}>→</span>
                                                            <strong style={{ color: 'var(--color-success)' }}>{finalTask.finalSuccessRate}%</strong>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                            <span>{task.initialAvgTimeSeconds}s</span>
                                                            <span style={{ color: 'var(--text-disabled)', margin: '0 4px' }}>→</span>
                                                            <strong>{finalTask.finalAvgTimeSeconds}s</strong>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                            <span style={{ color: 'var(--color-error)' }}>{task.initialErrorCount}</span>
                                                            <span style={{ color: 'var(--text-disabled)', margin: '0 4px' }}>→</span>
                                                            <span style={{ color: 'var(--color-success)' }}>{finalTask.finalErrorCount}</span>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: successDelta >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                                            {successDelta >= 0 ? `+${successDelta}%` : `${successDelta}%`} éxito
                                                            {timeDelta !== 0 && (
                                                                <span style={{ display: 'block', fontSize: 11, color: timeDelta <= 0 ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 500 }}>
                                                                    {timeDelta <= 0 ? `${timeDelta}s` : `+${timeDelta}s`}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state-card" style={{ padding: 'var(--space-12)' }}>
                            <Award size={48} className="empty-state-icon" aria-hidden="true" />
                            <h3 className="empty-state-title">No hay datos de evaluación comparativa registrados</h3>
                            <p className="empty-state-subtitle">
                                Programa sesiones con etiqueta "Evaluación Inicial" y "Evaluación Final" en el módulo de Sesiones para visualizar la comparativa en tiempo real.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}