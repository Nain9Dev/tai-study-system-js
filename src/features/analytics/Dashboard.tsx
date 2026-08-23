import { useEffect } from 'react';
import { useAnalyticsStore } from '../../store/useAnalyticsStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function Dashboard() {
  const { 
    estadisticas, 
    isLoading, 
    error, 
    isOfflineMode, 
    fetchEstadisticas, 
    resetAnalytics 
  } = useAnalyticsStore();

  useEffect(() => {
    fetchEstadisticas();
  }, [fetchEstadisticas]);

  const handleReset = () => {
    if (window.confirm("¿Estás seguro de que deseas borrar todo tu historial y estadísticas de estudio guardadas en este navegador?")) {
      resetAnalytics();
    }
  };

  if (isLoading) {
    return (
      <Card title="Panel de Rendimiento Opositor">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          Cargando métricas...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Panel de Rendimiento Opositor">
        <div style={{ padding: '1rem', backgroundColor: 'var(--color-danger)', color: '#fff', borderRadius: '4px' }}>
          {error}
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card title="Panel de Rendimiento Opositor (Almacenamiento Local)">
        {isOfflineMode && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-warning)', color: '#000', borderRadius: '4px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span> 
            <b>Modo Offline:</b> Mostrando estadísticas guardadas localmente o simuladas.
          </div>
        )}

        <p className="muted" style={{ marginBottom: '2rem' }}>
          Tus resultados y precisión te permiten enfocar tus esfuerzos de estudio diario.
        </p>

        {estadisticas ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              <Card>
                <div className="muted">Total Preguntas</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{estadisticas.totalPreguntas}</div>
              </Card>
              <Card>
                <div className="muted">Nota Media Oficial INAP</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-strong)' }}>
                  {estadisticas.notaMedia.toFixed(2)} / 10
                </div>
              </Card>
              <Card>
                <div className="muted">Aciertos / Fallos</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  <span style={{ color: 'var(--color-success)' }}>{estadisticas.aciertos}</span> / <span style={{ color: 'var(--color-danger)' }}>{estadisticas.fallos}</span>
                </div>
              </Card>
              <Card>
                <div className="muted">Tasa de Acierto</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {estadisticas.totalPreguntas > 0 ? ((estadisticas.aciertos / estadisticas.totalPreguntas) * 100).toFixed(0) : 0} %
                </div>
              </Card>
            </div>

            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Desglose de Precisión por Bloque Temario</h3>
            <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-line)' }}>
                    <th style={{ padding: '0.75rem' }}>Bloque del Temario TAI</th>
                    <th style={{ padding: '0.75rem' }}>Precisión (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(estadisticas.progresoPorBloque).length === 0 ? (
                    <tr>
                      <td colSpan={2} className="muted" style={{ padding: '1rem', textAlign: 'center' }}>
                        No hay suficientes datos registrados todavía. Realiza un simulacro para generar estadísticas.
                      </td>
                    </tr>
                  ) : (
                    Object.entries(estadisticas.progresoPorBloque).map(([bloque, accuracy]) => (
                      <tr key={bloque} style={{ borderBottom: '1px solid var(--color-line)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{bloque}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ marginBottom: '0.25rem' }}>{accuracy.toFixed(0)} %</div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-line)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${accuracy}%`, height: '100%', backgroundColor: accuracy >= 50 ? 'var(--color-success)' : 'var(--color-danger)' }} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="muted" style={{ textAlign: 'center', padding: '2rem' }}>
            No hay estadísticas disponibles.
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="danger" onClick={handleReset}>Reiniciar Historial Local</Button>
        </div>
      </Card>
    </div>
  );
}
