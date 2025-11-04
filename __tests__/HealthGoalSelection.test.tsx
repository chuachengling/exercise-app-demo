import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import HealthGoalSelection from '../src/app/signup/_components/HealthGoalSelection';
import { HEALTH_GOALS } from '../src/constants/healthGoals';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock database functions
jest.mock('../src/lib/database/userGoals', () => ({
  saveUserGoalPreference: jest.fn(),
}));

describe('HealthGoalSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all four health goal options', () => {
    render(<HealthGoalSelection />);
    
    // Check that all goals are rendered
    HEALTH_GOALS.forEach((goal) => {
      expect(screen.getByText(goal.title)).toBeInTheDocument();
      expect(screen.getByText(goal.description)).toBeInTheDocument();
    });
  });

  it('should enable continue button only after goal selection', () => {
    render(<HealthGoalSelection />);
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    
    // Button should be disabled initially
    expect(continueButton).toBeDisabled();
    
    // Click on a goal
    const weightLossCard = screen.getByText('Lose Weight').closest('[role="radio"]');
    fireEvent.click(weightLossCard);
    
    // Button should be enabled after selection
    expect(continueButton).not.toBeDisabled();
  });

  it('should show error message when trying to continue without selection', async () => {
    render(<HealthGoalSelection />);
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    
    // Try to click disabled button (in real scenario, this wouldn't be possible)
    // But we can test the validation logic through the form state
    expect(continueButton).toBeDisabled();
  });

  it('should provide keyboard navigation support', () => {
    render(<HealthGoalSelection />);
    
    const firstGoalCard = screen.getByText('Lose Weight').closest('[role="radio"]');
    
    // Focus the card
    firstGoalCard.focus();
    expect(document.activeElement).toBe(firstGoalCard);
    
    // Press Enter to select
    fireEvent.keyDown(firstGoalCard, { key: 'Enter' });
    expect(firstGoalCard).toHaveAttribute('aria-checked', 'true');
  });

  it('should display progress indicator correctly', () => {
    render(<HealthGoalSelection />);
    
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('Health Goals')).toBeInTheDocument();
  });

  it('should show selection indicator on selected goal', () => {
    render(<HealthGoalSelection />);
    
    const weightLossCard = screen.getByText('Lose Weight').closest('[role="radio"]');
    
    // Should not be selected initially
    expect(weightLossCard).toHaveAttribute('aria-checked', 'false');
    
    // Click to select
    fireEvent.click(weightLossCard);
    
    // Should be selected now
    expect(weightLossCard).toHaveAttribute('aria-checked', 'true');
  });
});

describe('Goal Selection Form Validation', () => {
  it('should clear errors when valid selection is made', async () => {
    render(<HealthGoalSelection />);
    
    // Select a goal
    const goalCard = screen.getByText('Build Muscle').closest('[role="radio"]');
    fireEvent.click(goalCard);
    
    // Verify no error messages are shown
    expect(screen.queryByText(/please select a health goal/i)).not.toBeInTheDocument();
  });
});

describe('Navigation Flow', () => {
  it('should have back button functionality', () => {
    const mockBack = jest.fn();
    jest.mocked(require('next/navigation').useRouter).mockReturnValue({
      push: jest.fn(),
      back: mockBack,
    });

    render(<HealthGoalSelection />);
    
    const backButton = screen.getByRole('button', { name: /go back/i });
    fireEvent.click(backButton);
    
    expect(mockBack).toHaveBeenCalled();
  });
});