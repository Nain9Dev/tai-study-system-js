import type { Pregunta } from '../../types/domain';
import { useStudyStore } from '../../store/useStudyStore';
import { Card } from '../../components/ui/Card';
import styles from './QuestionCard.module.css';

interface QuestionCardProps {
  pregunta: Pregunta;
  questionNumber: number;
}

export function QuestionCard({ pregunta, questionNumber }: QuestionCardProps) {
  const { mode, selectedAnswers, answerQuestion } = useStudyStore();
  const selectedOptionIndex = selectedAnswers[pregunta.id];
  const isStudyMode = mode === 'study';
  const hasAnswered = selectedOptionIndex !== undefined;

  const handleOptionClick = (index: number) => {
    if (isStudyMode && hasAnswered) return;
    answerQuestion(pregunta.id, index);
  };

  const getOptionClassName = (index: number) => {
    let classes = [styles.optionBtn];
    
    if (isStudyMode && hasAnswered) {
      classes.push(styles.disabled);
      if (index === pregunta.respuestaCorrecta) {
        classes.push(styles.correct);
      } else if (index === selectedOptionIndex) {
        classes.push(styles.incorrect);
      }
    } else if (!isStudyMode && selectedOptionIndex === index) {
      classes.push(styles.selected);
    }
    
    return classes.join(' ');
  };

  return (
    <Card className={styles.card}>
      <div className={styles.title}>
        <strong>{questionNumber}.</strong> 
        <span>{pregunta.enunciado}</span>
      </div>

      <div className={styles.optionsList}>
        {pregunta.opciones.map((optText, idx) => (
          <button
            key={idx}
            type="button"
            className={getOptionClassName(idx)}
            onClick={() => handleOptionClick(idx)}
            disabled={isStudyMode && hasAnswered}
          >
            <strong>{String.fromCharCode(65 + idx)}.</strong>
            <span>{optText}</span>
          </button>
        ))}
      </div>

      {isStudyMode && hasAnswered && (
        <div className={styles.explanation}>
          <b>Fundamento y Repaso:</b> La respuesta correcta corresponde a la opción señalada en verde. 
          {pregunta.bloque && <span> Bloque asociado: <i>{pregunta.bloque}</i>.</span>}
          {pregunta.tema && <span> Tema: <i>{pregunta.tema}</i>.</span>}
        </div>
      )}
    </Card>
  );
}
