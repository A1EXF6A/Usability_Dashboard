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
    getEvaluationComparison: (testPlanId: Guid) => api.get(`/Dashboard/evaluation-comparison/${testPlanId}`),
};

// ── ProductBacklog ──
export const productBacklogApi = {
    getByPlan: (planId: Guid, params?: { search?: string; priority?: string; status?: string; sortBy?: string }) =>
        api.get(`/ProductBacklog/by-plan/${planId}`, { params }),
    get: (id: Guid) => api.get(`/ProductBacklog/${id}`),
    create: (data: any) => api.post('/ProductBacklog', data),
    update: (id: Guid, data: any) => api.put(`/ProductBacklog/${id}`, data),
    delete: (id: Guid) => api.delete(`/ProductBacklog/${id}`),
    importApproved: (planId: Guid, data: { stories: any[] }) => api.post(`/ProductBacklog/import-approved/${planId}`, data),
};

// ── Sprints ──
export const sprintsApi = {
    getByPlan: (planId: Guid) => api.get(`/Sprints/by-plan/${planId}`),
    get: (id: Guid) => api.get(`/Sprints/${id}`),
    create: (data: any) => api.post('/Sprints', data),
    update: (id: Guid, data: any) => api.put(`/Sprints/${id}`, data),
    delete: (id: Guid) => api.delete(`/Sprints/${id}`),
    assignStory: (sprintId: Guid, storyId: Guid) => api.post(`/Sprints/${sprintId}/assign-story/${storyId}`),
    removeStory: (storyId: Guid) => api.post(`/Sprints/remove-story/${storyId}`),
};

// ── Kanban ──
export const kanbanApi = {
    getTasksBySprint: (sprintId: Guid) => api.get(`/Kanban/tasks/by-sprint/${sprintId}`),
    getTask: (id: Guid) => api.get(`/Kanban/tasks/${id}`),
    createTask: (data: any) => api.post('/Kanban/tasks', data),
    updateTask: (id: Guid, data: any) => api.put(`/Kanban/tasks/${id}`, data),
    updateStatus: (id: Guid, status: string) => api.patch(`/Kanban/tasks/${id}/status`, { status }),
    updateAssignee: (id: Guid, assignee: string) => api.patch(`/Kanban/tasks/${id}/assignee`, { assignee }),
    deleteTask: (id: Guid) => api.delete(`/Kanban/tasks/${id}`),
    getTeamProgress: (sprintId: Guid) => api.get(`/Kanban/team-progress/${sprintId}`),
};

// ── Retrospectives ──
export const retrospectivesApi = {
    getBySprint: (sprintId: Guid) => api.get(`/Retrospectives/by-sprint/${sprintId}`),
    save: (data: any) => api.post('/Retrospectives', data),
};

// ── AiAssistant ──
export const aiAssistantApi = {
    analyzeUsability: (planId: Guid, data?: { userApiKey?: string }) => api.post(`/AiAssistant/analyze-usability/${planId}`, data || {}),
};

// ── SprintBacklog ──
export const sprintBacklogApi = {
    getByPlan: (planId: Guid) => api.get(`/SprintBacklog/by-plan/${planId}`),
    generate: (data: { testPlanId: Guid; userApiKey?: string }) => api.post('/SprintBacklog/generate', data),
    save: (planId: Guid, data: { sprintName: string; sprintGoal: string; contentJson: string; rawMarkdown: string }) => api.post(`/SprintBacklog/save/${planId}`, data),
    chat: (data: { prompt: string; activePageName: string; contextJson: string }) => api.post('/SprintBacklog/chat', data),
};

export default api;
