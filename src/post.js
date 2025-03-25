import { getState, setFailed } from '@actions/core';
import { readLog } from './logs.js';
import { pidIsRunning } from './pidIsRunning.js';
import { logger } from './logger.js';

async function post() {
  try {
    const pid = parseInt(getState('pid'));

    if (isNaN(pid)) {
      logger.warn('No PID found in state, skipping cleanup');
      return;
    }

    if (pidIsRunning(pid)) {
      logger.info('Stopping Turbo Cache Server', { pid });
      process.kill(pid);
      
      // Wait a moment for the process to terminate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (pidIsRunning(pid)) {
        logger.warn('Server did not terminate gracefully, forcing kill', { pid });
        process.kill(pid, 'SIGKILL');
      }
    } else {
      logger.error('Server process not found', { 
        pid,
        message: 'This may indicate a configuration or server crash',
      });
      setFailed(
        `Turbo Cache Server with PID ${pid} was not running. This may indicate a configuration or server crash.`,
      );
    }

    const [out, err] = await Promise.all([readLog('out'), readLog('err')]);

    if (out) {
      logger.debug('Server output log', { output: out });
    }

    if (err) {
      logger.error('Server error log', { error: err });
    }
  } catch (error) {
    logger.error('Error during cleanup', { error: error.message });
    setFailed(error.message);
  }
}

post().catch((error) => {
  logger.error('Unhandled error in post cleanup', { error: error.message });
  setFailed(error.message);
});
