import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <main className="page narrow not-found">
      <h1>404</h1>
      <p>La pagina que buscas no existe.</p>
      <Link className="button primary" to="/">
        Volver al inicio
      </Link>
    </main>
  );
};

export default NotFoundPage;
