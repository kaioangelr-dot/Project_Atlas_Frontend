export default function Popup(props) {
  const { onClose, title, children } = props;
  return (
    <div className="popup">
      <div className={`popup__content`}>
        <button aria-label="Close Modal" className="popup__close" type="button" onClick={onClose}></button>
        {title && <h3 className="popup__title">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
