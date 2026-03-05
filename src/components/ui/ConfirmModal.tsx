import { ReactNode } from 'react';
import AppIcon from '@/components/ui/AppIcon';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    onConfirm,
    onCancel,
    isDestructive = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-modal animate-in zoom-in-95 duration-200 overflow-hidden border border-border">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDestructive ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                            <AppIcon name={isDestructive ? 'ExclamationTriangleIcon' : 'QuestionMarkCircleIcon'} size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-heading font-bold text-foreground mb-2">{title}</h3>
                            <div className="text-sm text-muted-foreground">{message}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-muted/30 px-6 py-4 border-t border-border flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 font-medium text-sm text-foreground hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 font-bold text-sm text-white rounded-lg shadow-sm transition-transform hover:scale-105 ${isDestructive ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary/90'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
