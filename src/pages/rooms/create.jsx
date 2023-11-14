import { useConnection } from 'context/connect';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Home() {
    const { connection } = useConnection();
    const router = useRouter();
    const [error, setError] = useState(null);

    const createRoom = (event) => {
        event.preventDefault();
        const name = event.target.name.value;

        connection.emit('createRoom', { name });

        connection.off('createRoom').on('createRoom', (data) => {
            if (data.success) {
                router.push('/rooms/' + data.data.id);
            } else {
                setError(data.message);
            }
        });
    };

    useEffect(() => {
        if (connection) {
            connection.emit('fetchUser');
            connection.on('user', (data) => {
                if (data === null) {
                    router.push('/');
                }
            });

            return () => {
                connection.off('user', (data) => {
                    if (data === null) {
                        router.push('/');
                    }
                });
            };
        }
    }, [connection]);

    return (
        <div className="md:h-screen relative flex flex-col justify-center items-center">
            <div className="bg-dark-2 md:shadow-lg shadow-none rounded p-10">
                <div className="flex flex-col items-center space-y-3">
                    <span className="text-2xl text-white font-semi-bold leading-normal">Criar Nova Sala</span>
                </div>
                {error && (
                    <div className="w-full rounded-md px-4 p-2 border-red-500 border text-red-500 bg-red-500/20 mt-4">
                        <p>{error || 'Algo deu errado..'}</p>
                    </div>
                )}
                <form onSubmit={createRoom} className="my-8 w-96 h-auto">
                    <div className="relative mb-2">
                        <label
                            htmlFor="name"
                            className="text-[12.5px] leading-tighter text-gray-300 uppercase font-medium text-base cursor-text"
                        >
                            Nome da Sala
                        </label>
                        <input
                            id="name"
                            autoComplete="off"
                            className="text-white bg-dark-3 transition-all duration-200 w-full rounded-lg p-3 border border-gray-300/10 focus:border-blue-700 outline-none ring-none"
                            type="text"
                        />
                    </div>
                    <div className="space-y-9">
                        <div className="text-sm flex justify-end items-center h-full mt-16">
                            <button className="w-full rounded-md px-4 py-2 border border-gray-300/5 text-gray-300 bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50 transition-all duration-200">
                                Criar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}