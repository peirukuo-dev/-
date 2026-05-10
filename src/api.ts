
const API_BASE = 'http://localhost:5001/api';


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
  heartCount: number;
  flowerCount: number;
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

function normalizeProfessor(raw: any): Professor {
  return {
    id: raw.id || raw._id || '',
    name: raw.name || '',
    department: raw.department || '',
    courses: Array.isArray(raw.courses) ? raw.courses : [],
    relatedProfessors: Array.isArray(raw.relatedProfessors) ? raw.relatedProfessors : [],
    searchCount: raw.searchCount ?? 0,
    avgMetrics: {
      score: raw.avgMetrics?.score ?? 0,
      sweety: raw.avgMetrics?.sweety ?? 0,
      coolness: raw.avgMetrics?.coolness ?? 0,
      knowledge: raw.avgMetrics?.knowledge ?? 0,
    },
    comments: Array.isArray(raw.comments) ? raw.comments : [],
    beatenCount: raw.beatenCount ?? 0,
    heartCount: raw.heartCount ?? 0,
    flowerCount: raw.flowerCount ?? 0,
    photoUrl: raw.photoUrl || '',
    photoHitUrl: raw.photoHitUrl || '',
  };
}

export const api = {
  async getProfessors(): Promise<Professor[]> {
    const response = await fetch(`${API_BASE}/professors`);
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeProfessor) : [];
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

  async giveHeart(professorId: string): Promise<{ heartCount: number }> {
    const response = await fetch(`${API_BASE}/professors/${professorId}/heart`, {
      method: 'PUT',
    });
    return response.json();
  },

  async giveFlower(professorId: string): Promise<{ flowerCount: number }> {
    const response = await fetch(`${API_BASE}/professors/${professorId}/flower`, {
      method: 'PUT',
    });
    return response.json();
  },
};