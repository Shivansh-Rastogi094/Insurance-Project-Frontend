import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders children when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    );

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="My Title">
        <p>Body</p>
      </Modal>
    );

    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Body Only</p>
      </Modal>
    );

    expect(screen.queryByClassName?.('modal-title')).toBeFalsy();
    expect(screen.getByText('Body Only')).toBeInTheDocument();
  });

  it('calls onClose when clicking the overlay', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>
    );

    // Click on the overlay (outer div with class modal-overlay)
    const overlay = document.querySelector('.modal-overlay');
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does NOT call onClose when clicking inside modal content', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <p>Click me</p>
      </Modal>
    );

    // Click inside the modal content
    fireEvent.click(screen.getByText('Click me'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies custom maxWidth', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Wide Modal" maxWidth="800px">
        <p>Wide content</p>
      </Modal>
    );

    const modalContent = document.querySelector('.modal-content');
    expect(modalContent.style.maxWidth).toBe('800px');
  });

  it('uses default maxWidth of 480px', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Default Width">
        <p>Default width content</p>
      </Modal>
    );

    const modalContent = document.querySelector('.modal-content');
    expect(modalContent.style.maxWidth).toBe('480px');
  });
});
