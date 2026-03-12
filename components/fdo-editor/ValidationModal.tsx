import React from 'react';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: string[];
}

const ValidationModal = ({ isOpen, onClose, errors }: ValidationModalProps) => {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open" open>
      <div className="modal-box">
        <h3 className="font-bold text-lg text-error mb-4">Validation Errors</h3>
        <p className="py-2">The following fields need to be filled:</p>
        <ul className="list-disc list-inside mb-4">
          {errors.map((error, index) => (
            <li key={index} className="text-sm">{error}</li>
          ))}
        </ul>
        <div className="modal-action">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default ValidationModal;
