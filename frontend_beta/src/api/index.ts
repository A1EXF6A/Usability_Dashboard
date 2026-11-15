import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

export type Guid = string;

// ── TestPlans ──
export const testPlansApi = {
    getAll: () => api.get('/TestPlans'),
    get: (id: Guid) => api.get(`/TestPlans/${id}`),
    create: (data: any) => api.post('/TestPlans', data),
    update: (id: Guid, data: any) => api.put(`/TestPlans/${id}`, data),
    updateStatus: (id: Guid, status: string) => api.patch(`/TestPlans/${id}/status`, `"${status}"`, { headers: { 'Content-Type': 'application/json' } }),
    delete: (id: Guid) => api.delete(`/TestPlans/${id}`),
};

// ── TestTasks ──
export const testTasksApi = {
    getByPlan: (planId: Guid) => api.get(`/TestTasks/by-plan/${planId}`),
    get: (id: Guid) => api.get(`/TestTasks/${id}`),
    create: (data: any) => api.post('/TestTasks', data),
    update: (id: Guid, data: any) => api.put(`/TestTasks/${id}`, data),
    delete: (id: Guid) => api.delete(`/TestTasks/${id}`),
};

// ── ModeratorScripts ──
export const moderatorScriptsApi = {
    getByPlan: (planId: Guid) => api.get(`/ModeratorScripts/by-plan/${planId}`),
    get: (id: Guid) => api.get(`/ModeratorScripts/${id}`),
    create: (data: any) => api.post('/ModeratorScripts', data),
    update: (id: Guid, data: any) => api.put(`/ModeratorScripts/${id}`, data),
    delete: (id: Guid) => api.delete(`/ModeratorScripts/${id}`),
};

// ── ObservationLogs ──
export const observationLogsApi = {
    getAll: (testSessionId?: Guid, testTaskId?: Guid) =>
        api.get('/ObservationLogs', { params: { testSessionId, testTaskId } }),
    get: (id: Guid) => api.get(`/ObservationLogs/${id}`),
    create: (data: any) => api.post('/ObservationLogs', data),
    update: (id: Guid, data: any) => api.put(`/ObservationLogs/${id}`, data),
    delete: (id: Guid) => api.delete(`/ObservationLogs/${id}`),
};

// ── Findings ──
export const findingsApi = {
    getByPlan: (planId: Guid) => api.get(`/Findings/by-plan/${planId}`),
    get: (id: Guid) => api.get(`/Findings/${id}`),
    create: (data: any) => api.post('/Findings', data),
    update: (id: Guid, data: any) => api.put(`/Findings/${id}`, data),
    delete: (id: Guid) => api.delete(`/Findings/${id}`),
};

// ── ImprovementActions ──
export const improvementActionsApi = {
    getByFinding: (findingId: Guid) => api.get(`/ImprovementActions/by-finding/${findingId}`),
    get: (id: Guid) => api.get(`/ImprovementActions/${id}`),
    create: (data: any) => api.post('/ImprovementActions', data),
    update: (id: Guid, data: any) => api.put(`/ImprovementActions/${id}`, data),
    updateStatus: (id: Guid, status: string) =>
        api.patch(`/ImprovementActions/${id}/status`, { status }),
    delete: (id: Guid) => api.delete(`/ImprovementActions/${id}`),
};

// ── Participants ──
export const participantsApi = {
    getAll: () => api.get('/Participants'),
    get: (id: Guid) => api.get(`/Participants/${id}`),
    create: (data: any) => api.post('/Participants', data),
    update: (id: Guid, data: any) => api.put(`/Participants/${id}`, data),
    delete: (id: Guid) => api.delete(`/Participants/${id}`),
};

// ── TestSessions ──
export const testSessionsApi = {
    getAll: (testPlanId?: Guid) => api.get('/TestSessions', { params: { testPlanId } }),
    get: (id: Guid) => api.get(`/TestSessions/${id}`),
    create: (data: any) => api.post('/TestSessions', data),
    update: (id: Guid, data: any) => api.put(`/TestSessions/${id}`, data),
    delete: (id: Guid) => api.delete(`/TestSessions/${id}`),
};

// ── Dashboard ──
export const dashboardApi = {
    getStats: (testPlanId?: Guid) => api.get('/Dashboard/stats', { params: { testPlanId } }),
};

// ── SprintBacklog ──
export const sprintBacklogApi = {
    getByPlan: (planId: Guid) => api.get(`/SprintBacklog/by-plan/${planId}`),
    generate: (data: { testPlanId: Guid; userApiKey?: string }) => api.post('/SprintBacklog/generate', data),
    save: (planId: Guid, data: { sprintName: string; sprintGoal: string; contentJson: string; rawMarkdown: string }) => api.post(`/SprintBacklog/save/${planId}`, data),
    chat: (data: { prompt: string; activePageName: string; contextJson: string }) => api.post('/SprintBacklog/chat', data),
};

// ── Módulo SCRUM Real ──
export const scrumApi = {
    // Product Backlog (Historias de Usuario)
    getBacklog: (planId: Guid) => api.get(`/scrum/backlog/${planId}`),
    getStory: (id: Guid) => api.get(`/scrum/story/${id}`),
    createStory: (data: any) => api.post('/scrum/story', data),
    updateStory: (id: Guid, data: any) => api.put(`/scrum/story/${id}`, data),
    deleteStory: (id: Guid) => api.delete(`/scrum/story/${id}`),
    reorderStories: (planId: Guid, storyIds: Guid[]) => api.post(`/scrum/backlog/reorder/${planId}`, { storyIds }),
    sortByQuotient: (planId: Guid) => api.post(`/scrum/backlog/sort-by-quotient/${planId}`),

    // Sprints
    getSprints: (planId: Guid) => api.get(`/scrum/sprints/${planId}`),
    getSprintDetail: (id: Guid) => api.get(`/scrum/sprint/${id}/detail`),
    createSprint: (data: any) => api.post('/scrum/sprint', data),
    updateSprint: (id: Guid, data: any) => api.put(`/scrum/sprint/${id}`, data),
    deleteSprint: (id: Guid) => api.delete(`/scrum/sprint/${id}`),
    assignStories: (sprintId: Guid, storyIds: Guid[]) => api.post(`/scrum/sprint/${sprintId}/assign-stories`, { storyIds }),

    // Tareas del Sprint (Kanban)
    getTasks: (sprintId: Guid) => api.get(`/scrum/tasks/${sprintId}`),
    createTask: (data: any) => api.post('/scrum/task', data),
    updateTask: (id: Guid, data: any) => api.put(`/scrum/task/${id}`, data),
    updateTaskStatus: (id: Guid, status: string) => api.patch(`/scrum/task/${id}/status`, { status }),
    deleteTask: (id: Guid) => api.delete(`/scrum/task/${id}`),

    // Tareas No Planificadas (TNP)
    getUnplanned: (sprintId: Guid) => api.get(`/scrum/unplanned/${sprintId}`),
    createUnplanned: (data: any) => api.post('/scrum/unplanned', data),
    deleteUnplanned: (id: Guid) => api.delete(`/scrum/unplanned/${id}`),

    // Daily Log
    getDaily: (sprintId: Guid) => api.get(`/scrum/daily/${sprintId}`),
    createDaily: (data: any) => api.post('/scrum/daily', data),
    deleteDaily: (id: Guid) => api.delete(`/scrum/daily/${id}`),

    // Retrospectiva
    getRetrospective: (sprintId: Guid) => api.get(`/scrum/retrospective/${sprintId}`),
    saveRetrospective: (sprintId: Guid, data: any) => api.post(`/scrum/retrospective/${sprintId}`, data),

    // Seed y Exportación
    seed: (planId: Guid) => api.post(`/scrum/seed/${planId}`),
    exportMatrixUrl: (sprintId: Guid) => `/api/scrum/export-matrix/${sprintId}`,
};

// ── Asistente IA de Análisis de Observaciones ──
export const aiApi = {
    analyzeObservations: (planId: Guid, userApiKey?: string) =>
        api.post('/ai/analyze-observations', { testPlanId: planId, userApiKey }),
};

export default api;
