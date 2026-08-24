import { useEffect, useState } from 'react';
import { WifiOff, RefreshCcw } from 'lucide-react';
import styles from './OfflineIndicator.module.css';
import { apiClient } from '../../api/client';
import { offlineQueue } from '../../api/offlineQueue';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      setIsOffline(!navigator.onLine || apiClient.getMode() === 'static');
    };
    
    const updateQueue = async () => {
      const requests = await offlineQueue.getPendingRequests();
      setPendingCount(requests.length);
    };

    const handleQueueUpdated = (e: CustomEvent<number>) => {
      setPendingCount(e.detail);
    };

    window.addEventListener('online', () => {
      checkStatus();
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 3000);
    });
    window.addEventListener('offline', checkStatus);
    window.addEventListener('offlineQueue:updated', handleQueueUpdated as EventListener);
    
    const interval = setInterval(checkStatus, 2000);
    updateQueue();
    checkStatus();

    return () => {
      window.removeEventListener('online', checkStatus);
      window.removeEventListener('offline', checkStatus);
      window.removeEventListener('offlineQueue:updated', handleQueueUpdated as EventListener);
      clearInterval(interval);
    };
  }, []);

  if (!isOffline && pendingCount === 0 && !isSyncing) return null;

  return (
    <div className={`${styles.indicator} ${isOffline ? styles.offline : styles.syncing}`}>
      <div className={styles.iconWrapper}>
        {isOffline ? <WifiOff size={16} /> : <RefreshCcw size={16} className={isSyncing ? styles.spin : ''} />}
      </div>
      <div className={styles.content}>
        <span className={styles.title}>
          {isOffline ? 'Sin conexión a Internet' : isSyncing ? 'Sincronizando cambios...' : 'Cambios locales pendientes'}
        </span>
        {pendingCount > 0 && (
          <span className={styles.subtitle}>
            {pendingCount} operaci{pendingCount === 1 ? 'ón' : 'ones'} en cola. Se sincronizarán al volver la red.
          </span>
        )}
      </div>
    </div>
  );
}
