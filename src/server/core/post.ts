import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      // Splash Screen Configuration
      appDisplayName: 'Stack Shooter: Vampire Siege',
      backgroundUri: 'vampire-splash.png',
      buttonLabel: '🧛 Play Now',
      description:
        'A top-down survival shooter! Defend against endless waves of vampires. Shoot, dash, and upgrade your way through the undead horde.',
      heading: '🧛 Stack Shooter: Vampire Siege',
      appIconUri: 'vampire-icon.png',
    },
    postData: {
      gameState: 'initial',
      score: 0,
    },
    subredditName: subredditName,
    title: '🧛 Stack Shooter: Vampire Siege - Survive the Undead Horde!',
  });
};
