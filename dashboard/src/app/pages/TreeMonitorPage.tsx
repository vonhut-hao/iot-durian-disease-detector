import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { db } from '../../config/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { ArrowLeft, Droplets, Thermometer, Wind, Power, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TreeMonitorPage() {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState<any>(null);
  const [sensorLogs, setSensorLogs] = useState<any[]>([]);
  const [relays, setRelays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial Tree info from REST API
  useEffect(() => {
    fetch(`http://localhost:3000/api/trees/${treeId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert('Tree not found');
          navigate('/');
        } else {
          setTreeData(data);
          setRelays(data.station?.relays || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [treeId, navigate]);

  // Real-time listener for Sensor Logs
  useEffect(() => {
    if (!treeData?.stationId) return;

    const q = query(
      collection(db, 'sensor_logs'),
      where('stationId', '==', treeData.stationId),
      orderBy('resultTime', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timeStr: data.resultTime?.toDate().toLocaleTimeString()
        };
      }).reverse(); // Reverse for chart (oldest to newest)
      setSensorLogs(logs);
    });

    return () => unsubscribe();
  }, [treeData?.stationId]);

  // Real-time listener for Relays
  useEffect(() => {
    if (!treeData?.stationId) return;

    const relaysRef = collection(db, 'stations', treeData.stationId, 'relays');
    const unsubscribe = onSnapshot(relaysRef, (snapshot) => {
      const updatedRelays = snapshot.docs.map(doc => ({
        taskingCapabilityId: doc.id,
        ...doc.data()
      }));
      setRelays(updatedRelays);
    });

    return () => unsubscribe();
  }, [treeData?.stationId]);

  const toggleRelay = async (taskingCapabilityId: string, currentState: number) => {
    const action = currentState === 1 ? 0 : 1;
    
    // Optimistic UI update could go here
    
    try {
      await fetch('http://localhost:3000/api/devices/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: treeData.stationId,
          targets: [
            { taskId: Math.floor(Math.random() * 1000000), taskingCapabilityId: parseInt(taskingCapabilityId) }
          ],
          taskingParameters: { actionType: 'control', action }
        })
      });
      // We don't need to manually update state, onSnapshot will handle it when confirmed
    } catch (err) {
      console.error('Failed to toggle relay', err);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!treeData) return <div className="flex h-screen items-center justify-center">No Data</div>;

  const tempLogs = sensorLogs.filter(l => l.unit.includes('C'));
  const humLogs = sensorLogs.filter(l => l.unit.includes('%rH'));
  const soilLogs = sensorLogs.filter(l => l.unit === '%');

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{treeData.name}</h1>
            <p className="text-sm text-slate-500">ID: {treeId} • Variety: {treeData.variety}</p>
          </div>
        </div>

        {/* Tree Info & Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tree Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Row:</span> <span className="font-medium">{treeData.row}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Station:</span> <span className="font-medium">{treeData.station?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Notes:</span> <span className="font-medium">{treeData.notes}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Planted:</span> <span className="font-medium">{new Date(treeData.plantedDate._seconds * 1000).toLocaleDateString()}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Power className="w-5 h-5 mr-2 text-emerald-500" /> Control Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {relays.map((relay) => (
                <div key={relay.taskingCapabilityId} className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                  <div className="flex flex-col">
                    <Label className="text-base font-semibold">{relay.name || `Relay ${relay.taskingCapabilityId}`}</Label>
                    <span className="text-xs text-slate-500">
                      State: {relay.state === 1 ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <Switch 
                    checked={relay.state === 1}
                    onCheckedChange={() => toggleRelay(relay.taskingCapabilityId, relay.state)}
                  />
                </div>
              ))}
              {relays.length === 0 && <p className="text-sm text-slate-500 text-center">No relays found for this station.</p>}
            </CardContent>
          </Card>
        </div>

        {/* Sensor Charts */}
        <h2 className="text-xl font-bold mt-8 mb-4">Live Telemetry</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Temperature */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <Thermometer className="w-4 h-4 mr-2 text-red-500" /> Temperature (°C)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempLogs}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="timeStr" fontSize={10} tickMargin={10} />
                  <YAxis domain={['auto', 'auto']} fontSize={10} width={30} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Humidity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <Wind className="w-4 h-4 mr-2 text-blue-500" /> Air Humidity (%)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={humLogs}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="timeStr" fontSize={10} tickMargin={10} />
                  <YAxis domain={[0, 100]} fontSize={10} width={30} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Soil Moisture */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <Droplets className="w-4 h-4 mr-2 text-amber-600" /> Soil Moisture (%)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={soilLogs}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="timeStr" fontSize={10} tickMargin={10} />
                  <YAxis domain={[0, 100]} fontSize={10} width={30} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#d97706" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
