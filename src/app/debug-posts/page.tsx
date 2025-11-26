'use client';

import { useEffect, useState } from 'react';
import { getPosts } from '@/lib/posts';
import { Post } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
      
      // Récupérer aussi les données brutes depuis Firestore
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const raw = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));
      setRawData(raw);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Debug Posts</h1>
        <Button onClick={loadPosts}>Actualiser</Button>
      </div>

      <div className="grid gap-4">
        {rawData.map((raw, index) => {
          const post = posts[index];
          return (
            <Card key={raw.id}>
              <CardHeader>
                <CardTitle>Post {index + 1} - ID: {raw.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Données brutes Firestore:</h3>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(raw.data, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Post converti:</h3>
                  <div className="space-y-2">
                    <p><strong>Author:</strong> {post?.author}</p>
                    <p><strong>Media Count:</strong> {post?.media?.length || 0}</p>
                    {post?.media && post.media.length > 0 ? (
                      <div>
                        <p><strong>Médias:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          {post.media.map((m, i) => (
                            <li key={i} className="text-sm">
                              <div>Type: {m.type}</div>
                              <div className="break-all">URL: {m.url}</div>
                              <div>URL Length: {m.url?.length || 0}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-red-500">⚠️ Aucun média dans le post converti!</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Champ media dans Firestore:</h3>
                  <div className="space-y-2">
                    <p><strong>Existe:</strong> {'media' in raw.data ? '✅ Oui' : '❌ Non'}</p>
                    <p><strong>Type:</strong> {typeof raw.data.media}</p>
                    <p><strong>Is Array:</strong> {Array.isArray(raw.data.media) ? '✅ Oui' : '❌ Non'}</p>
                    {raw.data.media ? (
                      <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48">
                        {JSON.stringify(raw.data.media, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-red-500">❌ Le champ media n'existe pas ou est null/undefined</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

