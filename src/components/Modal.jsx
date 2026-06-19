import React from 'react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '480px' }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
                {title && (
                    <div className="modal-title">
                        {title}
                    </div>
                )}
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
