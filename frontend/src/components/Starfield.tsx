'use client'

export function Starfield() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden">
      <style>{`
        @keyframes starfieldScroll {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 -2000px;
          }
        }
        
        @keyframes glowBreathAnim {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        
        .starfield-bg {
          animation: starfieldScroll 120s linear infinite;
          background-attachment: fixed;
        }
        
        .glow-breath {
          animation: glowBreathAnim 8s ease-in-out infinite;
        }
      `}</style>
      
      {/* Stars background */}
      <div 
        className="absolute inset-0 starfield-bg"
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 10% 20%, #ffffff, transparent),
            radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,1), transparent),
            radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,0.95), transparent),
            radial-gradient(1.5px 1.5px at 55% 40%, rgba(255,255,255,1), transparent),
            radial-gradient(1.8px 1.8px at 75% 80%, rgba(255,255,255,0.9), transparent),
            radial-gradient(1.2px 1.2px at 85% 25%, rgba(255,255,255,1), transparent),
            radial-gradient(1.3px 1.3px at 15% 80%, rgba(255,255,255,0.95), transparent),
            radial-gradient(2px 2px at 50% 15%, rgba(255,255,255,1), transparent),
            radial-gradient(1.5px 1.5px at 25% 50%, rgba(255,255,255,0.92), transparent),
            radial-gradient(1.4px 1.4px at 70% 60%, rgba(255,255,255,0.9), transparent),
            radial-gradient(1.6px 1.6px at 5% 50%, rgba(255,255,255,0.98), transparent),
            radial-gradient(1.8px 1.8px at 95% 45%, rgba(255,255,255,0.92), transparent),
            radial-gradient(1.2px 1.2px at 40% 10%, rgba(255,255,255,0.88), transparent),
            radial-gradient(2.1px 2.1px at 60% 90%, rgba(255,255,255,1), transparent),
            radial-gradient(1.4px 1.4px at 35% 35%, rgba(255,255,255,0.95), transparent),
            radial-gradient(1.7px 1.7px at 12% 65%, rgba(255,255,255,0.93), transparent),
            radial-gradient(1.3px 1.3px at 88% 12%, rgba(255,255,255,0.87), transparent),
            radial-gradient(1.9px 1.9px at 45% 75%, rgba(255,255,255,0.96), transparent),
            radial-gradient(1.5px 1.5px at 72% 22%, rgba(255,255,255,0.91), transparent),
            radial-gradient(1.6px 1.6px at 18% 42%, rgba(255,255,255,0.94), transparent)
          `,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'repeat',
        }} 
      />
      
      {/* Glow effects */}
      <div 
        className="absolute inset-0 pointer-events-none glow-breath"
        style={{
          background: `
            radial-gradient(circle at 10% 25%, rgba(255, 255, 255, 0.25), transparent 70%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15), transparent 65%),
            radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0.2), transparent 66%),
            radial-gradient(ellipse 70% 60% at 15% 30%, rgba(232, 25, 10, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 85% 70%, rgba(255, 100, 50, 0.1) 0%, transparent 60%)
          `,
        }}
      />

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
          opacity: 0.4
        }}
      />
    </div>
  )
}
