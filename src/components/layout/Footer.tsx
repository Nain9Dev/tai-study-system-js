export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--color-line)', padding: '2rem 0', marginTop: '4rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
      <div className="shell" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p>© {new Date().getFullYear()} NainDev. Analytics privacy-first integradas.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="https://github.com/Nain9Dev" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="#">Volver arriba</a>
        </div>
      </div>
    </footer>
  );
}
