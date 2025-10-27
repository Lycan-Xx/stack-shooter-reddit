import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      // Splash Screen Configuration
      appDisplayName: 'Vampire Siege',
      backgroundUri: 'vampire-splash.png',
      buttonLabel: '🧛 Play Now',
      description: 'Survive endless waves of vampires! Shoot, dash, and upgrade your way through the undead horde.',
      entryUri: 'index.html',
      heading: '🧛 Vampire Siege',
      appIconUri: 'vampire-icon.png',
    },
    postData: {
      gameState: 'initial',
      score: 0,
    },
    subredditName: subredditName,
    title: '🧛 Vampire Siege - Survive the Undead Horde!',
  });
};
