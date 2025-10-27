import { useEffect, useState } from 'react';
import './MatchmakingScreen.css';

export default function MatchmakingScreen({ onMatchFound, onCancel, multiplayerClient }) {
  const [status, setStatus] = useState('searching');
  const [queuePosition, setQueuePosition] = useState(0);
  const [countdown, setCountdown] = useState(15);
  const [playersFound, setPlayersFound] = useState(1);

  useEffect(() => {
    let mounted = true;
    let countdownInterval;

    const joinMatch = async () => {
      const result = await multiplayerClient.joinMatch();

      if (!mounted) return;

      if (result.success) {
        if (result.matchId) {
          // Match found immediately - get full match state for countdown
          try {
            const response = await fetch('/api/match/state');
            const data = await response.json();
            
            if (data.match) {
              setStatus('found');
              setPlayersFound(data.match.players.length);
              
              // Use server timestamp for synchronized countdown
              if (data.match.startTime) {
                startCountdownFromServer(data.match.startTime);
              } else {
                startCountdown();
              }
            }
          } catch (error) {
            console.error('Error fetching match state:', error);
            setStatus('found');
            setPlayersFound(2);
            startCountdown(); // Fallback
          }
        } else {
          // In queue
          setStatus('searching');
          setQueuePosition(result.queuePosition || 0);
          pollForMatch();
        }
      } else {
        setStatus('error');
      }
    };

    const pollForMatch = async () => {
      const pollInterval = setInterval(async () => {
        if (!mounted) {
          clearInterval(pollInterval);
          return;
        }

        try {
          const response = await fetch('/api/match/state');
          const data = await response.json();

          if (data.match && data.match.matchId) {
            clearInterval(pollInterval);
            setStatus('found');
            setPlayersFound(data.match.players.length);
            
            // Use server timestamp for synchronized countdown
            if (data.match.startTime) {
              startCountdownFromServer(data.match.startTime);
            } else {
              startCountdown();
            }
          }
        } catch (error) {
          console.error('Error polling for match:', error);
        }
      }, 1000);
    };

    const startCountdownFromServer = (serverStartTime) => {
      // Calculate time remaining based on server timestamp
      const updateCountdown = () => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((serverStartTime - now) / 1000));
        setCountdown(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          if (mounted) {
            // Start the match on server before transitioning
            fetch('/api/match/start', { method: 'POST' })
              .then(() => {
                console.log('Match started on server');
                onMatchFound();
              })
              .catch(err => console.error('Error starting match:', err));
          }
        }
      };

      updateCountdown(); // Update immediately
      countdownInterval = setInterval(updateCountdown, 100); // Update every 100ms for accuracy
    };

    const startCountdown = () => {
      // Fallback for old behavior (shouldn't be used)
      let timeLeft = 15;
      setCountdown(timeLeft);

      countdownInterval = setInterval(() => {
        timeLeft--;
        setCountdown(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          if (mounted) {
            // Start the match on server before transitioning
            fetch('/api/match/start', { method: 'POST' })
              .then(() => {
                console.log('Match started on server (fallback)');
                onMatchFound();
              })
              .catch(err => console.error('Error starting match:', err));
          }
        }
      }, 1000);
    };

    joinMatch();

    return () => {
      mounted = false;
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [multiplayerClient, onMatchFound]);

  const handleCancel = async () => {
    await multiplayerClient.leaveMatch();
    onCancel();
  };

  return (
    <div className="matchmaking-screen">
      <div className="matchmaking-container">
        {status === 'searching' && (
          <>
            <div className="matchmaking-spinner"></div>
            <h2>Finding Players...</h2>
            <p className="queue-info">
              {queuePosition > 0
                ? `Position in queue: ${queuePosition}`
                : 'Searching for opponents...'}
            </p>
            <p className="player-count">Waiting for {2 - playersFound} more player(s)</p>
          </>
        )}

        {status === 'found' && (
          <>
            <div className="match-found-icon">✓</div>
            <h2>Match Found!</h2>
            <p className="player-count">{playersFound} players ready</p>
            <div className="countdown-circle">
              <span className="countdown-number">{countdown}</span>
            </div>
            <p className="countdown-text">Game starting in {countdown} seconds...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="error-icon">✗</div>
            <h2>Connection Error</h2>
            <p>Unable to connect to matchmaking server</p>
          </>
        )}

        <button className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
