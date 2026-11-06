import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenText,
  Smiley,
  MicrophoneStage,
  Headphones,
  Gavel,
  Archive,
  ListChecks,
  EnvelopeSimple,
  ArrowRight,
  Fire
} from '@phosphor-icons/react';

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Subah bakhair! Chai ka cup taiyaar hai?';
  } else if (hour >= 12 && hour < 17) {
    return 'Dopahar ka aalas ya overthinking time?';
  } else if (hour >= 17 && hour < 22) {
    return 'Shaam ka sukoon, thoda timepass toh banta hai.';
  } else {
    return 'Raat ke sannate mein jaagna officially approved hai.';
  }
}

interface DeptCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  route: string;
  badge?: string;
  accentColor?: string;
}

const DeptCard: React.FC<DeptCardProps> = ({ title, desc, icon, route, badge, accentColor }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    if (route === '/secret-vault' || route === '/vault' || route.startsWith('http')) {
      window.location.href = route;
    } else {
      navigate(route);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
      }}
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        borderTop: accentColor ? `4px solid ${accentColor}` : undefined
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-ivory)',
              border: 'var(--border-width) solid var(--color-graphite)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-graphite)'
            }}
          >
            {icon}
          </div>
          {badge && (
            <span className="badge badge-lime">{badge}</span>
          )}
        </div>

        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '6px' }}>{title}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span>Kholo</span>
          <ArrowRight size={14} weight="bold" />
        </span>
      </div>
    </div>
  );
};

export const HQ: React.FC = () => {
  const navigate = useNavigate();
  const greeting = getTimeGreeting();

  const departments = [
    {
      title: 'Classified Notebook',
      desc: 'Jo mann mein aaye, likh daalo.',
      icon: <BookOpenText size={22} weight="bold" />,
      route: '/notebook',
      accentColor: 'var(--color-cobalt)'
    },
    {
      title: 'Meme Department',
      desc: 'Taaza memes seedha internet se, wohoooo!',
      icon: <Smiley size={22} weight="bold" />,
      route: '/memes',
      accentColor: 'var(--color-coral)'
    },
    {
      title: 'Audio Diary',
      desc: 'Jo kehna hai, apni awaaz mein keh do.',
      icon: <MicrophoneStage size={22} weight="bold" />,
      route: '/audio',
      accentColor: 'var(--color-cobalt)'
    },
    {
      title: 'Background Music',
      desc: 'Thoda sa sukoon, thodi si dhun.',
      icon: <Headphones size={22} weight="bold" />,
      route: '/music',
      accentColor: 'var(--color-lime)'
    },
    {
      title: 'Truth or Dare',
      desc: 'Sach ya Kaand? Solo aur real-time online 2-player mode!',
      icon: <Fire size={22} weight="fill" />,
      route: '/games/truth-or-dare',
      accentColor: 'var(--color-coral)',
      badge: 'NEW • MULTIPLAYER'
    },
    {
      title: 'Meme Court',
      desc: 'Aapki adaalat, aapka faisla.',
      icon: <Gavel size={22} weight="bold" />,
      route: '/court',
      accentColor: 'var(--color-coral)'
    },
    {
      title: 'Inside Joke Museum',
      desc: 'Kuch raaz toh raaz hi rehne chahiye... par ye wale nahi.',
      icon: <Archive size={22} weight="bold" />,
      route: '/museum',
      accentColor: 'var(--color-cobalt)',
      badge: 'Case 001'
    },
    {
      title: 'Task & To-Do Wall',
      desc: 'Mausami Ji ke zaroori, bekaar aur classified tasks ka official hisaab.',
      icon: <ListChecks size={22} weight="bold" />,
      route: '/achievements',
      accentColor: 'var(--color-lime)',
      badge: 'MISSION CONTROL'
    }
  ];

  return (
    <div style={{ padding: '20px 16px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Greeting Header */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
          {greeting}
        </p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          Aaj kya kaand karna hai?
        </h1>
      </div>

      {/* Grid of departments */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          marginBottom: '28px'
        }}
      >
        {departments.map((dept) => (
          <DeptCard
            key={dept.route}
            title={dept.title}
            desc={dept.desc}
            icon={dept.icon}
            route={dept.route}
            badge={dept.badge}
            accentColor={dept.accentColor}
          />
        ))}
      </div>

      {/* Final Transmission Special Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate('/final')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('/final');
          }
        }}
        className="card"
        style={{
          backgroundColor: 'var(--color-ivory)',
          border: 'var(--border-width) solid var(--color-graphite)',
          boxShadow: 'var(--shadow-retro)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '16px 20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-coral)',
              border: 'var(--border-width) solid var(--color-graphite)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-graphite)',
              flexShrink: 0
            }}
          >
            <EnvelopeSimple size={26} weight="bold" />
          </div>
          <div>
            <span className="badge badge-coral" style={{ marginBottom: '4px' }}>Special Transmission</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Final Transmission</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Achha, ek baat kehni thi...</p>
          </div>
        </div>

        <ArrowRight size={20} weight="bold" />
      </div>
    </div>
  );
};
