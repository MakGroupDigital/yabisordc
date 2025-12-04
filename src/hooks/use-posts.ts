'use client';

import { useState, useEffect } from 'react';
import { getPosts, subscribeToPosts, formatRelativeTime } from '@/lib/posts';
import { Post } from '@/types';

export interface PostWithRelativeTime extends Post {
  relativeTime: string;
}

export function usePosts(useRealtime: boolean = true) {
  const [posts, setPosts] = useState<PostWithRelativeTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (useRealtime) {
      // Écouter les posts en temps réel
      const unsubscribe = subscribeToPosts((firestorePosts) => {
        const postsWithTime = firestorePosts.map(post => ({
          ...post,
          relativeTime: formatRelativeTime(post.createdAt)
        }));
        setPosts(postsWithTime);
        setLoading(false);
        setError(null);
      });

      return () => unsubscribe();
    } else {
      // Charger les posts une seule fois
      getPosts()
        .then((firestorePosts) => {
          const postsWithTime = firestorePosts.map(post => ({
            ...post,
            relativeTime: formatRelativeTime(post.createdAt)
          }));
          setPosts(postsWithTime);
          setLoading(false);
          setError(null);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    }
  }, [useRealtime]);

  return { posts, loading, error };
}





