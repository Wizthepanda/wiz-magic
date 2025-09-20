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
				}
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			textShadow: {
				'3d': '2px 2px 4px rgba(0, 0, 0, 0.3)',
				'glow': '0 0 10px rgba(147, 51, 234, 0.5)',
			},
			boxShadow: {
				'glow': '0 0 20px rgba(147, 51, 234, 0.3)',
				'glow-lg': '0 0 30px rgba(147, 51, 234, 0.4)',
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
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.6s ease-out',
				'slide-up': 'slideUp 0.8s ease-out',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'bounce-subtle': 'bounceSubtle 0.6s ease-out',
				'count-up': 'countUp 1.2s ease-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
