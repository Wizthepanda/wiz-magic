import { useEffect } from 'react';

const About = () => {
  useEffect(() => {
    document.title = 'About WIZ — Watch YouTube, Earn Rewards';
  }, []);

  return (
    <div 
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        lineHeight: 1.6,
        color: '#2D2D2D',
        margin: 0,
        padding: 0,
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%, #f8fafc 100%)',
        minHeight: '100vh',
        position: 'relative'
      }}
    >
      {/* White glassmorphism background */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden', 
        zIndex: -1 
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at 30% 20%, rgba(167, 139, 250, 0.08) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 80%, rgba(14, 165, 233, 0.06) 0%, transparent 50%)`
        }} />
        
        {/* Floating sparkles for white theme */}
        {[
          { left: '15%', top: '25%', delay: '0s', size: '4px' },
          { left: '85%', top: '15%', delay: '3s', size: '4px' },
          { left: '70%', top: '75%', delay: '6s', size: '4px' },
          { left: '25%', top: '65%', delay: '9s', size: '4px' },
          { left: '50%', top: '40%', delay: '12s', size: '4px' },
          { left: '90%', top: '50%', delay: '15s', size: '4px' },
        ].map((sparkle, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: sparkle.size,
              height: sparkle.size,
              background: 'radial-gradient(circle, rgba(167, 139, 250, 0.6) 0%, rgba(14, 165, 233, 0.3) 50%, transparent 100%)',
              borderRadius: '50%',
              left: sparkle.left,
              top: sparkle.top,
              opacity: 0.4,
              filter: 'blur(0.5px)',
              animation: `floatWhite 12s ease-in-out infinite ${sparkle.delay}`
            }}
          />
        ))}
      </div>

      {/* Glassmorphic Back to Home Link */}
      <a 
        href="/" 
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(167, 139, 250, 0.3)',
          borderRadius: '50px',
          padding: '12px 24px',
          color: '#6366f1',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '14px',
          zIndex: 100,
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(167, 139, 250, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)';
          e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)';
          e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.3)';
        }}
      >
        ← Back to WIZ
      </a>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px 60px' }}>
        {/* Hero Section */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '80px',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(167, 139, 250, 0.2)',
          borderRadius: '32px',
          padding: '60px 40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
        }}>
          <h1 style={{
            fontSize: '4.5rem',
            fontWeight: 900,
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 25%, #8b5cf6 50%, #06b6d4 75%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
            filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))',
            backgroundSize: '300% 100%',
            animation: 'gradientShiftWhite 4s ease-in-out infinite'
          }}>
            ⚡ WIZ: Watch. Earn. Evolve.
          </h1>
          <p style={{ 
            color: '#64748b', 
            fontSize: '1.25rem', 
            fontWeight: 400, 
            lineHeight: 1.6, 
            maxWidth: '600px', 
            margin: '0 auto'
          }}>
            Your screen time finally works for you. WIZ transforms every minute you spend watching YouTube into XP, rewards, and $WIZ tokens—giving value back to your time.
          </p>
        </div>

        {/* How WIZ Works Section */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '48px',
            background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.2))'
          }}>
            How WIZ Works
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {[
              {
                icon: '⏱',
                title: 'Watch Content',
                description: 'Every 30 seconds of YouTube watch time earns you XP. Whether you\'re learning, vibing, or bingeing, your time is always rewarded.'
              },
              {
                icon: '🏆',
                title: 'Earn XP & Level Up',
                description: 'Complete videos, keep streaks, and unlock completion bonuses. Every milestone makes your profile stronger, with perks to match.'
              },
              {
                icon: '💎',
                title: 'Convert to Rewards',
                description: 'Turn XP into $WIZ tokens, redeem for exclusive creator content, free courses, and marketplace perks.'
              }
            ].map((card, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '24px',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  display: 'block',
                  textAlign: 'center',
                  filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))'
                }}>
                  {card.icon}
                </div>
                <h3 style={{
                  color: '#1e293b',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#64748b',
                  lineHeight: 1.6,
                  textAlign: 'center',
                  margin: 0
                }}>
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why WIZ is Different Section */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '48px',
            background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.2))'
          }}>
            Why WIZ is Different
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '4rem'
          }}>
            {[
              {
                icon: '✨',
                title: 'Transparent Rewards',
                description: 'No gimmicks, no hidden walls. Your XP is tracked clearly in real-time.'
              },
              {
                icon: '🎥',
                title: 'Creator-first Economy',
                description: 'Creators can share free & premium content, while fans earn XP for engaging.'
              },
              {
                icon: '🔥',
                title: 'Daily Motivation',
                description: 'Streak bonuses, level-ups, and limited rewards keep watching exciting.'
              },
              {
                icon: '🌍',
                title: 'Community-driven',
                description: 'Every Wizard fuels a bigger ecosystem where fans and creators thrive together.'
              }
            ].map((card, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.5)';
                }}
              >
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '0.75rem',
                  filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))'
                }}>
                  {card.icon}
                </div>
                <h4 style={{
                  color: '#1e293b',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem'
                }}>
                  {card.title}
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* XP Progression Section */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '48px',
            background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.2))'
          }}>
            XP Progression & Levels
          </h2>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '24px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            position: 'relative'
          }}>
            <h3 style={{
              color: '#1e293b',
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '1rem'
            }}>
              Every Wizard starts at Level 1
            </h3>
            <p style={{
              fontSize: '1rem',
              color: '#64748b',
              lineHeight: 1.6,
              marginBottom: '1.5rem'
            }}>
              With daily watch time, you'll climb levels, unlock badges, and flex your progress. The more you watch, the faster you evolve.
            </p>
            
            <div style={{
              background: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              height: '16px',
              overflow: 'hidden',
              margin: '1.5rem 0',
              position: 'relative'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #a855f7 0%, #06b6d4 50%, #8b5cf6 100%)',
                height: '100%',
                width: '75%',
                borderRadius: '12px',
                position: 'relative',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
                animation: 'progressGlow 2s ease-in-out infinite'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '20px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
                  borderRadius: '12px',
                  animation: 'shimmer 2s ease-in-out infinite'
                }} />
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              {[
                { level: 'Level 1', xp: '100 XP', active: true },
                { level: 'Level 3', xp: '500 XP', active: true },
                { level: 'Level 5', xp: '2,000 XP', active: false },
                { level: 'Level 7', xp: '8,000 XP', active: false }
              ].map((marker, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: marker.active ? '#8b5cf6' : '#64748b'
                  }}
                >
                  <div>{marker.level}</div>
                  <div>{marker.xp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rewards & Tokens Section */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '24px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #10b981 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 40px rgba(251, 191, 36, 0.3)',
              animation: 'tokenGlow 3s ease-in-out infinite'
            }}>
              💎
            </div>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.2))'
            }}>
              From XP to $WIZ Tokens
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#64748b',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              XP isn't just points—it's real value. Trade XP for $WIZ tokens that unlock courses, discounts, creator exclusives, or rewards across our ecosystem. Your time = your currency.
            </p>
          </div>
        </div>

        {/* Built for Everyone Section */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '48px',
            background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.2))'
          }}>
            Built for Everyone
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'center',
            marginBottom: '4rem'
          }}>
            {[
              {
                title: 'For Viewers (Wizards)',
                description: 'Watch, earn XP, level up, and unlock exclusive rewards. Every minute is a step closer to your next perk.'
              },
              {
                title: 'For Creators',
                description: 'Feature your YouTube content, share premium tutorials or courses, and reward your most loyal fans with XP-backed engagement.'
              }
            ].map((card, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '24px',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(168, 85, 247, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                <h3 style={{
                  color: '#1e293b',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1rem'
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#64748b',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Community Call to Action */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(25px)',
          borderRadius: '32px',
          padding: '4rem 2rem',
          textAlign: 'center',
          marginTop: '4rem',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{
            color: '#1e293b',
            fontSize: '2.5rem',
            fontWeight: 800,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            position: 'relative',
            zIndex: 10
          }}>
            Join thousands of Wizards turning screen time into XP
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: '#64748b',
            fontWeight: 500,
            marginBottom: '2rem',
            position: 'relative',
            zIndex: 10
          }}>
            Don't just watch—elevate.
          </p>
          <a 
            href="/"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              color: '#fff',
              padding: '1rem 3rem',
              borderRadius: '50px',
              fontSize: '1.25rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              zIndex: 10
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
            }}
          >
            Join WIZ Now
            <span style={{ marginLeft: '0.5rem', animation: 'arrowMove 1.5s ease-in-out infinite' }}>→</span>
          </a>
        </div>

        {/* Final CTA */}
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <a 
            href="/"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              color: '#fff',
              padding: '1rem 3rem',
              borderRadius: '50px',
              fontSize: '1.25rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
            }}
          >
            Start Earning XP
            <span style={{ marginLeft: '0.5rem', animation: 'arrowMove 1.5s ease-in-out infinite' }}>→</span>
          </a>
          <p style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '1rem', fontWeight: 400 }}>
            Your watch time just leveled up ✨
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradientShiftWhite {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 200% 50%; }
          75% { background-position: 300% 50%; }
        }
        
        @keyframes floatWhite {
          0%, 100% { 
            transform: translateY(0) scale(1); 
            opacity: 0.3; 
          }
          33% { 
            transform: translateY(-15px) scale(1.2); 
            opacity: 0.6; 
          }
          66% { 
            transform: translateY(-8px) scale(0.8); 
            opacity: 0.4; 
          }
        }
        
        @keyframes progressGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
          50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.6); }
        }
        
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(300%); }
        }
        
        @keyframes tokenGlow {
          0%, 100% { 
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.3);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 60px rgba(16, 185, 129, 0.5);
            transform: scale(1.05);
          }
        }
        
        @keyframes arrowMove {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        
        @media (max-width: 768px) {
          h1 { 
            font-size: 3rem !important; 
            padding: 0 1rem;
          }
          h2 {
            font-size: 2rem !important;
          }
          .two-column {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .hero-header {
            padding: 40px 20px !important;
            margin: 0 1rem !important;
          }
        }
        
        @media (max-width: 480px) {
          h1 { 
            font-size: 2.5rem !important; 
          }
        }
      `}</style>
    </div>
  );
};

export default About;