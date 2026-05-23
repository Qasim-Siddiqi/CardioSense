import api from "./axios";

// Patient: submit health form
// data shape matches SubmitHealthDto
export const submitHealth = (data) => api.post("/health/submit", data);

// Patient: get own submission history
export const getMySubmissions = () => api.get("/health/my-submissions");

// Patient: get single submission by id
export const getMySubmissionById = (id) => api.get(`/health/my-submissions/${id}`);

// Doctor: get all submissions (with optional filters)
// params: { riskLevel, page, pageSize }
export const getAllSubmissions = (params) => api.get("/health/all", { params });

// Doctor: get any single submission by id
export const getSubmissionById = (id) => api.get(`/health/${id}`);

// Doctor: add/update notes on a submission
export const addNotes = (id, notes) => api.put(`/health/${id}/notes`, { notes });
