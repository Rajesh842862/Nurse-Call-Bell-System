import { useEffect, useRef } from "react";
import { RotateCcw, X } from "lucide-react";

interface ResetConfirmModalProps {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

const ResetConfirmModal = ({ isOpen, onConfirm, onCancel }: ResetConfirmModalProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen) {
			dialog.showModal();
		} else if (dialog.open) {
			dialog.close();
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent): void => {
			if (e.key === "Escape") {
				e.preventDefault();
				onCancel();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onCancel]);

	const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>): void => {
		if (e.target === dialogRef.current) {
			onCancel();
		}
	};

	return (
		<dialog
			ref={dialogRef}
			className="reset-modal-dialog"
			onClick={handleBackdropClick}
		>
			<div className="reset-modal-content">
				<div className="reset-modal-header">
					<div className="reset-modal-icon">
						<RotateCcw size={20} />
					</div>
					<h2 className="reset-modal-title">Reset Alert</h2>
					<button className="reset-modal-close" onClick={onCancel} aria-label="Close">
						<X size={16} />
					</button>
				</div>

				<p className="reset-modal-message">
					Are you sure you want to reset this alert?
				</p>

				<div className="reset-modal-actions">
					<button className="reset-modal-btn reset-modal-btn-cancel" onClick={onCancel}>
						Cancel
					</button>
					<button className="reset-modal-btn reset-modal-btn-confirm" onClick={onConfirm}>
						<RotateCcw size={14} />
						Reset
					</button>
				</div>
			</div>
		</dialog>
	);
};

export default ResetConfirmModal;
