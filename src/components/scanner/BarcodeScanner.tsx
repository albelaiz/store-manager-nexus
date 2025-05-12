
import React, { useState } from 'react';
import { useCodeScanner } from '@/hooks/useCodeScanner';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScanBarcode } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

interface BarcodeScannerProps {
  onProductScanned: (code: string) => void;
  enabled?: boolean;
  createOrderMode?: boolean;
  onCreateOrder?: (productCode: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onProductScanned, 
  enabled = true,
  createOrderMode = false,
  onCreateOrder
}) => {
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const { toast } = useToast();

  const handleScan = (scannedCode: string) => {
    setLastScanned(scannedCode);
    console.log("Barcode scanned:", scannedCode);
    
    if (createOrderMode && onCreateOrder) {
      onCreateOrder(scannedCode);
      toast({
        title: "Auto Order",
        description: `Creating order with product: ${scannedCode}`,
      });
    } else {
      toast({
        title: "Code Scanned",
        description: `Scanned: ${scannedCode}`,
      });
      onProductScanned(scannedCode);
    }
  };

  const { isScanning, currentBuffer } = useCodeScanner({ 
    onScan: handleScan,
    enabled
  });

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <ScanBarcode className="h-5 w-5 text-gray-600" />
        <div className="font-medium">Barcode Scanner</div>
        <Badge 
          variant="outline" 
          className={isScanning 
            ? "bg-green-100 text-green-800 border-green-300 animate-pulse" 
            : "bg-yellow-100 text-yellow-800 border-yellow-300"
          }
        >
          {isScanning ? "Active" : "Ready"}
        </Badge>
        {createOrderMode && (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            Auto-Order Mode
          </Badge>
        )}
      </div>

      {enabled && (
        <Alert className={`${createOrderMode ? "bg-blue-50" : "bg-blue-50"}`}>
          <AlertDescription className="text-sm">
            {createOrderMode 
              ? "Scan any product barcode to instantly create a new order with that product."
              : "Connect your USB or wireless barcode scanner and scan a product code to add it to the order."
            }
            {currentBuffer && currentBuffer.length > 0 && (
              <div className="mt-1 font-medium text-blue-600">Scanning: {currentBuffer}</div>
            )}
            {lastScanned && (
              <div className="mt-1 font-medium">Last scanned: {lastScanned}</div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
