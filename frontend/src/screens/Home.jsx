import { useAuth } from '../context/AuthContext';
import MoodCard from '../components/MoodCard';
import TaskCard from '../components/TaskCard';
import SleepCard from '../components/SleepCard';
import RecommendationCard from '../components/RecommendationCard';
import { BiBrain } from 'react-icons/bi';

export default function Home() {
  const { user } = useAuth();
  const userName = user?.name || 'Demo';

  return (
    <div>
      {/* Exact match for the Hello header */}
      <div className="gradient-header">
        <h1>
          <BiBrain />
          Hello, {userName}!
        </h1>
        <p>Let's make today great 💙</p>
      </div>


      <MoodCard />
      
      <TaskCard />
      
      <SleepCard />
      
      <RecommendationCard />
    </div>
  );
}
