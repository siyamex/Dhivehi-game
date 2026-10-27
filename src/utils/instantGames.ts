interface InstantSharePayload {
  intent: 'SHARE' | 'INVITE';
  image: string;
  text: string;
  data?: Record<string, string | number>;
}

interface FacebookInstantGames {
  initializeAsync: () => Promise<void>;
  setLoadingProgress: (progress: number) => void;
  startGameAsync: () => Promise<void>;
  shareAsync: (payload: InstantSharePayload) => Promise<void>;
}

declare global {
  interface Window {
    FBInstant?: FacebookInstantGames;
  }
}

declare const __INSTANT_GAMES__: boolean;

let sdkPromise: Promise<FacebookInstantGames> | undefined;

export const isInstantGamesBuild = __INSTANT_GAMES__;

function loadInstantGamesSdk(): Promise<FacebookInstantGames> {
  if (window.FBInstant) return Promise.resolve(window.FBInstant);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/fbinstant.6.3.js';
    script.async = true;
    script.onload = () => {
      if (window.FBInstant) resolve(window.FBInstant);
      else reject(new Error('Meta Instant Games SDK did not initialize'));
    };
    script.onerror = () => reject(new Error('Meta Instant Games SDK failed to load'));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

export async function initializeInstantGame(): Promise<void> {
  if (!isInstantGamesBuild) return;

  try {
    const sdk = await loadInstantGamesSdk();
    await sdk.initializeAsync();
    sdk.setLoadingProgress(100);
    await sdk.startGameAsync();
  } catch (error) {
    console.error('Meta Instant Games initialization failed:', error);
  }
}

function createShareImage(score?: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext('2d');

  if (!context) return '';

  context.fillStyle = '#26324d';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#0d9488';
  context.fillRect(0, 0, canvas.width, 22);
  context.textAlign = 'center';
  context.fillStyle = '#ffffff';
  context.font = '700 76px sans-serif';
  context.fillText('BasHoadha', canvas.width / 2, 230);

  if (score !== undefined) {
    context.fillStyle = '#ffdb46';
    context.font = '700 142px sans-serif';
    context.fillText(String(score), canvas.width / 2, 410);
    context.fillStyle = '#ffffff';
    context.font = '600 38px sans-serif';
    context.fillText('POINTS', canvas.width / 2, 475);
  } else {
    context.fillStyle = '#b8f34a';
    context.font = '600 42px sans-serif';
    context.fillText('Dhivehi Word Puzzle', canvas.width / 2, 345);
  }

  return canvas.toDataURL('image/png').split(',')[1] || '';
}

async function share(payload: InstantSharePayload): Promise<void> {
  if (isInstantGamesBuild) {
    const sdk = await loadInstantGamesSdk();
    await sdk.shareAsync(payload);
    return;
  }

  const shareData = { title: 'BasHoadha', text: payload.text, url: window.location.href };
  if (navigator.share) {
    await navigator.share(shareData);
    return;
  }
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(`${payload.text} ${window.location.href}`);
  }
}

export async function shareGame(): Promise<void> {
  try {
    await share({
      intent: 'INVITE',
      image: createShareImage(),
      text: 'Play BasHoadha, the Dhivehi word search puzzle!',
      data: { action: 'invite' },
    });
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'AbortError')) {
      console.error('Unable to share the game:', error);
    }
  }
}

export async function shareScore(score: number, levelId: string): Promise<void> {
  try {
    await share({
      intent: 'SHARE',
      image: createShareImage(score),
      text: `I scored ${score} points in BasHoadha! Can you beat my score?`,
      data: { action: 'score', score, levelId },
    });
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'AbortError')) {
      console.error('Unable to share the score:', error);
    }
  }
}