import React, { useState, useCallback } from 'react';
import BirthInfoForm from '@/components/BirthInfoForm';
import RashiChart from '@/components/RashiChart';
import PlanetInfoTable from '@/components/PlanetInfoTable';
import { calculateChart, parseLatitude, parseLongitude, BirthData, Planet } from '@/lib/kundliCalculations';

const Index = () => {
  // Form state
  const [name, setName] = useState('Your Name');
  const [date, setDate] = useState('1987-06-16');
  const [time, setTime] = useState('10:05');
  const [tz, setTz] = useState('5');
  const [lat, setLat] = useState('23N39');
  const [lon, setLon] = useState('80E42');

  // Chart data state
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [rashis, setRashis] = useState<number[]>([]);
  const [houses, setHouses] = useState<string[][]>([]);
  const [chartGenerated, setChartGenerated] = useState(false);

  const handleGenerate = useCallback(() => {
    const [hours, minutes] = time.split(':').map(Number);
    const birthDate = new Date(date);
    
    const birthData: BirthData = {
      name,
      date: birthDate,
      time: { hours, minutes },
      tz: parseFloat(tz),
      lat: parseLatitude(lat),
      lon: parseLongitude(lon)
    };

    const result = calculateChart(birthData);
    setPlanets(result.planets);
    setRashis(result.rashis);
    setHouses(result.houses);
    setChartGenerated(true);
  }, [name, date, time, tz, lat, lon]);

  // Generate chart on initial load
  React.useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Rashi Chart</h1>
        </header>

        <BirthInfoForm
          name={name} setName={setName}
          date={date} setDate={setDate}
          time={time} setTime={setTime}
          tz={tz} setTz={setTz}
          lat={lat} setLat={setLat}
          lon={lon} setLon={setLon}
          onGenerate={handleGenerate}
        />

        {chartGenerated && (
          <>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Rashi Chart (D1)</h2>
              <div className="flex justify-center">
                <RashiChart rashis={rashis} houses={houses} title="Rashi Chart" />
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Planet Information</h2>
              <PlanetInfoTable planets={planets} />
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
