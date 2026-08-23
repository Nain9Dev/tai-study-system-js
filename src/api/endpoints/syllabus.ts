import { apiClient } from '../client';
import type { SyllabusBlock, SyllabusTopic } from '../../types/domain';

export const syllabusApi = {
  getBlocks: () => apiClient.get<SyllabusBlock[]>('/syllabus/blocks', 'blocks.json'),
  getTopics: () => apiClient.get<SyllabusTopic[]>('/syllabus/topics', 'topics.json'),
};
