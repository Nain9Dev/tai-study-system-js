import { useState } from 'react';
import { useStudyStore } from '../../store/useStudyStore';
import { useAnalyticsStore } from '../../store/useAnalyticsStore';
import { calculateINAPScore } from '../../utils/scoring';
import { QuestionCard } from '../study/QuestionCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function ExamEngine() {
  const { 
    questions, 
    mode, 
    isTestFinished, 
    selectedAnswers,
    finishTest,
    resetTest
  } = useStudyStore();
  const { submitIntento } = useAnalyticsStore();

  const [isReviewing, setIsReviewing] = useState(false);

  const handleFinish = () => {
    finishTest();

    let correctCount = 0;
    let wrongCount = 0;
    let blankCount = 0;

    questions.forEach(q => {
      const userSelected = selectedAnswers[q.id];

      if (userSelected === undefined) {
        blankCount++;
      } else if (userSelected === q.respuestaCorrecta) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const { officialGrade } = calculateINAPScore(questions.length, correctCount, wrongCount);
    
    submitIntento({
      fecha: new Date().toISOString(),
      aciertos: correctCount,
      fallos: wrongCount,
      total: questions.length,
      nota: officialGrade,
      // Here you could pass the block if the exam was filtered, but since we don't have it easily accessible here, we leave it optional.
    });
  };

  if (isTestFinished && !isReviewing) {
    let correctCount = 0;
    let wrongCount = 0;
    let blankCount = 0;

    questions.forEach(q => {
      const userSelected = selectedAnswers[q.id];
      if (userSelected === undefined) blankCount++;
      else if (userSelected === q.respuestaCorrecta) correctCount++;
      else wrongCount++;
    });

    const { officialGrade } = calculateINAPScore(questions.length, correctCount, wrongCount);

    return (
      <Card title="Resultado Oficial de la Evaluación (Baremo INAP)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Card>
            <div className="muted">Nota Baremada INAP</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: officialGrade >= 5 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {officialGrade.toFixed(2)} / 10
            </div>
          </Card>
          <Card>
            <div className="muted">Aciertos (+1,00 pt)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-success)' }}>{correctCount}</div>
          </Card>
          <Card>
            <div className="muted">Fallos (-0,33 pts)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-danger)' }}>{wrongCount}</div>
          </Card>
          <Card>
            <div className="muted">En Blanco (0,00 pts)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{blankCount}</div>
          </Card>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button onClick={() => {
            useStudyStore.getState().setMode('study'); // Switch visually
            setIsReviewing(true);
          }} variant="secondary">Revisar Soluciones Detalladas</Button>
          <Button onClick={resetTest}>Configurar Nuevo Simulacro</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>
        {isReviewing ? "Revisión de Soluciones del Examen" : mode === 'study' ? `Práctica Activa (${questions.length} preguntas)` : `Simulacro Oficial INAP (${questions.length} preguntas)`}
      </h2>

      <div>
        {questions.map((q, idx) => (
          <QuestionCard 
            key={q.id} 
            pregunta={q} 
            questionNumber={idx + 1} 
          />
        ))}
      </div>

      {!isReviewing && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Button onClick={handleFinish}>Finalizar y Evaluar Examen</Button>
          <Button onClick={resetTest} variant="secondary">Abandonar Simulacro</Button>
        </div>
      )}
      {isReviewing && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Button onClick={resetTest}>Configurar Nuevo Simulacro</Button>
        </div>
      )}
    </div>
  );
}
