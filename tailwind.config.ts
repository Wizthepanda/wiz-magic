import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				// Premium XP Gradient Colors - Midnight Indigo + XP
				'midnight-indigo': {
					50: '#f0f4ff',
					100: '#e0e7ff',
					200: '#c7d2fe',
					300: '#a5b4fc',
					400: '#818cf8',
					500: '#6366f1',
					600: '#4f46e5',
					700: '#4338ca',
					800: '#3730a3',
					900: '#312e81',
					950: '#1e1b4b',
				},
				'aqua-violet': {
					50: '#f0fdfa',
					100: '#ccfbf1',
					200: '#99f6e4',
					300: '#5eead4',
					400: '#2dd4bf',
					500: '#14b8a6',
					600: '#0d9488',
					700: '#0f766e',
					800: '#115e59',
					900: '#134e4a',
					950: '#042f2e',
				},
				// Enhanced gradient colors
				lavender: {
					50: '#faf7ff',
					100: '#f3ebff',
					200: '#e9d8ff',
					300: '#d8b9ff',
					400: '#c084ff',
					500: '#a855f7',
					600: '#9333ea',
					700: '#7c3aed',
					800: '#6b21a8',
					900: '#581c87',
				},
				peach: {
					50: '#fff7ed',
					100: '#ffedd5',
					200: '#fed7aa',
					300: '#fdba74',
					400: '#fb923c',
					500: '#f97316',
					600: '#ea580c',
					700: '#c2410c',
					800: '#9a3412',
					900: '#7c2d12',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// WIZ Brand Colors
				wiz: {
					primary: 'hsl(var(--wiz-primary))',
					secondary: 'hsl(var(--wiz-secondary))',
					accent: 'hsl(var(--wiz-accent))',
					magic: 'hsl(var(--wiz-magic))'
				},
				// XP System Colors
				xp: {
					primary: 'hsl(var(--xp-primary))',
					secondary: 'hsl(var(--xp-secondary))',
					glow: 'hsl(var(--xp-glow))',
					complete: 'hsl(var(--xp-complete))'
				},
				// Dark Mode Color System
				dark: {
					bg: {
						primary: '#0B0F19',
						secondary: '#1A1F2E',
						tertiary: '#242938',
						elevated: '#2D3648'
					},
					indigo: {
						50: '#E8EAFF',
						100: '#D1D5FF',
						200: '#A4ABFF',
						300: '#7681FF',
						400: '#4857FF',
						500: '#1A2DFF',
						600: '#1524CC',
						700: '#101B99',
						800: '#0A1266',
						900: '#050933'
					},
					navy: {
						50: '#F1F3F9',
						100: '#E3E7F3',
						200: '#C7CFE7',
						300: '#ABB7DB',
						400: '#8F9FCF',
						500: '#7387C3',
						600: '#5C6C9C',
						700: '#455175',
						800: '#2E364E',
						900: '#171B27'
					},
					surface: {
						100: 'rgba(255, 255, 255, 0.05)',
						200: 'rgba(255, 255, 255, 0.08)',
						300: 'rgba(255, 255, 255, 0.12)',
						400: 'rgba(255, 255, 255, 0.16)',
						500: 'rgba(255, 255, 255, 0.20)'
					},
					text: {
						primary: '#FFFFFF',
						secondary: '#B8C2E0',
						muted: '#8B9BB8',
						disabled: '#6B7A96'
					},
					accent: {
						purple: '#8B5CF6',
						blue: '#3B82F6',
						cyan: '#06B6D4',
						emerald: '#10B981',
						orange: '#F59E0B'
					}
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Community V10 Design Tokens
				zap: {
					DEFAULT: '#6C5EF8',
					alt: '#5DE0FF'
				},
				glass: {
					base: 'rgba(255,255,255,0.65)',
					dark: 'rgba(17,20,27,0.55)'
				}
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				// Premium XP Gradients
				'xp-primary': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
				'xp-secondary': 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
				'xp-tertiary': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
				'glass-light': 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.05))',
				'glass-dark': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02))',
				'neon-glow': 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'xl2': '18px'
			},
			textShadow: {
				'3d': '2px 2px 4px rgba(0, 0, 0, 0.3)',
				'glow': '0 0 10px rgba(147, 51, 234, 0.5)',
			},
			boxShadow: {
				'glow': '0 0 20px rgba(147, 51, 234, 0.3)',
				'glow-lg': '0 0 30px rgba(147, 51, 234, 0.4)',
				'glass': '0 6px 30px rgba(16,24,40,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
				'card': '0 10px 30px rgba(11,14,24,0.06)'
			},
			transitionTimingFunction: {
				'soft': 'cubic-bezier(.2,.9,.17,1)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				slideUp: {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				glow: {
					'0%': { boxShadow: '0 0 5px rgba(147, 51, 234, 0.2)' },
					'100%': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.6)' },
				},
				bounceSubtle: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
				},
				countUp: {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'50%': { transform: 'scale(1.1)', opacity: '0.8' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				// Premium sidebar animations
				'neon-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(6, 182, 212, 0.2)'
					},
					'50%': {
						boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)'
					},
				},
				'glass-shimmer': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'50%': { opacity: '1' },
					'100%': { transform: 'translateX(100%)', opacity: '0' },
				},
				'float-up': {
					'0%': { transform: 'translateY(0px)', opacity: '0.7' },
					'50%': { transform: 'translateY(-10px)', opacity: '1' },
					'100%': { transform: 'translateY(0px)', opacity: '0.7' },
				},
				'sparkle-burst': {
					'0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
					'50%': { transform: 'scale(1) rotate(180deg)', opacity: '1' },
					'100%': { transform: 'scale(0) rotate(360deg)', opacity: '0' },
				},
				'notification-pulse': {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
					'50%': { transform: 'scale(1.1)', opacity: '1' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.6s ease-out',
				'slide-up': 'slideUp 0.8s ease-out',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'bounce-subtle': 'bounceSubtle 0.6s ease-out',
				'count-up': 'countUp 1.2s ease-out',
				// Premium sidebar animations
				'neon-pulse': 'neon-pulse 3s ease-in-out infinite',
				'glass-shimmer': 'glass-shimmer 2s ease-in-out infinite',
				'float-up': 'float-up 4s ease-in-out infinite',
				'sparkle-burst': 'sparkle-burst 1.5s ease-out infinite',
				'notification-pulse': 'notification-pulse 2s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
