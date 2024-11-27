import React, { useState, useEffect } from 'react';
import retryFetch from './retryFetch';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('published');

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const endpoint =
          filter === 'published'
            ? 'http://localhost:5175/api/v1/stores/published?shop=quickstart-2770d800.myshopify.com'
            : filter === 'unpublished'
            ? 'http://localhost:5175/api/v1/stores/unpublished?shop=quickstart-2770d800.myshopify.com'
            : 'http://localhost:5175/api/v1/stores/stores?shop=quickstart-2770d800.myshopify.com';

        const response = await retryFetch(endpoint, { method: 'GET' });
        setStores(response.data);
      } catch (err) {
        setError(
          err.response?.status === 429
            ? 'Too many requests. Please try again later.'
            : 'Error fetching stores.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [filter]);

  return (
    <div>
      <div>
        <button onClick={() => setFilter('published')}>Published</button>
        <button onClick={() => setFilter('unpublished')}>Unpublished</button>
        <button onClick={() => setFilter('all')}>All</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {!loading && !error && (
        <ul>
          {stores.map((store, index) => (
            <li key={index}>
              <h2>{store.name}</h2>
              <p>{store.address.street}, {store.address.city}, {store.address.state}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StoreList;
