import LandingPage from '../LandingPage';

export default function LandingPageExample() {
  const handleGetStarted = () => {
    console.log('Get started clicked - redirect to onboarding');
  };
  
  const handleLogin = () => {
    console.log('Login clicked - redirect to auth');
  };
  
  return (
    <LandingPage 
      onGetStarted={handleGetStarted}
      onLogin={handleLogin}
    />
  );
}