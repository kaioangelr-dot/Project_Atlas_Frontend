export default function InfoToolTip(props) {
  const { handleClosePopup, children } = props;
  return (
    <div className="popup" role="presentation">
      <div className="popup__content" role="dialog" aria-modal="true">
        <button
          aria-label="Fechar mensagem"
          className="popup__close"
          type="button"
          onClick={handleClosePopup}
        ></button>
        {children}
      </div>
    </div>
  );
}
