import { createFileRoute } from '@tanstack/react-router';
import { useStudyStore } from '../store/useStudyStore';
import { SetupForm } from '../features/study/SetupForm';
import { ExamEngine } from '../features/exam/ExamEngine';
import styles from './Dashboard.module.css';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const isTestActive = useStudyStore((state) => state.isTestActive);
  const isTestFinished = useStudyStore((state) => state.isTestFinished);

  return (
    <>
      <header className={styles.hero}>
        <h1 className={styles.title}>Sistema de Oposiciones <span>TAI</span></h1>
        <p className={styles.subtitle}>
          Plataforma inteligente de autoevaluación interactiva con baremo oficial INAP (+1,0 / -0,33), modo de estudio en tiempo real y analítica persistente.
        </p>
      </header>

      {(!isTestActive && !isTestFinished) ? <SetupForm /> : <ExamEngine />}
    </>
  );
}
