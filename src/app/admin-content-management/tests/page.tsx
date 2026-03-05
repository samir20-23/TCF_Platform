'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminTestsPage() {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const res = await fetch('/api/admin/tests');
            if (res.ok) {
                const data = await res.json();
                setTests(data.tests || []);
            }
        } catch (error) {
            console.error('Failed to load tests', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteTest = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce test ?')) return;
        try {
            const res = await fetch(`/api/admin/tests/${id}`, { method: 'DELETE' });
            if (res.ok) fetchTests();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    if (loading) return <div className="p-8">Chargement...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestion des Tests (Exam Engine)</h1>
                <Link
                    href="/admin-content-management/tests/new"
                    className="bg-primary text-white px-4 py-2 text-sm rounded-lg"
                >
                    + Créer un Test
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-6 py-3">Nom</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Questions</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tests.map(test => (
                            <tr key={test.id} className="border-b">
                                <td className="px-6 py-4 font-medium">{test.name}</td>
                                <td className="px-6 py-4 capitalize">{test.test_type}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${test.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {test.published ? 'Publié' : 'Brouillon'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{test.questionCount || 0}</td>
                                <td className="px-6 py-4 space-x-3">
                                    <Link href={`/admin-content-management/tests/${test.id}`} className="text-blue-600 hover:underline">
                                        Éditer
                                    </Link>
                                    <button onClick={() => deleteTest(test.id)} className="text-red-600 hover:underline">
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {tests.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    Aucun test trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
