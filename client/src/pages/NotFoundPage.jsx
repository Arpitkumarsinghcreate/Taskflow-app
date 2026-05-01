import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
      <p className="text-content-secondary mb-6">The page you are looking for does not exist.</p>
      <Link to="/" className="text-brand-green hover:underline">
        Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;
