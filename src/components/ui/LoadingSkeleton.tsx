import styles from './LoadingSkeleton.module.css';

interface SkeletonProps {
  type?: 'card' | 'text' | 'title' | 'button';
  count?: number;
}

export function LoadingSkeleton({ type = 'card', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={`${styles.skeleton} ${styles[type]}`}></div>
      ))}
    </>
  );
}
