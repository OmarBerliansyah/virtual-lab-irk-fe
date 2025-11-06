import { UserProfile } from '@/components/UserProfile';

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <UserProfile />
      </div>
    </div>
  );
}