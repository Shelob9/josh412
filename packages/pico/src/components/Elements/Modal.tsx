import { HTMLAttributes,MouseEvent, ReactNode} from "react";
import { useModal } from "../../contexts/ModalContext";
interface ModalProps extends HTMLAttributes<HTMLElement> {
  title: string;
  children: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
}
export default function Modal({ title, children, cancelLabel, confirmLabel, ...props }: ModalProps) {

  const { modalIsOpen, handleClose } = useModal();

  const handleClickOverlay = (event: MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.target === event.currentTarget) {
          //@ts-ignore
        handleClose(event);
      }
  };

  return (
    //@ts-ignore
    <dialog onClick={handleClickOverlay} open={modalIsOpen} {...props}>
      <article>
        <header>
          <button aria-label="Close" rel="prev" onClick={handleClose}></button>
          <h3>{title}</h3>
        </header>
        {children}
        <footer>
          <button className="secondary" onClick={handleClose}>
            {cancelLabel}
          </button>
          <button onClick={handleClose}>
            {confirmLabel}
          </button>
        </footer>
      </article>
    </dialog>
  );
}
