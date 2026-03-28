import React, { useState } from 'react';

interface Props {
  onComplete: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to BharatTycoon! 🎮',
    content: 'In this business simulation game, you\'ll build a company over 18 months. Make smart decisions to grow your business!',
    icon: '🏆'
  },
  {
    title: 'Understanding Money 💰',
    content: 'Every business has:\n• Revenue - Money coming in from sales\n• Costs - Money going out (rent, salaries, supplies)\n• Profit = Revenue - Costs\n• Cash - Your available money to run operations',
    icon: '💰'
  },
  {
    title: 'Make Decisions 🎯',
    content: 'Each month, you\'ll choose from decision cards:\n• Hire employees to grow\n• Run marketing campaigns\n• Expand to new locations\n• Reduce costs\n\nEach choice affects your money differently!',
    icon: '🎯'
  },
  {
    title: 'Watch Your Cash 💳',
    content: 'Cash is your lifeblood!\n• Never let cash reach zero\n• Keep 3-6 months of costs in reserve\n• Smart investments help you grow\n• Balance risk and reward',
    icon: '💳'
  },
  {
    title: 'Grow Through Phases 📈',
    content: 'Your business goes through stages:\n• Founder (Months 1-3): Build foundation\n• Seed (Months 4-8): Validate your model\n• Growth (Months 9-14): Scale up\n• Scale (Months 15-18): Prepare for success',
    icon: '📈'
  },
  {
    title: 'Ready to Play! 🚀',
    content: 'You now know the basics!\n• Choose decisions each month\n• Balance revenue, costs, and cash\n• Aim for 18 months of growth\n• Build the biggest business in India!',
    icon: '🎉'
  }
];

export const TutorialScreen: React.FC<Props> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>{step.icon}</div>
        <h1 style={styles.title}>{step.title}</h1>
        <p style={styles.content}>{step.content}</p>
        
        <div style={styles.progress}>
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.dot,
                ...(i <= currentStep ? styles.dotActive : {})
              }}
            />
          ))}
        </div>

        <div style={styles.buttons}>
          <button style={styles.skipBtn} onClick={handleSkip}>
            Skip
          </button>
          <button style={styles.nextBtn} onClick={handleNext}>
            {currentStep < TUTORIAL_STEPS.length - 1 ? 'Next →' : 'Start Playing!'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: 20
  },
  card: {
    maxWidth: 500,
    background: '#1e293b',
    borderRadius: 24,
    padding: 40,
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  },
  icon: {
    fontSize: 64,
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 16,
    color: '#fff'
  },
  content: {
    fontSize: 16,
    lineHeight: 1.6,
    color: '#94a3b8',
    whiteSpace: 'pre-line',
    marginBottom: 32
  },
  progress: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#334155',
    transition: 'all 0.3s'
  },
  dotActive: {
    background: '#3b82f6'
  },
  buttons: {
    display: 'flex',
    gap: 12
  },
  skipBtn: {
    flex: 1,
    padding: 14,
    background: 'transparent',
    border: '1px solid #475569',
    borderRadius: 12,
    color: '#94a3b8',
    fontSize: 16,
    cursor: 'pointer'
  },
  nextBtn: {
    flex: 2,
    padding: 14,
    background: '#3b82f6',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer'
  }
};
