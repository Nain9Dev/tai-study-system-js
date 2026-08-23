import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { usePreguntas } from '../../hooks/usePreguntas';
import { useStudyStore } from '../../store/useStudyStore';
import type { StudyMode } from '../../store/useStudyStore';

export function SetupForm() {
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [localMode, setLocalMode] = useState<StudyMode>('study');
  
  const { fetchPreguntas, isLoading, error, isOfflineMode } = usePreguntas();
  const setMode = useStudyStore((state) => state.setMode);

  const handleGenerate = async () => {
    setMode(localMode);
    await fetchPreguntas(selectedBlock);
  };

  return (
    <Card title="Configuración de la Prueba">
      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--color-danger)', color: '#fff', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {isOfflineMode && (
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-warning)', color: '#000', borderRadius: '4px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span> 
          <b>Modo Offline Activo:</b> No se pudo conectar al servidor. Se están utilizando los datos locales de respaldo.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Select 
          label="Bloque del Temario"
          value={selectedBlock}
          onChange={(e) => setSelectedBlock(e.target.value)}
          options={[
            { value: 'all', label: 'Todos los bloques TAI' },
            { value: '1', label: 'I - Organización del Estado y Administración Electrónica' },
            { value: '2', label: 'II - Tecnología Básica' },
            { value: '3', label: 'III - Desarrollo de Sistemas' },
            { value: '4', label: 'IV - Sistemas y Comunicaciones' }
          ]}
          disabled={isLoading}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Modalidad de Prueba y Evaluación:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            <input 
              type="radio" 
              name="studyMode" 
              value="study" 
              checked={localMode === 'study'} 
              onChange={() => setLocalMode('study')} 
              disabled={isLoading}
            />
            <span><b>Modo Estudio / Repaso</b> (Corrección inmediata y retroalimentación)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            <input 
              type="radio" 
              name="studyMode" 
              value="exam" 
              checked={localMode === 'exam'} 
              onChange={() => setLocalMode('exam')}
              disabled={isLoading} 
            />
            <span><b>Modo Examen Oficial INAP</b> (Baremación +1 / -0,33)</span>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? 'Conectando y Generando...' : 'Generar y Comenzar Simulacro'}
        </Button>
        <span className="muted" style={{ fontSize: '13px' }}>
          {isLoading ? 'Esperando al servidor...' : 'Conexión Híbrida lista'}
        </span>
      </div>
    </Card>
  );
}
