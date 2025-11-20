// Legacy component - use Chat component instead
import { Chat } from './Chat';

interface ConversationListProps {
  userType: 'vendor' | 'customer';
  workspaceId: number;
}

export const ConversationList: React.FC<ConversationListProps> = () => {
  return <Chat />;
};
