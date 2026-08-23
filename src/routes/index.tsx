import { createFileRoute } from '@tanstack/react-router';
import { useStudyStore } from '../store/useStudyStore';
import { SetupForm } from '../features/study/SetupForm';
import { ExamEngine } from '../features/exam/ExamEngine';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const isTestActive = useStudyStore((state) => state.isTestActive);
  const isTestFinished = useStudyStore((state) => state.isTestFinished);

  return (
    <>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Sistema de Oposiciones TAI</h1>
        <p className="muted" style={{ maxWidth: '800px', margin: '0 auto' }}>
          Plataforma inteligente de autoevaluación interactiva con baremo oficial INAP (+1,0 / -0,33), modo de estudio en tiempo real y analítica persistente sin coste de servidor.
        </p>
      </header>

      {(!isTestActive && !isTestFinished) ? <SetupForm /> : <ExamEngine />}
    </>
  );
}
