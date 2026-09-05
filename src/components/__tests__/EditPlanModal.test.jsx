import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditPlanModal from '../EditPlanModal';

const mockPlan = {
  id: 1,
  planName: 'Gold Life Plan',
  minCoverageAmount: 500000,
  premiumAmount: 12000,
  premiumType: 'ANNUAL',
  duration: 10,
  termsAndConditions: 'Standard T&C apply',
  active: true,
};

describe('EditPlanModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <EditPlanModal isOpen={false} onClose={() => {}} plan={mockPlan} onSave={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when isOpen is true', () => {
    render(
      <EditPlanModal isOpen={true} onClose={() => {}} plan={mockPlan} onSave={() => {}} />
    );

    // Title is "Edit Insurance Plan" per the actual rendered output
    expect(screen.getByText(/Edit Insurance Plan/i)).toBeInTheDocument();
  });

  it('populates form with existing plan data', () => {
    render(
      <EditPlanModal isOpen={true} onClose={() => {}} plan={mockPlan} onSave={() => {}} />
    );

    const planNameInput = screen.getByDisplayValue('Gold Life Plan');
    expect(planNameInput).toBeInTheDocument();
  });

  it('calls onClose when cancel/close is triggered', () => {
    const onClose = vi.fn();
    render(
      <EditPlanModal isOpen={true} onClose={onClose} plan={mockPlan} onSave={() => {}} />
    );

    const cancelBtn = screen.getByText(/Cancel/i);
    fireEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('populates with default values when plan has missing fields', () => {
    const minimalPlan = { id: 99 };
    render(
      <EditPlanModal isOpen={true} onClose={() => {}} plan={minimalPlan} onSave={() => {}} />
    );

    expect(screen.getByDisplayValue('LifeSecure Term Plan')).toBeInTheDocument();
  });
});
