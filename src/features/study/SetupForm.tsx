import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { usePreguntas } from '../../hooks/usePreguntas';
import { useStudyStore } from '../../store/useStudyStore';
import { apiClient } from '../../api/client';
import type { StudyMode } from '../../store/useStudyStore';
import styles from './SetupForm.module.css';

export function SetupForm() {
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [localMode, setLocalMode] = useState<StudyMode>('study');
  
  const { mutateAsync: fetchPreguntas, isPending: isLoading, error } = usePreguntas();
  const setMode = useStudyStore((state) => state.setMode);
  const isOfflineMode = apiClient.getMode() === 'static';

  const handleGenerate = async () => {
    setMode(localMode);
    await fetchPreguntas(selectedBlock);
  };

  return (
    <Card title="Configuración de la Prueba">
      <div className={styles.setupContainer}>
        {error && (
          <div className={styles.errorBanner}>
            {error instanceof Error ? error.message : 'Error desconocido'}
          </div>
        )}

        {isOfflineMode && (
          <div className={styles.offlineBanner}>
            <span>⚠️</span> 
            <div><b>Modo Offline Activo:</b> No se pudo conectar al servidor. Se están utilizando los datos locales de respaldo.</div>
          </div>
        )}

        <div className={styles.grid}>
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

        <div className={styles.modeSection}>
          <div className={styles.modeLabel}>Modalidad de Prueba y Evaluación:</div>
          <div className={styles.radioGroup}>
            <label className={`${styles.radioLabel} ${isLoading ? styles.disabled : ''}`}>
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
            <label className={`${styles.radioLabel} ${isLoading ? styles.disabled : ''}`}>
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

        <div className={styles.actions}>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Conectando y Generando...' : 'Generar y Comenzar Simulacro'}
          </Button>
          <span className={styles.statusText}>
            {isLoading ? 'Esperando al servidor...' : 'Conexión Híbrida lista'}
          </span>
        </div>
      </div>
    </Card>
  );
}
