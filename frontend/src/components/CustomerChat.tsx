import { Chat } from "./Chat";

export const CustomerChat = () => {
  return (
    <div className="h-screen bg-gray-50">
      <div className="container mx-auto p-4 h-full">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-gray-600">Chat with vendors about your events</p>
        </div>
        <div className="h-[calc(100%-80px)] bg-white rounded-lg shadow">
          <Chat />
        </div>
      </div>
    </div>
  );
};