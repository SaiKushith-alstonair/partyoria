import { Chat } from "../../../components/Chat";

const VendorChat = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Customer Communication</h1>
      <div className="h-[calc(100vh-200px)]">
        <Chat />
      </div>
    </div>
  );
};

export default VendorChat;





