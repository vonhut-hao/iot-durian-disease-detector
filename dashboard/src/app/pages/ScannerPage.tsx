import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { QrCode, Sprout } from 'lucide-react';

export default function ScannerPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        // Stop scanning after successful read
        scanner.clear();
        // Redirect to Tree Detail
        navigate(`/tree/${decodedText}`);
      },
      (errorMessage) => {
        // Ignore normal scanning errors
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-100 p-3 rounded-full mb-4">
            <Sprout className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Durian Traceability</h1>
          <p className="text-slate-500 mt-2 text-center">
            Scan the QR code on the durian tree to view its health and control irrigation.
          </p>
        </div>

        <Card className="overflow-hidden shadow-lg border-emerald-100">
          <CardHeader className="bg-white border-b border-slate-100">
            <CardTitle className="flex items-center text-lg">
              <QrCode className="mr-2 h-5 w-5 text-emerald-500" />
              QR Scanner
            </CardTitle>
            <CardDescription>Position the QR code within the frame</CardDescription>
          </CardHeader>
          <CardContent className="p-0 bg-black/5">
            <div id="qr-reader" className="w-full border-none"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
