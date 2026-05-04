const API_BASE = '/api';

export interface Professor {
  id: string;
  name: string;
  department: string;
  courses: string[];
  relatedProfessors: string[];
  searchCount: number;
  avgMetrics: {
    score: number;
    sweety: number;
    coolness: number;
    knowledge: number;
  };
  comments: Comment[];
  beatenCount: number;
  photoUrl: string;
  photoHitUrl: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  courseName: string;
  date: string;
  metrics: {
    score: number;
    sweety: number;
    coolness: number;
    knowledge: number;
  };
}

export const api = {
  async getProfessors(): Promise<Professor[]> {
    const response = await fetch(`${API_BASE}/professors`);
    return response.json();
  },

  async addProfessor(professor: Omit<Professor, 'id'>): Promise<Professor> {
    const response = await fetch(`${API_BASE}/professors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(professor),
    });
    return response.json();
  },

  async updateProfessor(id: string, updates: Partial<Professor>): Promise<Professor> {
    const response = await fetch(`${API_BASE}/professors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  async addComment(professorId: string, comment: Omit<Comment, 'id'>): Promise<Comment> {
    const response = await fetch(`${API_BASE}/professors/${professorId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
    return response.json();
  },

  async incrementBeaten(professorId: string): Promise<{ beatenCount: number }> {
    const response = await fetch(`${API_BASE}/professors/${professorId}/beaten`, {
      method: 'PUT',
    });
    return response.json();
  },

  async incrementSearch(professorId: string): Promise<{ searchCount: number }> {
    const response = await fetch(`${API_BASE}/professors/${professorId}/search`, {
      method: 'PUT',
    });
    return response.json();
  },
};