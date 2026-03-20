import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { getPublicListings } from '../../services/propertyService';
import PropertyCard from '../../components/cards/PropertyCard';

const ListingsPage = () => {
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(initialSearch);
    const [query, setQuery] = useState(initialSearch);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await getPublicListings(query);
                setProperties(data.properties || []);
            } catch (err) {
                setError('Failed to load listings. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        setQuery(search.trim());
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">
                    Find Your <span className="text-primary-600">Perfect Stay</span>
                </h1>
                <p className="text-slate-500 text-lg font-medium">
                    Browse verified boarding places near your university
                </p>

                {/* Search */}
                <form onSubmit={handleSearch} className="mt-8 flex items-center gap-3 max-w-xl mx-auto">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, address…"
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 transition-all hover:-translate-y-0.5"
                    >
                        Search
                    </button>
                </form>
            </motion.div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                    <p className="text-slate-500 font-medium">Loading listings…</p>
                </div>
            ) : error ? (
                <div className="text-center py-20 text-red-500 font-semibold">{error}</div>
            ) : properties.length === 0 ? (
                <div className="text-center py-24">
                    <p className="text-6xl mb-4">🏘️</p>
                    <h3 className="text-xl font-black text-slate-700 mb-2">No Listings Found</h3>
                    <p className="text-slate-500 font-medium">
                        {query ? `No results for "${query}". Try a different search.` : 'No verified listings available right now.'}
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">
                        {properties.length} Listing{properties.length !== 1 ? 's' : ''} found
                    </p>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {properties.map((property) => (
                            <motion.div key={property._id} variants={itemVariants}>
                                <PropertyCard property={property} />
                            </motion.div>
                        ))}
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default ListingsPage;
