import { createFileRoute } from '@tanstack/react-router';
import { useStudyStore } from '../store/useStudyStore';
import { SetupForm } from '../features/study/SetupForm';
import { ExamEngine } from '../features/exam/ExamEngine';
import styles from './Home.module.css';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const phase = useStudyStore((state) => state.phase);

  return (
    <div className="stack">
      {phase === 'setup' && (
        <header className={styles.hero}>
          <span className="eyebrow">Oposiciones TAI · INAP</span>
          <h1 className={styles.title}>
            Practica como en el <span className="title-accent">examen real</span>
          </h1>
          <p className="lead">
            Simulacros sobre los cuatro bloques del temario, corregidos con el baremo oficial
            (+1,00 por acierto, −0,33 por fallo, 0,00 en blanco) y analítica que te dice en qué
            bloque conviene insistir.
          </p>
        </header>
      )}

      {phase === 'setup' ? <SetupForm /> : <ExamEngine />}
    </div>
  );
}
