import { useConnection } from "context/connect";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

export default function Sidebar() {
    const router = useRouter();
    const { connection } = useConnection();

    const [rooms, setRooms] = useState([]);
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [protectedRoom, setProtectedRoom] = useState(null);

    useEffect(() => {
        if (connection) {
            connection.emit('fetchUser');
            connection.on('user', (data) => {
                if (data === null) {
                    router.push('/');
                } else {
                    setUser(data);
                }
            });

            return () => {
                connection.off('user', (data) => {
                    if (data === null) {
                        router.push('/');
                    } else {
                        setUser(data);
                    }
                });
            };
        }
    }, [connection]);

    useEffect(() => {
        if (connection) {
            connection.emit('fetchRooms');
            connection.on('rooms', (data) => {
                setRooms(data.rooms);
            });

            return () => {
                connection.off('rooms', (data) => {
                    if (data.isLogged) {
                        setUser(data.user);
                    }
                    setRooms(data.rooms);
                });
            };
        }
    }, []);

    const joinRoom = (room) => {
        const { id, passwordProtected } = room;
        if (passwordProtected) {
            setIsOpen(true);
            setProtectedRoom(room);

        } else {
            connection.emit('joinRoom', { id });
        }

        connection.off('joinRoom').on('joinRoom', (data) => {
            if (data.success) {
                setIsOpen(false);
                router.push('/rooms/' + id);
            } else {
                if (data?.alreadyIn) {
                    router.push('/rooms/' + id);
                } else {
                    alert(data.error);
                }
            }
        });
    };

    return (
        <>
            <div className="sticky top-0 h-screen w-96 bg-dark-2 text-white p-6 flex flex-col justify-between">
                <div className="flex flex-col items-center space-y-3">
                <button
                        onClick={() => router.push('/rooms/create')}
                        className="w-full rounded-md px-4 py-2 border border-gray-300/5 text-gray-300 bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50 transition-all duration-200"
                    >
                        Criar Sala
                    </button>
                    <span className="text-2xl font-semi-bold leading-normal mb-4">Salas</span>
                </div>
                <div className="flex flex-col h-full mt-4 space-y-2">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="w-full rounded-md px-4 py-2 border border-gray-300/5 text-gray-300 bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50 transition-all duration-200"
                            onClick={() => joinRoom(room)}
                        >
                            <img src={`https://avatars.dicebear.com/api/initials/${room?.name || "No Name"}.png`} alt="username" className="w-10 h-10 rounded-md" />
                            <div className="flex-shrink-0 flex flex-col bg-blue">
                                <span className="font-semibold">{room.name}</span>
                                <span className="text-xs text-gray-400">Criada por {room?.owner?.username.split(0, 5) + '...'}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col items-center space-y-3 mt-6 w-full">
                    <div className="bg-zinc-500/10 flex flex-row items-center space-x-2 w-full hover:bg-zinc-100/10 p-4 rounded-lg transition-all duration-200">
                        <img
                            src={`https://avatars.dicebear.com/api/micah/${user?.username || "clqu"}.png`}
                            alt="username"
                            className="h-10 w-10 rounded-full"
                        />
                        <span className="font-semibold">{user?.username}</span>
                    </div>
                </div>
            </div>
        </>
    );
}