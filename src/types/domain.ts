export interface SyllabusBlock {
  id: number;
  code: string;
  name: string;
}

export interface SyllabusTopic {
  id: number;
  blockId: number;
  topicNumber: number;
  title: string;
}

export interface Pregunta {
  id: number;
  enunciado: string;
  opciones: string[];
  respuestaCorrecta: number; // index of 'opciones' or specific option id
  bloque?: string;
  tema?: string;
}

export interface Intento {
  id?: number;
  fecha: string;
  aciertos: number;
  fallos: number;
  total: number;
  nota: number;
  bloque?: string;
}

export interface Estadisticas {
  totalPreguntas: number;
  aciertos: number;
  fallos: number;
  notaMedia: number;
  progresoPorBloque: Record<string, number>; // Record of block name/id to percentage or correct count
}

export interface BlockPerformance {
  total: number;
  correct: number;
  wrong: number;
}
