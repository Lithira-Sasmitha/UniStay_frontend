import { useState, useEffect } from 'react';

const useWishlist = () => {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        // Run once on mount to initialize from localStorage
        const stored = localStorage.getItem('unistay_wishlist');
        if (stored) {
            try {
                setWishlist(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse wishlist from local storage', e);
            }
        }
    }, []);

    // Sync state changes back to localStorage whenever it changes
    const saveWishlist = (newList) => {
        setWishlist(newList);
        localStorage.setItem('unistay_wishlist', JSON.stringify(newList));
        // Dispatch a custom event so other tabs/hooks can sync if needed
        window.dispatchEvent(new Event('wishlist_updated'));
    };

    const addToWishlist = (property) => {
        const current = [...wishlist];
        if (!current.some(item => item._id === property._id)) {
            const newItem = {
                _id: property._id,
                name: property.name,
                address: property.address,
                price: property.rooms?.[0]?.monthlyRent || property.price || 0,
                trustBadge: property.trustBadge || 'unverified',
                coverPhoto: property.photos?.[0]?.url || property.coverPhoto || null,
            };
            saveWishlist([...current, newItem]);
        }
    };

    const removeFromWishlist = (propertyId) => {
        const updated = wishlist.filter(item => item._id !== propertyId);
        saveWishlist(updated);
    };

    const isInWishlist = (propertyId) => {
        return wishlist.some(item => item._id === propertyId);
    };

    const toggleWishlist = (property) => {
        if (isInWishlist(property._id)) {
            removeFromWishlist(property._id);
        } else {
            addToWishlist(property);
        }
    };

    // Effect to sync across instances in the same window without reloading
    useEffect(() => {
        const handleUpdate = () => {
            const stored = localStorage.getItem('unistay_wishlist');
            if (stored) {
                try {
                    setWishlist(JSON.parse(stored));
                } catch (e) {}
            }
        };

        window.addEventListener('wishlist_updated', handleUpdate);
        return () => window.removeEventListener('wishlist_updated', handleUpdate);
    }, []);

    return { wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist };
};

export default useWishlist;
