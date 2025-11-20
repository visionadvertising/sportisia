export default function FieldCardSkeleton() {
  return (
    <div className="card">
      <div style={{
        width: '100%',
        height: '200px',
        marginBottom: '16px',
        borderRadius: '8px',
        backgroundColor: '#e5e7eb',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }} />
      <div style={{
        width: '80px',
        height: '24px',
        marginBottom: '16px',
        borderRadius: '4px',
        backgroundColor: '#e5e7eb',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }} />
      <div style={{
        width: '70%',
        height: '24px',
        marginBottom: '12px',
        borderRadius: '4px',
        backgroundColor: '#e5e7eb',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }} />
      <div style={{
        width: '100%',
        height: '16px',
        marginBottom: '8px',
        borderRadius: '4px',
        backgroundColor: '#e5e7eb',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }} />
      <div style={{
        width: '90%',
        height: '16px',
        marginBottom: '12px',
        borderRadius: '4px',
        backgroundColor: '#e5e7eb',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }} />
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}


