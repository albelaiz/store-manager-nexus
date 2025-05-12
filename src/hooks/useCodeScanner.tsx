
import { useEffect, useState } from 'react';

interface UseCodeScannerProps {
  onScan: (scannedCode: string) => void;
  enabled?: boolean;
  scanDelay?: number; // Time in ms to reset buffer
}

/**
 * A hook that listens for barcode scanner input
 * Works with USB and wireless barcode scanners which act as keyboard devices
 */
export function useCodeScanner({ onScan, enabled = true, scanDelay = 20 }: UseCodeScannerProps) {
  const [buffer, setBuffer] = useState<string>('');
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Reset status effect
  useEffect(() => {
    if (!isScanning) return;
    
    const timerId = setTimeout(() => {
      setIsScanning(false);
    }, 1000);
    
    return () => clearTimeout(timerId);
  }, [isScanning]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentTime = new Date().getTime();
      
      // Most barcode scanners send keys very rapidly
      // If time since last keystroke is too long, it's likely manual keyboard input
      if (currentTime - lastScanTime > scanDelay && buffer.length > 0) {
        // Reset if the time between keystrokes is too long
        setBuffer('');
      }
      
      setLastScanTime(currentTime);

      // Handle Enter key as the end of a barcode scan
      if (event.key === 'Enter' && buffer) {
        event.preventDefault();
        onScan(buffer);
        setIsScanning(true);
        setBuffer('');
        return;
      }
      
      // Handle common barcode scanner keys
      if (
        // Ignore modifier keys that might be part of user keyboard shortcuts
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        // Only capture printable characters
        event.key.length === 1
      ) {
        // Build the buffer as scanner sends characters
        setBuffer(prev => prev + event.key);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [buffer, lastScanTime, onScan, scanDelay, enabled]);

  return { isScanning, currentBuffer: buffer };
}
