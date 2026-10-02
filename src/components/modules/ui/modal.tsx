"use client";

import { useEffect, type ReactNode } from "react";
import { LuX } from "react-icons/lu";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

interface ModalProps {
  title: ReactNode;
  description?: ReactNode;
  onClose?: () => void;
  /** old name of onClose (admin panel) */
  hideModal?: () => void;
  size?: keyof typeof sizes;
  children?: ReactNode;
  footer?: ReactNode;
}

/**
 * Accessible modal dialog. On phones it sits at the bottom of the screen.
 * <Modal title="..." onClose={fn} size="md" footer={<button/>}>content</Modal>
 */
export default function Modal({ title, description, onClose, hideModal, size = "md", children, footer }: ModalProps) {
  const close = onClose || hideModal;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close?.();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center p-3 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/50 backdrop-blur-[2px]" onClick={close} />
      <div
        className={`card relative flex max-h-[90vh] w-full ${sizes[size] ?? sizes.md} animate-scale-in flex-col overflow-hidden shadow-float`}
      >
        <div className="card-header flex-nowrap">
          <div className="min-w-0">
            <h2 className="card-title">{title}</h2>
            {description && <p className="mt-0.5 text-sm break-words text-gray-700 dark:text-gray-500">{description}</p>}
          </div>
          <button type="button" onClick={close} className="btn btn-ghost btn-icon -mr-2 shrink-0" aria-label="Close">
            <LuX className="size-5" />
          </button>
        </div>
        {children != null && <div className="card-body overflow-y-auto">{children}</div>}
        {footer && (
          <div className="flex flex-col-reverse justify-end gap-2 border-t border-gray-200 px-5 py-4 sm:flex-row dark:border-white/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
